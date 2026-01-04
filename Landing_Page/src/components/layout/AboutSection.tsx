"use client";



export function AboutSection() {
    return (
        <section id="about" className="py-20 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 transition-colors">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row items-center gap-12">
                    {/* Text Content */}
                    <div className="md:w-1/2 space-y-6">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                            Tentang <span className="text-blue-600 dark:text-blue-400">UMKM Store</span>
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                            UMKM Store adalah platform yang didedikasikan untuk mengangkat potensi produk-produk lokal Indonesia. Kami percaya bahwa setiap produk memiliki cerita, dan setiap pengrajin memiliki mimpi.
                        </p>
                        <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                            Visi kami adalah menjadi jembatan antara pengrajin lokal bertalenta dengan pasar yang lebih luas, memastikan kualitas terbaik sampai ke tangan Anda dengan harga yang adil.
                        </p>
                        <div className="grid grid-cols-2 gap-6 mt-8">
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-900">
                                <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">1000+</h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">Produk Terjual</p>
                            </div>
                            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-900">
                                <h3 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">500+</h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">Mitra UMKM</p>
                            </div>
                        </div>
                    </div>

                    {/* Image/Visual */}
                    <div className="md:w-1/2 relative group">
                        <div className="absolute inset-0 bg-blue-600 rounded-3xl rotate-6 opacity-10 group-hover:rotate-3 transition-transform duration-500"></div>
                        <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-video bg-gray-200">
                            <img
                                src="/images/ui/about-image.jpg"
                                alt="Tentang UMKM Store"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
