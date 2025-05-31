// src/components/Navbar.tsx
import Link from 'next/link';

export default function Navbar() {
    return (
        <nav className="relative z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo/Brand */}
                    <div className="flex-shrink-0">
                        <Link
                            href="/"
                            className="text-xl font-bold text-white hover:text-sky-400 transition-colors duration-200"
                        >
                            Moroccan Economy DWH
                        </Link>
                    </div>

                    {/* Navigation Links */}
                    <div className="flex space-x-8">
                        <Link
                            href="/"
                            className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                        >
                            Home
                        </Link>
                        <Link
                            href="/dashboard"
                            className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                        >
                            Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}