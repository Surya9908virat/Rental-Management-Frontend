import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import api from '../services/apiClient';
import { CreditCard, DollarSign, User, MapPin, ArrowLeft, Loader2, Download, TrendingUp, Clock, Image as ImageIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const LandlordPayments: React.FC = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/payments/landlord-payments');
      setPayments(res.data);
    } catch (error) {
      console.error("Failed to fetch payments", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/landlord/dashboard">
            <Button variant="ghost" size="sm" className="p-0 h-8 w-8 rounded-full">
              <ArrowLeft size={20} />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-secondary">Rent & Payments Ledger</h1>
        </div>
        <Button variant="outline" className="gap-2 border-slate-200">
          <Download size={18} /> Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-secondary to-slate-800 text-white border-none shadow-lg">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-white/10 rounded-lg">
                <DollarSign size={24} className="text-emerald-400" />
              </div>
              <Badge variant="success" className="bg-emerald-500/20 text-emerald-300 border-none">+12.5%</Badge>
            </div>
            <p className="text-sm font-medium text-slate-300">Total Revenue Collected</p>
            <h3 className="text-3xl font-bold mt-1">${totalRevenue.toLocaleString()}</h3>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <TrendingUp size={24} />
              </div>
            </div>
            <p className="text-sm font-medium text-slate-500">Scheduled Income</p>
            <h3 className="text-2xl font-bold text-secondary mt-1">$0</h3>
            <p className="text-xs text-slate-400 mt-1">Found in active leases</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                <Clock size={24} />
              </div>
            </div>
            <p className="text-sm font-medium text-slate-500">Pending Approvals</p>
            <h3 className="text-2xl font-bold text-secondary mt-1">0</h3>
            <p className="text-xs text-slate-400 mt-1">Manual records to verify</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="bg-white border-b border-slate-100 py-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <CreditCard className="text-primary" size={20} /> Transaction History
          </h2>
        </CardHeader>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="animate-spin h-10 w-10 mb-2" />
            <p>Loading ledger...</p>
          </div>
        ) : payments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider">Tenant</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider">Property</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-right">Amount</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-center">Receipt</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xs">
                          {payment.tenant?.name?.substring(0, 2).toUpperCase() || <User size={14} />}
                        </div>
                        <p className="font-medium text-slate-800">{payment.tenant?.name || 'Tenant'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-600 flex items-center gap-1">
                        <MapPin size={14} className="opacity-40" /> {payment.lease?.property?.address || 'Unknown Property'}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {format(new Date(payment.paymentDate || payment.createdAt), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-emerald-600">
                      +${payment.amount}
                    </td>
                    <td className="px-6 py-4 text-center text-primary">
                      {payment.image ? (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="px-2 py-1 h-auto text-xs flex items-center gap-1 mx-auto"
                          onClick={() => window.open(payment.image, '_blank')}
                        >
                          <ImageIcon size={14} /> View
                        </Button>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge variant="success">Completed</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-20 bg-slate-50/30">
            <div className="bg-white p-4 rounded-full shadow-sm inline-block mb-4">
              <CreditCard className="text-slate-200" size={48} />
            </div>
            <h3 className="text-lg font-bold text-slate-600">No payment records yet</h3>
            <p className="text-slate-400 font-medium">When tenants pay rent, the history will appear here.</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default LandlordPayments;
