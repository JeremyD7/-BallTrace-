import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { config } from 'dotenv';
import { defineConfig } from 'prisma/config';

const localEnvPath = resolve(process.cwd(), '.env');
const rootEnvPath = resolve(process.cwd(), '..', '.env');

config({
  path: existsSync(localEnvPath) ? localEnvPath : rootEnvPath,
});

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
  },
});
