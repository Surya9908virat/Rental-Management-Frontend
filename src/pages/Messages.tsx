import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';
import { Send, User, Search, MoreVertical, Smile, Image as ImageIcon, ArrowLeft, Plus, MessageSquare, ShieldCheck, Home, Check, CheckCheck } from 'lucide-react';
import api from '../services/apiClient';
import socket from '../services/socket';

const Messages: React.FC = () => {
  const { user } = useAuth();
  const [chats, setChats] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResultUsers, setSearchResultUsers] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm) {
        searchGlobalUsers();
      } else {
        setSearchResultUsers([]);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const searchGlobalUsers = async () => {
    try {
      const res = await api.get(`/messages/search-users?query=${searchTerm}`);
      setSearchResultUsers(res.data);
    } catch (e) {
      console.error("Global search failed", e);
    }
  };

  useEffect(() => {
    fetchConversations();

    // Connect socket
    socket.connect();

    // Global listener for last message updates in sidebar
    socket.on("new-message", (msg) => {
      setChats(prev => prev.map(chat =>
        chat.id === msg.relationId
          ? { ...chat, lastMsg: msg.content, time: msg.createdAt }
          : chat
      ));
    });

    return () => {
      socket.off("new-message");
      socket.disconnect();
    };
  }, []);

  const fetchConversations = async () => {
    try {
      const res = await api.get('/messages/conversations');
      setChats(res.data);
    } catch (error) {
      console.error("Failed to load conversations", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (id: string) => {
    try {
      const res = await api.get(`/messages/${id}`);
      setMessages(res.data);
      if (!activeChat?.isVirtual) {
        api.post('/messages/mark-read', { relationId: id }).catch(e => console.error(e));
      }
    } catch (error) {
      console.error("Failed to fetch messages", error);
    }
  };

  useEffect(() => {
    if (activeChat) {
      fetchMessages(activeChat.id);

      // Join the room for real-time updates
      socket.emit("join-room", activeChat.id);

      // Listen for messages in this room
      const handleNewMessage = (msg: any) => {
        if (msg.relationId === activeChat.id) {
          setMessages(prev => {
            if (prev.find(m => m._id === msg._id)) return prev;
            return [...prev, msg];
          });
          // Mark as read if it's from the other person
          if (msg.sender?._id !== user?._id && msg.sender !== user?._id) {
            api.post('/messages/mark-read', { relationId: activeChat.id }).catch(e => console.error(e));
          }
        }
      };

      const handleMessagesRead = (payload: any) => {
        if (payload.relationId === activeChat.id) {
          setMessages(prev => prev.map(m =>
            (m.sender?._id === user?._id || m.sender === user?._id) ? { ...m, status: 'read' } : m
          ));
        }
      };

      socket.on("new-message", handleNewMessage);
      socket.on("messages-read", handleMessagesRead);

      return () => {
        socket.off("new-message", handleNewMessage);
        socket.off("messages-read", handleMessagesRead);
      };
    }
  }, [activeChat, user]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !activeChat) return;

    try {
      const res = await api.post('/messages', {
        relationId: activeChat.id,
        content: messageText
      });
      
      setMessages(prev => [...prev, res.data]);
      setMessageText('');

      // Update sidebar locally as well
      setChats(prev => prev.map(chat =>
        chat.id === activeChat.id
          ? { ...chat, lastMsg: messageText, time: new Date().toISOString() }
          : chat
      ));
    } catch (error) {
      console.error("Failed to send message", error);
    }
  };

  const filteredChats = chats.filter(chat =>
    chat.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.property?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="flex h-full items-center justify-center bg-white rounded-xl shadow-sm border border-slate-100 italic text-slate-400">Loading conversations...</div>;

  return (
    <div className="h-[calc(100vh-140px)] flex bg-[#edd377] dark:bg-[#384959] rounded-2xl shadow-xl border border-white/40 dark:border-slate-800/40 overflow-hidden backdrop-blur-sm transition-colors duration-300">
      {/* Sidebar - Chat List */}
      <div className={`w-full md:w-80 lg:w-96 border-r border-slate-200/60 dark:border-slate-800/60 flex flex-col bg-white/70 dark:bg-slate-900/70 backdrop-blur-md ${activeChat ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-white/40 dark:bg-slate-900/20">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Link to={user?.role === 'landlord' ? "/landlord/dashboard" : "/tenant/dashboard"}>
                <Button variant="ghost" size="sm" className="p-0 h-8 w-8 rounded-full hover:bg-slate-100">
                  <ArrowLeft size={20} />
                </Button>
              </Link>
              <h2 className="text-2xl font-black text-secondary dark:text-white tracking-tight">Messages</h2>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" className="p-2 h-9 w-9 rounded-xl hover:bg-slate-100 transition-all">
                <Plus size={18} className="text-primary" />
              </Button>
              <Button variant="ghost" size="sm" className="p-2 h-9 w-9 rounded-xl hover:bg-slate-100">
                <MoreVertical size={18} className="text-slate-400" />
              </Button>
            </div>
          </div>
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
            <Input
              placeholder="Search tenant or property..."
              className="pl-10 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl h-11 focus:ring-4 focus:ring-primary/10 transition-all shadow-sm text-secondary dark:text-white"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-4">
          {/* Local Conversations */}
          {filteredChats.length > 0 && (
            <div className="space-y-1">
              <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">My Leases</p>
              {filteredChats.map(chat => (
                <div
                  key={chat.id}
                  onClick={() => setActiveChat(chat)}
                  className={`p-4 flex items-center gap-4 cursor-pointer transition-all duration-200 rounded-2xl ${activeChat?.id === chat.id ? 'bg-primary shadow-lg shadow-primary/20 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
                >
                  <div className="relative">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg shadow-inner ${activeChat?.id === chat.id ? 'bg-white/20 text-white' : 'bg-gradient-to-br from-primary/10 to-blue-500/10 dark:from-slate-800 dark:to-slate-900 text-primary'}`}>
                      {chat.name?.substring(0, 2).toUpperCase() || "??"}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 ${activeChat?.id === chat.id ? 'border-primary bg-emerald-400' : 'border-white dark:border-slate-900 bg-emerald-500 shadow-sm'}`}></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className={`font-bold text-sm truncate ${activeChat?.id === chat.id ? 'text-white' : 'text-slate-800 dark:text-white'}`}>{chat.name}</h3>
                      <span className={`text-[10px] font-bold ${activeChat?.id === chat.id ? 'text-white/60' : 'text-slate-400'}`}>
                        {chat.time ? new Date(chat.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 opacity-80 mb-1">
                      <Home size={10} />
                      <p className="text-[10px] font-bold truncate uppercase tracking-tighter">{chat.property}</p>
                    </div>
                    <p className={`text-xs truncate font-medium ${activeChat?.id === chat.id ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'}`}>{chat.lastMsg}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {searchTerm && searchResultUsers.length > 0 && (
            <div className="space-y-1">
              <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Found Users</p>
              {searchResultUsers
                .filter(user => !chats.some(chat => chat.id === user._id)) // Prevent duplicates if already in my leases
                .map(user => (
                  <div
                    key={user._id}
                    onClick={() => setActiveChat({ id: user._id, name: user.name, property: user.role.toUpperCase(), isVirtual: true })}
                    className={`p-4 flex items-center gap-4 cursor-pointer transition-all duration-200 rounded-2xl ${activeChat?.id === user._id ? 'bg-primary/90 shadow-lg text-white' : 'hover:bg-slate-100/50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400'}`}
                  >
                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-400 dark:text-slate-500">
                      {user.name?.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm truncate">{user.name}</h3>
                      <p className="text-[10px] uppercase font-black opacity-50">{user.role}</p>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {filteredChats.length === 0 && searchResultUsers.length === 0 && (
            <div className="flex flex-col items-center justify-center p-10 opacity-30 text-center">
              <Search size={40} className="mb-2" />
              <p className="text-sm font-bold">No results found</p>
              <p className="text-[10px] uppercase font-black mt-1">Try a different name</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      {activeChat ? (
        <div className="flex-1 flex flex-col min-w-0 bg-white/40 dark:bg-slate-900/40">
          {/* Top Bar */}
          <div className="px-6 py-4 bg-white/80 dark:bg-slate-900 shadow-sm dark:shadow-none backdrop-blur-md border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 z-20">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="md:hidden p-0 h-10 w-10 text-slate-400" onClick={() => setActiveChat(null)}>
                <ArrowLeft size={24} />
              </Button>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-blue-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-primary/20">
                {activeChat.name?.substring(0, 2).toUpperCase() || "??"}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-secondary dark:text-white text-lg leading-tight tracking-tight">{activeChat.name}</h3>
                  <ShieldCheck size={16} className="text-emerald-500" />
                </div>
                <span className="text-[10px] uppercase tracking-widest font-black text-slate-400 flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div> Local Time: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
            <div className="hidden lg:flex items-center gap-3">
              <div className="text-right mr-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Lease Property</p>
                <p className="text-xs font-bold text-slate-600 dark:text-slate-300">{activeChat.property}</p>
              </div>
              <div className="h-10 w-[1px] bg-slate-100 dark:bg-slate-800 mx-2"></div>
              <Button variant="ghost" size="sm" className="h-10 w-10 rounded-xl text-slate-400 hover:text-primary hover:bg-primary/5 transition-all"><User size={22} /></Button>
              <Button variant="ghost" size="sm" className="h-10 w-10 rounded-xl text-slate-400 hover:text-primary hover:bg-primary/5 transition-all"><MoreVertical size={22} /></Button>
            </div>
          </div>

          {/* Messages Wrapper */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-gradient-to-b from-transparent to-slate-50/50 dark:to-slate-950/20">
            {messages.map((m, index) => {
              const isMine = m.sender?._id === user?._id || m.sender === user?._id;
              const showTime = index === 0 || new Date(m.createdAt).getTime() - new Date(messages[index - 1].createdAt).getTime() > 300000;

              return (
                <div key={m._id} className="space-y-2">
                  {showTime && (
                    <div className="flex justify-center my-4">
                      <span className="text-[10px] font-black uppercase tracking-widest bg-slate-200/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 px-3 py-1 rounded-full">{new Date(m.createdAt).toLocaleDateString()}</span>
                    </div>
                  )}
                  <div className={`flex items-end gap-2 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
                    {/* Receiver Avatar (Only for incoming messages) */}
                    {!isMine && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-700 flex-shrink-0 flex items-center justify-center text-[10px] font-black text-slate-500 dark:text-slate-400 border border-white dark:border-slate-700 shadow-sm mb-6">
                        {m.sender?.name?.substring(0, 2).toUpperCase() || "??"}
                      </div>
                    )}

                    <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} max-w-[80%] md:max-w-[70%]`}>
                      <div className={`group relative px-5 py-3 rounded-2xl text-sm leading-relaxed shadow-sm transition-all hover:shadow-md ${isMine
                          ? 'bg-gradient-to-br from-primary to-blue-600 text-white rounded-br-none'
                          : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-bl-none'
                        }`}>
                        <p className="font-medium">{m.content}</p>

                        {/* Hidden timestamp on hover for a cleaner look */}
                        <div className={`absolute bottom-0 ${isMine ? '-left-12' : '-right-12'} opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap`}>
                          <span className="text-[9px] font-black text-slate-400 uppercase">
                            {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>

                      <div className={`flex items-center gap-1.5 mt-1.5 ${isMine ? 'flex-row-reverse' : ''}`}>
                        <div className="flex items-center">
                          {isMine ? (
                            m.status === 'read' ? (
                              <CheckCheck size={14} className="text-blue-400" />
                            ) : (
                              <Check size={14} className="text-slate-400" />
                            )
                          ) : null}
                        </div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                          {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-6 bg-white/80 dark:bg-slate-900 backdrop-blur-md border-t border-slate-100 dark:border-slate-800 sticky bottom-0">
            <form onSubmit={handleSendMessage} className="flex items-center gap-3 bg-white dark:bg-slate-950 p-2 rounded-2xl border-2 border-slate-100 dark:border-slate-800 focus-within:border-primary/40 focus-within:ring-4 focus-within:ring-primary/5 transition-all shadow-lg shadow-slate-200/20 dark:shadow-none">
              <div className="flex items-center px-1">
                <Button type="button" variant="ghost" size="sm" className="p-0 h-10 w-10 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"><Plus size={22} /></Button>
              </div>
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 bg-transparent border-none outline-none text-sm px-2 text-slate-700 dark:text-slate-200 font-medium placeholder:text-slate-300 dark:placeholder:text-slate-600"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
              />
              <div className="flex items-center gap-2 pr-1">
                <Button type="button" variant="ghost" size="sm" className="hidden sm:flex p-0 h-10 w-10 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"><Smile size={22} /></Button>
                <Button type="button" variant="ghost" size="sm" className="hidden sm:flex p-0 h-10 w-10 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"><ImageIcon size={22} /></Button>
                <Button
                  type="submit"
                  disabled={!messageText.trim()}
                  className="bg-primary hover:bg-primary/90 text-white p-0 h-11 w-11 rounded-xl shadow-xl shadow-primary/30 flex items-center justify-center transition-all disabled:opacity-50 disabled:shadow-none hover:scale-105 active:scale-95"
                >
                  <Send size={20} className="relative -right-0.5" />
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="flex-1 hidden md:flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 text-slate-300 dark:text-slate-800 p-20 text-center">
          <div className="bg-white dark:bg-slate-800 p-12 rounded-[40px] shadow-2xl shadow-slate-200/50 dark:shadow-none mb-10 border-4 border-slate-50 dark:border-slate-700 relative group">
            <div className="absolute inset-0 bg-primary/5 rounded-[40px] animate-ping opacity-20 hidden group-hover:block"></div>
            <MessageSquare size={100} className="text-slate-100 group-hover:text-primary/20 transition-all duration-700 scale-110 group-hover:rotate-12" />
          </div>
          <h3 className="text-3xl font-black text-secondary dark:text-white mb-4 tracking-tight">Your Inbox</h3>
          <p className="max-w-xs text-sm font-bold text-slate-400 dark:text-slate-500 leading-relaxed uppercase tracking-widest">Select a lease conversation to start messaging your tenant or property manager.</p>
          <div className="mt-12 flex gap-4">
            <div className="px-5 py-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-3 group hover:border-emerald-200 dark:hover:border-emerald-900 transition-all">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">End-to-End Encrypted</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;
