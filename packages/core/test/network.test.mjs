import test from "node:test";
import assert from "node:assert/strict";
import { Interface } from "ethers";
import { captureReceipt, rpcCall, verifyOnMirror, RPC } from "../network.mjs";
const abi = new Interface([
  "function latestRoundData() view returns (uint80,int256,uint256,uint256,uint80)",
  "function decimals() view returns (uint8)",
  "function description() view returns (string)",
]);
function fixture({
  chain = "0x127",
  changed = false,
  description = "HBAR / USD",
} = {}) {
  let blocks = 0;
  return async (url, options) => {
    assert.equal(url, RPC);
    const { method, params } = JSON.parse(options.body);
    let result;
    if (method === "eth_chainId") result = chain;
    else if (method === "eth_getBlockByNumber") {
      blocks++;
      result = {
        number: "0x123",
        hash: "0x" + (changed && blocks > 1 ? "b" : "a").repeat(64),
      };
    } else {
      assert.equal(params[1], "0x123", "all calls must pin the same block");
      const name = abi.parseTransaction({ data: params[0].data }).name;
      const now = Math.floor(Date.now() / 1000);
      result = abi.encodeFunctionResult(
        name,
        name === "decimals"
          ? [8]
          : name === "description"
            ? [description]
            : [8n, 12345678n, now - 20, now - 10, 8n],
      );
    }
    return { ok: true, json: async () => ({ result }) };
  };
}
test("capture uses one pinned block for every feed read", async () =>
  assert.equal((await captureReceipt(fixture())).answer, "12345678"));
test("wrong chain fails before feed reads", async () =>
  assert.rejects(captureReceipt(fixture({ chain: "0x128" })), /chain/));
test("changed block cannot produce a mixed receipt", async () =>
  assert.rejects(captureReceipt(fixture({ changed: true })), /changed/));
test("wrong pair description is rejected", async () =>
  assert.rejects(
    captureReceipt(fixture({ description: "BTC / USD" })),
    /description/,
  ));
test("HTTP and RPC errors fail explicitly", async () => {
  await assert.rejects(
    rpcCall("eth_chainId", [], async () => ({ ok: false, status: 429 })),
    /429/,
  );
  await assert.rejects(
    rpcCall("eth_chainId", [], async () => ({
      ok: true,
      json: async () => ({ error: { message: "no data" } }),
    })),
    /could not/,
  );
});
test("mirror lag is an explicit failure, never a match", async () => {
  await assert.rejects(
    verifyOnMirror({}, "0.0.123", "1", undefined, async () => ({
      ok: false,
      status: 404,
    })),
    /404/,
  );
});
