import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fsExtra from 'fs-extra';

const { ensureDir, pathExists, remove, copy } = fsExtra;

const rootDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);
const allureResultsDir = path.join(rootDir, 'allure-results');
const allureReportDir = path.join(rootDir, 'allure-report');
const historySource =
  process.env.ALLURE_HISTORY_SOURCE ?? path.join(allureReportDir, 'history');
const shouldOpen = process.argv.includes('--open');

const ensureHistory = async () => {
  if (!(await pathExists(historySource))) {
    return;
  }

  await ensureDir(allureResultsDir);
  await remove(path.join(allureResultsDir, 'history'));
  await copy(historySource, path.join(allureResultsDir, 'history'));
};

const ensureJavaAvailable = () => {
  const javaCheck = spawnSync('java', ['-version'], {
    shell: true,
    stdio: 'ignore',
  });

  if (javaCheck.status === 0) {
    return;
  }

  throw new Error(
    'Allure report generation needs Java on the local machine. CI still publishes the report automatically to GitHub Pages.',
  );
};

const runAllure = (commandArgs) => {
  const result = spawnSync(
    process.platform === 'win32' ? 'npx.cmd' : 'npx',
    ['allure-commandline', ...commandArgs],
    {
      cwd: rootDir,
      stdio: 'inherit',
      shell: false,
    },
  );

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};

await ensureHistory();
ensureJavaAvailable();

runAllure(['generate', allureResultsDir, '--clean', '-o', allureReportDir]);

if (shouldOpen) {
  runAllure(['open', allureReportDir]);
}
