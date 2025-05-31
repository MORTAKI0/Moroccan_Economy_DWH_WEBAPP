// src/app/page.tsx
import Link from 'next/link';

// Updated SVG Icons with explicit className for Tailwind sizing
const ArrowRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 ml-2 group-hover:translate-x-0.5 transition-transform duration-200 ease-in-out">
        <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l3.5 3.25a.75.75 0 010 1.08l-3.5 3.25a.75.75 0 11-1.04-1.08l2.158-1.97H3.75A.75.75 0 013 10z" clipRule="evenodd" />
    </svg>
);

const GitHubIcon = () => (
    <svg className="w-6 h-6 mr-2.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
    </svg>
);

// Feature Card Icons (Heroicons - outline style)
const FeatureIcon1 = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-sky-400">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
    </svg>
);

const FeatureIcon2 = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-emerald-400">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5m1.5 4.5H3m18 0h-1.5m-16.5-4.5H3m1.5 1.5h16.5m0 4.5H3m1.5-1.5h16.5m0-4.5H6.75m10.5 0h1.5m-1.5 4.5H6.75" />
    </svg>
);

const FeatureIcon3 = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-purple-400">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
    </svg>
);

export default function HomePage() {
    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center text-slate-100 relative overflow-hidden selection:bg-sky-500/30 selection:text-sky-100">
            {/* Background Gradient */}
            <div className="absolute inset-0 -z-20 bg-gradient-to-br from-slate-900 via-blue-950 to-black"></div>

            {/* Animated Blobs */}
            <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden opacity-20 blur-3xl">
                <div className="absolute aspect-square w-96 md:w-[500px] lg:w-[600px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-sky-600 to-purple-800 left-1/4 top-1/4 animate-blob"></div>
                <div className="absolute aspect-square w-80 md:w-[450px] lg:w-[500px] translate-x-1/3 rounded-full bg-gradient-to-tl from-emerald-600 to-teal-800 right-1/4 bottom-1/4 animate-blob animation-delay-2s"></div>
            </div>

            {/* Main Content */}
            <div className="relative z-0 max-w-6xl w-full mx-auto px-6 sm:px-8 py-12">
                <div className="bg-slate-800/20 backdrop-blur-xl p-8 sm:p-10 md:p-12 rounded-2xl shadow-2xl border border-slate-700/50">
                    {/* Badge */}
                    <div className="mb-8 text-center">
                        <span className="inline-block px-5 py-2 text-sm font-semibold tracking-wider text-sky-200 bg-sky-700/40 rounded-full border border-sky-600/60 shadow-md">
                            Economic Insights Platform
                        </span>
                    </div>

                    {/* Title */}
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-4 text-center tracking-tighter">
                        Moroccan Economy
                        <span className="block mt-1 sm:mt-2 text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-500">
                            Data Warehouse
                        </span>
                    </h1>

                    {/* Description */}
                    <p className="text-lg sm:text-xl text-slate-300/90 mb-12 max-w-2xl mx-auto text-center leading-relaxed">
                        Unlock the power of data with comprehensive analysis, dynamic visualizations, and AI-enhanced insights into Morocco's key economic indicators.
                    </p>

                    {/* Feature Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        {[
                            {
                                title: "Multi-Source Data",
                                description: "HCP, Bank Al-Maghrib, World Bank.",
                                Icon: FeatureIcon1
                            },
                            {
                                title: "AI-Powered Insights",
                                description: "Automated, accessible analysis.",
                                Icon: FeatureIcon2
                            },
                            {
                                title: "Interactive Dashboards",
                                description: "Dynamic, real-time visualizations.",
                                Icon: FeatureIcon3
                            },
                        ].map((feature) => (
                            <div
                                key={feature.title}
                                className="bg-slate-800/50 backdrop-blur-md p-6 rounded-xl shadow-xl border border-slate-700/60 hover:border-slate-500/80 hover:bg-slate-700/60 transition-all duration-300 text-center md:text-left"
                            >
                                <div className="flex justify-center md:justify-start mb-3">
                                    <feature.Icon />
                                </div>
                                <h3 className="text-xl font-semibold text-slate-100 mb-2">{feature.title}</h3>
                                <p className="text-sm text-slate-400">{feature.description}</p>
                            </div>
                        ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-5">
                        <Link
                            href="/dashboard"
                            className="group inline-flex items-center justify-center w-full sm:w-auto px-8 py-3.5 text-base lg:text-lg font-semibold text-white bg-blue-600 hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 rounded-lg shadow-xl hover:shadow-blue-500/40 transition-all duration-200 ease-in-out transform hover:scale-[1.03]"
                        >
                            View Dashboard
                            <ArrowRightIcon />
                        </Link>
                        <Link
                            href="https://github.com/abdelkader-midassi/moroccan-economy-dashboard"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group inline-flex items-center justify-center w-full sm:w-auto px-8 py-3.5 text-base lg:text-lg font-semibold text-slate-100 bg-slate-700/70 hover:bg-slate-600/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 rounded-lg shadow-xl hover:shadow-slate-500/40 transition-all duration-200 ease-in-out transform hover:scale-[1.03]"
                        >
                            <GitHubIcon />
                            Project on GitHub
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}