import { MapPin, Phone, Mail, Clock } from "lucide-react";

export default function ContactPage() {
    return (
        <div className="container mx-auto px-4 md:px-8 py-12">
            <div className="text-center max-w-3xl mx-auto mb-16">
                <h1 className="text-4xl font-bold text-gray-900 mb-6">Hubungi Kami</h1>
                <p className="text-xl text-gray-500">
                    Punya pertanyaan atau ingin bermitra dengan kami? Jangan ragu untuk menghubungi tim kami.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Contact Info */}
                <div className="space-y-8">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 flex-shrink-0">
                            <MapPin className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Kantor Pusat</h3>
                            <p className="text-gray-500 leading-relaxed">
                                Jl. Sudirman No. 123, Jakarta Pusat<br />
                                DKI Jakarta, 10220
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 flex-shrink-0">
                            <Phone className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Telepon / WhatsApp</h3>
                            <p className="text-gray-500">
                                +62 812 3456 7890 (Layanan Pelanggan)<br />
                                +62 21 5555 1234 (Kantor)
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 flex-shrink-0">
                            <Mail className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Email</h3>
                            <p className="text-gray-500">
                                support@umkmstore.id<br />
                                partnership@umkmstore.id
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 flex-shrink-0">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Jam Operasional</h3>
                            <p className="text-gray-500">
                                Senin - Jumat: 09:00 - 17:00 WIB<br />
                                Sabtu - Minggu: Tutup
                            </p>
                        </div>
                    </div>
                </div>

                {/* Map */}
                <div className="bg-gray-100 rounded-3xl overflow-hidden h-[400px] lg:h-full relative shadow-lg">
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.466453488277!2d106.82078631476906!3d-6.202029695498871!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f41f2c6acb3f%3A0x4b7b252119045763!2sJl.%20Jend.%20Sudirman%2C%20Daerah%20Khusus%20Ibukota%20Jakarta!5e0!3m2!1sen!2sid!4v1655106546379!5m2!1sen!2sid"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        className="absolute inset-0"
                    ></iframe>
                </div>
            </div>
        </div>
    );
}
