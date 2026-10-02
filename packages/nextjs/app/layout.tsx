import type { Metadata } from "next";
import "./style.css";
export const metadata: Metadata = {
  title: "Oracle Receipt Lab",
  description:
    "Observe a Chainlink round. Record its provenance. Verify the exact bytes with Hedera Consensus Service.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
