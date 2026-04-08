import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import api from '../services/apiClient';
import { CreditCard, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

const TenantPayments: React.FC = () => {
  const [leases, setLeases] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [receipt, setReceipt] = useState<File | null>(null);
  const [selectedLeaseId, setSelectedLeaseId] = useState('');
  const activeLeases = leases.filter(l => l.status === 'active' && l.property);

  useEffect(() => {
    if (activeLeases.length === 1 && !selectedLeaseId) {
      setSelectedLeaseId(activeLeases[0]._id);
    }
  }, [activeLeases, selectedLeaseId]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [leasesRes, paymentsRes] = await Promise.all([
          api.get('/leases/my-leases'),
          api.get('/payments/my-payments'),
        ]);
        setLeases(leasesRes.data);
        setPayments(paymentsRes.data);
      } catch (error) {
        console.error("Error fetching payment data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handlePayRent = async (leaseId: string, amount: number) => {
    setPaying(true);
    try {
      const formData = new FormData();
      formData.append('leaseId', leaseId);
      formData.append('amount', amount.toString());
      if (receipt) {
        formData.append('image', receipt);
      }

      await api.post('/payments/pay', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const paymentsRes = await api.get('/payments/my-payments');
      setPayments(paymentsRes.data);
      setReceipt(null);
      alert('Payment successful!');
      setSelectedLeaseId(''); // Reset selection after success
    } catch (error: any) {
      console.error("Payment failed", error);
      const msg = error.response?.data?.message || 'Payment failed. Please try again.';
      alert(`Error: ${msg}`);
    } finally {
      setPaying(false);
    }
  };

  if (loading) return <div className="text-center py-8">Loading payments...</div>;

  const activeLease = activeLeases.find(l => l._id === selectedLeaseId) || (activeLeases.length === 0 ? null : activeLeases[0]);

  // Check if paid for current month
  const isPaidThisMonth = activeLease && payments.some(p => {
    const pDate = new Date(p.paymentDate || p.createdAt);
    const now = new Date();
    return p.lease?._id === activeLease._id &&
      p.status === 'paid' &&
      pDate.getMonth() === now.getMonth() &&
      pDate.getFullYear() === now.getFullYear();
  });

  const handleUPIPayment = (platform: 'phonepe' | 'gpay') => {
    if (!activeLease) return;
    const landlordName = activeLease.landlord?.name || "Landlord";

    // Use Landlord's actual details if available, otherwise construct PhonePe VPA from phone
    let upiId = activeLease.landlord?.upiId;

    if (!upiId && activeLease.landlord?.phoneNumber) {
      // Construct PhonePe VPA: mobile_number@ybl
      upiId = `${activeLease.landlord.phoneNumber}@ybl`;
    }

    // Final fallback for demo if absolutely nothing is set
    if (!upiId) upiId = "9999999999@okaxis";

    const amount = activeLease.rentAmount;
    const note = `Rent Payment - ${activeLease.property.address}`;

    // UPI Deep Link
    const upiLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(landlordName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`;

    window.location.href = upiLink;

    // Inform user to upload receipt after payment
    alert(`Redirecting to ${platform === 'phonepe' ? 'PhonePe' : 'Google Pay'}... After completing the payment, please upload the screenshot below to confirm.`);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto w-full">
      <div className="flex items-center justify-between bg-white p-6 rounded-xl shadow-sm border border-slate-100 mb-4">
        <div className="flex items-center gap-4">
          <Link to="/tenant/dashboard">
            <Button variant="ghost" size="sm" className="p-0 h-8 w-8 rounded-full">
              <ArrowLeft size={20} />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-secondary">Rent & Payments</h1>
        </div>
        <Badge variant="info" className="px-3 py-1">Secure Payments</Badge>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <CreditCard className="text-primary" />
          <h2 className="text-lg font-semibold">Make A Payment</h2>
        </CardHeader>
        <CardContent>
          {activeLeases.length > 1 && (
            <div className="mb-6 bg-slate-50 p-4 rounded-lg border border-slate-100">
              <label className="text-sm font-semibold text-slate-700 block mb-2">Select Property to Pay Rent</label>
              <select
                className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white text-secondary"
                value={selectedLeaseId}
                onChange={e => setSelectedLeaseId(e.target.value)}
              >
                <option value="">Select a property...</option>
                {activeLeases.map(l => (
                  <option key={l._id} value={l._id}>{l.property.address}</option>
                ))}
              </select>
            </div>
          )}

          {activeLease ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b pb-4">
                <div>
                  <p className="text-xs text-primary font-bold uppercase tracking-wider mb-1">Paying For</p>
                  <p className="font-semibold text-secondary">{activeLease.property.address}</p>
                  <p className="text-sm text-slate-500">Owner: <span className="font-medium text-slate-700">{activeLease.landlord?.name || 'Loading...'}</span></p>
                </div>
                {isPaidThisMonth && (
                  <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <CheckCircle size={14} /> PAID FOR THIS MONTH
                  </div>
                )}
              </div>
              <div className="flex justify-between items-center border-b pb-4">
                <div>
                  <p className="text-sm text-slate-500">Amount Due</p>
                  <p className="text-3xl font-bold text-secondary">${activeLease.rentAmount}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 text-right">Lease Period</p>
                  <p className="font-medium text-right">
                    {format(new Date(activeLease.startDate || Date.now()), 'MMM d, yyyy')} - {format(new Date(activeLease.endDate || Date.now()), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>

              {/* UPI Payment Options */}
              {!isPaidThisMonth && (
                <div className="py-4 space-y-3">
                  <p className="text-sm font-bold text-slate-700">Quick Pay via UPI</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      className="border-primary/20 hover:bg-primary/5 flex items-center justify-center gap-2 h-12"
                      onClick={() => handleUPIPayment('phonepe')}
                    >
                      <img src="https://img.icons8.com/color/48/phone-pe.png" alt="PhonePe" className="w-6 h-6" />
                      PhonePe
                    </Button>
                    <Button
                      variant="outline"
                      className="border-primary/20 hover:bg-primary/5 flex items-center justify-center gap-2 h-12"
                      onClick={() => handleUPIPayment('gpay')}
                    >
                      <img src="https://img.icons8.com/color/48/google-pay.png" alt="GPay" className="w-6 h-6" />
                      Google Pay
                    </Button>
                  </div>

                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mt-4">
                    <p className="text-xs text-blue-700 font-medium flex items-start gap-2">
                      <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                      <span><b>Why use UPI?</b> Instant transfers with zero processing fees. Secure bank-to-bank transactions using your mobile banking apps.</span>
                    </p>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-1.5 py-2">
                <label className="text-sm font-medium text-slate-700">Upload Receipt {isPaidThisMonth ? '(Paid)' : '(After payment)'}</label>
                <input
                  type="file"
                  accept="image/*"
                  disabled={isPaidThisMonth}
                  onChange={e => setReceipt(e.target.files ? e.target.files[0] : null)}
                  className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 disabled:opacity-50"
                />
                {receipt && <p className="text-xs text-emerald-600 font-medium">Receipt selected: {receipt.name}</p>}
              </div>

              <div className="flex justify-between items-center pt-2 border-t">
                <div>
                  <p className="font-medium text-emerald-600 flex items-center gap-1">
                    <CheckCircle size={16} /> Online Payments Ready
                  </p>
                </div>
                <Button
                  onClick={() => handlePayRent(activeLease._id, activeLease.rentAmount)}
                  disabled={paying || !selectedLeaseId || isPaidThisMonth}
                >
                  {paying ? 'Processing...' : isPaidThisMonth ? 'Already Paid' : `Mark as Paid $${activeLease.rentAmount}`}
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="mx-auto text-slate-300 mb-2" size={48} />
              <p className="text-slate-500 font-medium">No active lease found to pay rent for.</p>
              <p className="text-sm text-slate-400 mt-1">Please ensure your landlord has activated your lease agreement.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Previous Payments</h2>
        </CardHeader>
        <div className="divide-y divide-slate-100">
          {payments.length > 0 ? payments.map((payment) => (
            <div key={payment._id} className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${payment.status === 'paid' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                  {payment.status === 'paid' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                </div>
                <div>
                  <p className="font-medium">Rent Payment</p>
                  <p className="text-sm text-slate-500">{format(new Date(payment.paymentDate || payment.createdAt || Date.now()), 'MMM d, yyyy h:mm a')}</p>
                  <p className="text-xs text-slate-400 font-mono">ID: {payment._id}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-bold text-secondary">${payment.amount}</span>
                <p className={`text-xs capitalize font-medium ${payment.status === 'paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {payment.status}
                </p>
              </div>
            </div>
          )) : (
            <div className="p-8 text-center text-slate-500">No payment history found.</div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default TenantPayments;
