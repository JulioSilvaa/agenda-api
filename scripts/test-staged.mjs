#!/usr/bin/env node
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';

// Captura lista de arquivos staged
const staged = execSync('git diff --name-only --cached', { encoding: 'utf-8' })
  .split('\n')
  .map(f => f.trim())
  .filter(f => f.length > 0 && f.endsWith('.ts'));

if (staged.length === 0) {
  process.exit(0);
}

// Deriva possíveis arquivos de teste relacionados:
// Heurística simples: para cada arquivo modificado em src/, tenta encontrar *<BaseName>.test.ts
// e executa vitest com --run.
const testCandidates = new Set();
for (const file of staged) {
  const base = file.replace(/\\/g, '/');
  // Se já é um teste, inclui diretamente
  if (base.match(/\.test\.ts$/)) {
    testCandidates.add(base);
    continue;
  }
  // Caso arquivo de implementação, procura teste no mesmo diretório
  const potential = base.replace(/(\.ts)$/i, '.test.ts');
  if (existsSync(potential)) {
    testCandidates.add(potential);
  }
}

// Se nada encontrado, fallback: roda vitest related
const testsToRun = Array.from(testCandidates);

try {
  if (testsToRun.length > 0) {
    const cmd = `npx vitest --run ${testsToRun.join(' ')}`;
    execSync(cmd, { stdio: 'inherit' });
  } else {
    execSync('npx vitest related --run', { stdio: 'inherit' });
  }
} catch (e) {
  process.exit(1);
}
