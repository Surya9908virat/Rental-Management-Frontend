import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { CreditCard, Wrench, Home, CheckCircle, XCircle, Loader2, AlertCircle, MessageSquare, TrendingUp, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/apiClient';
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, Cell } from 'recharts';

const paymentData = [
  { month: 'Jan', status: 'Paid', amount: 1200 },
  { month: 'Feb', status: 'Paid', amount: 1200 },
  { month: 'Mar', status: 'Paid', amount: 1200 },
  { month: 'Apr', status: 'Paid', amount: 1200 },
  { month: 'May', status: 'Paid', amount: 1200 },
  { month: 'Jun', status: 'Pending', amount: 1200 },
];

const TenantDashboard: React.FC = () => {
  const { user } = useAuth();
  const [leases, setLeases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  const fetchLeases = async () => {
    try {
      const res = await api.get('/leases/my-leases');
      setLeases(res.data);
    } catch (error) {
      console.error("Failed to fetch leases", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeases();
  }, []);

  const handleLeaseAction = async (id: string, action: 'accept' | 'reject') => {
    setProcessing(id);
    try {
      await api.post(`/leases/${id}/${action}`);
      alert(`Lease ${action}ed successfully!`);
      fetchLeases();
    } catch (error: any) {
      alert(error.response?.data?.message || `Failed to ${action} lease.`);
    } finally {
      setProcessing(null);
    }
  };

  const pendingLeases = leases.filter(l => l.status === 'pending');
  const activeLease = leases.find(l => l.status === 'active');

  if (loading) return <div className="text-center py-20 text-slate-500 font-medium italic">Loading your dashboard...</div>;

  return (
    <div className="space-y-8 max-w-5xl mx-auto w-full pb-10">
      <div className="bg-gradient-to-r from-primary to-blue-500 dark:from-slate-900 dark:to-slate-800 rounded-2xl p-8 text-white shadow-md relative overflow-hidden transition-all duration-300">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2 text-white">Welcome back, {user?.name}</h1>
          <p className="text-white/80 text-lg">What would you like to do today?</p>
        </div>
        <Home className="absolute -right-4 -bottom-4 text-white/10 w-48 h-48" />
      </div>

      {/* Actionable Alerts for Pending Leases */}
      {pendingLeases.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-secondary dark:text-white flex items-center gap-2">
            <AlertCircle className="text-amber-500" size={20} /> Action Required
          </h2>
          {pendingLeases.map(lease => (
            <Card key={lease._id} className="border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-900/10 shadow-sm overflow-hidden">
              <CardContent className="p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex gap-4 items-center">
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-amber-100 dark:border-amber-900/30 text-amber-600 dark:text-amber-400">
                    <Home size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-100">New Lease Agreement</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Property: <b>{lease.property?.address || "Wait..."}</b></p>
                    <p className="text-xs text-slate-500 font-medium mt-1">Rent: ${lease.rentAmount}/month • Starts: {new Date(lease.startDate).toLocaleDateString()}</p>

                    {lease.lease_documents && lease.lease_documents.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {lease.lease_documents.map((doc: string, idx: number) => (
                          <a
                            key={idx}
                            href={doc}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-2 py-1 bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/50 rounded text-[10px] font-bold text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
                          >
                            <FileText size={12} /> {doc.match(/\.pdf($|\?)/i) ? 'PDF' : 'IMAGE'} {idx + 1}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                  <Button
                    onClick={() => handleLeaseAction(lease._id, 'accept')}
                    disabled={!!processing}
                    className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-700 gap-2"
                  >
                    {processing === lease._id ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle size={16} />}
                    Accept Lease
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleLeaseAction(lease._id, 'reject')}
                    disabled={!!processing}
                    className="flex-1 md:flex-none border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 gap-2"
                  >
                    <XCircle size={16} /> Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">

        {/* Payments Link */}
        <Link to="/tenant/payments" className="group">
          <Card className="h-full border-transparent hover:border-primary/30 hover:shadow-lg transition-all cursor-pointer">
            <CardContent className="p-8 flex flex-col items-center text-center gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/30 text-primary dark:text-blue-400 rounded-full group-hover:bg-primary group-hover:text-white transition-colors">
                <CreditCard size={32} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-secondary dark:text-white mb-2">Rent & Payments</h2>
                <p className="text-slate-500">Pay your rent online, view payment history, and check your upcoming due dates.</p>
                {activeLease && (
                  <div className={`mt-4 p-3 rounded-lg border inline-block ${activeLease.isPaidThisMonth ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-900/50' : 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900/50'}`}>
                    <p className={`text-xs font-bold uppercase tracking-wider ${activeLease.isPaidThisMonth ? 'text-emerald-800 dark:text-emerald-400' : 'text-blue-800 dark:text-blue-400'}`}>
                      {activeLease.isPaidThisMonth ? 'Monthly Status' : 'Current Rent Due'}
                    </p>
                    {activeLease.isPaidThisMonth ? (
                      <div className="flex items-center gap-2 mt-1">
                        <CheckCircle className="text-emerald-500" size={20} />
                        <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">Payment Completed</p>
                      </div>
                    ) : (
                      <p className="text-2xl font-black text-blue-600 dark:text-blue-400">${activeLease.rentAmount}</p>
                    )}
                    <p className={`text-[10px] font-bold mt-1 uppercase ${activeLease.isPaidThisMonth ? 'text-emerald-700 dark:text-emerald-500' : 'text-blue-700 dark:text-blue-500'}`}>
                      {activeLease.isPaidThisMonth ? 'Next due in the following month' : `Due on ${new Date(activeLease.startDate).getDate()}th of every month`}
                    </p>
                    {activeLease.lease_documents && activeLease.lease_documents.length > 0 && (
                      <div className="mt-4 flex flex-col gap-2">
                        {activeLease.lease_documents.map((doc: string, idx: number) => (
                          <a
                            key={idx}
                            href={doc}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button variant="outline" size="sm" className="w-full gap-2 border-primary/20 dark:border-primary/40 text-primary dark:text-blue-400 hover:bg-primary/5 dark:hover:bg-primary/10 font-bold h-9 rounded-lg">
                              <FileText size={14} /> View Lease Agreement {activeLease.lease_documents.length > 1 ? idx + 1 : ''}
                            </Button>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              {!activeLease?.isPaidThisMonth && (
                <Button variant="primary" className="mt-4 w-full md:w-auto px-10">
                  {activeLease ? "Make Payment Now" : "Manage Payments"}
                </Button>
              )}
              {activeLease?.isPaidThisMonth && (
                <Button variant="outline" className="mt-4 w-full md:w-auto px-10 border-emerald-200 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20">
                  View Payment Receipt
                </Button>
              )}
            </CardContent>
          </Card>
        </Link>

        {/* Maintenance Link */}
        <Link to="/tenant/maintenance" className="group">
          <Card className="h-full border-transparent hover:border-accent/30 hover:shadow-lg transition-all cursor-pointer">
            <CardContent className="p-8 flex flex-col items-center text-center gap-4">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 text-accent dark:text-emerald-400 rounded-full group-hover:bg-accent group-hover:text-white transition-colors">
                <Wrench size={32} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-secondary dark:text-white mb-2">Maintenance Requests</h2>
                <p className="text-slate-500">Submit a new repair request, track existing tickets, and communicate with your landlord.</p>
              </div>
              <Button variant="outline" className="mt-4 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/20 border-accent/20 dark:border-accent/40 text-accent dark:text-emerald-400">
                View Maintenance
              </Button>
            </CardContent>
          </Card>
        </Link>

        {/* Messages Link */}
        <Link to="/messages" className="group">
          <Card className="h-full border-transparent hover:border-purple-300 dark:hover:border-purple-900 hover:shadow-lg transition-all cursor-pointer">
            <CardContent className="p-8 flex flex-col items-center text-center gap-4">
              <div className="p-4 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <MessageSquare size={32} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-secondary dark:text-white mb-2">Support & Chat</h2>
                <p className="text-slate-500">Contact your landlord directly, discuss repairs, and keep all communication in one place.</p>
              </div>
              <Button variant="outline" className="mt-4 group-hover:bg-purple-50 dark:group-hover:bg-purple-900/20 border-purple-200 dark:border-purple-900/50 text-purple-600 dark:text-purple-400">
                Open Chat
              </Button>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Analytics / Payment History */}
      <Card className="border-none shadow-xl overflow-hidden">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h2 className="text-xl font-bold text-secondary dark:text-white flex items-center gap-2">
                <TrendingUp className="text-primary" size={22} /> Rent Payment History
              </h2>
              <p className="text-sm text-slate-500">Overview of your last 6 months of consistency</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Paid</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-100"></div>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Upcoming / Pending</span>
              </div>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={paymentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                  dy={10}
                />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="amount" radius={[6, 6, 6, 6]} barSize={40}>
                  {paymentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.status === 'Paid' ? '#2563eb' : '#dbeafe'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TenantDashboard;