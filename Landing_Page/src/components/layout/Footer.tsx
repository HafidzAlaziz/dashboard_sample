"use client";

import Link from "next/link";

import { Facebook, Instagram, Twitter, Mail, MapPin, Phone } from "lucide-react";

export function Footer() {
    return (
        <footer className="bg-gray-50 dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 transition-colors pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                    {/* Brand & Desc */}
                    <div className="space-y-4">
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <div className="relative w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center border border-gray-200 dark:border-gray-700 shadow-sm">
                                <img
                                    src="/images/ui/logo-pattern.jpg"
                                    alt="UMKM Logo Pattern"
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/20" />
                                <span className="relative z-10 text-white font-bold text-xl drop-shadow-md">U</span>
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                                UMKM Store
                            </span>
                        </Link>
                        <p className="text-sm leading-relaxed">
                            Membangun ekonomi lokal dengan mendukung produk-produk kreatif anak bangsa. Belanja lokal, kualitas global.
                        </p>
                    </div>

                    {/* Links */}
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white mb-4">Tautan</h3>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Beranda</Link></li>
                            <li><Link href="/products" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Produk</Link></li>
                            <li><Link href="/#about" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Tentang Kami</Link></li>
                            <li><Link href="/#how-to-buy" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Cara Belanja</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white mb-4">Kontak</h3>
                        <ul className="space-y-4 text-sm">
                            <li className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                                <span>Jl. Raya Teknologi No. 123,<br />Jakarta Selatan, 12345</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-blue-600 shrink-0" />
                                <span>+62 812-3456-7890</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-blue-600 shrink-0" />
                                <span>halo@umkmstore.com</span>
                            </li>
                        </ul>
                    </div>

                    {/* Social */}
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white mb-4">Sosial Media</h3>
                        <div className="flex gap-4">
                            <a href="#" className="p-2 bg-white dark:bg-gray-900 shadow-sm rounded-lg hover:text-blue-600 hover:shadow-md transition-all border border-gray-100 dark:border-gray-800">
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a href="#" className="p-2 bg-white dark:bg-gray-900 shadow-sm rounded-lg hover:text-blue-600 hover:shadow-md transition-all border border-gray-100 dark:border-gray-800">
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a href="#" className="p-2 bg-white dark:bg-gray-900 shadow-sm rounded-lg hover:text-blue-600 hover:shadow-md transition-all border border-gray-100 dark:border-gray-800">
                                <Twitter className="w-5 h-5" />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-800 pt-8 text-center text-sm">
                    <p>&copy; {new Date().getFullYear()} UMKM Store. Hak Cipta Dilindungi.</p>
                </div>
            </div>
        </footer>
    );
}
