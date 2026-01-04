const supabase = require('../config/supabaseClient');
const bcrypt = require('bcryptjs');

// Get all users
const getUsers = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('id, email, name, role, created_at, avatar')
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create new user
const createUser = async (req, res) => {
    const { email, password, name, role } = req.body;
    try {
        // Check if user exists
        const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .single();

        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const { data, error } = await supabase
            .from('users')
            .insert([
                {
                    email,
                    password: hashedPassword,
                    name,
                    role: role || 'user'
                }
            ])
            .select('id, email, name, role, created_at, avatar')
            .single();

        if (error) throw error;

        // Note: We don't auto-sync NEW admins to settings to avoid overwriting existing store owner unintentionally
        // Only updates to existing admins trigger sync.

        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update user
const updateUser = async (req, res) => {
    const { id } = req.params;
    const { name, role, email, password } = req.body; // Added email to destructive

    try {
        const updates = {
            name,
            role,
            updated_at: new Date()
        };

        if (password) {
            const salt = await bcrypt.genSalt(10);
            updates.password = await bcrypt.hash(password, salt);
        }

        // Allow email updates if provided (though careful with uniqueness)
        if (email) {
            updates.email = email;
        }

        const { data, error } = await supabase
            .from('users')
            .update(updates)
            .eq('id', id)
            .select('id, email, name, role, created_at, avatar')
            .single();

        if (error) throw error;

        // SYNC: If user is admin, sync to Settings Profile
        if (data.role === 'admin') {
            console.log("Syncing updated Admin user to Settings...");
            try {
                // Fetch current settings to preserve structure
                const { data: currentSettings } = await supabase
                    .from('settings')
                    .select('*')
                    .single();

                if (currentSettings) {
                    // REDUNDANCY CHECK
                    if (
                        currentSettings.profile.name === data.name &&
                        currentSettings.profile.email === data.email &&
                        currentSettings.profile.avatar === data.avatar
                    ) {
                        console.log("Settings already match Admin data, skipping sync.");
                    } else {
                        const newProfile = {
                            ...currentSettings.profile,
                            name: data.name,
                            email: data.email,
                            avatar: data.avatar
                        };

                        await supabase
                            .from('settings')
                            .update({
                                profile: newProfile,
                                updated_at: new Date().toISOString()
                            })
                            .eq('id', currentSettings.id);

                        console.log("Settings synced successfully.");
                    }
                }
            } catch (syncErr) {
                console.error("Failed to sync to Settings:", syncErr);
                // Don't fail the request, just log
            }
        }

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete user
const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        const { error } = await supabase
            .from('users')
            .delete()
            .eq('id', id);

        if (error) throw error;

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Sync Admin Profile (Called from Settings)
const syncAdmin = async (req, res) => {
    try {
        const { name, email, avatar, oldEmail } = req.body;

        console.log("Syncing Admin Payload:", req.body);

        // 1. Try to find Admin by OLD Email
        let { data: adminUser, error: findError } = await supabase
            .from('users')
            .select('id, name, email, avatar')
            .eq('email', oldEmail)
            .eq('role', 'admin')
            .single();

        // 2. If not found (e.g. email mismatch between Settings and Users), find PRIMARY Admin
        if (!adminUser || findError) {
            console.log("Admin not found by legacy email, searching by role...");
            const { data: fallbackAdmin, error: fallbackError } = await supabase
                .from('users')
                .select('id, name, email, avatar')
                .eq('role', 'admin')
                .limit(1)
                .single();

            if (fallbackError || !fallbackAdmin) {
                return res.status(404).json({ error: 'No Admin user found to sync with.' });
            }
            adminUser = fallbackAdmin;
        }

        // REDUNDANCY CHECK: Skip update if data is identical to avoid Realtime loops
        if (
            adminUser.name === name &&
            adminUser.email === email &&
            adminUser.avatar === avatar
        ) {
            console.log("Admin data identical, skipping sync update.");
            return res.status(200).json({ message: 'Admin profile already up to date', skipped: true });
        }

        console.log("Found Admin to sync:", adminUser.id);

        // 3. Update the Admin found
        const updates = {
            name,
            email,
            avatar,
            updated_at: new Date()
        };

        const { error: updateError } = await supabase
            .from('users')
            .update(updates)
            .eq('id', adminUser.id);

        if (updateError) throw updateError;

        res.status(200).json({ message: 'Admin profile synced successfully' });

    } catch (error) {
        console.error("Sync Error:", error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getUsers,
    createUser,
    updateUser,
    deleteUser,
    syncAdmin
};
