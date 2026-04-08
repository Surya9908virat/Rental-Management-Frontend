import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import api from '../services/apiClient';
import { FileText, Plus, User, Calendar, DollarSign, ArrowLeft, Loader2, CheckCircle, Clock, XCircle, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const LandlordLeases: React.FC = () => {
  const [leases, setLeases] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    propertyId: '',
    startDate: '',
    endDate: '',
    rentAmount: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [leasesRes, propsRes] = await Promise.all([
        api.get('/leases/landlord'),
        api.get('/properties/my')
      ]);
      setLeases(leasesRes.data);
      setProperties(propsRes.data);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const [leaseFiles, setLeaseFiles] = useState<FileList | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value);
      });

      if (leaseFiles) {
        for (let i = 0; i < leaseFiles.length; i++) {
          data.append('lease_documents', leaseFiles[i]);
        }
      }

      await api.post('/leases', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setShowForm(false);
      setFormData({ propertyId: '', startDate: '', endDate: '', rentAmount: '' });
      setLeaseFiles(null);
      fetchData();
    } catch (error: any) {
      console.error("Failed to create lease", error);
      alert(error.response?.data?.message || "Error creating lease.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteLease = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this lease? This action cannot be undone.")) return;
    try {
      await api.delete(`/leases/${id}`);
      alert("Lease deleted successfully");
      fetchData();
    } catch (error: any) {
      console.error("Delete failed", error);
      alert(error.response?.data?.message || "Failed to delete lease");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge variant="success" className="gap-1"><CheckCircle size={10} /> Active</Badge>;
      case 'pending': return <Badge variant="warning" className="gap-1"><Clock size={10} /> Pending</Badge>;
      case 'rejected': return <Badge variant="danger" className="gap-1"><XCircle size={10} /> Rejected</Badge>;
      default: return <Badge variant="info">{status}</Badge>;
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
          <h1 className="text-2xl font-bold text-secondary dark:text-white">Lease Contracts</h1>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
            <Plus size={18} /> New Lease
          </Button>
        )}
      </div>

      {showForm && (
        <Card className="max-w-2xl mx-auto shadow-xl border-t-4 border-emerald-500 overflow-hidden">
          <CardHeader className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 py-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <FileText className="text-emerald-600" size={20} /> Generate Lease Agreement
            </h2>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Select Property</label>
                <select
                  className="w-full h-10 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
                  required
                  value={formData.propertyId}
                  onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
                >
                  <option value="">Choose a property...</option>
                  {properties.map(p => (
                    <option key={p._id} value={p._id}>{p.address}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Start Date"
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  icon={<Calendar size={18} />}
                />
                <Input
                  label="End Date"
                  type="date"
                  required
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  icon={<Calendar size={18} />}
                />
              </div>

              <Input
                label="Monthly Rent Amount"
                type="number"
                placeholder="1200"
                required
                value={formData.rentAmount}
                onChange={(e) => setFormData({ ...formData, rentAmount: e.target.value })}
                icon={<DollarSign size={18} />}
              />

              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Lease Agreements (PDFs & Images)</label>
                <input
                  type="file"
                  multiple
                  accept="application/pdf,image/*"
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                  onChange={(e) => setLeaseFiles(e.target.files)}
                />
                {leaseFiles && <p className="text-xs text-emerald-600 font-medium">{leaseFiles.length} files selected</p>}
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={submitting} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                  {submitting ? <Loader2 className="animate-spin mr-2" /> : <CheckCircle size={18} className="mr-2" />}
                  Finalize & Send Lease
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
          <p>Fetching active contracts...</p>
        </div>
      ) : leases.length > 0 ? (
        <Card className="overflow-hidden border-none shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider">Property</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider">Tenant</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-right">Monthly Rent</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-center">Document</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-center">Status</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leases.map((lease) => (
                  <tr key={lease._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition border-b border-slate-100 dark:border-slate-800">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800 dark:text-slate-200">{lease.property?.address?.split(',')[0] || 'Unknown'}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate w-48">{lease.property?.address}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                          <User size={14} />
                        </div>
                        <div>
                          <p className="font-medium text-slate-700 dark:text-slate-300">{lease.tenant?.name || 'Pending'}</p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-tighter">{lease.tenant?._id?.substring(18)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      <p className="font-medium">{format(new Date(lease.startDate), 'MMM d, yyyy')}</p>
                      <p className="text-xs opacity-60">to {format(new Date(lease.endDate), 'MMM d, yyyy')}</p>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-slate-900 dark:text-white">
                      ${lease.rentAmount}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-wrap justify-center gap-2">
                        {lease.lease_documents && lease.lease_documents.length > 0 ? (
                          lease.lease_documents.map((doc: string, dIdx: number) => (
                            <a key={dIdx} href={doc} target="_blank" rel="noopener noreferrer">
                              <Button variant="outline" size="sm" className="h-9 gap-2 border-emerald-100 text-emerald-700 hover:bg-emerald-50 px-3 rounded-lg font-bold">
                                <FileText size={14} /> {lease.lease_documents.length > 1 ? `View ${dIdx + 1}` : 'View Doc'}
                              </Button>
                            </a>
                          ))
                        ) : (
                          <span className="text-slate-300 dark:text-slate-600 text-xs italic font-medium px-3 py-1.5 bg-slate-50 dark:bg-slate-900 rounded-lg">No Document</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {getStatusBadge(lease.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-10 w-10 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full"
                        onClick={() => handleDeleteLease(lease._id)}
                      >
                        <Trash2 size={22} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <div className="text-center py-20 bg-emerald-50/30 dark:bg-emerald-950/20 rounded-xl border-2 border-dashed border-emerald-100 dark:border-emerald-900/50">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-full shadow-sm inline-block mb-4">
            <FileText className="text-emerald-200 dark:text-emerald-900" size={48} />
          </div>
          <h3 className="text-lg font-bold text-slate-600 dark:text-slate-300">No active leases found</h3>
          <p className="text-slate-400 dark:text-slate-500 mb-6 font-medium">You haven't created any rental agreements yet.</p>
          <Button onClick={() => setShowForm(true)} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
            <Plus size={18} /> Create Your First Lease
          </Button>
        </div>
      )}
    </div>
  );
};

export default LandlordLeases;
