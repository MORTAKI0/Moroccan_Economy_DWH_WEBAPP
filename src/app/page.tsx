// src/app/page.tsx
import Link from 'next/link';

export default function HomePage() {
    return (
        <div className="min-h-[calc(100vh-100px)] flex flex-col items-center justify-center text-center"> {/* Adjust min-h if navbar height changes */}
            <section className="bg-gray-800 p-8 md:p-12 rounded-xl shadow-2xl max-w-3xl">
                <h1 className="text-5xl font-extrabold text-blue-400 mb-6">
                    Analyzing the Moroccan Economy
                </h1>
                <p className="text-lg text-gray-300 mb-4">
                    Welcome to the Moroccan Economy Data Warehouse project. Our vision is to provide
                    a comprehensive platform for multidimensional analysis of key economic indicators.
                </p>
                <p className="text-lg text-gray-300 mb-8">
                    Leveraging data from diverse sources like HCP, Bank Al-Maghrib, and the World Bank,
                    this dashboard aims to offer insightful visualizations, further enhanced by
                    AI-generated descriptions to make complex data more accessible.
                </p>
                <div className="space-y-4 md:space-y-0 md:space-x-4 flex flex-col md:flex-row justify-center">
                    <Link
                        href="/dashboard"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition duration-300 ease-in-out transform hover:scale-105"
                    >
                        View Dashboard
                    </Link>
                    <Link
                        href="https://github.com/your-username/moroccan-economy-dwh" // Replace with your actual GitHub repo link
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition duration-300 ease-in-out transform hover:scale-105"
                    >
                        Project on GitHub
                    </Link>
                </div>
            </section>
        </div>
    );
}