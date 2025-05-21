// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar"; // Import the Navbar

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Moroccan Economy Dashboard",
    description: "Multidimensional analysis of the Moroccan Economy using a Data Warehouse.",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
        <body className={`${inter.className} bg-gray-900 text-white`}>
        <Navbar /> {/* Add Navbar here */}
        <main className="container mx-auto p-4 md:p-8"> {/* Add some padding to main content */}
            {children}
        </main>
        {/* You can add a Footer component here as well */}
        </body>
        </html>
    );
}