"use client";
import { useState } from "react";
type Receipt = {
  schema: string;
  chainId: number;
  feed: string;
  blockNumber: number;
  blockHash: string;
  observedAt: number;
  roundId: string;
  answer: string;
  decimals: number;
  startedAt: number;
  updatedAt: number;
  answeredInRound: string;
  maxAgeSeconds: number;
};
type Observation = {
  receipt: Receipt;
  assessment: { eligible: boolean; ageSeconds: number; problems: string[] };
  digest: string;
  price: string;
};
type Verified = {
  digest: string;
  consensusTimestamp: string;
  payer: string;
  mirrorUrl: string;
};
const time = (seconds: number) =>
  new Date(seconds * 1000)
    .toISOString()
    .replace("T", " ")
    .replace(".000Z", " UTC");
export default function Home() {
  const [observation, setObservation] = useState<Observation | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [evidence, setEvidence] = useState("");
  const [verified, setVerified] = useState<Verified | null>(null);
  const [verifyError, setVerifyError] = useState("");
  const [verifying, setVerifying] = useState(false);
  async function observe() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/observe");
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setObservation(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Observation failed.");
    } finally {
      setBusy(false);
    }
  }
  function download() {
    if (!observation) return;
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(observation.receipt, null, 2) + "\n"], {
        type: "application/json",
      }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "receipt.json";
    a.click();
    URL.revokeObjectURL(url);
  }
  async function verify() {
    setVerifying(true);
    setVerifyError("");
    setVerified(null);
    try {
      const response = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: evidence,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setVerified(data);
    } catch (e) {
      setVerifyError(e instanceof Error ? e.message : "Verification failed.");
    } finally {
      setVerifying(false);
    }
  }
  return (
    <main>
      <header>
        <a className="brand" href="/">
          ◈ <span>ORACLE RECEIPT LAB</span>
        </a>
        <span className="network">
          Read: Mainnet <i /> Write: Testnet only
        </span>
      </header>
      <section className="hero">
        <p className="eyebrow">CHAINLINK × HEDERA CONSENSUS SERVICE</p>
        <h1>
          A price is a moment.
          <br />
          <span>Keep its provenance.</span>
        </h1>
        <p className="intro">
          Capture a Chainlink round at a pinned Hedera block. Keep an exact
          receipt, anchor it on testnet, and independently compare the consensus
          message.
        </p>
        <div className="flow">
          <span>01 Observe</span>
          <b>→</b>
          <span>02 Anchor</span>
          <b>→</b>
          <span>03 Verify</span>
        </div>
      </section>
      <div className="grid">
        <section className="card observation">
          <div className="sectionhead">
            <span className="step">01</span>
            <h2>Observe the feed</h2>
            <span className="tag">READ ONLY</span>
          </div>
          <p className="muted">
            HBAR / USD · Chainlink proxy · Hedera chain 295
          </p>
          <div className="price">
            {observation ? "$" + observation.price : "No observation yet"}
          </div>
          {observation ? (
            <>
              <p
                className={observation.assessment.eligible ? "good" : "warning"}
              >
                {observation.assessment.eligible
                  ? "Eligible at observation"
                  : "Not eligible: " +
                    observation.assessment.problems.join(", ")}
              </p>
              <dl>
                <dt>Oracle updated</dt>
                <dd>{time(observation.receipt.updatedAt)}</dd>
                <dt>Observed</dt>
                <dd>{time(observation.receipt.observedAt)}</dd>
                <dt>Pinned block</dt>
                <dd>{observation.receipt.blockNumber}</dd>
                <dt>Round ID</dt>
                <dd>{observation.receipt.roundId}</dd>
              </dl>
              <div className="digest">
                <small>SHA-256 · CANONICAL RECEIPT</small>
                <code>{observation.digest}</code>
              </div>
            </>
          ) : (
            <p className="empty">
              Fetch an actual network observation to begin. No wallet connection
              or API key is required.
            </p>
          )}
          {error && (
            <p role="alert" className="warning">
              {error}
            </p>
          )}
          <div className="actions">
            <button onClick={observe} disabled={busy}>
              {busy
                ? "Reading pinned block…"
                : observation
                  ? "Refresh observation"
                  : "Capture live observation"}
            </button>
            <button
              className="secondary"
              onClick={download}
              disabled={!observation}
            >
              Download receipt
            </button>
          </div>
          <p className="fine">
            Freshness policy: 24 hours. This is a development threshold, not a
            trading signal. A saved observation does not update automatically.
          </p>
        </section>
        <section className="card">
          <div className="sectionhead">
            <span className="step">02</span>
            <h2>Anchor on testnet</h2>
          </div>
          <p className="muted">
            A local CLI signs a single HCS message. Private keys stay outside
            the web application.
          </p>
          <ol>
            <li>Fund a dedicated testnet account with the official faucet.</li>
            <li>
              Set its account ID and DER private key in the root{" "}
              <code>.env</code>.
            </li>
            <li>Capture, anchor, then verify the exact bytes.</li>
          </ol>
          <pre>
            npm run capture{"\n"}npm run anchor -- --testnet{"\n"}npm run verify
          </pre>
          <p className="fine">
            The CLI creates a submit-key-protected topic, then sends one
            ≤1,024-byte message. Each transaction is capped at 1 testnet HBAR.
            Network confirmation and mirror availability are separate steps.
          </p>
          <a
            className="textlink"
            href="https://portal.hedera.com/faucet"
            target="_blank"
            rel="noreferrer"
          >
            Open official testnet faucet ↗
          </a>
        </section>
      </div>
      <section className="card verify">
        <div className="sectionhead">
          <span className="step">03</span>
          <h2>Verify the receipt</h2>
          <span className="tag">INDEPENDENT MIRROR READ</span>
        </div>
        <p className="muted">
          Paste the CLI’s <code>runtime/evidence.json</code>. Verification
          compares canonical receipt bytes, sequence and payer against the
          public testnet mirror.
        </p>
        <label htmlFor="evidence">Evidence JSON</label>
        <textarea
          id="evidence"
          spellCheck={false}
          value={evidence}
          onChange={(e) => {
            setEvidence(e.target.value);
            setVerified(null);
            setVerifyError("");
          }}
          placeholder="Paste your actual testnet evidence file here"
          maxLength={8192}
        />
        <button onClick={verify} disabled={!evidence.trim() || verifying}>
          {verifying ? "Checking consensus message…" : "Verify against mirror"}
        </button>
        {verifyError && (
          <p className="warning" role="alert">
            {verifyError}
          </p>
        )}
        {verified && (
          <div className="result" role="status">
            <strong>Exact receipt matched</strong>
            <p>
              Consensus timestamp: {verified.consensusTimestamp} · Payer:{" "}
              {verified.payer}
            </p>
            <code>{verified.digest}</code>
            <p>
              <a href={verified.mirrorUrl} target="_blank" rel="noreferrer">
                Inspect the raw mirror message ↗
              </a>
            </p>
          </div>
        )}
      </section>
      <aside>
        <strong>What this proves</strong>
        <p>
          A match establishes that the submitted bytes appear at the specified
          HCS sequence. It does not independently authenticate the oracle
          answer, prove a market price, or establish that the payer owns the
          feed. Source RPC trust and the submitter’s identity remain separate
          concerns. Testnet data may be reset.
        </p>
      </aside>
      <footer>
        <span>Oracle Receipt Lab / v1.0</span>
        <a
          href="https://docs.chain.link/data-feeds/price-feeds/addresses?network=hedera&page=1"
          target="_blank"
          rel="noreferrer"
        >
          Feed registry ↗
        </a>
        <a
          href="https://docs.hedera.com/native/consensus/submit-message"
          target="_blank"
          rel="noreferrer"
        >
          HCS documentation ↗
        </a>
      </footer>
    </main>
  );
}
