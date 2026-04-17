import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardHeader } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import {
  ArrowLeft,
  User,
  Lock,
  Settings,
  Camera,
  Save,
  ShieldCheck,
  CreditCard,
  LogOut,
  Loader2,
  Phone
} from "lucide-react";
import api from "../services/apiClient";
import { useAuth } from "../context/AuthContext";

const Profile = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(false);
  const [picLoading, setPicLoading] = useState(false);

  // General profile profileData
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    upiId: user?.upiId || "",
    phoneNumber: user?.phoneNumber || "",
  });

  // Password state
  const [passData, setPassData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        email: user.email || "",
        upiId: user.upiId || "",
        phoneNumber: user.phoneNumber || "",
      });
    }
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put("/auth/profile", profileData);
      setUser(res.data.user);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      alert("Profile updated successfully!");
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const handlePicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPicLoading(true);
    const formData = new FormData();
    formData.append("profilePicture", file);
    // Add other fields to keep them in sync
    formData.append("name", profileData.name);
    formData.append("email", profileData.email);
    formData.append("upiId", profileData.upiId);
    formData.append("phoneNumber", profileData.phoneNumber);

    try {
      const res = await api.put("/auth/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUser(res.data.user);
      localStorage.setItem("user", JSON.stringify(res.data.user));
    } catch (error) {
      console.error("Pic upload failed", error);
      alert("Failed to upload picture.");
    } finally {
      setPicLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passData.newPassword !== passData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    setLoading(true);
    try {
      await api.put("/auth/change-password", {
        oldPassword: passData.oldPassword,
        newPassword: passData.newPassword,
      });
      alert("Password changed successfully!");
      setPassData({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error: any) {
      // Show the actual error message from server if possible
      const msg = error.response?.data?.error || error.response?.data?.message || "Failed to change password.";
      alert(`Error: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <Sidebar />

      <div className="ml-[220px] p-8"> {/* Adjusted layout */}
        <div className="flex items-center gap-4 mb-8">
          <Link to={user?.role === 'landlord' ? "/landlord/dashboard" : "/tenant/dashboard"}>
            <Button variant="ghost" size="sm" className="p-0 h-10 w-10 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm text-secondary dark:text-white">
              <ArrowLeft size={20} />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Account Settings</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Manage your personal information and security</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Settings Sidebar */}
          <div className="lg:col-span-1 space-y-2">
            <button
              onClick={() => setActiveTab("general")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${activeTab === "general" ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 shadow-sm"}`}
            >
              <User size={18} /> General Info
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${activeTab === "security" ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 shadow-sm"}`}
            >
              <Lock size={18} /> Security
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm bg-white dark:bg-slate-900 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 border border-slate-100 dark:border-slate-800 shadow-sm mt-4"
            >
              <LogOut size={18} /> Sign Out
            </button>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3">
            {activeTab === "general" ? (
              <div className="space-y-6">
                <Card className="border border-slate-200 dark:border-slate-700 shadow-card bg-white dark:bg-slate-800 overflow-hidden">
                  <CardHeader className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700 py-6 px-8">
                    <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <Settings className="text-primary" size={24} /> Basic Information
                    </h2>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="flex flex-col md:flex-row gap-10 items-start">
                      {/* Avatar Section */}
                      <div className="flex flex-col items-center gap-4">
                        <div className="relative group">
                          <div className="w-32 h-32 rounded-3xl bg-slate-100 dark:bg-slate-800 border-4 border-white dark:border-slate-700 shadow-xl overflow-hidden flex items-center justify-center relative">
                            {picLoading ? (
                              <Loader2 className="animate-spin text-primary" size={32} />
                            ) : user?.profilePicture ? (
                              <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                              <User size={48} className="text-slate-300 dark:text-slate-700" />
                            )}
                          </div>
                          <label className="absolute -bottom-2 -right-2 p-2.5 bg-primary text-white rounded-xl shadow-lg cursor-pointer hover:scale-110 transition-transform active:scale-95 group-hover:rotate-6">
                            <Camera size={18} />
                            <input type="file" className="hidden" accept="image/*" onChange={handlePicUpload} />
                          </label>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Profile Picture</p>
                      </div>

                      {/* Info Form */}
                      <form onSubmit={handleUpdateProfile} className="flex-1 space-y-5 w-full">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <Input
                            label="Full Name"
                            icon={<User size={18} />}
                            placeholder="Current Name"
                            value={profileData.name}
                            onChange={e => setProfileData({ ...profileData, name: e.target.value })}
                          />
                          <Input
                            label="Email Address"
                            type="email"
                            icon={<ShieldCheck size={18} />}
                            placeholder="your@email.com"
                            value={profileData.email}
                            onChange={e => setProfileData({ ...profileData, email: e.target.value })}
                          />
                          <Input
                            label="Phone Number"
                            type="tel"
                            icon={<Phone size={18} />}
                            placeholder="+91 98765 43210"
                            value={profileData.phoneNumber}
                            onChange={e => setProfileData({ ...profileData, phoneNumber: e.target.value })}
                          />
                        </div>

                        {user?.role === 'landlord' && (
                          <div className="p-5 bg-blue-50/50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50 rounded-2xl space-y-3">
                            <h3 className="text-sm font-bold text-blue-900 dark:text-blue-400 flex items-center gap-2">
                              <CreditCard size={18} /> Landlord Payout Settings
                            </h3>
                            <Input
                              label="UPI ID"
                              placeholder="vpa@upi"
                              value={profileData.upiId}
                              onChange={e => setProfileData({ ...profileData, upiId: e.target.value })}
                            />
                            <p className="text-[11px] text-blue-700/70 dark:text-blue-400/50 font-medium">Used by tenants for instant rent payments via PhonePe or GPay.</p>
                          </div>
                        )}

                        <div className="pt-4">
                          <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl text-md font-bold shadow-lg shadow-primary/20">
                            {loading ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" />}
                            Update Profile Details
                          </Button>
                        </div>
                      </form>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="border border-slate-200 dark:border-slate-700 shadow-card bg-white dark:bg-slate-800 overflow-hidden">
                <CardHeader className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700 py-6 px-8">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Lock className="text-primary" size={24} /> Account Security
                  </h2>
                </CardHeader>
                <CardContent className="p-8">
                  <form onSubmit={handleChangePassword} className="max-w-md mx-auto space-y-5">
                    <Input
                      label="Current Password"
                      type="password"
                      icon={<Lock size={18} />}
                      value={passData.oldPassword}
                      onChange={e => setPassData({ ...passData, oldPassword: e.target.value })}
                    />
                    <div className="space-y-4 pt-2">
                      <Input
                        label="New Password"
                        type="password"
                        icon={<ShieldCheck size={18} />}
                        value={passData.newPassword}
                        onChange={e => setPassData({ ...passData, newPassword: e.target.value })}
                      />
                      <Input
                        label="Confirm New Password"
                        type="password"
                        icon={<ShieldCheck size={18} />}
                        value={passData.confirmPassword}
                        onChange={e => setPassData({ ...passData, confirmPassword: e.target.value })}
                      />
                    </div>
                    <div className="pt-6">
                      <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl text-md font-bold shadow-lg shadow-primary/20">
                        {loading ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" />}
                        Securely Update Password
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;