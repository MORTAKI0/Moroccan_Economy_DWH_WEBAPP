// src/app/page.tsx
import Link from 'next/link';

export default function HomePage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
            </div>

            {/* Floating particles */}
            <div className="absolute inset-0">
                <div className="absolute w-1 h-1 bg-blue-400/30 rounded-full animate-bounce top-1/4 left-1/4"></div>
                <div className="absolute w-1 h-1 bg-emerald-400/30 rounded-full animate-ping top-3/4 left-1/3"></div>
                <div className="absolute w-1 h-1 bg-purple-400/30 rounded-full animate-pulse top-1/2 right-1/4"></div>
                <div className="absolute w-1 h-1 bg-blue-400/30 rounded-full animate-bounce top-1/3 right-1/3"></div>
                <div className="absolute w-1 h-1 bg-emerald-400/30 rounded-full animate-ping top-2/3 left-2/3"></div>
            </div>

            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-20">
                <div className="max-w-5xl mx-auto text-center">
                    {/* Hero Badge */}
                    <div className="inline-flex items-center px-4 py-2 mb-8 bg-blue-500/10 border border-blue-500/20 rounded-full backdrop-blur-sm">
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-3 animate-pulse"></div>
                        <span className="text-blue-300 text-sm font-medium">Live Economic Data Platform</span>
                    </div>

                    {/* Main Heading */}
                    <h1 className="text-6xl md:text-7xl font-black mb-6 bg-gradient-to-r from-blue-400 via-emerald-400 to-purple-400 bg-clip-text text-transparent leading-tight">
                        Moroccan Economy
                        <span className="block text-5xl md:text-6xl mt-2">Data Warehouse</span>
                    </h1>

                    {/* Subtitle */}
                    <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed font-light">
                        Comprehensive platform for multidimensional analysis of
                        <span className="text-emerald-400 font-medium"> key economic indicators</span>
                    </p>

                    {/* Feature highlights */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
                        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 group">
                            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">Multi-Source Data</h3>
                            <p className="text-slate-400 text-sm">HCP, Bank Al-Maghrib, World Bank integration</p>
                        </div>

                        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 group">
                            <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">AI-Powered Insights</h3>
                            <p className="text-slate-400 text-sm">Smart analysis with automated descriptions</p>
                        </div>

                        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 group">
                            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">Interactive Dashboards</h3>
                            <p className="text-slate-400 text-sm">Dynamic visualizations and real-time analytics</p>
                        </div>
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link
                            href="/dashboard"
                            className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-xl hover:shadow-blue-500/25 transform hover:scale-105 transition-all duration-300 border border-blue-500/20 backdrop-blur-sm"
                        >
                            <span className="relative z-10">Explore Dashboard</span>
                            <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                        </Link>

                        <Link
                            href="https://github.com/your-username/moroccan-economy-dwh"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-white/10 rounded-2xl border border-white/20 backdrop-blur-sm hover:bg-white/20 transform hover:scale-105 transition-all duration-300"
                        >
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807.1.493-.789-.002-.695.583-1.326.583-1.326-.695-.583-1.704-2.085-1.704-2.085-.546-1.387-1.333-1.756-1.333-1.756 0 0 .417-.066 1.024.256-.003-.04-.003-.08-.003-.121 0-1.273-.874-2.331-2.008-2.331-1.134 0-2.008 1.058-2.008 2.331 0 .041 0 .081-.003.121.607-.322 1.024-.256 1.024-.256 1.071 1.836 2.808 1.305 3.493 1 .108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                            </svg>
                            View on GitHub
                            <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        </Link>
                    </div>

                    {/* Stats or additional info */}
                    <div className="mt-16 pt-8 border-t border-white/10">
                        <div className="flex flex-col sm:flex-row justify-center items-center gap-8 text-slate-400">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-white">50+</div>
                                <div className="text-sm">Economic Indicators</div>
                            </div>
                            <div className="hidden sm:block w-px h-8 bg-white/20"></div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-white">Real-time</div>
                                <div className="text-sm">Data Updates</div>
                            </div>
                            <div className="hidden sm:block w-px h-8 bg-white/20"></div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-white">Multi-source</div>
                                <div className="text-sm">Integration</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


        </div>
    );
}