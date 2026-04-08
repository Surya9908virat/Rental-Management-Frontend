import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { ArrowLeft, Send, MessageSquare, Image as ImageIcon, Clock } from 'lucide-react';
import api from '../services/apiClient';

import socket from '../services/socket';

const MaintenanceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [request, setRequest] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [requestRes, messagesRes] = await Promise.all([
          api.get(`/maintenance/${id}`),
          api.get(`/messages/${id}`)
        ]);
        setRequest(requestRes.data);
        setMessages(messagesRes.data);
        
        // Join room for real-time updates
        if (requestRes.data.lease?._id) {
            socket.emit("join-room", requestRes.data.lease._id);
        }
      } catch (error) {
        console.error("Failed to fetch maintenance details", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Listen for status updates
    const handleStatusUpdate = (payload: any) => {
        if (payload.requestId === id) {
            setRequest((prev: any) => ({
                ...prev,
                status: payload.status,
                timeline: payload.timeline
            }));
        }
    };

    socket.on("maintenance-update", handleStatusUpdate);

    return () => {
        socket.off("maintenance-update", handleStatusUpdate);
    };
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    try {
      const res = await api.post('/messages', {
        relationId: id,
        content: newMessage
      });
      setMessages([...messages, res.data]);
      setNewMessage('');
    } catch (error) {
      console.error("Failed to send message", error);
      alert('Failed to send message.');
    }
  };

  const [statusMessage, setStatusMessage] = useState('');

  const handleUpdateStatus = async (newStatus: string) => {
    setUpdating(true);
    try {
      const res = await api.put(`/maintenance/${id}`, { 
        status: newStatus,
        message: statusMessage || `Status updated to ${newStatus}`
      });
      setRequest(res.data.request);
      setStatusMessage('');
      alert(`Status successfully updated to ${newStatus}`);
    } catch (error: any) {
      console.error("Failed to update status", error);
      const msg = error.response?.data?.message || error.message || 'Failed to update request status.';
      alert(`Error updating status: ${msg}`);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="text-center py-8 dark:text-white">Loading request details...</div>;
  if (!request) return <div className="text-center py-8 dark:text-white">Request not found.</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto w-full">
      <div className="flex justify-between items-center">
        <Button variant="ghost" size="sm" onClick={() => window.history.back()} className="dark:text-white">
          <ArrowLeft size={20} /> <span className="ml-2">Back</span>
        </Button>
        
        {/* Landlord Action Buttons */}
        {user?.role === 'landlord' && request.status !== 'resolved' && (
          <div className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="w-full sm:w-64">
               <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Timeline Note (Optional)</label>
               <input 
                 type="text" 
                 placeholder="e.g. Handyman scheduled for 2 PM"
                 className="w-full px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                 value={statusMessage}
                 onChange={e => setStatusMessage(e.target.value)}
               />
            </div>
            <div className="flex gap-2">
                {request.status === 'submitted' && (
                  <Button size="sm" variant="outline" onClick={() => handleUpdateStatus('in-progress')} disabled={updating}>
                    Start Work
                  </Button>
                )}
                <Button size="sm" variant="primary" onClick={() => handleUpdateStatus('resolved')} disabled={updating} className="bg-emerald-600 border-none text-white hover:bg-emerald-700">
                    Mark as Resolved
                </Button>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 mb-6">
        <Link to={user?.role === 'landlord' ? "/landlord/dashboard" : "/tenant/dashboard"}>
          <Button variant="ghost" size="sm" className="p-0 h-8 w-8 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 dark:text-white">
            <ArrowLeft size={20} />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Maintenance Detail</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Request Details Section */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{request.title}</h1>
                <div className="flex flex-wrap gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1"><Clock size={14} /> {format(new Date(request.createdAt), 'MMM d, yyyy h:mm a')}</span>
                  <span>•</span>
                  <span>ID: {request._id}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 text-sm">
                <Badge variant={request.status === 'resolved' ? 'success' : request.status === 'in-progress' ? 'warning' : 'info'}>
                  {request.status.toUpperCase()}
                </Badge>
                <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${
                  request.urgency === 'high' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : 
                  request.urgency === 'medium' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}>
                  {request.urgency} Urgency
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2 dark:text-white">Description</h3>
                <p className="text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-100 dark:border-slate-700 w-full break-words whitespace-pre-wrap">
                  {request.description}
                </p>
              </div>

              {request.images && request.images.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2 dark:text-white">
                    <ImageIcon size={18} /> Attached Photos & Videos
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {request.images.map((img: string, idx: number) => {
                      const isVideo = img.match(/\.(mp4|webm|ogg|mov)$|^data:video/i);
                      return (
                        <div key={idx} className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 group relative">
                          {isVideo ? (
                            <video 
                              src={img} 
                              className="w-full h-full object-cover"
                              controls={false}
                              muted
                              onMouseOver={e => e.currentTarget.play()}
                              onMouseOut={e => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
                            />
                          ) : (
                            <img 
                              src={img} 
                              alt={`Request attachment ${idx+1}`} 
                              className="w-full h-full object-cover transition group-hover:scale-105"
                            />
                          )}
                          <div 
                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer text-white text-xs font-bold"
                            onClick={() => window.open(img, '_blank')}
                          >
                            Click to View Full
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold mb-3 dark:text-white">Status Timeline</h3>
                <div className="relative border-l-2 border-slate-200 dark:border-slate-700 ml-3 space-y-6">
                  {(request.timeline || []).map((step: any, idx: number) => (
                    <div key={idx} className="relative pl-6">
                      <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-4 border-white dark:border-slate-800 ${
                        step.status === 'resolved' ? 'bg-emerald-500' : 
                        step.status === 'in-progress' ? 'bg-amber-500' : 'bg-primary'
                      }`}></div>
                      <p className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-tight">{step.status}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">{step.message}</p>
                      <p className="text-[10px] text-slate-400 font-black uppercase mt-1">
                        {format(new Date(step.date), 'MMM d, yyyy • h:mm a')}
                      </p>
                    </div>
                  ))}
                  {(!request.timeline || request.timeline.length === 0) && (
                    <div className="relative pl-6">
                        <div className="absolute -left-[9px] top-1 bg-primary w-4 h-4 rounded-full border-4 border-white dark:border-slate-800"></div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 italic">History initialized...</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Messaging Interface */}
        <div className="lg:col-span-1 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden flex flex-col bg-white dark:bg-slate-800 shadow-sm h-[600px]">
          <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-2">
            <MessageSquare size={18} className="text-primary" />
            <h2 className="font-semibold text-slate-900 dark:text-white">Messages</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-900/50">
            {messages.map((msg) => {
              const isMine = msg.sender?._id === user?._id || msg.sender === user?._id;
              const senderName = msg.sender?.name || (isMine ? 'You' : 'User');
              return (
                <div key={msg._id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                  <div className="text-xs text-slate-400 mb-1 ml-1 mr-1">{senderName}</div>
                  <div className={`px-4 py-2 rounded-2xl max-w-[85%] text-sm ${
                    isMine 
                      ? 'bg-primary text-white rounded-tr-sm shadow-sm' 
                      : 'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-tl-sm shadow-sm'
                  }`}>
                    {msg.content}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">{format(new Date(msg.createdAt || msg.timestamp), 'h:mm a')}</div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
          
          <form onSubmit={handleSendMessage} className="p-3 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 flex gap-2">
            <input
              type="text"
              className="flex-1 border border-slate-300 dark:border-slate-600 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <Button type="submit" variant="primary" size="sm" className="rounded-full px-4" disabled={!newMessage.trim()}>
              <Send size={16} />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceDetail;
