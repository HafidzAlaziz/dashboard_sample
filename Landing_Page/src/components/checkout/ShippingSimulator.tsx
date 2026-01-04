"use client";

import { useState, useRef, useEffect } from "react";
import { Truck, Search, Check, ChevronDown, Loader2 } from "lucide-react";
import { formatRupiah, cn, toTitleCase } from "@/lib/utils";
import { useCartStore } from "@/store/useCartStore";

interface Province {
    id: string;
    name: string;
}

interface Regency {
    id: string;
    province_id: string;
    name: string;
}

interface CityData {
    id: string;
    name: string;
    province: string;
}

interface ShippingSimulatorProps {
    onShippingCalculated: (cost: number, destination: string) => void;
}

export function ShippingSimulator({ onShippingCalculated }: ShippingSimulatorProps) {
    const { totalWeight } = useCartStore();
    const [cost, setCost] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);

    // Data state
    const [cities, setCities] = useState<CityData[]>([]);
    const [fetchingCities, setFetchingCities] = useState(true);

    // Search state
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCity, setSelectedCity] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Fetch data on mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [provincesRes, regenciesRes] = await Promise.all([
                    fetch("https://raw.githubusercontent.com/yusufsyaifudin/wilayah-indonesia/master/data/list_of_area/provinces.json"),
                    fetch("https://raw.githubusercontent.com/yusufsyaifudin/wilayah-indonesia/master/data/list_of_area/regencies.json")
                ]);

                const provinces: Province[] = await provincesRes.json();
                const regencies: Regency[] = await regenciesRes.json();

                // Map province ID to name
                const provinceMap = new Map(provinces.map(p => [p.id, p.name]));

                // Join data
                const joinedData = regencies.map(regency => ({
                    id: regency.id,
                    name: toTitleCase(regency.name),
                    province: toTitleCase(provinceMap.get(regency.province_id) || "")
                }));

                setCities(joinedData);
            } catch (error) {
                console.error("Failed to fetch region data:", error);
            } finally {
                setFetchingCities(false);
            }
        };

        fetchData();
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Filter logic
    const filteredCities = cities.filter(city =>
        city.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Limit displayed results for performance
    const displayedCities = filteredCities.slice(0, 100);

    const handleSelectCity = (city: CityData) => {
        setSelectedCity(city.name);
        setSearchQuery("");
        setIsOpen(false);
    };

    const calculateShipping = () => {
        if (!selectedCity) return;

        setLoading(true);
        // Simulate API delay
        setTimeout(() => {
            const weightCost = Math.ceil(totalWeight() / 1000) * 5000;
            const distanceFactor = selectedCity.length * 500;
            const baseCost = 10000 + distanceFactor;
            const total = baseCost + weightCost;

            setCost(total);
            setLoading(false);
            onShippingCalculated(total, selectedCity);
        }, 1000);
    };

    return (
        <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-blue-100 dark:border-blue-900 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
                <Truck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3>Cek Ongkos Kirim</h3>
            </div>

            <div className="space-y-4">
                <div className="relative" ref={dropdownRef}>
                    <span className="text-xs text-gray-500 block mb-1">Kota Tujuan</span>

                    {/* Custom Trigger */}
                    <div
                        onClick={() => !fetchingCities && setIsOpen(!isOpen)}
                        className={cn(
                            "w-full text-sm p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-between hover:border-blue-400 dark:hover:border-blue-500 transition-all",
                            fetchingCities ? "cursor-wait opacity-70" : "cursor-pointer"
                        )}
                    >
                        <span className={!selectedCity ? "text-gray-400" : "text-gray-800 dark:text-gray-200"}>
                            {fetchingCities
                                ? "Memuat data wilayah..."
                                : (selectedCity || "Cari Kota / Kabupaten...")}
                        </span>
                        {fetchingCities ? (
                            <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                        ) : (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                    </div>

                    {/* Dropdown Content */}
                    {isOpen && !fetchingCities && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 shadow-xl z-50 max-h-60 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-100">
                            {/* Search Input */}
                            <div className="p-2 border-b border-gray-50 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
                                <div className="relative">
                                    <Search className="absolute left-2 top-2.5 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        autoFocus
                                        placeholder="Ketik nama kota..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-8 pr-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            {/* List */}
                            <div className="overflow-y-auto flex-1">
                                {filteredCities.length === 0 ? (
                                    <div className="p-4 text-center text-sm text-gray-500">
                                        Kota tidak ditemukan
                                    </div>
                                ) : (
                                    displayedCities.map((city) => (
                                        <button
                                            key={city.id}
                                            onClick={() => handleSelectCity(city)}
                                            className={cn(
                                                "w-full text-left px-4 py-2 text-sm hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors flex items-center justify-between group text-gray-700 dark:text-gray-200",
                                                selectedCity === city.name && "bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 font-medium"
                                            )}
                                        >
                                            <div className="flex flex-col">
                                                <span>{city.name}</span>
                                                <span className="text-[10px] text-gray-400 group-hover:text-blue-400">{city.province}</span>
                                            </div>
                                            {selectedCity === city.name && <Check className="w-4 h-4" />}
                                        </button>
                                    ))
                                )}
                                {filteredCities.length > 100 && (
                                    <div className="p-2 text-center text-xs text-gray-400 border-t border-gray-50">
                                        Ketik untuk mencari hasil lainnya...
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div>
                    <span className="text-xs text-gray-500 block mb-1">Berat Total</span>
                    <div className="text-sm font-medium bg-gray-50 dark:bg-gray-800 p-2 rounded-lg text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-700">
                        {totalWeight()} gram ({Math.ceil(totalWeight() / 1000)} kg)
                    </div>
                </div>

                <button
                    onClick={calculateShipping}
                    disabled={!selectedCity || loading}
                    className="w-full py-2 bg-gray-900 dark:bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors shadow-sm disabled:shadow-none"
                >
                    {loading ? "Menghitung..." : "Hitung Ongkir"}
                </button>

                {cost !== null && !loading && (
                    <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-900 flex justify-between items-center animate-in fade-in slide-in-from-top-2">
                        <div className="flex flex-col">
                            <span className="text-xs text-green-600 font-medium">JNE REGULER</span>
                            <span className="text-xs text-green-600 lowercase">Estimasi 2-3 Hari</span>
                        </div>
                        <span className="text-sm font-bold text-green-700 dark:text-green-400">{formatRupiah(cost)}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
