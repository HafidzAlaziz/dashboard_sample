import { supabase } from "@/lib/supabase";
import { generateOrders } from "@/lib/orderData";
import { INITIAL_PRODUCTS } from "@/lib/productData";
import { INITIAL_CUSTOMERS } from "@/lib/customerData";
import { DEFAULT_SETTINGS } from "@/lib/settingsData";

export const seedDatabase = async () => {
    console.log("Starting seeding...");

    // Seed Products
    const { error: pError } = await supabase.from('products').upsert(INITIAL_PRODUCTS);
    if (pError) console.error("Error seeding products:", pError);
    else console.log("Products seeded.");

    // Seed Customers
    const dbCustomers = INITIAL_CUSTOMERS.map(c => ({
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        segment: c.segment,
        avatar: c.avatar,
        total_orders: c.totalOrders,
        total_spend: c.totalSpend,
        last_order_date: c.lastOrderDate,
        join_date: new Date(c.joinDate).toISOString()
    }));
    const { error: cError } = await supabase.from('customers').upsert(dbCustomers);
    if (cError) console.error("Error seeding customers:", cError);
    else console.log("Customers seeded.");

    // Seed Orders
    const orders = generateOrders();
    const dbOrders = orders.map(o => {
        const { dateObj, ...rest } = o;
        return {
            ...rest,
            date_obj: dateObj.toISOString()
        };
    });
    const { error: oError } = await supabase.from('orders').upsert(dbOrders);
    if (oError) console.error("Error seeding orders:", oError);
    else console.log("Orders seeded.");

    // Seed Settings
    const { error: sError } = await supabase.from('settings').upsert([{
        id: '00000000-0000-0000-0000-000000000000', // Example static ID
        profile: DEFAULT_SETTINGS.profile,
        appearance: DEFAULT_SETTINGS.appearance,
        business: DEFAULT_SETTINGS.business,
        notifications: DEFAULT_SETTINGS.notifications
    }]);
    if (sError) console.error("Error seeding settings:", sError);
    else console.log("Settings seeded.");

    console.log("Seeding finished.");
};
