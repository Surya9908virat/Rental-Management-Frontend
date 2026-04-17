import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import api from '../services/apiClient';
import { Home, Plus, MapPin, Building, ArrowLeft, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const LandlordProperties: React.FC = () => {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    street: '',
    city: '',
    state: '',
    zip: ''
  });

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const res = await api.get('/properties/my');
      setProperties(res.data);
    } catch (error) {
      console.error("Failed to fetch properties", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fullAddress = `${formData.street}, ${formData.city}, ${formData.state} ${formData.zip}`;
      await api.post('/properties', { address: fullAddress });
      setShowForm(false);
      setFormData({ street: '', city: '', state: '', zip: '' });
      fetchProperties();
    } catch (error: any) {
      console.error("Failed to create property", error);
      const detail = error.response?.data?.message || error.message || "Unknown error";
      alert(`Error creating property: ${detail}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/landlord/dashboard">
            <Button variant="ghost" size="sm" className="p-0 h-8 w-8 rounded-full">
              <ArrowLeft size={20} />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-secondary">My Properties</h1>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus size={18} /> Add Property
          </Button>
        )}
      </div>

      {showForm && (
        <Card className="max-w-2xl mx-auto shadow-lg border-2 border-primary/10">
          <CardHeader className="bg-slate-50 border-b border-slate-100">
            <h2 className="text-lg font-bold">Register New Property</h2>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Street Address"
                placeholder="123 Main St, Apt 4"
                required
                value={formData.street}
                onChange={(e) => setFormData({...formData, street: e.target.value})}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="City"
                  placeholder="New York"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                />
                <Input
                  label="State / Province"
                  placeholder="NY"
                  required
                  value={formData.state}
                  onChange={(e) => setFormData({...formData, state: e.target.value})}
                />
              </div>
              <Input
                label="Zip / Postal Code"
                placeholder="10001"
                required
                value={formData.zip}
                onChange={(e) => setFormData({...formData, zip: e.target.value})}
              />
              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={submitting} className="flex-1">
                  {submitting ? <Loader2 className="animate-spin mr-2" /> : <Plus className="mr-2" />}
                  Add Property
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} disabled={submitting}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 className="animate-spin h-10 w-10 mb-2" />
          <p>Loading your portfolio...</p>
        </div>
      ) : (properties && properties.length > 0) ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((prop) => (
            <Card key={prop._id} className="group hover:shadow-md transition-shadow cursor-default overflow-hidden">
              <div className="h-3 bg-secondary/10 group-hover:bg-primary/20 transition-colors"></div>
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-slate-100 rounded text-slate-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <Building size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 leading-tight mb-1">{prop.address.split(',')[0]}</h3>
                    <p className="text-sm text-slate-500 flex items-center gap-1">
                      <MapPin size={14} /> {prop.address}
                    </p>
                  </div>
                </div>
                <div className="mt-6 flex justify-between items-center pt-4 border-t border-slate-50">
                  <Badge variant="success">Active</Badge>
                  <Button variant="ghost" size="sm" className="text-xs h-8">Manage Details</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
          <div className="bg-white p-4 rounded-full shadow-sm inline-block mb-4">
            <Home className="text-slate-300" size={48} />
          </div>
          <h3 className="text-lg font-bold text-slate-600">No properties listed yet</h3>
          <p className="text-slate-400 mb-6 font-medium">Start your portfolio by adding your first rental property.</p>
          <Button onClick={() => setShowForm(true)} variant="primary" className="gap-2">
            <Plus size={18} /> Add Your First Property
          </Button>
        </div>
      )}
    </div>
  );
};

export default LandlordProperties;
