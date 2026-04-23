import React, { type ReactNode, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import Sidebar from '../Sidebar';
import socket from '../../services/socket';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const Layout: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Close mobile sidebar on navigation
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (user) {
      socket.connect();
      
      const handleMaintenanceUpdate = (payload: any) => {
        toast(`Maintenance request updated to: ${payload.status}`);
      };

      const handleNewMessage = (msg: any) => {
        // Only show if it's not from us
        if (msg.sender?._id !== user._id && msg.sender !== user._id) {
           toast(`New message from ${msg.sender?.name || 'User'}: ${msg.content.substring(0, 30)}...`, 'info');
        }
      };

      socket.on("maintenance-update", handleMaintenanceUpdate);
      socket.on("new-message", handleNewMessage);

      return () => {
        socket.off("maintenance-update", handleMaintenanceUpdate);
        socket.off("new-message", handleNewMessage);
      }
    }
  }, [user]);

  return (
    <div className="flex min-h-screen bg-[var(--color-bg-base)] transition-colors duration-300">
      {user && (
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
        />
      )}
      
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${user ? 'md:ml-[260px]' : ''}`}>
        <Navbar onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};
