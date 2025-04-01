import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastContainer } from 'react-toastify';
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AnnonChat",
  description: "A simple encrypted chat app made with <3 by SuggarHidden",
  metadataBase: new URL("https://annonchat.suggarhidden.dev"),
  keywords: [
    "AnnonChat",
    "AnnonChat App",
    "AnnonChat App Chat",
    "Anonimous Chat",
    "Encrypted chat",
    "Anonymous chat",
    "Secure chat app",
    "Private messages",
    "No registration chat",
    "Protected chat",
    "Encrypted messaging",
    "Anonymity app",
    "Anonymous communication",
    "Secure application",
    "Encrypted conversations",
    "Private messaging app",
    "Anonymous platform",
    "Unidentified chat",
    "Privacy in chat",
    "Secure messaging app",
    "Message encryption",
    "Secret messages",
    "Online anonymity",
    "Hidden messages"
  ].join(", "),
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://annonchat.suggarhidden.dev",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  openGraph: {
    title: "AnnoChat - Anonimous Chat",
    description: "A simple encrypted chat app made with <3 by SuggarHidden",
    url: "https://annonchat.suggarhidden.dev",
    siteName: "AnnoChat - Anonimous Chat",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "AnnoChat - Anonimous Chat",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AnnoChat - Anonimous Chat",
    description: "A simple encrypted chat app made with <3 by SuggarHidden",
    images: ["/logo.png"],
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ToastContainer />
        {children}
      </body>
    </html>
  );
}
