import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { User, WastePickup } from '../types';

interface ComplaintsProps {
    user: User;
}

const Complaints: React.FC<ComplaintsProps> = ({ user }) => {
    const [pickups, setPickups] = useState<WastePickup[]>([]);
    const [complaints, setComplaints] = useState<Record<string, boolean>>({}); // key: pickupId
    const [loading, setLoading] = useState(true);
    const [reporting, setReporting] = useState<string | null>(null);

    useEffect(() => {
        // Fetch User Pickups
        const q = query(
            collection(db, `users/${user.id}/pickups`),
            orderBy('date', 'desc'),
            limit(100)
        );

        const unsubscribePickups = onSnapshot(q, (snapshot) => {
            const currentDateStr = new Date().toISOString().split('T')[0];

            const missedPickups = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as WastePickup[];

            // Filter missed pickups locally, date < currentDate and status != completed
            const filtered = missedPickups.filter(p =>
                p.date < currentDateStr && p.status !== 'COMPLETED'
            );

            setPickups(filtered);
            setLoading(false);
        });

        return () => {
            unsubscribePickups();
        };
    }, [user.id]);

    const handleReport = (pickup: WastePickup) => {
        try {
            setReporting(pickup.id);
            const subject = encodeURIComponent("Missed Pickup Complaint");
            const body = encodeURIComponent(
                `Pickup ID: ${pickup.id}\nScheduled Date: ${pickup.date}\nLocation: ${pickup.address}\n\nMessage:\nThis pickup request was not serviced on the scheduled date. Please take necessary action.`
            );
            
            // Using the direct Gmail web compose URL ensures that asking Chrome will open Gmail directly.
            const gmailUrl = `https://mail.google.com/mail/u/0/?view=cm&fs=1&to=authorityscrap@gmail.com&su=${subject}&body=${body}`;
            
            // Create a temporary anchor element
            const link = document.createElement('a');
            link.href = gmailUrl;
            
            // Specify target to ensure it tries to open correctly
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            
            // Append, click, and remove
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Mark as reported locally for this session
            setComplaints(prev => ({ ...prev, [pickup.id]: true }));
        } catch (error) {
            console.error("Error reporting complaint:", error);
            alert("Failed to report complaint. There was an error opening your email client.");
        } finally {
            setReporting(null);
        }
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 mt-16 flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-500">
            <div className="bg-white rounded-3xl shadow-sm border border-red-50 overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center bg-white/50">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path></svg>
                        Complaints
                    </h3>
                    <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full">{pickups.length} Missed Pickups</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Pickup ID</th>
                                <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Scheduled Date</th>
                                <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Location</th>
                                <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-widest">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {pickups.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-12 text-center text-sm font-medium text-gray-500">
                                        No missed pickup requests found. All scheduled collections are completed.
                                    </td>
                                </tr>
                            ) : (
                                pickups.map((p) => {
                                    const isReported = complaints[p.id];
                                    return (
                                        <tr key={p.id} className="hover:bg-red-50/20 transition-colors">
                                            <td className="px-8 py-5 text-sm font-mono text-gray-500">{p.id.substring(0, 8)}...</td>
                                            <td className="px-8 py-5 text-sm font-bold text-gray-900">{p.date}</td>
                                            <td className="px-8 py-5 text-sm text-gray-700 max-w-xs truncate" title={p.address}>{p.address}</td>
                                            <td className="px-8 py-5">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${p.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    {p.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <button
                                                    onClick={() => !isReported && handleReport(p)}
                                                    disabled={isReported || reporting === p.id}
                                                    className={`inline-flex items-center px-4 py-2 text-xs font-bold rounded-lg transition-all shadow-sm ${isReported
                                                            ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                                                            : 'bg-red-600 text-white hover:bg-red-700 hover:shadow-md'
                                                        }`}
                                                >
                                                    {isReported ? 'Reported ✓' : reporting === p.id ? 'Reporting...' : 'Report to Authority'}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Complaints;
