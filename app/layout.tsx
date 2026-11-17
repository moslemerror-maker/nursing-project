import './globals.css';
import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Nursing Assessment Portal',
  description: 'Nursing pre-test and post-test assessment portal'
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
