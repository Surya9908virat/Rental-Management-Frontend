import { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Search, MapPin, DollarSign, Home, ArrowRight, Loader2, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/apiClient';

interface Property {
    _id: string;
    name: string;
    address: string;
    description: string;
    price: number;
    images: string[];
    landlord: {
        name: string;
        profilePicture?: string;
    };
}

const BrowseProperties = () => {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchProperties = async () => {
            try {
                const res = await api.get('/properties/all');
                setProperties(res.data);
            } catch (error) {
                console.error("Failed to fetch properties", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProperties();
    }, []);

    const filteredProperties = properties.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.address.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-900 transition-colors duration-300">

            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-secondary dark:text-white tracking-tight mb-2">Find Your Next Home</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">Browse available properties and request a lease directly.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        <div className="relative flex-1 sm:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search by area or property name..."
                                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm font-medium text-secondary dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" className="flex items-center gap-2 h-12 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                            <Filter size={18} /> Filters
                        </Button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 space-y-4">
                        <Loader2 className="animate-spin text-primary" size={48} />
                        <p className="text-slate-500 dark:text-slate-400 font-bold animate-pulse italic">Discovering properties...</p>
                    </div>
                ) : filteredProperties.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredProperties.map((property) => (
                            <Link key={property._id} to={`/properties/${property._id}`} className="group">
                                <Card className="h-full border-none shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden hover:-translate-y-1 transition-all duration-300">
                                    <div className="aspect-[4/3] bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                                        {property.images && property.images.length > 0 ? (
                                            <img
                                                src={property.images[0]}
                                                alt={property.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-700">
                                                <Home size={48} />
                                            </div>
                                        )}
                                        <div className="absolute top-4 right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-sm border border-white/50 dark:border-slate-800/50">
                                            <p className="text-sm font-black text-primary flex items-center gap-1">
                                                <DollarSign size={14} /> {property.price.toLocaleString()}/mo
                                            </p>
                                        </div>
                                    </div>

                                    <CardContent className="p-6">
                                        <div className="mb-4">
                                            <h3 className="text-lg font-black text-secondary dark:text-white group-hover:text-primary transition-colors line-clamp-1">{property.name}</h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1 mt-1">
                                                <MapPin size={14} className="text-slate-400" /> {property.address}
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 border border-white dark:border-slate-700 overflow-hidden">
                                                    {property.landlord.profilePicture ? (
                                                        <img src={property.landlord.profilePicture} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary text-[10px] font-bold">
                                                            {property.landlord.name.charAt(0)}
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 line-clamp-1">{property.landlord.name}</span>
                                            </div>

                                            <div className="text-primary font-bold text-xs flex items-center gap-1">
                                                View Details <ArrowRight size={14} />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-32 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="inline-flex p-6 bg-slate-50 dark:bg-slate-800 rounded-full text-slate-300 dark:text-slate-700 mb-6">
                            <Search size={48} />
                        </div>
                        <h3 className="text-xl font-black text-secondary mb-2">No properties found</h3>
                        <p className="text-slate-500 font-medium max-w-xs mx-auto">Try adjusting your search or check back later for new listings.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BrowseProperties;
