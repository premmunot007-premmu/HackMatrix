import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CoverWise — Understand Your Health Cover Before You Need It',
  description:
    'Instant health policy analysis, grounded clause citations, treatment cost estimation, proportionate room rent deductions, and scenario comparisons.',
  keywords: [
    'health insurance',
    'out of pocket calculator',
    'room rent limit',
    'proportionate deduction',
    'policy clauses',
    'waiting periods',
    'copay estimator'
  ],
  authors: [{ name: 'CoverWise Team' }]
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
