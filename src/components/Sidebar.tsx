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
  PlusCircle,
  X
} from "lucide-react";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
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
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <div className={`w-[260px] h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col fixed left-0 top-0 z-50 shadow-2xl md:shadow-none transition-transform duration-300 md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        <div className="p-6 md:p-8 flex flex-col flex-1 overflow-y-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30 shrink-0">
                <Home size={18} className="text-white" />
              </div>
              <span className="text-xl md:text-2xl font-black text-secondary dark:text-white tracking-tighter truncate">
                Rental Mgmt
              </span>
            </div>
            {/* Mobile close button */}
            <button onClick={onClose} className="md:hidden p-2 text-slate-500 hover:text-slate-800 dark:hover:text-white">
              <X size={20} />
            </button>
          </div>

          <nav className="space-y-1.5 flex-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 px-3">Main Menu</p>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
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
                  onClick={onClose}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${isActive ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-slate-800"}`}
                >
                  <Icon size={18} /> {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800 mt-auto bg-white dark:bg-slate-900">
          <button
            onClick={() => {
              if(onClose) onClose();
              logout();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 font-bold transition-all"
          >
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;