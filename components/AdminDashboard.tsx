
import React, { useState, useEffect } from 'react';
import { collection, collectionGroup, getDocs, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { User, WastePickup } from '../types';
import { KERALA_DISTRICTS, KERALA_LOCAL_BODIES } from '../src/data/keralaData';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#FF6384'];

interface AdminDashboardProps {
    user: User;
    onLogout: () => void;
}

// Extended type to include user ID with pickup if needed
interface AdminPickup extends WastePickup {
    userId?: string;
    path?: string; // Add path for direct document reference
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onLogout }) => {
    const [activeTab, setActiveTab] = useState<'pickups' | 'users' | 'analytics'>('analytics');
    const [pickups, setPickups] = useState<AdminPickup[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState<string>('All');
    const [filterDistrict, setFilterDistrict] = useState<string>('All');
    const [filterLocalBody, setFilterLocalBody] = useState<string>('All');
    const [sortOption, setSortOption] = useState<'date' | 'type' | 'location'>('date');

    useEffect(() => {
        // Fetch users when tab is users, or if we need them for analytics
        if (activeTab === 'users' || activeTab === 'analytics') {
            fetchUsers();
        }
    }, [activeTab]);

    // Renamed fetchData to fetchUsers for clarity, as fetchPickupsWithUser is now separate
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const usersSnapshot = await getDocs(collection(db, 'users'));
            const usersData = usersSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as User));
            setUsers(usersData);
        } catch (error) {
            console.error("Error fetching users:", error);
            alert("Failed to fetch users. Check console for details.");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (pickupId: string, userId: string | undefined, newStatus: 'PENDING' | 'COMPLETED' | 'CANCELLED') => {
        try {
            // We need to find the specific document reference. 
            // Since we used collectionGroup, we don't strictly know the path unless we stored userId or path.
            // However, we can use the ref from the snapshot if we kept it, or find the path.
            // Simpler: Fetch user pickups again or just assume we know the path if we have userId.
            // BUT: collectionGroup results don't easily give direct updates without the full path
            // if we didn't store the ref. 
            // Workaround: We'll iterate the current pickups to find the one we want and use its ref path from a new query if needed, 
            // or better: just require `userId` to be present.
            // Wait, `collectionGroup` docs HAVE a `ref`. We should use that if we can. 
            // For this implementation, let's assume we can map it back or just iterate `users` to find it is slow.
            // Actually, let's just find the doc by ID in the list to update logic, 
            // but to WRITE to Firestore, we need the path.
            // Let's rely on finding it via `collectionGroup` is read-only essentially unless we store the ref.

            // Better approach for Update: We need the full path. 
            // Let's assume we construct it: `users/${userId}/pickups/${pickupId}` IF we have userId.
            // `collectionGroup` result docs have `ref.path`. 

            // Let's loop through pickups to find the one matching ID and use its path?
            // No, we can just store the path in state?
            // Let's simply update local state and alert for now to keep it simple, 
            // OR better, re-query specific doc path effectively.

            // Actually, we can get the doc ref from the `pickups` array if we store the `ref` in state, 
            // but `ref` is non-serializable object sometimes.
            // Let's use a workaround: The `pickup` object doesn't have `ref`. 
            // We'll update only if we can construct path. 
            // Since we don't have distinct userId on the pickup object by default, 
            // maybe we should assume we can't easily update without it.

            // HOWEVER, for this MVP, let's try to query the specific doc via collectionGroup again? 
            // No, that's inefficient.
            // Let's just prompt user that "Status update requires full path" or 
            // iterate all users to find it? No.

            // FIX: When fetching pickups, we can get `doc.ref.path`.
            // Let's just say "Status Updated" locally for demo if path is hard.
            // NOTE: In the `fetchData`, `doc.ref.parent.parent.id` IS the userId.
            // Let's store that!

            alert(`Update status for Pickup ${pickupId} to ${newStatus}. (Implementation pending full path access)`);
        } catch (err) {
            console.error(err);
        }
    };

    // Improved fetch with userId extraction
    const fetchPickupsWithUser = async () => {
        setLoading(true);
        try {
            const pickupsQuery = query(collectionGroup(db, 'pickups'));
            const querySnapshot = await getDocs(pickupsQuery);
            const pickupsData: AdminPickup[] = querySnapshot.docs.map(doc => ({
                id: doc.id,
                userId: doc.ref.parent.parent?.id, // Extract User ID from parent collection
                path: doc.ref.path, // Store full path for updates
                ...doc.data()
            } as unknown as AdminPickup));
            // Client-side sort is now handled by filteredPickups
            setPickups(pickupsData);
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    const updatePickupStatus = async (path: string, newStatus: string, userId: string | undefined, currentStatus: string) => {
        try {
            const docRef = doc(db, path);
            await updateDoc(docRef, { status: newStatus });

            // Increment Eco Points only if status changes to COMPLETED from a different status
            if (newStatus === 'COMPLETED' && currentStatus !== 'COMPLETED' && userId) {
                const { getDoc } = await import('firebase/firestore');
                const userRef = doc(db, 'users', userId);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    const userData = userSnap.data() as User;
                    const currentPoints = userData.ecoPoints || 0;

                    if (currentPoints < 5) {
                        const newPoints = currentPoints + 1;
                        await updateDoc(userRef, {
                            ecoPoints: newPoints,
                            discountAvailable: newPoints >= 5 ? true : (userData.discountAvailable || false)
                        });
                    }
                }
            }

            // Update local state
            setPickups(prev => prev.map(p => p.path === path ? { ...p, status: newStatus } : p) as AdminPickup[]);
            alert(`Status updated to ${newStatus}`);
        } catch (e) {
            alert("Failed to update status: " + e);
        }
    }


    // Also fetch pickups for analytics
    useEffect(() => {
        if (activeTab === 'pickups' || activeTab === 'analytics') fetchPickupsWithUser();
    }, [activeTab]);

    // Analytics Calculations
    const totalPickups = pickups.length;
    const totalUsers = users.length;
    const pendingPickups = pickups.filter(p => p.status === 'PENDING').length;
    const completedPickups = pickups.filter(p => p.status === 'COMPLETED').length;

    const wasteTypeData = Object.entries(pickups.reduce((acc, curr) => {
        acc[curr.type] = (acc[curr.type] || 0) + 1;
        return acc;
    }, {} as Record<string, number>)).map(([name, value]) => ({ name, value }));

    const statusData = [
        { name: 'Pending', value: pendingPickups },
        { name: 'Completed', value: completedPickups },
        { name: 'Cancelled', value: pickups.filter(p => p.status === 'CANCELLED').length }
    ].filter(d => d.value > 0);


    // Client-side filtering and sorting
    const filteredPickups = pickups.filter(p => {
        let match = true;
        if (filterType !== 'All' && p.type !== filterType) match = false;
        if (filterDistrict !== 'All' && p.district !== filterDistrict) match = false;
        if (filterLocalBody !== 'All' && p.localBody !== filterLocalBody) match = false;
        return match;
    }).sort((a, b) => {
        if (sortOption === 'date') return new Date(b.date).getTime() - new Date(a.date).getTime();
        if (sortOption === 'type') return a.type.localeCompare(b.type);
        // Simple verification if location exists
        if (sortOption === 'location') return (b.latitude || 0) - (a.latitude || 0);
        return 0;
    });


    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-40 shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center gap-3">
                            <div className="bg-green-500 p-1.5 rounded-lg">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                            </div>
                            <span className="text-xl font-bold text-white tracking-wider">Admin<span className="text-green-500">Panel</span></span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-medium text-gray-400">{user.email}</span>
                            <button onClick={onLogout} className="text-xs font-bold text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors shadow-lg">LOGOUT</button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="flex gap-4 mb-8 justify-between items-center">
                    <div className="flex gap-4">
                        <button
                            onClick={() => setActiveTab('pickups')}
                            className={`px-6 py-3 rounded-xl font-bold transition-all shadow-sm ${activeTab === 'pickups' ? 'bg-white text-gray-900 ring-1 ring-gray-200' : 'bg-gray-200 text-gray-500 hover:bg-gray-300'}`}
                        >
                            All Bookings
                        </button>
                        <button
                            onClick={() => setActiveTab('analytics')}
                            className={`px-6 py-3 rounded-xl font-bold transition-all shadow-sm ${activeTab === 'analytics' ? 'bg-white text-gray-900 ring-1 ring-gray-200' : 'bg-gray-200 text-gray-500 hover:bg-gray-300'}`}
                        >
                            Analytics
                        </button>
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`px-6 py-3 rounded-xl font-bold transition-all shadow-sm ${activeTab === 'users' ? 'bg-white text-gray-900 ring-1 ring-gray-200' : 'bg-gray-200 text-gray-500 hover:bg-gray-300'}`}
                        >
                            User Management
                        </button>
                    </div>

                    {activeTab === 'pickups' && (
                        <div className="flex gap-3">
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                                <option value="All">All Types</option>
                                <option>Plastic</option>
                                <option>Metal</option>
                                <option>Glass</option>
                                <option>Paper</option>
                                <option>Organic</option>
                                <option>Electronic</option>
                                <option>Hazardous</option>
                            </select>
                            <select
                                value={filterDistrict}
                                onChange={(e) => {
                                    setFilterDistrict(e.target.value);
                                    setFilterLocalBody('All');
                                }}
                                className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                                <option value="All">All Districts</option>
                                {KERALA_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                            <select
                                value={filterLocalBody}
                                onChange={(e) => setFilterLocalBody(e.target.value)}
                                disabled={filterDistrict === 'All'}
                                className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                            >
                                <option value="All">All Local Bodies</option>
                                {filterDistrict !== 'All' && KERALA_LOCAL_BODIES[filterDistrict]?.map(lb => <option key={lb} value={lb}>{lb}</option>)}
                            </select>
                            <select
                                value={sortOption}
                                onChange={(e) => setSortOption(e.target.value as any)}
                                className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                                <option value="date">Sort by Date</option>
                                <option value="type">Sort by Type</option>
                                <option value="location">Sort by Location (Lat)</option>
                            </select>
                        </div>
                    )}
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-green-500"></div>
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                        {activeTab === 'pickups' ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100">
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">User ID</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Details</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Location</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {filteredPickups.map((p) => (
                                            <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{p.date}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 font-mono">{p.userId?.substring(0, 8)}...</td>
                                                <td className="px-6 py-4 text-sm text-gray-700">
                                                    <div className="font-bold">{p.type}</div>
                                                    <div className="text-xs text-gray-500">{p.size || 'N/A'}</div>
                                                    {p.discountApplied && (
                                                        <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold uppercase rounded-md shadow-sm">20% Discount Applied</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                                                    {p.district && <div className="font-bold text-gray-800">{p.district}</div>}
                                                    {p.localBody && <div className="text-xs text-green-700">{p.localBody}</div>}
                                                    <div title={p.address}>{p.address}</div>
                                                    {p.latitude && p.longitude && (
                                                        <a
                                                            href={`https://www.google.com/maps?q=${p.latitude},${p.longitude}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1"
                                                        >
                                                            <span>Map</span>
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                                        </a>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${p.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                                        p.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                                            'bg-amber-100 text-amber-800'
                                                        }`}>
                                                        {p.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                                                    <div className="flex gap-2">
                                                        <button onClick={() => updatePickupStatus(p.path as string, 'COMPLETED', p.userId, p.status)} className="text-green-600 hover:text-green-900 font-bold text-xs uppercase disabled:opacity-50" disabled={p.status === 'COMPLETED'}>Complete</button>
                                                        <button onClick={() => updatePickupStatus(p.path as string, 'CANCELLED', p.userId, p.status)} className="text-red-400 hover:text-red-700 font-bold text-xs uppercase disabled:opacity-50" disabled={p.status === 'CANCELLED'}>Cancel</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredPickups.length === 0 && (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-12 text-center text-gray-400">No bookings found.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        ) : activeTab === 'analytics' ? (
                            <div className="p-8">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                    <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                                        <h3 className="text-gray-500 text-sm font-bold uppercase">Total Bookings</h3>
                                        <p className="text-3xl font-extrabold text-blue-600 mt-2">{totalPickups}</p>
                                    </div>
                                    <div className="bg-green-50 p-6 rounded-2xl border border-green-100">
                                        <h3 className="text-gray-500 text-sm font-bold uppercase">Active Users</h3>
                                        <p className="text-3xl font-extrabold text-green-600 mt-2">{totalUsers}</p>
                                    </div>
                                    <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100">
                                        <h3 className="text-gray-500 text-sm font-bold uppercase">Pending Actions</h3>
                                        <p className="text-3xl font-extrabold text-amber-600 mt-2">{pendingPickups}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                        <h3 className="text-lg font-bold text-gray-800 mb-4">Waste Type Distribution</h3>
                                        <div className="h-64">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={wasteTypeData}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={60}
                                                        outerRadius={80}
                                                        paddingAngle={5}
                                                        dataKey="value"
                                                    >
                                                        {wasteTypeData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip />
                                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                        <h3 className="text-lg font-bold text-gray-800 mb-4">Pickup Status</h3>
                                        <div className="h-64">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={statusData}>
                                                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                                    <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                                    <Tooltip cursor={{ fill: '#f3f4f6' }} />
                                                    <Bar dataKey="value" fill="#10B981" radius={[4, 4, 0, 0]} barSize={40} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100">
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Contact</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Eco Points</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {users.map((u) => (
                                            <tr key={u.id} className="hover:bg-gray-50/50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-bold text-gray-900">{u.name}</div>
                                                    <div className="text-xs text-gray-400">{u.id}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{u.email}</div>
                                                    <div className="text-xs text-gray-500">{u.phone || '-'}</div>
                                                    <div className="text-xs text-gray-400">{u.address || '-'}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col gap-1 items-start">
                                                        <span className="text-sm font-bold text-green-700 bg-green-50 px-2 py-1 rounded-md">{u.ecoPoints || 0} / 5</span>
                                                        {u.discountAvailable && (
                                                            <span className="text-[10px] font-bold text-white bg-green-500 px-2 py-1 rounded-md uppercase tracking-wider shadow-sm">Discount Eligible</span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {users.length === 0 && (
                                            <tr>
                                                <td colSpan={3} className="px-6 py-12 text-center text-gray-400">No users found.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;
