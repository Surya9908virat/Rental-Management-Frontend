import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
    MapPin,
    DollarSign,
    MessageSquare,
    ArrowLeft,
    ShieldCheck,
    Info,
    Calendar,
    ChevronRight,
    Loader2,
    CheckCircle2,
    Building
} from 'lucide-react';
import api from '../services/apiClient';
import { useAuth } from '../context/AuthContext';

const PropertyDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [property, setProperty] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [requesting, setRequesting] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchProperty = async () => {
            try {
                const res = await api.get('/properties/all'); // Filtering on frontend for now to avoid new endpoint
                const found = res.data.find((p: any) => p._id === id);
                setProperty(found);
            } catch (error) {
                console.error("Failed to fetch property details", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProperty();
    }, [id]);

    const handleRequestLease = async () => {
        if (user?.role !== 'tenant') {
            alert("Only tenants can request a lease.");
            return;
        }

        setRequesting(true);
        try {
            // Create a pending lease request
            // We set arbitrary dates for now, usually landlord would finalize this
            const startDate = new Date();
            const endDate = new Date();
            endDate.setFullYear(endDate.getFullYear() + 1);

            await api.post('/leases', {
                propertyId: property._id,
                tenantId: user._id,
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
                rentAmount: property.price
            });

            setSuccess(true);
        } catch (error) {
            console.error("Request failed", error);
            alert("Failed to send lease request.");
        } finally {
            setRequesting(false);
        }
    };

    const handleMessageOwner = () => {
        // Navigate to messages and try to initiate chat
        // For now just navigate to messages
        navigate('/messages');
    };

    if (loading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="animate-spin text-primary" size={48} /></div>;
    if (!property) return <div className="text-center py-20">Property not found.</div>;

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-900 pb-20 transition-colors duration-300">

            <div className="max-w-6xl mx-auto px-4 py-8">
                <Link to="/properties" className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-primary font-bold transition-colors mb-8 group">
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Back to Marketplace
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Main Info */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="space-y-4">
                            <h1 className="text-4xl font-black text-secondary dark:text-white tracking-tight leading-tight">{property.name}</h1>
                            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium">
                                <MapPin size={20} className="text-primary" />
                                <p className="text-lg">{property.address}</p>
                            </div>
                        </div>

                        {/* Image Gallery Mockup */}
                        <div className="grid grid-cols-4 grid-rows-2 h-[500px] gap-4 rounded-3xl overflow-hidden shadow-2xl shadow-slate-200 dark:shadow-none">
                            <div className="col-span-3 row-span-2 bg-slate-100 dark:bg-slate-800 relative group cursor-pointer border border-white dark:border-slate-700">
                                {property.images && property.images.length > 0 ? (
                                    <img src={property.images[0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-700 italic">No main image available</div>
                                )}
                            </div>
                            <div className="bg-slate-200 dark:bg-slate-800 border border-white dark:border-slate-700">
                                {property.images && property.images.length > 1 ? (
                                    <img src={property.images[1]} alt="" className="w-full h-full object-cover" />
                                ) : <div className="h-full bg-slate-100" />}
                            </div>
                            <div className="bg-slate-300 dark:bg-slate-800 border border-white dark:border-slate-700 relative group cursor-pointer overflow-hidden">
                                {property.images && property.images.length > 2 ? (
                                    <>
                                        <img src={property.images[2]} alt="" className="w-full h-full object-cover" />
                                        {property.images.length > 3 && (
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-black text-xl backdrop-blur-[2px] group-hover:backdrop-blur-none transition-all">
                                                +{property.images.length - 2}
                                            </div>
                                        )}
                                    </>
                                ) : <div className="h-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-400"><Building size={24} /></div>}
                            </div>
                        </div>

                        <Card className="border-none shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
                            <CardContent className="p-8">
                                <h2 className="text-2xl font-black text-secondary dark:text-white mb-6 flex items-center gap-2">
                                    <Info className="text-primary" size={24} /> About this property
                                </h2>
                                <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed whitespace-pre-wrap text-lg">
                                    {property.description || "No description provided for this property."}
                                </p>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10">
                                    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                        <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest mb-1 text-center">Price</p>
                                        <p className="text-xl font-black text-primary text-center">${property.price.toLocaleString()}</p>
                                    </div>
                                    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                        <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest mb-1 text-center">Status</p>
                                        <p className="text-lg font-bold text-emerald-600 text-center uppercase tracking-tight">Available</p>
                                    </div>
                                    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 col-span-2">
                                        <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest mb-1 text-center">Listing Verified</p>
                                        <div className="flex items-center justify-center gap-2 text-blue-600">
                                            <ShieldCheck size={20} />
                                            <span className="font-bold">Rental Management Trust</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Action Sidebar */}
                    <div className="space-y-6">
                        <Card className="border-none shadow-2xl shadow-slate-200 dark:shadow-none overflow-hidden sticky top-8">
                            <div className="bg-primary p-1"></div>
                            <CardContent className="p-8 space-y-6">
                                <div className="text-center pb-6 border-b border-slate-100">
                                    <p className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Monthly Rent</p>
                                    <div className="flex items-center justify-center gap-1">
                                        <DollarSign className="text-primary mt-1" size={28} />
                                        <span className="text-5xl font-black text-secondary dark:text-white">{property.price.toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="space-y-4 py-4">
                                    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white dark:border-slate-700 shadow-sm">
                                            {property.landlord.profilePicture ? (
                                                <img src={property.landlord.profilePicture} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-primary flex items-center justify-center text-white font-bold">{property.landlord.name.charAt(0)}</div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-secondary dark:text-white">{property.landlord.name}</p>
                                            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Property Owner</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleMessageOwner}
                                        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-sm"
                                    >
                                        <MessageSquare size={18} className="text-primary" /> Message Landlord
                                    </button>
                                </div>

                                {success ? (
                                    <div className="p-5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/50 rounded-2xl flex flex-col items-center text-center gap-3 animate-in fade-in zoom-in duration-500">
                                        <div className="p-2 bg-emerald-100 rounded-full text-emerald-600">
                                            <CheckCircle2 size={32} />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-emerald-900 dark:text-emerald-400">Request Sent!</h4>
                                            <p className="text-xs text-emerald-700 dark:text-emerald-500 font-medium">The owner will review your application soon.</p>
                                        </div>
                                        <Button variant="primary" className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={() => navigate('/tenant/dashboard')}>
                                            Go to Dashboard
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 text-center">Interested in this home?</p>
                                        <Button
                                            onClick={handleRequestLease}
                                            disabled={requesting || user?.role !== 'tenant'}
                                            className="w-full h-14 rounded-2xl text-lg font-black shadow-xl shadow-primary/20 flex items-center justify-center gap-2 group"
                                        >
                                            {requesting ? (
                                                <Loader2 className="animate-spin" size={20} />
                                            ) : (
                                                <>Request Lease <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" /></>
                                            )}
                                        </Button>
                                        {user?.role !== 'tenant' && (
                                            <p className="text-[10px] text-red-500 font-bold text-center">You must be logged in as a Tenant to apply.</p>
                                        )}
                                    </div>
                                )}

                                <div className="pt-4 flex flex-col gap-3">
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <Calendar size={14} />
                                        <span className="text-[10px] font-bold uppercase tracking-tight">Posted {new Date(property.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-none bg-blue-600 dark:bg-blue-900/50 text-white overflow-hidden shadow-xl shadow-blue-200 dark:shadow-none">
                            <CardContent className="p-6 space-y-3">
                                <h4 className="font-black flex items-center gap-2"><ShieldCheck size={18} /> Rental Management Secure</h4>
                                <p className="text-xs text-blue-100 font-medium leading-relaxed">Your data and payments are secured with end-to-end encryption. We never share your details without consent.</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PropertyDetail;
