
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";


export const metadata: Metadata = {
  title: 'SuperScripts', // Updated title
  description: 'Get tailored Instagram reel scripts crafted from extensive market research.', // Updated description to match page
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
