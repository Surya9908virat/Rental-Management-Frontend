import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  Home,
  FileText,
  CreditCard,
  MessageSquare,
  User,
  LogOut,
  Wrench,
  Search,
  PlusCircle
} from "lucide-react";

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isLandlord = user?.role === 'landlord';

  const menuItems = isLandlord ? [
    { name: 'Dashboard', path: '/landlord/dashboard', icon: LayoutDashboard },
    { name: 'Properties', path: '/landlord/properties', icon: Home },
    { name: 'Leases', path: '/landlord/leases', icon: FileText },
    { name: 'Payments', path: '/landlord/payments', icon: CreditCard },
  ] : [
    { name: 'Dashboard', path: '/tenant/dashboard', icon: LayoutDashboard },
    { name: 'Marketplace', path: '/properties', icon: Search },
    { name: 'Lease Offers', path: '/tenant/available-leases', icon: PlusCircle },
    { name: 'My Lease', path: '/tenant/lease', icon: FileText },
    { name: 'Payments', path: '/tenant/payments', icon: CreditCard },
    { name: 'Maintenance', path: '/tenant/maintenance', icon: Wrench },
  ];

  const commonItems = [
    { name: 'Messages', path: '/messages', icon: MessageSquare },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <div className="w-[220px] h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col fixed left-0 top-0 z-20 shadow-sm transition-colors duration-300">
      <div className="p-8">
        <div className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
            <Home size={18} className="text-white" />
          </div>
          <span className="text-2xl font-black text-secondary dark:text-white tracking-tighter">Rental Management</span>
        </div>

        <nav className="space-y-1.5">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 px-3">Main Menu</p>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${isActive ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-slate-800"}`}
              >
                <Icon size={18} /> {item.name}
              </Link>
            );
          })}

          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 mt-8 px-3">Personal</p>
          {commonItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${isActive ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-slate-800"}`}
              >
                <Icon size={18} /> {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800 mt-auto">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 font-bold transition-all"
          >
          <LogOut size={18} /> Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;