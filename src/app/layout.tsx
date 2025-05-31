// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; // Make sure this path correctly points to your globals.css
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
        <body className="flex flex-col min-h-screen"> {/* Default theme from globals.css */}
        <Navbar />
        <main className="flex-grow"> {/* Removed container and padding constraints */}
            {children}
        </main>
        {/* Optional Footer
            <footer className="py-6 text-center text-xs text-[rgb(var(--foreground-rgb))] opacity-60 border-t border-[rgba(var(--foreground-rgb),0.1)]">
                © {new Date().getFullYear()} Moroccan Economy Data Platform
            </footer>
            */}
        </body>
        </html>
    );
}