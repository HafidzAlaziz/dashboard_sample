import { Award, Users, Heart } from "lucide-react";

export default function AboutPage() {
    return (
        <div className="container mx-auto px-4 md:px-8 py-12">
            {/* Hero */}
            <div className="text-center max-w-3xl mx-auto mb-20">
                <h1 className="text-4xl font-bold text-gray-900 mb-6">Tentang UMKM Store</h1>
                <p className="text-xl text-gray-500 leading-relaxed">
                    Kami adalah jembatan digital yang menghubungkan karya terbaik anak bangsa dengan pasar global. Misi kami adalah memberdayakan UMKM Indonesia agar dapat tumbuh dan bersaing di era digital.
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                <div className="bg-indigo-600 rounded-3xl p-8 text-center text-white">
                    <h3 className="text-5xl font-bold mb-2">500+</h3>
                    <p className="text-indigo-100">UMKM Tergabung</p>
                </div>
                <div className="bg-purple-600 rounded-3xl p-8 text-center text-white">
                    <h3 className="text-5xl font-bold mb-2">10k+</h3>
                    <p className="text-purple-100">Produk Terjual</p>
                </div>
                <div className="bg-pink-600 rounded-3xl p-8 text-center text-white">
                    <h3 className="text-5xl font-bold mb-2">34</h3>
                    <p className="text-pink-100">Provinsi Terjangkau</p>
                </div>
            </div>

            {/* Values */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mx-auto mb-6">
                        <Award className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Kualitas Kurasi</h3>
                    <p className="text-gray-500 leading-relaxed">
                        Setiap produk melewati proses kurasi ketat untuk memastikan standar kualitas tertinggi bagi pelanggan kami.
                    </p>
                </div>
                <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center text-green-600 mx-auto mb-6">
                        <Users className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Pemberdayaan</h3>
                    <p className="text-gray-500 leading-relaxed">
                        Kami memberikan pelatihan dan pendampingan digital bagi para pelaku UMKM untuk meningkatkan kapasitas bisnis mereka.
                    </p>
                </div>
                <div className="text-center">
                    <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 mx-auto mb-6">
                        <Heart className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Dampak Sosial</h3>
                    <p className="text-gray-500 leading-relaxed">
                        Setiap pembelian Anda berkontribusi langsung pada kesejahteraan pengrajin lokal dan pertumbuhan ekonomi daerah.
                    </p>
                </div>
            </div>
        </div>
    );
}
