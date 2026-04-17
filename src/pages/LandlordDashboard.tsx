import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import api from '../services/apiClient';
import { Home, Settings, FileText, CreditCard, MessageSquare, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { ResponsiveContainer, AreaChart, Area, Tooltip } from 'recharts';

const chartData = [
  { month: 'Jan', revenue: 4500 },
  { month: 'Feb', revenue: 5200 },
  { month: 'Mar', revenue: 4800 },
  { month: 'Apr', revenue: 6100 },
  { month: 'May', revenue: 5900 },
  { month: 'Jun', revenue: 7200 },
];

const LandlordDashboard: React.FC = () => {
  const [leases, setLeases] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        try {
          const leasesRes = await api.get('/leases/my-leases');
          setLeases(leasesRes.data);
        } catch (e) {
          console.log("Leases endpoint might differ for landlord", e);
        }

        const requestsRes = await api.get('/maintenance/landlord');
        setRequests(requestsRes.data);
      } catch (error) {
        console.error("Error fetching landlord data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="text-center py-8">Loading dashboard...</div>;

  const openRequests = requests.filter(r => r.status !== 'resolved');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-secondary dark:text-white">Landlord Hub</h1>
        <p className="text-white/80">Welcome back. Here's what's happening with your properties.</p>
      </div>

      {/* Stats Overview / Hub Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link to="/landlord/properties" className="group">
          <Card className="h-full border-transparent hover:border-primary/30 hover:shadow-2xl transition-all cursor-pointer overflow-hidden group">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                  <Home size={24} />
                </div>
                <span className="text-2xl font-bold text-secondary">{leases.length || 0}</span>
              </div>
              <h3 className="font-bold text-lg">My Properties</h3>
              <p className="text-sm text-slate-500">Manage listings and details</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/landlord/leases" className="group">
          <Card className="h-full border-transparent hover:border-accent/30 hover:shadow-2xl transition-all cursor-pointer overflow-hidden group">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
                  <FileText size={24} />
                </div>
                <span className="text-2xl font-bold text-secondary">{leases.length || 0}</span>
              </div>
              <h3 className="font-bold text-lg">My Leases</h3>
              <p className="text-sm text-slate-500">Active contracts & tenants</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/landlord/payments" className="group">
          <Card className="h-full border-transparent hover:border-amber-300 dark:hover:border-amber-900 hover:shadow-2xl transition-all cursor-pointer overflow-hidden group">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg">
                  <CreditCard size={24} />
                </div>
                {/* Mock count or status */}
                <Badge variant="info">Ledger</Badge>
              </div>
              <h3 className="font-bold text-lg">Rent & Payments</h3>
              <p className="text-sm text-slate-500">Track income and history</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/messages" className="group">
          <Card className="h-full border-transparent hover:border-purple-300 dark:hover:border-purple-900 hover:shadow-2xl transition-all cursor-pointer overflow-hidden group">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
                  <MessageSquare size={24} />
                </div>
                <Badge variant="info">Chat</Badge>
              </div>
              <h3 className="font-bold text-lg">Support & Chat</h3>
              <p className="text-sm text-slate-500">Direct tenant communication</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Maintenance Queue - Taking more space */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Settings size={22} className="text-secondary" /> Maintenance Queue
            </h2>
            {openRequests.length > 0 && <Badge variant="warning">{openRequests.length} Pending</Badge>}
          </div>

          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="px-6 py-4 font-semibold uppercase tracking-wider">Issue</th>
                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-center">Urgency</th>
                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {requests.length > 0 ? requests.slice(0, 5).map(req => (
                    <tr key={req._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition">
                      <td className="px-6 py-4">
                        <Link to={`/maintenance/${req._id}`} className="font-bold text-primary hover:underline block truncate w-64">
                          {req.title}
                        </Link>
                        <p className="text-xs text-slate-400 mt-1">{format(new Date(req.createdAt || Date.now()), 'MMM d, h:mm a')}</p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${req.urgency === 'high' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                            req.urgency === 'medium' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}>
                          {req.urgency}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link to={`/maintenance/${req._id}`}>
                          <Button size="sm" variant="outline" className="h-8 py-0">View</Button>
                        </Link>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-slate-400 italic">
                        All clear! No maintenance requests.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              {requests.length > 5 && (
                <div className="p-4 bg-slate-50 dark:bg-slate-900/30 text-center border-t border-slate-100 dark:border-slate-800">
                  <p className="text-xs text-slate-500 font-medium cursor-pointer hover:text-primary transition underline decoration-dotted">
                    View all {requests.length} requests
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Quick Actions / sidebar */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold">Quick Actions</h2>
          <Card>
            <CardContent className="p-4 space-y-3">
              <Link to="/landlord/properties">
                <Button variant="primary" className="w-full justify-start gap-2 h-12">
                  <Plus size={18} /> New Property
                </Button>
              </Link>
              <Link to="/landlord/leases">
                <Button variant="outline" className="w-full justify-start gap-2 h-12 border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20">
                  <FileText size={18} /> Generate New Lease
                </Button>
              </Link>
              <Link to="/landlord/payments">
                <Button variant="outline" className="w-full justify-start gap-2 h-12 border-amber-200 dark:border-amber-900/50 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20">
                  <CreditCard size={18} /> Record Payment
                </Button>
              </Link>
            </CardContent>
          </Card>
 
          <div className="bg-gradient-to-r from-primary to-blue-600 dark:from-slate-900 dark:to-slate-800 rounded-3xl p-8 md:p-12 text-white shadow-2xl relative overflow-hidden mb-10 transition-all duration-500">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <CardContent className="p-6 relative z-10">
              <h3 className="font-bold text-lg mb-4 flex items-center justify-between">
                <span>Monthly Revenue</span>
                <span className="text-xs bg-white/10 px-2 py-1 rounded text-emerald-400 font-black">ESTIMATED</span>
              </h3>

              {/* Visual Performance Chart */}
              <div className="h-32 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '10px' }}
                      itemStyle={{ color: '#10b981' }}
                      cursor={{ stroke: '#10b981', strokeWidth: 1 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#10b981"
                      fillOpacity={1}
                      fill="url(#colorRev)"
                      strokeWidth={3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] uppercase font-bold opacity-60 tracking-wider">Total Monthly Rent</p>
                    <p className="text-3xl font-black text-white">$ {leases.reduce((acc, curr) => acc + (curr.rentAmount || 0), 0).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase font-bold opacity-60 tracking-wider">Occupancy</p>
                    <p className="text-lg font-bold text-emerald-400">{leases.length > 0 ? '92%' : '0%'}</p>
                  </div>
                </div>
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400 w-[92%]"></div>
                </div>
              </div>
            </CardContent>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandlordDashboard;