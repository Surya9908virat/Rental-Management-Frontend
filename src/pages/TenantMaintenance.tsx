import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import api from '../services/apiClient';
import { Clock, Plus, X, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

const TenantMaintenance: React.FC = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [leases, setLeases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState('low');
  const [images, setImages] = useState<FileList | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [selectedLease, setSelectedLease] = useState('');
  const activeLeases = leases.filter(l => l.status === 'active' && l.property);

  useEffect(() => {
    if (activeLeases.length === 1 && !selectedLease) {
      setSelectedLease(activeLeases[0]._id);
    }
  }, [activeLeases, selectedLease]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [requestsRes, leasesRes] = await Promise.all([
        api.get('/maintenance/my'),
        api.get('/leases/my-leases')
      ]);
      setRequests(requestsRes.data);
      setLeases(leasesRes.data);
    } catch (error) {
      console.error("Error fetching maintenance data", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'resolved': return <Badge variant="success">Resolved</Badge>;
      case 'in-progress': return <Badge variant="warning">In Progress</Badge>;
      case 'submitted': default: return <Badge variant="info">Submitted</Badge>;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) {
      setError('Title and description are required.');
      return;
    }
    if (!selectedLease) {
      setError('Please select a property/lease.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('leaseId', selectedLease);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('urgency', urgency);
      
      if (images) {
        for (let i = 0; i < images.length; i++) {
          formData.append('files', images[i]);
        }
      }

      await api.post('/maintenance', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setShowForm(false);
      setTitle('');
      setDescription('');
      setUrgency('low');
      setImages(null);
      setSelectedLease('');
      await fetchData(); // Refresh list
    } catch (err: any) {
      console.error("Submission failed", err);
      const detail = err.response?.data?.error ? `: ${err.response.data.error}` : '';
      setError(`${err.response?.data?.message || 'Failed to submit request'}${detail}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center py-8 dark:text-white">Loading requests...</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto w-full">
      <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 mb-8">
        <div className="flex items-center gap-4">
          <Link to="/tenant/dashboard">
            <Button variant="ghost" size="sm" className="p-0 h-8 w-8 rounded-full dark:text-white">
              <ArrowLeft size={20} />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Maintenance Requests</h1>
            <p className="text-slate-500 dark:text-slate-400">Manage and track your property repairs</p>
          </div>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          {showForm ? <><X size={18} /> Cancel</> : <><Plus size={18} /> New Request</>}
        </Button>
      </div>

      {showForm && (
        <Card className="border-primary/20 shadow-md">
          <CardHeader>
            <h2 className="text-lg font-semibold text-primary">Submit a New Request</h2>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg border border-red-100 dark:border-red-900/30">{error}</div>}
              
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Property / Lease</label>
                {activeLeases.length > 0 ? (
                  <select 
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                    value={selectedLease}
                    onChange={e => setSelectedLease(e.target.value)}
                    required
                  >
                    <option value="">Select your property...</option>
                    {activeLeases.map(l => (
                      <option key={l._id} value={l._id}>{l.property.address}</option>
                    ))}
                  </select>
                ) : (
                  <div className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-xs rounded-lg border border-amber-100 dark:border-amber-900/30 italic">
                    You have no active lease contracts. Please contact your landlord.
                  </div>
                )}
              </div>

              <Input 
                label="Issue Title" 
                placeholder="e.g. Leaking sink" 
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
              />
              
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
                <textarea 
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-shadow bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 min-h-[100px]"
                  placeholder="Describe the issue in detail..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Urgency</label>
                <select 
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                  value={urgency}
                  onChange={e => setUrgency(e.target.value)}
                >
                  <option value="low">Low - General maintenance, not urgent</option>
                  <option value="medium">Medium - Needs attention soon</option>
                  <option value="high">High - Safety hazard or major damage risk</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Photos & Videos (Optional)</label>
                <input 
                  type="file" 
                  multiple 
                  accept="image/*,video/*"
                  onChange={e => setImages(e.target.files)}
                  className="text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                />
                {images && <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">{images.length} files selected</p>}
              </div>

              <Button type="submit" variant="primary" fullWidth disabled={submitting} className="mt-4">
                {submitting ? 'Submitting...' : 'Submit Request'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Your Request History</h2>
        </CardHeader>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {requests.length > 0 ? requests.map((req) => (
            <div key={req._id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <Link to={`/maintenance/${req._id}`} className="font-semibold text-lg text-primary hover:underline">
                  {req.title}
                </Link>
                {getStatusBadge(req.status)}
              </div>
              <p className="text-slate-600 dark:text-slate-300 line-clamp-2">{req.description}</p>
              <div className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 mt-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                <Clock size={14} />
                <span>Submitted on {format(new Date(req.createdAt || req.id || Date.now()), 'MMMM d, yyyy')}</span>
                <span className="mx-2">•</span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${
                  req.urgency === 'high' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : 
                  req.urgency === 'medium' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}>
                  {req.urgency} urgency
                </span>
              </div>
            </div>
          )) : (
             <div className="p-12 text-center text-slate-500 dark:text-slate-400 flex flex-col items-center">
               <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-full mb-4">
                 <Clock size={32} className="text-slate-400 dark:text-slate-500" />
               </div>
               <p className="text-lg font-medium text-slate-900 dark:text-white">No maintenance requests</p>
               <p>Your property looks good! You haven't submitted any requests yet.</p>
             </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default TenantMaintenance;
