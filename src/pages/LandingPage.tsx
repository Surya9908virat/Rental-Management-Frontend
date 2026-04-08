import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LandingPage: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (user) {
    if (user.role === 'landlord') return <Navigate to="/landlord/dashboard" replace />;
    if (user.role === 'tenant') return <Navigate to="/tenant/dashboard" replace />;
  }

  return (
    <div className="flex flex-col w-full bg-[#F8FAFC] dark:bg-slate-900 font-sans min-h-screen transition-colors duration-300">
      {/* Header Matter */}
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-16 px-4 text-center border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-4xl md:text-5xl font-extrabold text-secondary dark:text-white mb-4">
          Welcome to <span className="text-primary">Rental Management</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          The all-in-one portal connecting landlords and tenants. Seamlessly manage leases, properties, rent payments, and maintenance requests in one centralized platform.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center w-full max-w-5xl mx-auto py-16 px-4 gap-20">
        
        {/* Property Owner Section */}
        <div className="flex flex-col md:flex-row items-center justify-center w-full gap-10 md:gap-16">
          <div className="w-full md:w-5/12 flex justify-center md:justify-end">
            <img src="/images/owner.png" alt="Property Owner" className="w-64 md:w-80 lg:w-96 h-auto object-contain drop-shadow-sm dark:invert dark:opacity-80" />
          </div>
          <div className="w-full md:w-7/12 flex flex-col items-center md:items-start text-center md:text-left gap-4">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1E3A5F] dark:text-slate-200">
              Are You A Property Owner?
            </h2>
            <div className="flex flex-col gap-2 text-slate-600 dark:text-slate-400 text-[1.1rem]">
              <p>Post your property online for future tenants to view</p>
              <p>Manage all your tenants in one place</p>
              <p>Keep track of your tenant's payments</p>
            </div>
            <div className="flex items-center gap-4 mt-4">
              <Link to="/login" className="px-8 py-2.5 bg-[#F59E0B] hover:bg-amber-600 text-white font-medium rounded shadow-sm transition-colors tracking-wide">
                LOGIN
              </Link>
              <span className="text-slate-300 dark:text-slate-800 font-light text-2xl">|</span>
              <Link to="/register" className="px-8 py-2.5 bg-[#A78BFA] hover:bg-purple-500 text-white font-medium rounded shadow-sm transition-colors tracking-wide">
                REGISTER
              </Link>
            </div>
          </div>
        </div>

        <hr className="w-full max-w-3xl border-slate-100 dark:border-slate-800 my-4" />

        {/* Tenant Section */}
        <div className="flex flex-col md:flex-row items-center justify-center w-full gap-10 md:gap-16">
          <div className="w-full md:w-5/12 flex justify-center md:justify-end">
            <img src="/images/tenant.png" alt="Tenant" className="w-64 md:w-80 lg:w-96 h-auto object-contain drop-shadow-sm dark:invert dark:opacity-80" />
          </div>
          <div className="w-full md:w-7/12 flex flex-col items-center md:items-start text-center md:text-left gap-4">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1E3A5F] dark:text-slate-200">
              Are You A Tenant?
            </h2>
            <div className="flex flex-col gap-2 text-slate-600 dark:text-slate-400 text-[1.1rem]">
              <p>Browse through all kinds of properties for rent</p>
              <p>Contact the Property Owners</p>
              <p>Keep track of your payments and due dates</p>
            </div>
            <div className="flex items-center gap-4 mt-4">
              <Link to="/login" className="px-8 py-2.5 bg-[#F59E0B] hover:bg-amber-600 text-white font-medium rounded shadow-sm transition-colors tracking-wide">
                LOGIN
              </Link>
              <span className="text-slate-300 dark:text-slate-800 font-light text-2xl">|</span>
              <Link to="/register" className="px-8 py-2.5 bg-[#06B6D4] hover:bg-cyan-600 text-white font-medium rounded shadow-sm transition-colors tracking-wide">
                REGISTER
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
