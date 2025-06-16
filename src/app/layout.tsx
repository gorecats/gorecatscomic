import { Metadata } from "next";
import "./globals.css";
import ClientContextProvider from "@/providers/ClientContextProvider";

export const metadata: Metadata = {
  title: "Gorecats",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL as string),
  openGraph: {
    type: "website",
    title: "Gorecats",
    url: process.env.NEXT_PUBLIC_SITE_URL,
    siteName: "Gorecats",
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClientContextProvider>
    <html lang="en">
      <body>
          {children}
      </body>
    </html>
    </ClientContextProvider>
  );
}
