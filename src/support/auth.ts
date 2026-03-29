import fsExtra from 'fs-extra';
import type { Page } from '@playwright/test';
import { AUTH_DIR, AUTH_STATE_PATH, AUTH_USER_PATH } from '../config/paths.js';
import type { TestUser } from './test-users.js';

const { ensureDir, pathExists, readJson, writeJson } = fsExtra;

export const persistAuthenticatedUser = async (
  page: Page,
  user: TestUser,
): Promise<void> => {
  await ensureDir(AUTH_DIR);
  await page.context().storageState({ path: AUTH_STATE_PATH });
  await writeJson(AUTH_USER_PATH, user, { spaces: 2 });
};

export const loadStoredUser = async (): Promise<TestUser> => {
  if (!(await pathExists(AUTH_USER_PATH))) {
    throw new Error(
      'Expected an authenticated user record at playwright/.auth/user.json. Run the setup project first.',
    );
  }

  return readJson(AUTH_USER_PATH) as Promise<TestUser>;
};
