import { verifyOnMirror } from '@sh/oracle-core/network';
import { normalizeReceipt, validatePointer } from '@sh/oracle-core';
export const runtime = 'nodejs';
export async function POST(request: Request) {
  try {
    if (Number(request.headers.get('content-length') || 0) > 8192) return Response.json({ error: 'Evidence file is too large.' }, { status: 413 });
    const reader = request.body?.getReader();
    if (!reader) throw new Error('Missing evidence.');
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > 8192) { await reader.cancel(); return Response.json({ error: 'Evidence file is too large.' }, { status: 413 }); }
      chunks.push(value);
    }
    const evidence = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    if (evidence.network !== 'testnet') throw new Error('Only testnet evidence is supported.');
    normalizeReceipt(evidence.receipt);
    validatePointer(evidence.topic, evidence.sequence);
    if (typeof evidence.payer !== 'string' || !/^0\.0\.[1-9][0-9]*$/.test(evidence.payer)) throw new Error('A payer account is required.');
    const result = await verifyOnMirror(evidence.receipt, evidence.topic, evidence.sequence, evidence.payer);
    return Response.json(result, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'Verification failed.' }, { status: 400 });
  }
}
