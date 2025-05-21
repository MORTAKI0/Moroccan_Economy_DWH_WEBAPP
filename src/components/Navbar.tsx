// src/components/Navbar.tsx
import Link from 'next/link';

export default function Navbar() {
    return (
        <nav className="bg-gray-800 text-white p-4 shadow-md">
            <div className="container mx-auto flex justify-between items-center">
                <Link href="/" className="text-xl font-bold text-blue-400 hover:text-blue-300">
                    Moroccan Economy DWH
                </Link>
                <div className="space-x-4">
                    <Link href="/" className="hover:text-gray-300">
                        Home
                    </Link>
                    <Link href="/dashboard" className="hover:text-gray-300">
                        Dashboard
                    </Link>
                    {/* Add more links here as needed */}
                </div>
            </div>
        </nav>
    );
}