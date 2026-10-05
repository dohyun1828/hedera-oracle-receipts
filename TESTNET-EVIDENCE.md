# Testnet HCS evidence

Validation date: 2026-10-05 (UTC)

This is public testnet evidence. It contains no private key, recovery phrase, password or mainnet credential. An existing dedicated ECDSA testnet key was reused; no new key was generated during this validation.

## Public identifiers

- Network: Hedera testnet
- Payer account: `0.0.10865085`
- Public EVM address: `0x9dbf6a930dcc97d837a35f29928fe750a5801715`
- Topic: `0.0.10865105`
- Sequence: `1`
- Transaction ID: `0.0.10865085@1791164496.187795078`
- Consensus timestamp: `1791164503.927899051`
- Transaction status: `SUCCESS`
- Receipt SHA-256: `9d21f7cd4826f35df9b19ef5decbace4952850160452424a346697bdbe97ddfe`

## Verifiable links

- [Mirror message](https://testnet.mirrornode.hedera.com/api/v1/topics/0.0.10865105/messages/1)
- [Mirror transaction](https://testnet.mirrornode.hedera.com/api/v1/transactions/0.0.10865085-1791164496-187795078)
- [Mirror topic](https://testnet.mirrornode.hedera.com/api/v1/topics/0.0.10865105)
- [Mirror payer account](https://testnet.mirrornode.hedera.com/api/v1/accounts/0.0.10865085)
- [HashScan transaction](https://hashscan.io/testnet/transaction/0.0.10865085@1791164496.187795078)

The Mirror links returned HTTP 200 during validation. The HashScan URL is the SDK-generated public transaction link, but an automated HTTP request returned 404 at validation time; the Mirror message link is the independently verified submission evidence.

## Anchored receipt

- Schema: `oracle-receipt/1`
- Source chain: Hedera mainnet, chain ID `295`
- Feed: Chainlink HBAR/USD proxy `0xaf685fb45c12b92b5054ccb9313e135525f9b5d5`
- Pinned block: `100737388`
- Block hash: `0x35a8fa704dc0a664ce96009f18b8aa8e8727d954bf2c3d88f231254229d8d517`
- Round ID: `18446744073709590211`
- Integer answer: `10421000` with 8 decimals (`0.10421000` USD/HBAR)
- Observed at: `1791164469`
- Updated at: `1791160981`
- Assessment at capture: eligible; age 3,488 seconds; no problems
- Canonical message size: 399 bytes

## Verification performed

1. `npm run capture` produced the eligible pinned-block receipt.
2. `npm run anchor` created topic `0.0.10865105` and submitted exactly one canonical message on testnet.
3. `npm run verify` returned `matched: true` after comparing the Mirror Node message bytes, sequence and payer.
4. The verifier recomputed the same SHA-256 digest shown above.
5. Independent public queries confirmed the topic memo `Oracle Receipt Lab v1`, sequence `1`, payer `0.0.10865085`, a 399-byte message and one successful transaction record.

This proves that the documented receipt bytes appeared at the stated HCS topic sequence. It does not prove the economic accuracy of the oracle, identify a real-world person, provide a mainnet guarantee or imply competition acceptance or an award.
