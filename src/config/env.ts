import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const booleanFromString = z
  .string()
  .optional()
  .transform((value) => value === 'true');

const envSchema = z.object({
  BASE_URL: z.string().url().default('https://tutorialsninja.com/demo/'),
  PW_SUITE: z
    .enum(['smoke', 'regression', 'env-flaky', 'full'])
    .default('smoke'),
  HEADLESS: booleanFromString.default(true),
  CI: booleanFromString.default(false),
  INCLUDE_OPTIONAL_BROWSERS: booleanFromString.default(false),
});

const parsedEnv = envSchema.parse(process.env);

export const env = {
  baseUrl: parsedEnv.BASE_URL,
  suite: parsedEnv.PW_SUITE,
  headless: parsedEnv.HEADLESS,
  includeOptionalBrowsers: parsedEnv.INCLUDE_OPTIONAL_BROWSERS,
  isCI: parsedEnv.CI,
} as const;
