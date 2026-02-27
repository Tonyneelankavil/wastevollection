import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { User, WastePickup } from '../types';

interface CollectionLogsProps {
    user: User;
}

const CollectionLogs: React.FC<CollectionLogsProps> = ({ user }) => {
    const [pickups, setPickups] = useState<WastePickup[]>([]);

    useEffect(() => {
        const q = query(
            collection(db, `users/${user.id}/pickups`),
            orderBy('date', 'desc'),
            limit(50)
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

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-500">
            <div className="bg-white rounded-3xl shadow-sm border border-green-50 overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center bg-white/50">
                    <h3 className="text-xl font-bold text-gray-900">Collection Logs</h3>
                    <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">{pickups.length} Records</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Date</th>
                                <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Type</th>
                                <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {pickups.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-8 py-8 text-center text-sm text-gray-500">
                                        No collection logs found yet.
                                    </td>
                                </tr>
                            ) : (
                                pickups.map((p) => (
                                    <tr key={p.id} className="hover:bg-green-50/20 transition-colors">
                                        <td className="px-8 py-5 text-sm font-bold text-gray-900">{p.date}</td>
                                        <td className="px-8 py-5 text-sm text-gray-700">{p.type}</td>
                                        <td className="px-8 py-5">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${p.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                                                }`}>
                                                {p.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CollectionLogs;
