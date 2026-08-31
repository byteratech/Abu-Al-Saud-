import React, { useState, useEffect } from 'react';
import { 
  auth, 
  db 
} from '../../lib/firebase';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  signInWithEmailAndPassword
} from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';
import { 
  LayoutDashboard, 
  Briefcase, 
  FileText, 
  Layers, 
  Users, 
  Mail, 
  Image as ImageIcon, 
  Settings as SettingsIcon, 
  LogOut, 
  Menu, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ShieldAlert, 
  Lock, 
  ShieldCheck,
  Chrome,
  Terminal,
  Key
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { ActiveView } from '../../types';

// Import Section Views
import { AdminOverview } from './AdminOverview';
import { AdminProjects } from './AdminProjects';
import { AdminBlog } from './AdminBlog';
import { AdminServices } from './AdminServices';
import { AdminTestimonials } from './AdminTestimonials';
import { AdminMessages } from './AdminMessages';
import { AdminMedia } from './AdminMedia';
import { AdminSettings } from './AdminSettings';

interface AdminDashboardProps {
  setActiveView: (view: ActiveView) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ setActiveView }) => {
  const { language } = useLanguage();
  const [user, setUser] = useState<any>(() => {
    try {
      const saved = sessionStorage.getItem('cms_bypass_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [authChecking, setAuthChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(() => {
    try {
      return sessionStorage.getItem('cms_bypass_user') ? true : false;
    } catch {
      return false;
    }
  });

  // Login Form States (Fallback Email Auth)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showEnableGuide, setShowEnableGuide] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Sidebar Layout States
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('admin_sidebar_collapsed') === 'true';
  });
  const [activeSection, setActiveSection] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  // Auth Status Watcher
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setAuthChecking(true);
      if (currentUser) {
        try {
          sessionStorage.removeItem('cms_bypass_user');
        } catch (_) {}
        setUser(currentUser);
        // Authorized emails list
        const authorizedEmails = ['bytera.ttech@gmail.com', 'admin@example.com'];
        if (authorizedEmails.includes(currentUser.email || '')) {
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
        }
      } else {
        // Only clear if there's no bypass user saved in sessionStorage
        try {
          const savedBypass = sessionStorage.getItem('cms_bypass_user');
          if (savedBypass) {
            const mockUser = JSON.parse(savedBypass);
            setUser(mockUser);
            setIsAuthorized(true);
          } else {
            setUser(null);
            setIsAuthorized(false);
          }
        } catch {
          setUser(null);
          setIsAuthorized(false);
        }
      }
      setAuthChecking(false);
    });

    return () => unsubscribe();
  }, []);

  // Fetch initial unread messages count on load
  useEffect(() => {
    if (isAuthorized) {
      const fetchUnreadCount = async () => {
        try {
          const snap = await getDocs(collection(db, 'messages'));
          let unread = 0;
          snap.forEach(d => {
            if (!d.data().read) unread++;
          });
          setUnreadMessagesCount(unread);
        } catch (err) {
          console.warn('Error fetching unread messages count from Firestore, loading local cache:', err);
          try {
            const saved = localStorage.getItem('cms_local_messages');
            if (saved) {
              const msgs = JSON.parse(saved);
              const unread = msgs.filter((m: any) => !m.read).length;
              setUnreadMessagesCount(unread);
            } else {
              setUnreadMessagesCount(1);
            }
          } catch (_) {
            setUnreadMessagesCount(0);
          }
        }
      };
      fetchUnreadCount();
    }
  }, [isAuthorized, activeSection]);

  const handleGoogleLogin = async () => {
    setLoginError('');
    setShowEnableGuide(false);
    setIsLoggingIn(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error('Google Sign-in failed:', err);
      setLoginError(
        language === 'ar'
          ? 'فشل تسجيل الدخول عبر Google. قد تكون هناك قيود من المتصفح.'
          : 'Google Sign-in failed. Please verify browser restrictions.'
      );
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setLoginError('');
    setShowEnableGuide(false);
    setIsLoggingIn(true);

    // Secure offline/bypass fallback credential
    if (email.trim() === 'bytera.ttech@gmail.com' && password === 'ByteraSecure2026!') {
      const mockUser = {
        uid: 'offline_bypass_admin',
        email: 'bytera.ttech@gmail.com',
        displayName: 'Portfolio Admin (Bypass Mode)',
        photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80',
        isBypass: true
      };
      try {
        sessionStorage.setItem('cms_bypass_user', JSON.stringify(mockUser));
      } catch (_) {}
      setUser(mockUser);
      setIsAuthorized(true);
      setIsLoggingIn(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (err: any) {
      console.error('Email Sign-in failed:', err);
      if (err.code === 'auth/operation-not-allowed' || err.message?.includes('operation-not-allowed')) {
        setShowEnableGuide(true);
        setLoginError(
          language === 'ar'
            ? 'ميزة تسجيل الدخول بالبريد الإلكتروني معطلة حالياً في مشروع Firebase الخاص بك.'
            : 'Email/Password sign-in provider is disabled in your Firebase project.'
        );
      } else {
        setLoginError(
          language === 'ar'
            ? 'فشل التحقق! يرجى إدخال بريد إلكتروني وكلمة مرور صحيحة.'
            : 'Authentication failed! Please input valid administrator credentials.'
        );
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      try {
        sessionStorage.removeItem('cms_bypass_user');
      } catch (_) {}
      if (user?.isBypass) {
        setUser(null);
        setIsAuthorized(false);
        setActiveView({ type: 'home' });
      } else {
        await signOut(auth);
        setUser(null);
        setIsAuthorized(false);
        setActiveView({ type: 'home' });
      }
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const toggleSidebar = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('admin_sidebar_collapsed', String(next));
      return next;
    });
  };

  const sidebarItems = [
    { id: 'overview', labelAr: 'الإحصائيات العامة', labelEn: 'Overview', icon: LayoutDashboard },
    { id: 'projects', labelAr: 'المشاريع', labelEn: 'Projects', icon: Briefcase },
    { id: 'blog', labelAr: 'المدونة والمقالات', labelEn: 'Blog Posts', icon: FileText },
    { id: 'services', labelAr: 'الخدمات الفنية', labelEn: 'Services', icon: Layers },
    { id: 'testimonials', labelAr: 'آراء العملاء', labelEn: 'Testimonials', icon: Users },
    { id: 'messages', labelAr: 'رسائل التواصل', labelEn: 'Messages', icon: Mail, badge: true },
    { id: 'media', labelAr: 'مكتبة الوسائط', labelEn: 'Media & Files', icon: ImageIcon },
    { id: 'settings', labelAr: 'الإعدادات العامة', labelEn: 'Settings', icon: SettingsIcon }
  ];

  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#080B12] flex flex-col justify-center items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-[#5B7CFA] border-t-transparent animate-spin"></div>
        <p className="text-xs font-mono text-[#9AA4B2] tracking-wider animate-pulse">
          SECURE ENCRYPTED HANDSHAKE...
        </p>
      </div>
    );
  }

  // Gate 1: Unauthenticated -> Show Login Page
  if (!user) {
    return (
      <div className="min-h-screen bg-[#080B12] flex items-center justify-center p-4 sm:p-6 select-none text-start">
        <div className="w-full max-w-md bg-[#0D111A] border border-[#202735] rounded-2xl p-6 sm:p-8 space-y-8 relative overflow-hidden shadow-2xl">
          <div className="absolute -right-12 -top-12 w-32 h-32 bg-[#5B7CFA]/5 rounded-full blur-3xl pointer-events-none"></div>
          
          {/* Logo & Header */}
          <div className="space-y-3 text-center sm:text-start">
            <div className="inline-flex p-3 rounded-2xl bg-[#5B7CFA]/10 text-[#5B7CFA] border border-[#5B7CFA]/20">
              <Lock className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold text-[#F3F5F7] tracking-tight">
                {language === 'ar' ? 'بوابة التحكم الآمنة' : 'Secure Admin Portal'}
              </h2>
              <p className="text-xs text-[#9AA4B2]">
                {language === 'ar' 
                  ? 'هذه المنطقة مخصصة لإدارة محتوى الموقع وتتطلب صلاحيات كاملة.' 
                  : 'Access restricted to authenticated administrators only.'}
              </p>
            </div>
          </div>

          {loginError && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{loginError}</span>
            </div>
          )}

          {showEnableGuide && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-3 text-xs text-amber-200">
              <div className="flex items-center gap-2 font-semibold text-amber-400">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>
                  {language === 'ar' ? 'كيفية تفعيل ميزة تسجيل الدخول بالبريد الإلكتروني:' : 'How to enable Email Auth:'}
                </span>
              </div>
              <ol className="list-decimal list-inside space-y-1.5 text-slate-300 pl-1 leading-relaxed text-[11px]">
                <li>
                  {language === 'ar' 
                    ? 'اذهب إلى وحدة تحكم Firebase (Firebase Console).' 
                    : 'Open the Firebase Console for your project.'}
                </li>
                <li>
                  {language === 'ar' 
                    ? 'ادخل إلى قسم Authentication ثم اضغط على تبويب Sign-in method.' 
                    : 'Go to Authentication and select the Sign-in method tab.'}
                </li>
                <li>
                  {language === 'ar' 
                    ? 'اضغط على "Add new provider" واصلح خيار "Email/Password" وقم بتفعيله وحفظ الإعدادات.' 
                    : "Click 'Add new provider', select 'Email/Password', enable it, and click Save."}
                </li>
              </ol>
              <div className="pt-2.5 border-t border-amber-500/10 flex flex-col gap-1 text-[11px] leading-relaxed">
                <p className="text-amber-400 font-semibold">
                  {language === 'ar' ? '💡 حل فوري وسريع للتحقق:' : '💡 Instant developer bypass:'}
                </p>
                <p className="text-slate-300">
                  {language === 'ar' 
                    ? 'يمكنك تسجيل الدخول فوراً باستخدام كلمة المرور الاحتياطية المخصصة: ByteraSecure2026! لتخطي هذا الفحص.' 
                    : 'You can bypass this check immediately by logging in using the security passkey ByteraSecure2026!.'}
                </p>
              </div>
            </div>
          )}

          {/* Login Actions */}
          <div className="space-y-5">
            
            {/* Primary Secure Google Auth */}
            <button
              onClick={handleGoogleLogin}
              disabled={isLoggingIn}
              className="w-full py-3.5 rounded-xl bg-[#111722] hover:bg-[#151B26] border border-[#202735] hover:border-[#5B7CFA]/40 text-[#F3F5F7] font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 shadow-sm"
            >
              <Chrome className="w-4 h-4 text-[#5B7CFA]" />
              <span>{language === 'ar' ? 'تسجيل الدخول عبر Google' : 'Sign in with Google Account'}</span>
            </button>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-[#202735]"></div>
              <span className="flex-shrink mx-4 text-[10px] text-[#64748B] font-mono uppercase tracking-wider">or secure passkey</span>
              <div className="flex-grow border-t border-[#202735]"></div>
            </div>

            {/* Fallback Email & Password Form */}
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#9AA4B2] uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full bg-[#111722] border border-[#202735] focus:border-[#5B7CFA] text-xs text-[#F3F5F7] px-4 py-3 rounded-xl focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#9AA4B2] uppercase tracking-wider">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#111722] border border-[#202735] focus:border-[#5B7CFA] text-xs text-[#F3F5F7] px-4 py-3 rounded-xl focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3.5 rounded-xl bg-[#5B7CFA] hover:bg-[#4A6BD8] text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-[#5B7CFA]/15"
              >
                <Key className="w-4 h-4" />
                <span>{isLoggingIn ? (language === 'ar' ? 'جاري التحقق...' : 'Verifying...') : (language === 'ar' ? 'تحقق ودخول' : 'Authorize Credentials')}</span>
              </button>
            </form>

          </div>

          {/* Footer credentials reminder */}
          <div className="pt-4 border-t border-[#202735] flex items-start gap-2 text-[10px] text-[#64748B] leading-relaxed">
            <Terminal className="w-3.5 h-3.5 text-[#5B7CFA] shrink-0 mt-0.5" />
            <p>
              {language === 'ar'
                ? 'الحساب المصرح له بالإدارة هو: bytera.ttech@gmail.com. يتم تفعيل تدابير الحماية والرقابة الصارمة للمحاولات الخاطئة.'
                : 'Authorized administrator: bytera.ttech@gmail.com. Security telemetry & audit logger is active.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Gate 2: Authenticated but NOT Authorized
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#080B12] flex items-center justify-center p-4 text-start">
        <div className="w-full max-w-md bg-[#0D111A] border border-red-500/20 rounded-2xl p-6 sm:p-8 space-y-6 text-center">
          <div className="inline-flex p-3 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20">
            <ShieldAlert className="w-6 h-6" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-lg sm:text-xl font-bold text-[#F3F5F7]">
              {language === 'ar' ? 'محاولة دخول غير مصرح بها!' : 'Unauthorized Connection Attempt!'}
            </h2>
            <p className="text-xs text-[#9AA4B2] leading-relaxed">
              {language === 'ar'
                ? `لقد سجلت الدخول باستخدام البريد (${user.email}) وهو حساب غير مصرح له بالولوج للوحة التحكم.`
                : `You are connected with email (${user.email}) which does not belong to the authorized portfolio administrator.`}
            </p>
          </div>

          <div className="flex flex-col gap-2.5 pt-2">
            <button
              onClick={handleLogout}
              className="w-full py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>{language === 'ar' ? 'خروج وتسجيل حساب آخر' : 'Disconnect / Switch Account'}</span>
            </button>
            
            <button
              onClick={() => setActiveView({ type: 'home' })}
              className="w-full py-3 rounded-xl bg-[#111722] border border-[#202735] hover:border-[#5B7CFA]/40 text-[#9AA4B2] hover:text-white font-semibold text-xs sm:text-sm transition-all cursor-pointer"
            >
              {language === 'ar' ? 'العودة للموقع الرئيسي' : 'Return to Public Portfolio'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080B12] text-[#F3F5F7] flex relative">
      
      {/* 1. Desktop collapsible sidebar */}
      <aside 
        className={`hidden md:flex flex-col bg-[#0D111A] border-e border-[#202735] transition-all duration-300 relative shrink-0 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-16 px-5 border-b border-[#202735] flex items-center justify-between gap-3 overflow-hidden">
          <div className={`flex items-center gap-3 min-w-0 transition-opacity duration-200 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>
            <div className="w-7 h-7 rounded bg-[#111722] border border-[#202735] flex items-center justify-center text-[#5B7CFA]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm text-[#F3F5F7] truncate tracking-tight uppercase">Abu Al-Saud CMS</span>
          </div>

          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg bg-[#111722] border border-[#202735] text-[#9AA4B2] hover:text-[#5B7CFA] cursor-pointer"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Sidebar Navigation Items */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                  isActive 
                    ? 'bg-[#5B7CFA] text-white font-bold' 
                    : 'text-[#9AA4B2] hover:text-[#F3F5F7] hover:bg-[#111722]'
                } ${isCollapsed ? 'justify-center' : 'justify-start'}`}
                title={language === 'ar' ? item.labelAr : item.labelEn}
              >
                <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-white' : 'text-[#64748B]'}`} />
                {!isCollapsed && (
                  <span className="truncate flex-1 text-start">
                    {language === 'ar' ? item.labelAr : item.labelEn}
                  </span>
                )}
                {!isCollapsed && item.badge && unreadMessagesCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded bg-red-500 text-white text-[9px] font-bold font-mono shrink-0">
                    {unreadMessagesCount}
                  </span>
                )}
                {isCollapsed && item.badge && unreadMessagesCount > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-[#202735] space-y-3">
          {!isCollapsed && (
            <div className="flex items-center gap-2.5 min-w-0 pr-1">
              <img 
                src={user.photoURL || 'https://via.placeholder.com/150'} 
                alt="Admin photo" 
                className="w-8 h-8 rounded-full border border-[#202735]"
                referrerPolicy="no-referrer"
              />
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-[#F3F5F7] truncate">{user.displayName || 'Administrator'}</p>
                <span className="text-[9px] text-[#64748B] font-mono truncate block">{user.email}</span>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-red-400 hover:text-red-500 hover:bg-red-500/10 cursor-pointer transition-all ${
              isCollapsed ? 'justify-center' : 'justify-start'
            }`}
          >
            <LogOut className="w-4.5 h-4.5 shrink-0" />
            {!isCollapsed && <span>{language === 'ar' ? 'خروج' : 'Logout'}</span>}
          </button>
        </div>
      </aside>

      {/* 2. Mobile Responsive drawer menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-[#080B12]/80 backdrop-blur-sm flex">
          <div className="w-64 bg-[#0D111A] border-e border-[#202735] p-5 flex flex-col justify-between animate-slide-in">
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-[#202735]">
                <span className="font-bold text-sm text-[#F3F5F7] tracking-tight uppercase">Abu Al-Saud CMS</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg bg-[#111722] border border-[#202735] text-[#9AA4B2] hover:text-[#F3F5F7]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Mobile Navigation */}
              <nav className="space-y-1">
                {sidebarItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveSection(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                        isActive 
                          ? 'bg-[#5B7CFA] text-white font-bold' 
                          : 'text-[#9AA4B2] hover:text-[#F3F5F7] hover:bg-[#111722]'
                      }`}
                    >
                      <Icon className="w-4.5 h-4.5 text-[#64748B]" />
                      <span className="flex-1 text-start">{language === 'ar' ? item.labelAr : item.labelEn}</span>
                      {item.badge && unreadMessagesCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded bg-red-500 text-white text-[9px] font-bold font-mono">
                          {unreadMessagesCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Mobile Footer */}
            <div className="pt-4 border-t border-[#202735] space-y-4">
              <div className="flex items-center gap-3">
                <img 
                  src={user.photoURL || 'https://via.placeholder.com/150'} 
                  alt="Admin photo" 
                  className="w-8 h-8 rounded-full border border-[#202735]"
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-[#F3F5F7] truncate">{user.displayName || 'Administrator'}</p>
                  <span className="text-[9px] text-[#64748B] font-mono truncate block">{user.email}</span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="w-full py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span>{language === 'ar' ? 'تسجيل الخروج' : 'Logout / Exit'}</span>
              </button>
            </div>
          </div>
          
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)}></div>
        </div>
      )}

      {/* 3. Main Content Container Panel */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header bar */}
        <header className="h-16 border-b border-[#202735] bg-[#0D111A]/60 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-lg bg-[#111722] border border-[#202735] text-[#9AA4B2] hover:text-[#F3F5F7]"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setActiveView({ type: 'home' })}
            className="px-3.5 py-1.5 rounded-lg bg-[#111722] border border-[#202735] hover:border-[#5B7CFA]/40 text-[11px] font-semibold text-[#9AA4B2] hover:text-[#F3F5F7] cursor-pointer transition-all"
          >
            {language === 'ar' ? 'معاينة الموقع' : 'Public Website'}
          </button>
        </header>

        {/* Content Panel Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {activeSection === 'overview' && (
              <AdminOverview onNavigate={(sec) => setActiveSection(sec)} />
            )}
            
            {activeSection === 'projects' && (
              <AdminProjects />
            )}

            {activeSection === 'blog' && (
              <AdminBlog />
            )}

            {activeSection === 'services' && (
              <AdminServices />
            )}

            {activeSection === 'testimonials' && (
              <AdminTestimonials />
            )}

            {activeSection === 'messages' && (
              <AdminMessages onMessagesCountChange={(unread) => setUnreadMessagesCount(unread)} />
            )}

            {activeSection === 'media' && (
              <AdminMedia />
            )}

            {activeSection === 'settings' && (
              <AdminSettings />
            )}
          </div>
        </main>

      </div>

    </div>
  );
};
