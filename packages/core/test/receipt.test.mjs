import test from "node:test";
import assert from "node:assert/strict";
import {
  FEED,
  MAX_AGE,
  canonicalReceipt,
  digestReceipt,
  normalizeReceipt,
  assessReceipt,
  formatAnswer,
  verifyMirrorMessage,
  validatePointer,
} from "../receipt.mjs";
const receipt = {
  schema: "oracle-receipt/1",
  chainId: 295,
  feed: FEED,
  blockNumber: 123,
  blockHash: "0x" + "a".repeat(64),
  observedAt: 1800000000,
  roundId: "18446744073709560000",
  answer: "9007199254740993123",
  decimals: 8,
  startedAt: 1799999900,
  updatedAt: 1799999990,
  answeredInRound: "18446744073709560000",
  maxAgeSeconds: MAX_AGE,
};
const message = {
  sequence_number: 3,
  consensus_timestamp: "1800000001.123456789",
  payer_account_id: "0.0.123",
  message: Buffer.from(canonicalReceipt(receipt)).toString("base64"),
  chunk_info: null,
};
test("canonical bytes ignore input property order", () =>
  assert.equal(
    canonicalReceipt(Object.fromEntries(Object.entries(receipt).reverse())),
    canonicalReceipt(receipt),
  ));
test("price formatting preserves integers above Number precision", () =>
  assert.equal(formatAnswer(receipt.answer, 8), "90071992547.40993123"));
test("price formatting handles leading fractional zeros and zero precision", () => {
  assert.equal(formatAnswer("7", 8), "0.00000007");
  assert.equal(formatAnswer("7", 0), "7");
});
test("complete fresh round is eligible", () =>
  assert.equal(assessReceipt(receipt).eligible, true));
test("freshness boundary is inclusive", () =>
  assert.equal(
    assessReceipt({ ...receipt, observedAt: receipt.updatedAt + MAX_AGE })
      .eligible,
    true,
  ));
test("stale round is ineligible", () =>
  assert.equal(
    assessReceipt({ ...receipt, observedAt: receipt.updatedAt + MAX_AGE + 1 })
      .eligible,
    false,
  ));
test("future update is ineligible", () =>
  assert.equal(
    assessReceipt({ ...receipt, observedAt: receipt.updatedAt - 1 }).eligible,
    false,
  ));
test("incomplete answered round is ineligible", () =>
  assert.equal(
    assessReceipt({ ...receipt, answeredInRound: "1" }).eligible,
    false,
  ));
test("zero price is ineligible", () =>
  assert.equal(assessReceipt({ ...receipt, answer: "0" }).eligible, false));
test("negative or exponent-encoded prices are rejected", () => {
  assert.throws(() => normalizeReceipt({ ...receipt, answer: "-1" }));
  assert.throws(() => normalizeReceipt({ ...receipt, answer: "1e8" }));
});
test("numeric round IDs cannot silently lose precision", () =>
  assert.throws(() =>
    normalizeReceipt({ ...receipt, roundId: 18446744073709560000 }),
  ));
test("unexpected fields cannot be silently omitted", () =>
  assert.throws(() => normalizeReceipt({ ...receipt, note: "extra" })));
test("network and feed are bound", () => {
  assert.throws(() => normalizeReceipt({ ...receipt, chainId: 296 }));
  assert.throws(() =>
    normalizeReceipt({ ...receipt, feed: "0x" + "b".repeat(40) }),
  );
});
test("hash changes if any observation byte changes", () =>
  assert.notEqual(
    digestReceipt(receipt),
    digestReceipt({ ...receipt, answer: "1" }),
  ));
test("receipt stays below single-message limit", () =>
  assert.ok(Buffer.byteLength(canonicalReceipt(receipt)) < 1024));
test("mirror confirms bytes, sequence, payer and consensus timestamp", () =>
  assert.equal(
    verifyMirrorMessage(receipt, message, "3", "0.0.123").matched,
    true,
  ));
test("different receipt fails mirror comparison", () =>
  assert.throws(() =>
    verifyMirrorMessage({ ...receipt, answer: "1" }, message, "3"),
  ));
test("wrong sequence or payer is rejected", () => {
  assert.throws(() => verifyMirrorMessage(receipt, message, "4"));
  assert.throws(() => verifyMirrorMessage(receipt, message, "3", "0.0.124"));
});
test("chunked or unconfirmed mirror payload is rejected", () => {
  assert.throws(() =>
    verifyMirrorMessage(receipt, { ...message, chunk_info: { total: 2 } }, "3"),
  );
  assert.throws(() =>
    verifyMirrorMessage(receipt, { ...message, consensus_timestamp: "" }, "3"),
  );
});
test("mirror request pointers are restricted to numeric IDs", () => {
  validatePointer("0.0.123", "1");
  for (const topic of ["../accounts", "https://example.com", "0.0.0"])
    assert.throws(() => validatePointer(topic, "1"));
  assert.throws(() => validatePointer("0.0.123", "0"));
});
