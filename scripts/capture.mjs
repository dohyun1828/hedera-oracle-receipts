import { mkdir, writeFile } from 'node:fs/promises';
import { captureReceipt } from '@sh/oracle-core/network';
import { assessReceipt, digestReceipt } from '@sh/oracle-core';
try {
  const receipt = await captureReceipt();
  await mkdir('runtime', { recursive: true });
  await writeFile('runtime/receipt.json', JSON.stringify(receipt, null, 2) + '\n');
  console.log(JSON.stringify({ file: 'runtime/receipt.json', sha256: digestReceipt(receipt), assessment: assessReceipt(receipt), receipt }, null, 2));
} catch (error) { console.error(error.message); process.exitCode = 1; }
