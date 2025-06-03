// src/app/page.tsx
"use client"; // ESSENTIAL: Marks this as a Client Component because it uses hooks for client-side effects.

import Link from 'next/link';
import { useState, useEffect } from 'react'; // For client-side state and effects

// SVG Icon Components (ensure these are defined as in your context or imported)
const IconChevronRight = () => (
    <svg className="w-5 h-5 ml-1.5 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
    </svg>
);
const IconGitHub = () => (
    <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807.1.493-.789-.002-.695.583-1.326.583-1.326-.695-.583-1.704-2.085-1.704-2.085-.546-1.387-1.333-1.756-1.333-1.756 0 0 .417-.066 1.024.256-.003-.04-.003-.08-.003-.121 0-1.273-.874-2.331-2.008-2.331-1.134 0-2.008 1.058-2.008 2.331 0 .041 0 .081-.003-.121.607-.322 1.024-.256 1.024-.256 1.071 1.836 2.808 1.305 3.493 1 .108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    </svg>
);
const IconMultiSource = () => (
    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
);
const IconAIPowered = () => (
    <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
);
const IconInteractiveDashboards = () => (
    <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
    </svg>
);
const IconExternalLink = () => (
    <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
);

interface ParticleStyle {
    left: string;
    top: string;
    animationDelay: string;
    animationDuration: string;
}

export default function HomePage() {
    const [particleStyles, setParticleStyles] = useState<ParticleStyle[]>([]);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true); // Mark as mounted on client

        // Generate styles only on the client after mounting
        const styles: ParticleStyle[] = Array.from({ length: 10 }).map(() => ({
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 6}s`,
            animationDuration: `${6 + Math.random() * 6}s`,
        }));
        setParticleStyles(styles);
    }, []); // Empty dependency array ensures this runs only once on mount

    // This function will render particles only when isMounted is true
    const renderParticles = () => (
        <div className="absolute inset-0 -z-10">
            {particleStyles.map((style, i) => (
                <div
                    key={i}
                    className="absolute w-1.5 h-1.5 bg-sky-400/20 rounded-full animate-float" // Make sure .animate-float is defined in globals.css
                    style={style}
                ></div>
            ))}
        </div>
    );

    const navbarHeight = "56px"; // From your Navbar component (h-14 Tailwind = 3.5rem = 56px if 1rem=16px)

    return (
        <div
            className="flex flex-col items-center justify-center text-slate-100 p-4 relative overflow-hidden"
            style={{ minHeight: `calc(100vh - ${navbarHeight})` }}
        >
            {/* styled-jsx for animations specific to this page (blob) */}
            {/* These animations could also be moved to globals.css if preferred */}
            <style jsx>{`
                .animate-blob {
                    animation: blob 10s infinite ease-in-out;
                }
                .animation-delay-2s { animation-delay: -2s; }
                .animation-delay-4s { animation-delay: -4s; }

                @keyframes blob {
                    0%, 100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; transform: translate(0px, 0px) rotate(0deg); opacity: 0.7;}
                    25% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; transform: translate(20px, -30px) rotate(72deg); opacity: 0.4;}
                    50% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; transform: translate(-20px, 40px) rotate(144deg); opacity: 0.7;}
                    75% { border-radius: 40% 70% 60% 30% / 70% 40% 60% 30%; transform: translate(10px, -10px) rotate(216deg); opacity: 0.4;}
                }

                /* .animate-float is now applied via className, keyframes should be in globals.css or here */
                /* If .animate-float keyframes are in globals.css, this @keyframes float definition can be removed from here */
                @keyframes float { 
                    0%,100%{transform:translateY(0)} 
                    50%{transform:translateY(-15px)} 
                }
            `}</style>

            {/* Animated background blobs (CSS driven, safe for SSR) */}
            <div className="absolute inset-0 -z-20 bg-gradient-to-br from-slate-900 via-blue-950 to-black"></div>
            <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden opacity-20 blur-3xl">
                <div className="absolute aspect-square w-96 md:w-[500px] lg:w-[600px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-sky-600 to-purple-800 left-1/4 top-1/4 animate-blob"></div>
                <div className="absolute aspect-square w-80 md:w-[450px] lg:w-[500px] translate-x-1/3 rounded-full bg-gradient-to-tl from-emerald-600 to-teal-800 right-1/4 bottom-1/4 animate-blob animation-delay-2s"></div>
            </div>

            {/* Render particles only after client-side mount */}
            {isMounted && renderParticles()}

            <main className="relative z-20 text-center max-w-4xl mx-auto flex flex-col items-center justify-center flex-grow px-4 py-10 sm:py-16">
                <div className="inline-flex items-center px-4 py-1.5 mb-6 text-sm bg-sky-500/10 text-sky-300 rounded-full border border-sky-500/25 backdrop-blur-sm">
                    <span className="w-2.5 h-2.5 bg-green-400 rounded-full mr-2.5 animate-pulse"></span>
                    Live Economic Data Platform
                </div>

                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight tracking-tight">
                    Explore the <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-400 to-violet-500">Moroccan Economy</span>
                    <br />
                    Data Warehouse
                </h1>

                <p className="text-lg sm:text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
                    A comprehensive platform for multidimensional analysis of key economic indicators,
                    providing valuable insights for decision-making.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12 w-full">
                    <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-xl shadow-lg border border-slate-700/50 hover:bg-slate-700/70 transition-all">
                        <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4 mx-auto ring-1 ring-blue-500/30">
                            <IconMultiSource />
                        </div>
                        <h3 className="text-xl font-semibold text-sky-300 mb-2">Multi-Source Data</h3>
                        <p className="text-sm text-slate-400">Integration from HCP, Bank Al-Maghrib, and World Bank.</p>
                    </div>
                    <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-xl shadow-lg border border-slate-700/50 hover:bg-slate-700/70 transition-all">
                        <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center mb-4 mx-auto ring-1 ring-emerald-500/30">
                            <IconAIPowered />
                        </div>
                        <h3 className="text-xl font-semibold text-emerald-300 mb-2">AI-Powered Insights</h3>
                        <p className="text-sm text-slate-400">Automated descriptions and smart analysis.</p>
                    </div>
                    <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-xl shadow-lg border border-slate-700/50 hover:bg-slate-700/70 transition-all">
                        <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4 mx-auto ring-1 ring-purple-500/30">
                            <IconInteractiveDashboards />
                        </div>
                        <h3 className="text-xl font-semibold text-purple-300 mb-2">Interactive Dashboards</h3>
                        <p className="text-sm text-slate-400">Dynamic visualizations and real-time analytics.</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                    <Link
                        href="/dashboard"
                        className="group inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg hover:shadow-blue-500/40 transition-all duration-300 transform hover:scale-105"
                    >
                        Explore Dashboard
                        <IconChevronRight />
                    </Link>
                    <Link
                        href="https://github.com/abdelkader-midassi/moroccan-economy-dashboard" // YOUR GitHub link
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold text-slate-200 bg-slate-700/60 hover:bg-slate-600/80 rounded-xl shadow-lg hover:shadow-slate-500/30 transition-all duration-300 transform hover:scale-105"
                    >
                        <IconGitHub />
                        View on GitHub
                    </Link>
                </div>
            </main>
        </div>
    );
}