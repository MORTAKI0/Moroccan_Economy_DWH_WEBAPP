import Link from 'next/link';

export default function Navbar() {
    return (
        <nav className="bg-slate-800/50 backdrop-blur-lg border-b border-slate-700 sticky top-0 z-50">
            <div className="container mx-auto px-4 py-3">
                <div className="flex justify-between items-center">
                    <Link 
                        href="/" 
                        className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent hover:from-blue-300 hover:to-blue-500"
                    >
                        Moroccan Economy DWH
                    </Link>
                    <div className="space-x-6">
                        <Link 
                            href="/" 
                            className="text-slate-300 hover:text-white font-medium transition-colors"
                        >
                            Home
                        </Link>
                        <Link 
                            href="/dashboard" 
                            className="text-slate-300 hover:text-white font-medium transition-colors"
                        >
                            Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}