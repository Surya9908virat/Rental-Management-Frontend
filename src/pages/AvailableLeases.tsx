import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import api from '../services/apiClient';
import {
    FileText,
    MapPin,
    Calendar,
    Loader2,
    Building,
    ArrowRight,
    User,
    ShieldCheck,
    Search
} from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const AvailableLeases: React.FC = () => {
    const [leases, setLeases] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [accepting, setAccepting] = useState<string | null>(null);
    const navigate = useNavigate();

    const fetchAvailableLeases = async () => {
        setLoading(true);
        try {
            const res = await api.get('/leases/available');
            setLeases(res.data);
        } catch (error) {
            console.error("Failed to fetch available leases", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAvailableLeases();
    }, []);

    const handleAcceptLease = async (id: string) => {
        if (!window.confirm("Do you want to accept this lease agreement?")) return;

        setAccepting(id);
        try {
            await api.post(`/leases/${id}/accept`);
            alert("Lease accepted successfully! You can now view it in your dashboard.");
            navigate('/tenant/dashboard');
        } catch (error: any) {
            console.error("Failed to accept lease", error);
            alert(error.response?.data?.message || "Error accepting lease.");
        } finally {
            setAccepting(null);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-900 transition-colors duration-300">

            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="mb-12">
                    <h1 className="text-4xl font-black text-secondary dark:text-white tracking-tight mb-2">Available Lease Offers</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Browse and accept lease agreements directly from landlords.</p>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 space-y-4">
                        <Loader2 className="animate-spin text-primary" size={48} />
                        <p className="text-slate-500 dark:text-slate-400 font-bold animate-pulse italic">Loading available offers...</p>
                    </div>
                ) : leases.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {leases.map((lease) => (
                            <Card key={lease._id} className="border-none shadow-xl shadow-slate-200/40 dark:shadow-none overflow-hidden flex flex-col hover:-translate-y-1 transition-all">
                                <div className="bg-primary/5 dark:bg-primary/10 p-6 border-b border-primary/10 dark:border-primary/20">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm text-primary dark:text-blue-400">
                                            <Building size={24} />
                                        </div>
                                        <Badge variant="warning">New Opportunity</Badge>
                                    </div>
                                    <h3 className="text-xl font-black text-secondary dark:text-white line-clamp-1">{lease.property?.address?.split(',')[0]}</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1 mt-1">
                                        <MapPin size={14} className="text-slate-400" /> {lease.property?.address}
                                    </p>
                                </div>

                                <CardContent className="p-8 space-y-6 flex-1">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Monthly Rent</p>
                                            <p className="text-2xl font-black text-primary dark:text-blue-400">${lease.rentAmount}</p>
                                        </div>
                                        <div className="space-y-1 border-l border-slate-100 pl-4">
                                            <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">Lease Type</p>
                                            <p className="text-sm font-bold text-secondary dark:text-white">Standard Term</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3 py-4 border-t border-b border-slate-50 dark:border-slate-800">
                                        <div className="flex items-center gap-3 text-slate-600">
                                            <Calendar size={18} className="text-primary" />
                                            <div>
                                                <p className="text-[10px] font-black uppercase text-slate-400">Duration</p>
                                                <p className="text-xs font-bold text-slate-600 dark:text-slate-300">{format(new Date(lease.startDate), 'MMM yyyy')} - {format(new Date(lease.endDate), 'MMM yyyy')}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 text-slate-600">
                                            <User size={18} className="text-primary" />
                                            <div>
                                                <p className="text-[10px] font-black uppercase text-slate-400">Landlord</p>
                                                <p className="text-xs font-bold text-slate-600 dark:text-slate-300">{lease.landlord?.name}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-xl border border-emerald-100/50 dark:border-emerald-900/50">
                                        <ShieldCheck size={18} />
                                        <p className="text-[11px] font-bold">Verified by Rental Management Property Shield</p>
                                    </div>
                                </CardContent>

                                {lease.property?.images && lease.property.images.length > 0 && (
                                    <div className="h-48 overflow-hidden">
                                        <img
                                            src={lease.property.images[0]}
                                            alt="Property"
                                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                                        />
                                    </div>
                                )}
                                <div className="p-6 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 mt-auto flex flex-col gap-3">
                                    <div className="flex flex-wrap gap-2">
                                        {lease.lease_documents && lease.lease_documents.length > 0 ? (
                                            lease.lease_documents.map((doc: string, dIdx: number) => (
                                                <a key={dIdx} href={doc} target="_blank" rel="noopener noreferrer" className="flex-1">
                                                    <Button variant="outline" className="w-full gap-2 border-primary/20 dark:border-primary/40 text-primary dark:text-blue-400 hover:bg-primary/5 dark:hover:bg-primary/10 font-bold h-11 rounded-xl">
                                                        <FileText size={16} /> View Doc {lease.lease_documents.length > 1 ? dIdx + 1 : ''}
                                                    </Button>
                                                </a>
                                            ))
                                        ) : (
                                            <Button disabled variant="outline" className="flex-1 gap-2 border-slate-200 text-slate-400 font-bold h-11 rounded-xl">
                                                <FileText size={16} /> No Agreement Doc
                                            </Button>
                                        )}
                                    </div>
                                    <Button
                                        onClick={() => handleAcceptLease(lease._id)}
                                        disabled={accepting === lease._id}
                                        className="w-full h-12 rounded-xl font-black text-sm flex items-center justify-center gap-2 group shadow-lg shadow-primary/20"
                                    >
                                        {accepting === lease._id ? <Loader2 className="animate-spin" size={20} /> : (
                                            <>Accept Lease Agreement <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
                                        )}
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-32 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 shadow-sm max-w-2xl mx-auto px-6">
                        <div className="inline-flex p-6 bg-slate-50 dark:bg-slate-800 rounded-full text-slate-300 dark:text-slate-700 mb-6">
                            <Search size={48} />
                        </div>
                        <h3 className="text-2xl font-black text-secondary dark:text-white mb-2">No lease offers available</h3>
                        <p className="text-slate-500 dark:text-slate-400 font-medium max-w-sm mx-auto mb-8">Landlords haven't posted any available lease contracts for this area yet. Check back soon!</p>
                        <Button
                            onClick={() => navigate('/properties')}
                            className="gap-2 px-8 h-12 rounded-2xl shadow-xl shadow-primary/20 font-bold"
                        >
                            <Search size={20} /> Browse Marketplace for Properties
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AvailableLeases;
