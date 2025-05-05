
import type {Metadata} from 'next';
// Removed Geist font import as Inter is used in globals.css
import './globals.css';
import { Toaster } from "@/components/ui/toaster"; // Import Toaster


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
    <html lang="en">
      {/* Removed font variables from body className as Inter is applied globally */}
      <body className={`antialiased`}>
        {children}
        <Toaster /> {/* Add Toaster here */}
      </body>
    </html>
  );
}
