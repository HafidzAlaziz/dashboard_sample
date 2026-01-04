"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, Shield, User, X, Check, Save, Filter, MoreHorizontal, Mail, Phone, Calendar } from "lucide-react";
import { DashboardWrapper } from "@/components/layout/DashboardWrapper";
import { useToast } from "@/components/ui/ToastContext";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";

// Types
interface UserData {
    id: string;
    name: string;
    email: string;
    role: "admin" | "user";
    created_at: string;
    avatar?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function UsersPage() {
    const { showToast } = useToast();
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<"add" | "edit">("add");
    const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

    // Delete Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "user",
        avatar: ""
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/users`);
            if (!res.ok) throw new Error("Failed to fetch users");
            const data = await res.json();
            setUsers(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (mode: "add" | "edit", user?: UserData) => {
        setModalMode(mode);
        if (mode === "edit" && user) {
            setSelectedUser(user);
            setFormData({
                name: user.name,
                email: user.email,
                password: "",
                role: user.role,
                avatar: user.avatar || ""
            });
        } else {
            setSelectedUser(null);
            setFormData({
                name: "",
                email: "",
                password: "",
                role: "user",
                avatar: ""
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = modalMode === "add"
                ? `${API_URL}/users`
                : `${API_URL}/users/${selectedUser?.id}`;

            const method = modalMode === "add" ? "POST" : "PUT";

            const bodyData: any = { ...formData };
            if (modalMode === "edit" && !bodyData.password) {
                delete bodyData.password;
            }

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(bodyData)
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Operation failed");
            }

            setIsModalOpen(false);
            fetchUsers();
            showToast(
                modalMode === 'add' ? "User created successfully" : "User updated successfully",
                "success"
            );
        } catch (error: any) {
            showToast(error.message || "Operation failed", "error");
        }
    };

    const handleDelete = (id: string) => {
        console.log('handleDelete called for', id);
        setUserToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!userToDelete) return;

        try {
            const res = await fetch(`${API_URL}/users/${userToDelete}`, {
                method: "DELETE"
            });
            if (!res.ok) throw new Error("Failed to delete");
            fetchUsers();
            showToast("User deleted successfully", "success");
        } catch (error) {
            console.error(error);
            showToast("Failed to delete user", "error");
        } finally {
            setIsDeleteModalOpen(false);
            setUserToDelete(null);
        }
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <DashboardWrapper>
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
                    <button
                        onClick={() => handleOpenModal("add")}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20"
                    >
                        <Plus className="w-5 h-5" />
                        Add New User
                    </button>
                </div>

                {/* Card Container - Adaptive Light/Dark */}
                <div className="bg-white dark:bg-[#0f172a] rounded-xl border border-gray-200 dark:border-gray-800 p-4 min-h-[500px] shadow-sm">
                    {/* Header Controls */}
                    <div className="flex justify-between items-center mb-6">
                        <div className="relative w-full max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Cari nama atau email..."
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-[#1e293b] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder-gray-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-[#1e293b] border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ml-4">
                            <Filter className="w-4 h-4" />
                            Segmen
                        </button>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-800">
                                    <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                                    <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                                    <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Joined Date</th>
                                    <th className="px-4 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                {loading ? (
                                    <tr><td colSpan={4} className="text-center py-12 text-gray-500">Loading users...</td></tr>
                                ) : filteredUsers.length === 0 ? (
                                    <tr><td colSpan={4} className="text-center py-12 text-gray-500">No users found.</td></tr>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <tr key={user.id} className="group hover:bg-gray-50 dark:hover:bg-[#1e293b]/50 transition-colors">
                                            {/* User Info */}
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold overflow-hidden ${user.role === 'admin'
                                                        ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400'
                                                        : 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400'
                                                        }`}>
                                                        {user.avatar ? (
                                                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            user.role === 'admin' ? <Shield className="w-5 h-5" /> : <User className="w-5 h-5" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                                                        <p className="text-xs text-gray-500">{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Role */}
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${user.role === 'admin'
                                                    ? 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20'
                                                    : 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                                                    }`}>
                                                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                                </span>
                                            </td>

                                            {/* Join Date */}
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-gray-400" />
                                                    {new Date(user.created_at).toLocaleDateString("id-ID", {
                                                        day: 'numeric', month: 'short', year: 'numeric'
                                                    })}
                                                </div>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-4 py-4 whitespace-nowrap text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleOpenModal("edit", user)}
                                                        className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(user.id)}
                                                        className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination Mock */}
                    <div className="flex justify-between items-center mt-4 px-2 text-sm text-gray-500">
                        <p>Menampilkan {filteredUsers.length} - {filteredUsers.length} dari {filteredUsers.length} pelanggan</p>
                        <div className="flex gap-2">
                            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50" disabled>
                                &lt;
                            </button>
                            <span className="flex items-center text-gray-700 dark:text-gray-300">1 / 1</span>
                            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50" disabled>
                                &gt;
                            </button>
                        </div>
                    </div>
                </div>

                {/* Modal with FIX for input visibility */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl animate-in fade-in zoom-in duration-200">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-900">
                                    {modalMode === 'add' ? 'Add New User' : 'Edit User'}
                                </h2>
                                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-gray-900 bg-white placeholder-gray-400"
                                        placeholder="Enter full name"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-gray-900 bg-white"
                                        placeholder="Enter email address"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        {modalMode === 'add' ? 'Password' : 'New Password (Leave blank to keep)'}
                                    </label>
                                    <input
                                        type="password"
                                        required={modalMode === 'add'}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-gray-900 bg-white placeholder-gray-400"
                                        placeholder={modalMode === 'add' ? "Enter password" : "Enter new password (optional)"}
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Avatar URL (Optional)</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-gray-900 bg-white placeholder-gray-400"
                                        placeholder="https://example.com/avatar.jpg atau base64"
                                        value={formData.avatar || ""}
                                        onChange={e => setFormData({ ...formData, avatar: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Role</label>
                                    <select
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-gray-900 bg-white"
                                        value={formData.role}
                                        onChange={e => setFormData({ ...formData, role: e.target.value })}
                                    >
                                        <option value="user" className="text-gray-900 bg-white">User</option>
                                        <option value="admin" className="text-gray-900 bg-white">Admin</option>
                                    </select>
                                </div>

                                <div className="flex gap-3 mt-8 pt-4 border-t border-gray-100">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center justify-center gap-2"
                                    >
                                        <Save className="w-4 h-4" />
                                        Save User
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                <ConfirmationModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={confirmDelete}
                    title="Hapus Pengguna"
                    message="Apakah Anda yakin ingin menghapus pengguna ini? Tindakan ini tidak dapat dibatalkan."
                    confirmText="Ya, Hapus"
                    cancelText="Batal"
                />
            </div>
        </DashboardWrapper>
    );
}
