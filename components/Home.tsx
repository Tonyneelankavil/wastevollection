import React, { useState, useEffect, useMemo } from 'react';
import { collection, query, onSnapshot, addDoc, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { User, WastePickup } from '../types';
import { KERALA_DISTRICTS, KERALA_LOCAL_BODIES } from '../src/data/keralaData';
import {
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
    PieChart, Pie, Cell, Legend
} from 'recharts';

interface HomeProps {
    user: User;
}

const COLORS = ['#10B981', '#F59E0B', '#3B82F6', '#EF4444', '#8B5CF6', '#6366F1', '#EC4899', '#14B8A6'];

const Home: React.FC<HomeProps> = ({ user }) => {
    const [pickups, setPickups] = useState<WastePickup[]>([]);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [coordinates, setCoordinates] = useState<{ lat: number, lng: number } | null>(null);
    const [isLocating, setIsLocating] = useState(false);
    const [selectedDistrict, setSelectedDistrict] = useState('');

    useEffect(() => {
        const q = query(
            collection(db, `users/${user.id}/pickups`),
            orderBy('date', 'desc'),
            limit(10)
        );
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const pickupData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as WastePickup[];
            setPickups(pickupData);
        });
        return () => unsubscribe();
    }, [user.id]);

    const categoryData = useMemo(() => {
        const counts: Record<string, number> = {};
        pickups.forEach(p => {
            counts[p.type] = (counts[p.type] || 0) + 1;
        });
        return Object.keys(counts).map(key => ({ name: key, value: counts[key] }));
    }, [pickups]);

    const trendData = useMemo(() => {
        return pickups
            .slice()
            .reverse()
            .map(p => ({
                date: new Date(p.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                kg: parseFloat(p.weightEstimate || '2.0')
            }));
    }, [pickups]);

    const handleGetLocation = () => {
        setIsLocating(true);
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            setIsLocating(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setCoordinates({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
                setIsLocating(false);
            },
            (error) => {
                alert("Unable to retrieve your location");
                setIsLocating(false);
            }
        );
    };

    const handleScheduleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        try {
            const date = formData.get('date') as string;
            const type = formData.get('type') as string;
            const size = formData.get('size') as string;
            const address = formData.get('address') as string;
            const district = formData.get('district') as string;
            const localBody = formData.get('localBody') as string;

            if (!date || !type || !size || !address || !district || !localBody) {
                throw new Error("Please fill in all required fields.");
            }

            const pickupData: any = {
                date,
                type,
                size,
                status: 'PENDING',
                address,
                district,
                localBody,
                weightEstimate: (Math.random() * 5 + 1).toFixed(1)
            };

            if (user.discountAvailable) {
                pickupData.discountApplied = true;
            }

            if (coordinates) {
                pickupData.latitude = coordinates.lat;
                pickupData.longitude = coordinates.lng;
            }

            await addDoc(collection(db, `users/${user.id}/pickups`), pickupData);

            if (user.discountAvailable) {
                const { doc, updateDoc } = await import('firebase/firestore');
                await updateDoc(doc(db, 'users', user.id), {
                    ecoPoints: 0,
                    discountAvailable: false
                });
            }

            setShowScheduleModal(false);
            setCoordinates(null);
            setSelectedDistrict('');
            alert("Pickup scheduled successfully!");
        } catch (err: any) {
            console.error("Error scheduling pickup:", err);
            if (err instanceof Error) {
                alert(err.message);
            } else {
                alert("An unknown error occurred while scheduling pickup.");
            }
        }
    };

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-500">
            <div className="bg-white rounded-3xl p-6 border border-green-50 shadow-sm flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold text-green-900 tracking-tight">Welcome to Greenscrap, {user.name.split(' ')[0]}!</h1>
                    <p className="mt-1 text-sm text-green-700">Here's your environmental impact summary.</p>
                </div>
                <div className="hidden sm:block bg-green-50 p-3 rounded-2xl">
                    <span className="text-2xl">🌱</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-8">
                    <div className="bg-white rounded-3xl p-8 border border-green-50 shadow-sm space-y-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Eco Impact Overview</h2>
                                <p className="text-sm text-gray-500">Your waste diversion progress over time.</p>
                            </div>
                            <button
                                onClick={() => setShowScheduleModal(true)}
                                className="bg-green-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-100"
                            >
                                Schedule Pickup
                            </button>
                        </div>

                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trendData}>
                                    <defs>
                                        <linearGradient id="colorKg" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                                    <RechartsTooltip
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                    />
                                    <Area type="monotone" dataKey="kg" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorKg)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-green-50">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Waste Distribution</h3>
                        <div className="h-48 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value">
                                        {categoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                    </Pie>
                                    <RechartsTooltip />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            {showScheduleModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-green-900/40 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="px-8 py-6 bg-green-600 text-white flex justify-between items-center rounded-t-3xl">
                            <h3 className="text-xl font-bold">Schedule Pickup</h3>
                            <button onClick={() => setShowScheduleModal(false)}>✕</button>
                        </div>
                        <form onSubmit={handleScheduleSubmit} className="p-8 space-y-5">
                            <input required name="date" type="date" className="w-full px-4 py-3 bg-white border border-green-100 rounded-xl" />
                            <select name="type" className="w-full px-4 py-3 bg-white border border-green-100 rounded-xl">
                                <option>Plastic</option>
                                <option>Metal</option>
                                <option>Glass</option>
                                <option>Paper</option>
                                <option>Organic</option>
                                <option>Electronic</option>
                                <option>Hazardous</option>
                            </select>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Items Size</label>
                                <select name="size" className="w-full px-4 py-3 bg-white border border-green-100 rounded-xl">
                                    <option>Small</option>
                                    <option>Medium</option>
                                    <option>Large</option>
                                    <option>Extra Large</option>
                                </select>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-bold text-gray-700 mb-1">District</label>
                                    <select name="district" required value={selectedDistrict} onChange={(e) => setSelectedDistrict(e.target.value)} className="w-full px-4 py-3 bg-white border border-green-100 rounded-xl">
                                        <option value="">Select District...</option>
                                        {KERALA_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Local Body</label>
                                    <select name="localBody" required disabled={!selectedDistrict} className="w-full px-4 py-3 bg-white border border-green-100 rounded-xl">
                                        <option value="">Select Local Body...</option>
                                        {selectedDistrict && KERALA_LOCAL_BODIES[selectedDistrict]?.map(lb => <option key={lb} value={lb}>{lb}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Pickup Address</label>
                                <div className="flex gap-2">
                                    <input required name="address" type="text" defaultValue={user.address || "123 Green Avenue"} placeholder="Enter pickup address" className="w-full px-4 py-3 bg-white border border-green-100 rounded-xl" />
                                    <button type="button" onClick={handleGetLocation} className="whitespace-nowrap px-3 py-3 bg-green-50 text-green-700 font-bold rounded-xl border border-green-200 hover:bg-green-100" title="Use Current Location">
                                        {isLocating ? 'Locating...' : '📍 GPS'}
                                    </button>
                                </div>
                                {coordinates && <p className="text-xs text-green-600 mt-1">✓ Location attached ({coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)})</p>}
                            </div>
                            <button type="submit" className="w-full px-4 py-3 bg-green-600 text-white rounded-xl font-bold shadow-lg">Confirm</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;
