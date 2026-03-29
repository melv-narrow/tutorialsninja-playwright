import path from 'node:path';
import { defineConfig, devices, type Project } from '@playwright/test';
import { env } from './src/config/env.js';
import {
  ALLURE_RESULTS_DIR,
  AUTH_STATE_PATH,
  JSON_REPORT_DIR,
  PLAYWRIGHT_REPORT_DIR,
} from './src/config/paths.js';

const publicSpecPattern =
  /tests[\\/](smoke|regression)[\\/](?!.*\.auth\.spec\.ts$).*\.spec\.ts$/;
const authSpecPattern = /tests[\\/](regression)[\\/].*\.auth\.spec\.ts$/;
const setupSpecPattern = /tests[\\/]setup[\\/]auth\.setup\.ts$/;

const grepForSuite = (suite: string): RegExp | undefined => {
  switch (suite) {
    case 'smoke':
      return /@smoke/;
    case 'regression':
      return /@regression/;
    case 'env-flaky':
      return /@env-flaky/;
    case 'full':
    default:
      return undefined;
  }
};

const grepInvertForSuite = (suite: string): RegExp | undefined => {
  switch (suite) {
    case 'smoke':
    case 'regression':
      return /@env-flaky/;
    default:
      return undefined;
  }
};

const suiteGrep = grepForSuite(env.suite);
const suiteGrepInvert = grepInvertForSuite(env.suite);

const withSuiteFilters = <T extends Project>(project: T): T => ({
  ...project,
  ...(suiteGrep ? { grep: suiteGrep } : {}),
  ...(suiteGrepInvert ? { grepInvert: suiteGrepInvert } : {}),
});

const createBrowserProjects = (): Project[] => {
  const projects: Project[] = [
    withSuiteFilters({
      name: 'chromium',
      testMatch: publicSpecPattern,
      use: {
        ...devices['Desktop Chrome'],
      },
    }),
    withSuiteFilters({
      name: 'chromium-authenticated',
      dependencies: ['setup'],
      testMatch: authSpecPattern,
      use: {
        ...devices['Desktop Chrome'],
        storageState: AUTH_STATE_PATH,
      },
    }),
  ];

  if (env.includeOptionalBrowsers) {
    projects.push(
      withSuiteFilters({
        name: 'firefox-local',
        testMatch: publicSpecPattern,
        use: {
          ...devices['Desktop Firefox'],
        },
      }),
      withSuiteFilters({
        name: 'webkit-local',
        testMatch: publicSpecPattern,
        use: {
          ...devices['Desktop Safari'],
        },
      }),
    );
  }

  return projects;
};

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: env.isCI,
  retries: env.isCI ? 1 : 0,
  ...(env.isCI ? { workers: 2 } : {}),
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: PLAYWRIGHT_REPORT_DIR }],
    ['json', { outputFile: path.join(JSON_REPORT_DIR, `${env.suite}.json`) }],
    [
      'allure-playwright',
      {
        resultsDir: ALLURE_RESULTS_DIR,
        detail: true,
        suiteTitle: false,
      },
    ],
  ],
  use: {
    baseURL: env.baseUrl,
    headless: env.headless,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    viewport: {
      width: 1440,
      height: 900,
    },
  },
  projects: [
    {
      name: 'setup',
      testMatch: setupSpecPattern,
    },
    ...createBrowserProjects(),
  ],
});
