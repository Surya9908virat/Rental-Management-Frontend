import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import api from '../services/apiClient';
import { FileText, Calendar, ArrowLeft, Loader2, CheckCircle, Clock, XCircle, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const TenantLease: React.FC = () => {
  const [leases, setLeases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const leasesRes = await api.get('/leases/my-leases');
      setLeases(leasesRes.data);
    } catch (error) {
      console.error("Failed to fetch leases", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge variant="success" className="gap-1"><CheckCircle size={10} /> Active</Badge>;
      case 'pending': return <Badge variant="warning" className="gap-1"><Clock size={10} /> Pending</Badge>;
      case 'rejected': return <Badge variant="danger" className="gap-1"><XCircle size={10} /> Rejected</Badge>;
      case 'expired':
      case 'terminated': return <Badge variant="danger" className="gap-1"><XCircle size={10} /> {status}</Badge>;
      default: return <Badge variant="info">{status}</Badge>;
    }
  };

  const presentLeases = leases.filter(l => l.status === 'active' || l.status === 'pending');
  const pastLeases = leases.filter(l => l.status !== 'active' && l.status !== 'pending');

  const LeaseList = ({ title, list }: { title: string, list: any[] }) => (
    <div className="mb-10">
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">{title}</h2>
      {list.length > 0 ? (
        <Card className="overflow-hidden border border-slate-200 dark:border-slate-700 shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider">Property</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-right">Rent</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-center">Document</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {list.map((lease) => (
                  <tr key={lease._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                          <Home size={18} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{lease.property?.address?.split(',')[0] || 'Unknown'}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate w-48">{lease.property?.address}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-slate-400" />
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{format(new Date(lease.startDate), 'MMM d, yyyy')}</p>
                          <p className="text-xs opacity-70">to {format(new Date(lease.endDate), 'MMM d, yyyy')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-slate-900 dark:text-white text-lg">
                      ₹{lease.rentAmount}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-wrap justify-center gap-2">
                        {lease.lease_documents && lease.lease_documents.length > 0 ? (
                          lease.lease_documents.map((doc: string, dIdx: number) => (
                            <a key={dIdx} href={doc} target="_blank" rel="noopener noreferrer">
                              <Button variant="outline" size="sm" className="h-9 gap-2 border-primary/20 text-primary hover:bg-primary/5 px-3 rounded-lg font-bold">
                                <FileText size={14} /> {lease.lease_documents.length > 1 ? `Doc ${dIdx + 1}` : 'View'}
                              </Button>
                            </a>
                          ))
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500 text-xs italic font-medium px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg">No Document</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {getStatusBadge(lease.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-full inline-block mb-3">
            <FileText className="text-slate-400 dark:text-slate-500" size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No {title.toLowerCase()} found</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm">You do not have any {title.toLowerCase()} in your account.</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto w-full">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/tenant/dashboard">
          <Button variant="ghost" size="sm" className="p-0 h-10 w-10 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700">
            <ArrowLeft size={20} />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">My Leases</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">View and manage your present and past rental agreements</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 className="animate-spin h-10 w-10 mb-2 text-primary" />
          <p className="font-medium">Fetching your lease documents...</p>
        </div>
      ) : (
        <>
          <LeaseList title="Present Leases" list={presentLeases} />
          <LeaseList title="Past Leases" list={pastLeases} />
        </>
      )}
    </div>
  );
};

export default TenantLease;
