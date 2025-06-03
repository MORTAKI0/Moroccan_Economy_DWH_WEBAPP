// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; // Make sure this path is correct and globals.css exists
import Navbar from "@/components/Navbar";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter", // This defines the CSS variable name for Inter font
    display: "swap"
});

export const metadata: Metadata = {
    title: "Moroccan Economy Dashboard",
    description:
        "Multidimensional analysis of the Moroccan economy using a data warehouse.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className={`${inter.variable} h-full antialiased`}>
        <head>
            {/* Next.js automatically handles many essential head tags.
                    You can add other global meta tags or links here if needed.
                    For example: <link rel="icon" href="/favicon.ico" />
                */}
        </head>
        <body suppressHydrationWarning className="flex flex-col min-h-screen"> {/* Ensure body uses flex and can grow */}
        <Navbar />
        <main className="flex-grow"> {/* This allows the main content (children/page) to fill available space */}
            {children}
        </main>
        {/* Optional Footer can be added here */}
        </body>
        </html>
    );
}