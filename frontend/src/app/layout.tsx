import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import 'katex/dist/katex.min.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'SRP Education AI - Learn Smart, Grow Strong',
  description:
    'An all-in-one trusted education platform that helps students learn, prepare for exams, reduce stress, and improve results.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: '12px',
              padding: '12px 16px',
              fontSize: '14px',
            },
          }}
        />
      </body>
    </html>
  );
}
