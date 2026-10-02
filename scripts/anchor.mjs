import { readFile, writeFile } from 'node:fs/promises';
import { Client, PrivateKey, TopicCreateTransaction, TopicMessageSubmitTransaction, Hbar } from '@hashgraph/sdk';
import { assessReceipt, canonicalReceipt, digestReceipt } from '@sh/oracle-core';
try {
  if (!process.argv.includes('--testnet')) throw new Error('Pass --testnet to acknowledge a testnet-only HCS submission.');
  const receipt = JSON.parse(await readFile('runtime/receipt.json', 'utf8'));
  const assessment = assessReceipt(receipt);
  if (!assessment.eligible) throw new Error('Ineligible receipt: ' + assessment.problems.join(', '));
  const now = Math.floor(Date.now() / 1000);
  if (now < receipt.observedAt || now - receipt.observedAt > 300) throw new Error('Capture a new receipt within five minutes before anchoring.');
  if (!/^0\.0\.[1-9][0-9]*$/.test(process.env.HEDERA_ACCOUNT_ID || '')) throw new Error('Set a testnet HEDERA_ACCOUNT_ID.');
  if (!process.env.HEDERA_PRIVATE_KEY) throw new Error('Set the testnet-only private key in .env.');
  const key = PrivateKey.fromStringDer(process.env.HEDERA_PRIVATE_KEY);
  const client = Client.forTestnet().setOperator(process.env.HEDERA_ACCOUNT_ID, key);
  client.setDefaultMaxTransactionFee(new Hbar(1));
  try {
    // A new submit-key-protected topic has no externally supplied custom fees.
    const create = await new TopicCreateTransaction().setTopicMemo('Oracle Receipt Lab v1')
      .setSubmitKey(key.publicKey).setAdminKey(key.publicKey).setMaxTransactionFee(new Hbar(1)).execute(client);
    const topicReceipt = await create.getReceipt(client);
    const topic = topicReceipt.topicId.toString();
    await writeFile('runtime/topic.json', JSON.stringify({ topic, createTransaction: create.transactionId.toString() }, null, 2) + '\n');
    const response = await new TopicMessageSubmitTransaction().setTopicId(topic)
      .setMessage(canonicalReceipt(receipt)).setMaxChunks(1).setMaxTransactionFee(new Hbar(1)).execute(client);
    const txReceipt = await response.getReceipt(client);
    const evidence = {
      network: 'testnet', topic, sequence: txReceipt.topicSequenceNumber.toString(),
      payer: process.env.HEDERA_ACCOUNT_ID, transactionId: response.transactionId.toString(),
      status: txReceipt.status.toString(), sha256: digestReceipt(receipt), receipt,
      hashscan: 'https://hashscan.io/testnet/transaction/' + response.transactionId.toString()
    };
    await writeFile('runtime/evidence.json', JSON.stringify(evidence, null, 2) + '\n');
    console.log(JSON.stringify(evidence, null, 2));
  } finally { client.close(); }
} catch (error) { console.error(error.message); process.exitCode = 1; }
