#!/usr/bin/env node

import { runCli } from '../lib/cli.js';

try {
  const exitCode = await runCli(process.argv.slice(2));
  process.exitCode = exitCode;
} catch (error) {
  console.error(`Erro: ${error.message}`);
  process.exitCode = 1;
}
