export const SETTINGS_STORAGE_KEY = "umkm_dashboard_settings";

export interface UserSettings {
    profile: {
        name: string;
        email: string;
        storeName: string;
        phone: string;
        avatar?: string;
    };
    appearance: {
        theme: "light" | "dark" | "system";
        sidebarColor: string;
        primaryColor: string;
        compactMode: boolean;
    };
    business: {
        currency: string;
        taxRate: number;
        timezone: string;
        language: string;
        address: string;
    };
    notifications: {
        orderUpdates: boolean;
        customerActivity: boolean;
        marketingEmails: boolean;
        browserNotifications: boolean;
    };
    updated_at?: string;
}

export const DEFAULT_SETTINGS: UserSettings = {
    profile: {
        name: "Eco User",
        email: "user@example.com",
        storeName: "EcoSmart Store",
        phone: "-",
    },
    appearance: {
        theme: "system",
        sidebarColor: "slate",
        primaryColor: "indigo",
        compactMode: false,
    },
    business: {
        currency: "IDR",
        taxRate: 10,
        timezone: "Asia/Jakarta",
        language: "id",
        address: "-",
    },
    notifications: {
        orderUpdates: true,
        customerActivity: true,
        marketingEmails: false,
        browserNotifications: true,
    },
};

export const parseSettings = (data: any): UserSettings => {
    try {
        return {
            ...DEFAULT_SETTINGS,
            ...data,
            profile: { ...DEFAULT_SETTINGS.profile, ...data.profile },
            appearance: { ...DEFAULT_SETTINGS.appearance, ...data.appearance },
            business: { ...DEFAULT_SETTINGS.business, ...data.business },
            notifications: { ...DEFAULT_SETTINGS.notifications, ...data.notifications },
            updated_at: data.updated_at,
        };
    } catch (e) {
        return DEFAULT_SETTINGS;
    }
};
