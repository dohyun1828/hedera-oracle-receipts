import { captureReceipt } from "@sh/oracle-core/network";
import { assessReceipt, digestReceipt, formatAnswer } from "@sh/oracle-core";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
let cached: { expires: number; value: unknown } | undefined;
let pending: Promise<unknown> | undefined;
export async function GET() {
  try {
    if (cached && cached.expires > Date.now())
      return Response.json(cached.value, {
        headers: { "Cache-Control": "no-store" },
      });
    pending ??= captureReceipt()
      .then((receipt) => {
        const value = {
          receipt,
          assessment: assessReceipt(receipt),
          digest: digestReceipt(receipt),
          price: formatAnswer(receipt.answer, receipt.decimals),
        };
        cached = { expires: Date.now() + 10000, value };
        return value;
      })
      .finally(() => {
        pending = undefined;
      });
    return Response.json(await pending, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return Response.json(
      {
        error:
          "The public oracle RPC is unavailable or returned an invalid round. Please retry later.",
      },
      { status: 502 },
    );
  }
}
