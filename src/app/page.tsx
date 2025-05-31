import Link from 'next/link';

export default function HomePage() {
    return (
        <div className="min-h-[calc(100vh-73px)] flex flex-col items-center justify-center text-center px-4">
            <section className="max-w-4xl w-full bg-gradient-to-b from-slate-800 to-slate-900 p-8 md:p-12 rounded-2xl shadow-xl border border-slate-700">
                <h1 className="text-4xl md:text-6xl font-extrabold mb-6">
                    <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                        Analyzing the Moroccan Economy
                    </span>
                </h1>
                <p className="text-lg md:text-xl text-slate-300 mb-4 max-w-2xl mx-auto">
                    Welcome to the Moroccan Economy Data Warehouse project. Our vision is to provide
                    a comprehensive platform for multidimensional analysis of key economic indicators.
                </p>
                <p className="text-lg md:text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
                    Leveraging data from diverse sources like HCP, Bank Al-Maghrib, and the World Bank,
                    this dashboard offers insightful visualizations enhanced by AI-generated descriptions.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Link
                        href="/dashboard"
                        className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-lg w-full sm:w-auto transform hover:scale-105 transition-all shadow-lg hover:shadow-blue-500/25"
                    >
                        View Dashboard
                    </Link>
                    <Link
                        href="https://github.com/your-username/moroccan-economy-dwh"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-8 py-4 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl text-lg w-full sm:w-auto transform hover:scale-105 transition-all shadow-lg"
                    >
                        Project on GitHub
                    </Link>
                </div>
            </section>
        </div>
    );
}