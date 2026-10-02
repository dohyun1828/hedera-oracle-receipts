import { Interface } from "ethers";
import {
  FEED,
  MAX_AGE,
  normalizeReceipt,
  validatePointer,
  verifyMirrorMessage,
} from "./receipt.mjs";
export const RPC = "https://mainnet.hashio.io/api";
export const MIRROR = "https://testnet.mirrornode.hedera.com";
const ABI = new Interface([
  "function latestRoundData() view returns (uint80,int256,uint256,uint256,uint80)",
  "function decimals() view returns (uint8)",
  "function description() view returns (string)",
]);
async function jsonRequest(url, options, fetcher) {
  const response = await fetcher(url, {
    ...options,
    signal: AbortSignal.timeout(12000),
    cache: "no-store",
  });
  if (!response.ok)
    throw new Error("Upstream returned HTTP " + response.status);
  return response.json();
}
export async function rpcCall(method, params, fetcher = fetch) {
  const value = await jsonRequest(
    RPC,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    },
    fetcher,
  );
  if (value.error || value.result == null)
    throw new Error("Hedera RPC could not return this observation.");
  return value.result;
}
export async function captureReceipt(fetcher = fetch) {
  if ((await rpcCall("eth_chainId", [], fetcher)) !== "0x127")
    throw new Error("Unexpected oracle chain.");
  const block = await rpcCall(
    "eth_getBlockByNumber",
    ["latest", false],
    fetcher,
  );
  if (!block?.hash || !/^0x[0-9a-f]+$/i.test(block.number))
    throw new Error("Missing pinned block.");
  const atBlock = (name) =>
    rpcCall(
      "eth_call",
      [{ to: FEED, data: ABI.encodeFunctionData(name) }, block.number],
      fetcher,
    ).then((value) => ABI.decodeFunctionResult(name, value));
  const [round, decimals, description] = await Promise.all([
    atBlock("latestRoundData"),
    atBlock("decimals"),
    atBlock("description"),
  ]);
  if (description[0] !== "HBAR / USD")
    throw new Error("Unexpected feed description.");
  const again = await rpcCall(
    "eth_getBlockByNumber",
    [block.number, false],
    fetcher,
  );
  if (again.hash !== block.hash)
    throw new Error("Pinned block changed during observation. Retry.");
  return normalizeReceipt({
    schema: "oracle-receipt/1",
    chainId: 295,
    feed: FEED,
    blockNumber: Number(BigInt(block.number)),
    blockHash: block.hash.toLowerCase(),
    observedAt: Math.floor(Date.now() / 1000),
    roundId: round[0].toString(),
    answer: round[1].toString(),
    decimals: Number(decimals[0]),
    startedAt: Number(round[2]),
    updatedAt: Number(round[3]),
    answeredInRound: round[4].toString(),
    maxAgeSeconds: MAX_AGE,
  });
}
export async function verifyOnMirror(
  receipt,
  topic,
  sequence,
  expectedPayer,
  fetcher = fetch,
) {
  validatePointer(topic, sequence);
  const url = MIRROR + "/api/v1/topics/" + topic + "/messages/" + sequence;
  const message = await jsonRequest(url, {}, fetcher);
  return {
    ...verifyMirrorMessage(receipt, message, sequence, expectedPayer),
    mirrorUrl: url,
  };
}
