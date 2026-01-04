// Shared location data fetching and aggregation logic
export type Province = {
    id: string;
    name: string;
};

export type Regency = {
    id: string;
    province_id: string;
    name: string;
};

export type LocationItem = {
    id: string;
    city: string;
    province: string;
    island: string;
    users: number;
    percent: number;
    trend: string;
    trendUp: boolean;
};

export type IslandAggregation = {
    island: string;
    users: number;
    percent: number;
    trend: string;
    trendUp: boolean;
};

// Helper to map Province ID to Island
export const getIslandByProvinceId = (provId: string): string => {
    const id = parseInt(provId);
    if (id >= 11 && id <= 21) return "Sumatera";
    if (id >= 31 && id <= 36) return "Pulau Jawa";
    if (id >= 51 && id <= 53) return "Bali & Nusa Tenggara";
    if (id >= 61 && id <= 65) return "Kalimantan";
    if (id >= 71 && id <= 76) return "Sulawesi";
    if (id >= 81 && id <= 82) return "Maluku";
    if (id >= 91 && id <= 94) return "Papua";
    return "Lainnya";
};

// Fetch all location data (used by Locations page)
export const fetchAllLocationData = async (): Promise<LocationItem[]> => {
    try {
        const provRes = await fetch('https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json');
        const provinces: Province[] = await provRes.json();

        const cityRequests = provinces.map(async (province) => {
            try {
                const res = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${province.id}.json`);
                const regencies: Regency[] = await res.json();

                return regencies.map(reg => ({
                    id: reg.id,
                    city: reg.name.replace("KABUPATEN ", "").replace("KOTA ", ""),
                    province: province.name,
                    island: getIslandByProvinceId(province.id),
                    users: Math.floor(Math.random() * 1500) + 50,
                    percent: 0,
                    trend: `${(Math.random() * 15 - 5).toFixed(1)}%`,
                    trendUp: Math.random() > 0.4
                }));
            } catch (err) {
                console.error(`Failed to fetch cities for ${province.name}`, err);
                return [];
            }
        });

        const results = await Promise.all(cityRequests);
        let allCities = results.flat();

        const totalUsers = allCities.reduce((sum, item) => sum + item.users, 0);
        allCities = allCities.map(item => ({
            ...item,
            percent: parseFloat(((item.users / totalUsers) * 100).toFixed(4))
        }));

        allCities.sort((a, b) => b.users - a.users);
        return allCities;
    } catch (error) {
        console.error("Failed to fetch location data", error);
        return [];
    }
};

// Aggregate location data by island
export const aggregateByIsland = (locationData: LocationItem[]): IslandAggregation[] => {
    const grouped: Record<string, any> = {};

    locationData.forEach(item => {
        if (!grouped[item.island]) {
            grouped[item.island] = {
                island: item.island,
                users: 0,
                trendAccumulator: 0,
                count: 0
            };
        }
        grouped[item.island].users += item.users;
        grouped[item.island].trendAccumulator += parseFloat(item.trend);
        grouped[item.island].count += 1;
    });

    const totalUsers = Object.values(grouped).reduce((sum: number, item: any) => sum + item.users, 0);

    return Object.values(grouped).map((item: any) => ({
        island: item.island,
        users: item.users,
        percent: totalUsers ? Math.round((item.users / totalUsers) * 100) : 0,
        trend: `${(item.trendAccumulator / item.count).toFixed(1)}%`,
        trendUp: (item.trendAccumulator / item.count) >= 0
    })).sort((a, b) => b.users - a.users);
};
