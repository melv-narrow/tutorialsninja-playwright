import path from 'node:path';

export const ROOT_DIR = process.cwd();
export const PLAYWRIGHT_DIR = path.join(ROOT_DIR, 'playwright');
export const AUTH_DIR = path.join(PLAYWRIGHT_DIR, '.auth');
export const AUTH_STATE_PATH = path.join(AUTH_DIR, 'storage-state.json');
export const AUTH_USER_PATH = path.join(AUTH_DIR, 'user.json');
export const TEST_RESULTS_DIR = path.join(ROOT_DIR, 'test-results');
export const JSON_REPORT_DIR = path.join(TEST_RESULTS_DIR, 'json');
export const PLAYWRIGHT_REPORT_DIR = path.join(ROOT_DIR, 'playwright-report');
export const ALLURE_RESULTS_DIR = path.join(ROOT_DIR, 'allure-results');
export const ALLURE_REPORT_DIR = path.join(ROOT_DIR, 'allure-report');
