import path from 'node:path';
import os from 'node:os';
import fsExtra from 'fs-extra';
import { env } from '../config/env.js';
import { ALLURE_RESULTS_DIR, ROOT_DIR } from '../config/paths.js';

const { ensureDir, writeFile, writeJson } = fsExtra;

const categories = [
  {
    name: 'Environment instability',
    messageRegex:
      'Timeout.*(waiting for|locator)|net::|ERR_|ECONN|Navigation timeout',
    matchedStatuses: ['broken'],
  },
  {
    name: 'Assertion regression',
    messageRegex: 'expect\\(',
    matchedStatuses: ['failed'],
  },
  {
    name: 'Data or state issue',
    messageRegex: 'login|session|wish list|address|shopping cart|checkout',
    matchedStatuses: ['failed', 'broken'],
  },
];

const environmentLines = [
  `Base URL=${env.baseUrl}`,
  `Suite=${env.suite}`,
  `CI=${env.isCI}`,
  `OS=${os.platform()} ${os.release()}`,
  `Node=${process.version}`,
  `Workspace=${path.basename(ROOT_DIR)}`,
];

export default async function globalSetup(): Promise<void> {
  await ensureDir(ALLURE_RESULTS_DIR);
  await writeJson(
    path.join(ALLURE_RESULTS_DIR, 'categories.json'),
    categories,
    {
      spaces: 2,
    },
  );
  await writeFile(
    path.join(ALLURE_RESULTS_DIR, 'environment.properties'),
    `${environmentLines.join('\n')}\n`,
    'utf8',
  );
}
