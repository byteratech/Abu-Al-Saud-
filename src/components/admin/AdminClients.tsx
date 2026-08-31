import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc 
} from 'firebase/firestore';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Edit, 
  Copy, 
  Eye, 
  EyeOff, 
  Key, 
  Lock, 
  ShieldCheck, 
  Globe, 
  Phone, 
  Mail, 
  MessageCircle, 
  ExternalLink, 
  Check, 
  Sparkles, 
  RefreshCw, 
  Download, 
  Upload, 
  Printer, 
  FileText, 
  Building, 
  Server, 
  Database, 
  Code, 
  Smartphone, 
  AlertCircle, 
  CheckCircle2, 
  X, 
  DollarSign, 
  Tag, 
  ChevronDown, 
  ChevronUp, 
  Shield, 
  Receipt, 
  Calculator,
  HardDrive
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { CMSClient, ClientCredential, ClientStatus, CredentialType, SupportedCurrency } from '../../types';

interface AdminClientsProps {
  onNavigateToQuote?: (clientInfo?: { name: string; email: string; phone: string; company: string }) => void;
  onNavigateToInvoice?: (clientInfo?: { name: string; email: string; phone: string; company: string }) => void;
}

export const AdminClients: React.FC<AdminClientsProps> = ({ onNavigateToQuote, onNavigateToInvoice }) => {
  const { language } = useLanguage();
  const [clients, setClients] = useState<CMSClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'list' | 'form'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  
  // Visible passwords state map { [credentialId]: boolean }
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  // Expanded client cards { [clientId]: boolean }
  const [expandedClients, setExpandedClients] = useState<Record<string, boolean>>({});

  // Client Selected for Print / Dossier Modal
  const [printClient, setPrintClient] = useState<CMSClient | null>(null);
  // Client Selected for Delete confirmation
  const [clientToDelete, setClientToDelete] = useState<CMSClient | null>(null);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState<ClientStatus>('active');
  const [serviceType, setServiceType] = useState('');
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [currency, setCurrency] = useState<SupportedCurrency>('EGP');
  const [notes, setNotes] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [credentials, setCredentials] = useState<ClientCredential[]>([]);

  // Password Generator Helper
  const generateStrongPassword = (index?: number) => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%^&*()_+';
    let pass = '';
    for (let i = 0; i < 16; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    if (typeof index === 'number') {
      const updated = [...credentials];
      updated[index].password = pass;
      setCredentials(updated);
    }
    return pass;
  };

  // Initial Data Fetch from Firestore / Local Storage
  const fetchClients = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'clients'));
      const list: CMSClient[] = [];
      querySnapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as CMSClient);
      });

      // Sort by creation date desc
      list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

      if (list.length > 0) {
        setClients(list);
        try {
          localStorage.setItem('cms_local_clients', JSON.stringify(list));
        } catch (_) {}
      } else {
        // Load initial local samples if empty
        const cached = localStorage.getItem('cms_local_clients');
        if (cached) {
          setClients(JSON.parse(cached));
        } else {
          const sampleClients: CMSClient[] = [
            {
              id: 'client_sample_1',
              name: 'م. أحمد الشناوي',
              company: 'مؤسسة التقنية الذكية للحلول الرقمية',
              email: 'ahmed.elshinawy@smart-tech.eg',
              phone: '+201023456789',
              whatsapp: '+201023456789',
              address: 'القاهرة، التجمع الخامس',
              status: 'vip',
              serviceType: 'تطوير منصة وتطبيق سحابي + استضافة آمنة',
              totalRevenue: 45000,
              currency: 'EGP',
              notes: 'عميل مميز - يفضل التواصل عبر واتساب بعد الظهر. موعد تجديد الاستضافة السنوية في نوفمبر 2026.',
              tags: ['VIP', 'Cloud App', 'E-Commerce'],
              createdAt: new Date().toISOString(),
              credentials: [
                {
                  id: 'cred_1',
                  type: 'cpanel',
                  title: 'استضافة cPanel الرئيسية (Hostinger Cloud)',
                  url: 'https://cpanel.smart-tech.eg:2083',
                  username: 'smarttech_admin',
                  password: 'Bytera@Sec#9981x',
                  accessKey: 'Port 2083 | IP: 185.193.65.12',
                  notes: 'لوحة التحكم السحابية الرئيسية ومجلدات المشروع /public_html'
                },
                {
                  id: 'cred_2',
                  type: 'wordpress',
                  title: 'لوحة إدارة وردبريس (WordPress Admin)',
                  url: 'https://smart-tech.eg/wp-admin',
                  username: 'superadmin_ahmed',
                  password: 'WpPass!2026@Secure',
                  notes: 'صلاحيات مدير عام (Administrator) مع تفعيل جدار الحماية 2FA'
                },
                {
                  id: 'cred_3',
                  type: 'database',
                  title: 'قاعدة بيانات الإنتاج (PostgreSQL / MySQL)',
                  url: 'https://phpmyadmin.smart-tech.eg',
                  username: 'db_usr_prod',
                  password: 'Db_Secret$2026#ProdKey',
                  accessKey: 'DB Name: smarttech_prod_db | Port: 3306',
                  notes: 'قاعدة البيانات المباشرة للطلبات والمدفوعات'
                }
              ]
            },
            {
              id: 'client_sample_2',
              name: 'أ. سارة عبد الرحمن',
              company: 'براند زهرة للمنتجات الطبيعية',
              email: 'sara@zahranatural.com',
              phone: '+201198765432',
              whatsapp: '+201198765432',
              address: 'الجيزة، الشيخ زايد',
              status: 'active',
              serviceType: 'تصميم متجر إلكتروني وبوابة دفع فواتير',
              totalRevenue: 28000,
              currency: 'EGP',
              notes: 'المتجر مربوط مع بوابة دفع Paymob وفواتير إلكترونية.',
              tags: ['Shopify', 'Paymob', 'Retail'],
              createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
              credentials: [
                {
                  id: 'cred_4',
                  type: 'admin_panel',
                  title: 'لوحة تحكم المتجر الإلكتروني',
                  url: 'https://admin.zahranatural.com',
                  username: 'sara_manager',
                  password: 'ZahraStore2026#Secure',
                  notes: 'إدارة المنتجات والطلبيات والكوبونات'
                },
                {
                  id: 'cred_5',
                  type: 'api_key',
                  title: 'مفاتيح بوابة الدفع (Paymob Live API)',
                  username: 'Merchant ID: 489201',
                  accessKey: 'sec_live_948f98a2e8bc1a4f009d1',
                  notes: 'مفاتيح المعاملات المباشرة - يرجى عدم مشاركتها'
                }
              ]
            }
          ];
          setClients(sampleClients);
          try {
            localStorage.setItem('cms_local_clients', JSON.stringify(sampleClients));
          } catch (_) {}
        }
      }
    } catch (err) {
      console.warn('Error fetching clients from Firestore, loading local cache:', err);
      try {
        const cached = localStorage.getItem('cms_local_clients');
        if (cached) {
          setClients(JSON.parse(cached));
        }
      } catch (_) {}
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  // Copy helper with feedback
  const handleCopy = (text: string, fieldId: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  // Toggle Password visibility
  const togglePasswordVisibility = (credId: string) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [credId]: !prev[credId]
    }));
  };

  // Toggle Card Expand
  const toggleCardExpand = (clientId: string) => {
    setExpandedClients(prev => ({
      ...prev,
      [clientId]: !prev[clientId]
    }));
  };

  // Reset form
  const resetForm = () => {
    setEditingId(null);
    setName('');
    setCompany('');
    setEmail('');
    setPhone('');
    setWhatsapp('');
    setAddress('');
    setStatus('active');
    setServiceType('');
    setTotalRevenue(0);
    setCurrency('EGP');
    setNotes('');
    setTagsInput('');
    setCredentials([]);
  };

  // Start edit client
  const handleEdit = (client: CMSClient) => {
    setEditingId(client.id);
    setName(client.name);
    setCompany(client.company || '');
    setEmail(client.email);
    setPhone(client.phone);
    setWhatsapp(client.whatsapp || client.phone || '');
    setAddress(client.address || '');
    setStatus(client.status);
    setServiceType(client.serviceType || '');
    setTotalRevenue(client.totalRevenue || 0);
    setCurrency(client.currency || 'EGP');
    setNotes(client.notes || '');
    setTagsInput((client.tags || []).join(', '));
    setCredentials(client.credentials || []);
    setActiveTab('form');
  };

  // Add Credential Item
  const handleAddCredential = () => {
    const newCred: ClientCredential = {
      id: 'cred_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      type: 'cpanel',
      title: 'حساب جديد / خدمة استضافة',
      url: '',
      username: '',
      password: generateStrongPassword(),
      accessKey: '',
      notes: ''
    };
    setCredentials([...credentials, newCred]);
  };

  // Update Credential Item
  const handleUpdateCredential = (index: number, field: keyof ClientCredential, val: string) => {
    const updated = [...credentials];
    updated[index] = {
      ...updated[index],
      [field]: val
    };
    setCredentials(updated);
  };

  // Remove Credential Item
  const handleRemoveCredential = (index: number) => {
    const updated = credentials.filter((_, i) => i !== index);
    setCredentials(updated);
  };

  // Save / Submit Client (Create / Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim()) {
      alert(language === 'ar' ? 'يرجى إدخال اسم العميل والبريد ورقم الهاتف' : 'Please provide client name, email, and phone');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const clientData: Omit<CMSClient, 'id'> = {
      name: name.trim(),
      company: company.trim(),
      email: email.trim(),
      phone: phone.trim(),
      whatsapp: whatsapp.trim() || phone.trim(),
      address: address.trim(),
      status,
      serviceType: serviceType.trim(),
      totalRevenue: Number(totalRevenue) || 0,
      currency,
      notes: notes.trim(),
      tags,
      credentials: credentials.filter(c => c.title.trim() || c.username?.trim() || c.password?.trim()),
      createdAt: editingId ? (clients.find(c => c.id === editingId)?.createdAt || new Date().toISOString()) : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      if (editingId) {
        // Update
        try {
          await updateDoc(doc(db, 'clients', editingId), clientData as any);
        } catch (dbErr) {
          console.warn('Firestore update failed, updating local state:', dbErr);
        }

        const updatedList = clients.map(c => c.id === editingId ? { id: editingId, ...clientData } : c);
        setClients(updatedList);
        try {
          localStorage.setItem('cms_local_clients', JSON.stringify(updatedList));
        } catch (_) {}
        setSuccessMessage(language === 'ar' ? 'تم تحديث بيانات وحسابات العميل بنجاح!' : 'Client profile and credentials updated successfully!');
      } else {
        // Create
        let newId = 'client_' + Date.now();
        try {
          const docRef = await addDoc(collection(db, 'clients'), clientData);
          newId = docRef.id;
        } catch (dbErr) {
          console.warn('Firestore create failed, saving to local state:', dbErr);
        }

        const newClient: CMSClient = { id: newId, ...clientData };
        const updatedList = [newClient, ...clients];
        setClients(updatedList);
        try {
          localStorage.setItem('cms_local_clients', JSON.stringify(updatedList));
        } catch (_) {}
        setSuccessMessage(language === 'ar' ? 'تمت إضافة العميل وخزنة الاعتمادات بنجاح!' : 'New client & credentials vault created successfully!');
      }

      resetForm();
      setActiveTab('list');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      console.error('Error saving client:', err);
      alert(language === 'ar' ? 'حدث خطأ أثناء حفظ البيانات' : 'Error saving client');
    }
  };

  // Delete Client
  const handleDeleteClient = async () => {
    if (!clientToDelete) return;
    try {
      try {
        await deleteDoc(doc(db, 'clients', clientToDelete.id));
      } catch (dbErr) {
        console.warn('Firestore delete failed, deleting from local state:', dbErr);
      }

      const updated = clients.filter(c => c.id !== clientToDelete.id);
      setClients(updated);
      try {
        localStorage.setItem('cms_local_clients', JSON.stringify(updated));
      } catch (_) {}

      setClientToDelete(null);
      setSuccessMessage(language === 'ar' ? 'تم حذف العميل وسجلاته بنجاح' : 'Client profile removed successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error deleting client:', err);
    }
  };

  // Export Clients Data as JSON Backup
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(clients, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `AbuAlSaud_Clients_Vault_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Export Clients Data as CSV
  const handleExportCSV = () => {
    const headers = ['Client Name', 'Company', 'Email', 'Phone', 'WhatsApp', 'Status', 'Service Type', 'Total Revenue', 'Currency', 'Credentials Count', 'Notes'];
    const rows = clients.map(c => [
      `"${(c.name || '').replace(/"/g, '""')}"`,
      `"${(c.company || '').replace(/"/g, '""')}"`,
      `"${(c.email || '').replace(/"/g, '""')}"`,
      `"${(c.phone || '').replace(/"/g, '""')}"`,
      `"${(c.whatsapp || '').replace(/"/g, '""')}"`,
      `"${c.status}"`,
      `"${(c.serviceType || '').replace(/"/g, '""')}"`,
      `"${c.totalRevenue || 0}"`,
      `"${c.currency || 'EGP'}"`,
      `"${(c.credentials || []).length}"`,
      `"${(c.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `AbuAlSaud_Clients_Directory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // Import JSON Backup
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (Array.isArray(parsed)) {
            setClients(parsed);
            try {
              localStorage.setItem('cms_local_clients', JSON.stringify(parsed));
            } catch (_) {}
            setSuccessMessage(language === 'ar' ? `تم استيراد ${parsed.length} عميل بنجاح!` : `Imported ${parsed.length} clients successfully!`);
            setTimeout(() => setSuccessMessage(null), 4000);
          }
        } catch (err) {
          alert(language === 'ar' ? 'ملف غير صالح، يرجى اختيار ملف JSON صحيح' : 'Invalid JSON file format');
        }
      };
    }
  };

  // Helper for Credential Icon
  const getCredentialIcon = (type: CredentialType) => {
    switch (type) {
      case 'cpanel':
      case 'hosting':
        return <Server className="w-4 h-4 text-[#5B7CFA]" />;
      case 'wordpress':
      case 'admin_panel':
        return <Globe className="w-4 h-4 text-[#10B981]" />;
      case 'database':
        return <Database className="w-4 h-4 text-amber-400" />;
      case 'api_key':
        return <Key className="w-4 h-4 text-purple-400" />;
      case 'ftp':
      case 'server_ssh':
        return <HardDrive className="w-4 h-4 text-cyan-400" />;
      case 'email_account':
        return <Mail className="w-4 h-4 text-emerald-400" />;
      case 'social_media':
        return <Smartphone className="w-4 h-4 text-pink-400" />;
      default:
        return <Lock className="w-4 h-4 text-[#9AA4B2]" />;
    }
  };

  // Helper for Credential Label
  const getCredentialTypeLabel = (type: CredentialType) => {
    switch (type) {
      case 'cpanel':
        return 'cPanel / Cloud Hosting';
      case 'hosting':
        return language === 'ar' ? 'سيرفر واستضافة' : 'Web Hosting';
      case 'wordpress':
        return 'WordPress Admin';
      case 'database':
        return language === 'ar' ? 'قاعدة بيانات (Database)' : 'Database';
      case 'api_key':
        return 'API Key / Secret Token';
      case 'ftp':
        return 'FTP / SFTP Account';
      case 'server_ssh':
        return 'SSH / VPS Server';
      case 'email_account':
        return language === 'ar' ? 'بريد رسمي (Webmail)' : 'Email Account';
      case 'social_media':
        return language === 'ar' ? 'حسابات سوشيال ميديا' : 'Social Media Account';
      case 'admin_panel':
        return language === 'ar' ? 'لوحة تحكم مخصصة' : 'Custom Admin Panel';
      default:
        return language === 'ar' ? 'بيانات وحسابات أخرى' : 'Other Account';
    }
  };

  // Helper for Status Badge
  const getStatusBadge = (st: ClientStatus) => {
    switch (st) {
      case 'vip':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-purple-400" />
            <span>{language === 'ar' ? 'عميل VIP مميز' : 'VIP Client'}</span>
          </span>
        );
      case 'active':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>{language === 'ar' ? 'نشط' : 'Active'}</span>
          </span>
        );
      case 'pending':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
            <AlertCircle className="w-3 h-3 text-amber-400" />
            <span>{language === 'ar' ? 'معلق / قيد المتابعة' : 'Pending'}</span>
          </span>
        );
      case 'archived':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-500/15 text-slate-400 border border-slate-500/30 flex items-center gap-1">
            <span>{language === 'ar' ? 'مؤرشف' : 'Archived'}</span>
          </span>
        );
    }
  };

  // Filter clients
  const filteredClients = clients.filter(c => {
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const query = searchTerm.toLowerCase().trim();
    if (!query) return matchesStatus;

    const matchesName = c.name.toLowerCase().includes(query);
    const matchesCompany = (c.company || '').toLowerCase().includes(query);
    const matchesEmail = c.email.toLowerCase().includes(query);
    const matchesPhone = c.phone.includes(query) || (c.whatsapp || '').includes(query);
    const matchesService = (c.serviceType || '').toLowerCase().includes(query);
    const matchesCredentials = (c.credentials || []).some(
      cred =>
        cred.title.toLowerCase().includes(query) ||
        (cred.username || '').toLowerCase().includes(query) ||
        (cred.url || '').toLowerCase().includes(query)
    );
    const matchesTags = (c.tags || []).some(t => t.toLowerCase().includes(query));

    return matchesStatus && (matchesName || matchesCompany || matchesEmail || matchesPhone || matchesService || matchesCredentials || matchesTags);
  });

  // Calculate metrics
  const totalClientsCount = clients.length;
  const activeClientsCount = clients.filter(c => c.status === 'active' || c.status === 'vip').length;
  const vipClientsCount = clients.filter(c => c.status === 'vip').length;
  const totalCredentialsCount = clients.reduce((acc, c) => acc + (c.credentials || []).length, 0);

  return (
    <div className="space-y-6 text-start">
      
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#202735]">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-[#5B7CFA]/15 text-[#5B7CFA] border border-[#5B7CFA]/30">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#F3F5F7]">
                {language === 'ar' ? 'إدارة العملاء وخزنة الحسابات والبيانات' : 'Clients & Credentials Vault'}
              </h1>
              <p className="text-xs text-[#9AA4B2]">
                {language === 'ar'
                  ? 'سجل شامل لبيانات العملاء، أرقام الهواتف، كلمات المرور، لوحات التحكم، والمفاتيح السرية بأمان كامل.'
                  : 'Manage client directory, phone numbers, encrypted passwords, cPanel logins, and credentials.'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          {activeTab === 'list' ? (
            <>
              <button
                onClick={handleExportJSON}
                className="px-3 py-2 rounded-xl bg-[#111722] hover:bg-[#151B26] border border-[#202735] text-[#9AA4B2] hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                title={language === 'ar' ? 'تصدير نسخة احتياطية مشفرة (JSON)' : 'Export JSON Backup'}
              >
                <Download className="w-3.5 h-3.5 text-[#5B7CFA]" />
                <span className="hidden md:inline">{language === 'ar' ? 'نسخ احتياطي' : 'JSON Backup'}</span>
              </button>

              <button
                onClick={handleExportCSV}
                className="px-3 py-2 rounded-xl bg-[#111722] hover:bg-[#151B26] border border-[#202735] text-[#9AA4B2] hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                title={language === 'ar' ? 'تصدير جدول العملاء (CSV Excel)' : 'Export CSV Table'}
              >
                <FileText className="w-3.5 h-3.5 text-[#10B981]" />
                <span className="hidden md:inline">{language === 'ar' ? 'تصدير CSV' : 'Export CSV'}</span>
              </button>

              <label className="px-3 py-2 rounded-xl bg-[#111722] hover:bg-[#151B26] border border-[#202735] text-[#9AA4B2] hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer">
                <Upload className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden md:inline">{language === 'ar' ? 'استيراد' : 'Import'}</span>
                <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
              </label>

              <button
                onClick={() => {
                  resetForm();
                  setActiveTab('form');
                }}
                className="px-4 py-2 rounded-xl bg-[#5B7CFA] hover:bg-[#4A6BD8] text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-[#5B7CFA]/20"
              >
                <Plus className="w-4 h-4" />
                <span>{language === 'ar' ? 'إضافة عميل جديد' : 'Add New Client'}</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                resetForm();
                setActiveTab('list');
              }}
              className="px-4 py-2 rounded-xl bg-[#111722] hover:bg-[#151B26] border border-[#202735] text-[#9AA4B2] hover:text-white text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all"
            >
              <X className="w-4 h-4" />
              <span>{language === 'ar' ? 'إلغاء والعودة للقائمة' : 'Cancel & Back to Directory'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Success Notification Alert */}
      {successMessage && (
        <div className="p-3.5 rounded-2xl bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] text-xs font-semibold flex items-center justify-between gap-2 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="p-1 text-[#10B981] hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        <div className="p-4 rounded-2xl bg-[#0D111A] border border-[#202735] space-y-1">
          <div className="flex items-center justify-between text-[#9AA4B2]">
            <span className="text-[11px] font-semibold">{language === 'ar' ? 'إجمالي العملاء' : 'Total Clients'}</span>
            <Users className="w-4 h-4 text-[#5B7CFA]" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-[#F3F5F7] font-mono">{totalClientsCount}</p>
          <span className="text-[10px] text-[#64748B]">{language === 'ar' ? 'مسجلين في السجل العام' : 'In master database'}</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0D111A] border border-[#202735] space-y-1">
          <div className="flex items-center justify-between text-[#9AA4B2]">
            <span className="text-[11px] font-semibold">{language === 'ar' ? 'العملاء النشطون' : 'Active Clients'}</span>
            <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-[#10B981] font-mono">{activeClientsCount}</p>
          <span className="text-[10px] text-[#64748B]">{language === 'ar' ? 'مشاريع وخدمات جارية' : 'Ongoing engagements'}</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0D111A] border border-[#202735] space-y-1">
          <div className="flex items-center justify-between text-[#9AA4B2]">
            <span className="text-[11px] font-semibold">{language === 'ar' ? 'عملاء VIP' : 'VIP Accounts'}</span>
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-purple-400 font-mono">{vipClientsCount}</p>
          <span className="text-[10px] text-[#64748B]">{language === 'ar' ? 'أولوية دعم ومتابعة' : 'High-tier priority'}</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0D111A] border border-[#202735] space-y-1">
          <div className="flex items-center justify-between text-[#9AA4B2]">
            <span className="text-[11px] font-semibold">{language === 'ar' ? 'حسابات وخزائن بيانات' : 'Vault Credentials'}</span>
            <ShieldCheck className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-amber-400 font-mono">{totalCredentialsCount}</p>
          <span className="text-[10px] text-[#64748B]">{language === 'ar' ? 'كلمات مرور ولوحات تحكم' : 'cPanel, WP & API keys'}</span>
        </div>

      </div>

      {/* 3. Main Views: Directory List OR Add/Edit Form */}
      {activeTab === 'list' ? (
        <div className="space-y-4">
          
          {/* Search & Status Filters Bar */}
          <div className="p-3 sm:p-4 rounded-2xl bg-[#0D111A] border border-[#202735] flex flex-col md:flex-row items-center justify-between gap-3">
            
            {/* Search input */}
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={
                  language === 'ar'
                    ? 'بحث بالاسم، الشركة، الهاتف، الإيميل، الاستضافة، الباسورد...'
                    : 'Search by name, company, phone, email, credentials...'
                }
                className="w-full bg-[#111722] border border-[#202735] focus:border-[#5B7CFA] rounded-xl pl-9 pr-4 py-2 text-xs text-[#F3F5F7] placeholder-[#64748B] focus:outline-none"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Status Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
              {[
                { id: 'all', labelAr: 'الكل', labelEn: 'All' },
                { id: 'vip', labelAr: '⭐ VIP', labelEn: '⭐ VIP' },
                { id: 'active', labelAr: 'نشط', labelEn: 'Active' },
                { id: 'pending', labelAr: 'معلق', labelEn: 'Pending' },
                { id: 'archived', labelAr: 'مؤرشف', labelEn: 'Archived' }
              ].map(st => (
                <button
                  key={st.id}
                  onClick={() => setStatusFilter(st.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    statusFilter === st.id
                      ? 'bg-[#5B7CFA] text-white font-bold'
                      : 'bg-[#111722] text-[#9AA4B2] hover:text-[#F3F5F7] hover:bg-[#151B26] border border-[#202735]'
                  }`}
                >
                  {language === 'ar' ? st.labelAr : st.labelEn}
                </button>
              ))}
            </div>

          </div>

          {/* Clients Cards Feed */}
          {loading ? (
            <div className="p-12 text-center space-y-3 bg-[#0D111A] border border-[#202735] rounded-2xl">
              <div className="w-7 h-7 rounded-full border-2 border-[#5B7CFA] border-t-transparent animate-spin mx-auto"></div>
              <p className="text-xs text-[#9AA4B2] font-mono">LOADING ENCRYPTED CLIENT VAULT...</p>
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="p-12 text-center space-y-4 bg-[#0D111A] border border-[#202735] rounded-2xl">
              <div className="w-12 h-12 rounded-2xl bg-[#111722] text-[#64748B] flex items-center justify-center mx-auto border border-[#202735]">
                <Users className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-[#F3F5F7]">
                  {language === 'ar' ? 'لم يتم العثور على أي عملاء' : 'No clients found'}
                </h3>
                <p className="text-xs text-[#9AA4B2]">
                  {searchTerm
                    ? (language === 'ar' ? 'لا توجد نتائج تطابق كلمة البحث الحالية.' : 'Try adjusting your search criteria.')
                    : (language === 'ar' ? 'ابدأ بإضافة أول عميل وحساباته الآن.' : 'Add your first client and credentials to the vault.')}
                </p>
              </div>
              <button
                onClick={() => {
                  resetForm();
                  setActiveTab('form');
                }}
                className="px-4 py-2 rounded-xl bg-[#5B7CFA] text-white text-xs font-bold inline-flex items-center gap-2 cursor-pointer shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>{language === 'ar' ? 'إضافة عميل جديد' : 'Add Client'}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredClients.map((client) => {
                const isExpanded = expandedClients[client.id] !== false; // Default expanded
                const rawWhatsApp = (client.whatsapp || client.phone || '').replace(/\D/g, '');

                return (
                  <div
                    key={client.id}
                    className="p-5 sm:p-6 rounded-2xl bg-[#0D111A] border border-[#202735] hover:border-[#5B7CFA]/30 transition-all space-y-5 shadow-lg relative group"
                  >
                    {/* Top Row: Client Info & Badges */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#202735]">
                      
                      {/* Name & Identity */}
                      <div className="flex items-start gap-3.5 min-w-0">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#111722] to-[#1a2233] border border-[#202735] flex items-center justify-center text-[#5B7CFA] font-bold text-base shrink-0 shadow-inner">
                          {client.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center flex-wrap gap-2">
                            <h3 className="text-base font-bold text-[#F3F5F7] tracking-tight">{client.name}</h3>
                            {getStatusBadge(client.status)}
                            {client.serviceType && (
                              <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-[#111722] border border-[#202735] text-[#9AA4B2]">
                                {client.serviceType}
                              </span>
                            )}
                          </div>
                          {client.company && (
                            <p className="text-xs text-[#9AA4B2] flex items-center gap-1.5 font-medium">
                              <Building className="w-3.5 h-3.5 text-[#5B7CFA]" />
                              <span>{client.company}</span>
                              {client.address && <span className="text-[#64748B]">({client.address})</span>}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Quick Communication & Actions Toolbar */}
                      <div className="flex items-center flex-wrap gap-1.5">
                        
                        {/* WhatsApp Direct Chat */}
                        {rawWhatsApp && (
                          <a
                            href={`https://wa.me/${rawWhatsApp}?text=${encodeURIComponent(
                              language === 'ar' 
                                ? `مرحباً ${client.name}، معك أبو السعود. أتمنى أن تكون بأفضل حال.` 
                                : `Hello ${client.name}, this is Abu Al-Saud.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-xl bg-[#10B981]/15 hover:bg-[#10B981]/25 border border-[#10B981]/30 text-[#10B981] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                            title={language === 'ar' ? 'محادثة واتساب سريعة' : 'Chat on WhatsApp'}
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>{language === 'ar' ? 'واتساب' : 'WhatsApp'}</span>
                          </a>
                        )}

                        {/* Direct Phone Call */}
                        {client.phone && (
                          <a
                            href={`tel:${client.phone}`}
                            className="p-2 rounded-xl bg-[#111722] hover:bg-[#151B26] border border-[#202735] text-[#9AA4B2] hover:text-[#5B7CFA] transition-colors"
                            title={language === 'ar' ? `اتصال: ${client.phone}` : `Call: ${client.phone}`}
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                        )}

                        {/* Email */}
                        {client.email && (
                          <a
                            href={`mailto:${client.email}?subject=${encodeURIComponent('متابعة المشروع مع أبو السعود')}`}
                            className="p-2 rounded-xl bg-[#111722] hover:bg-[#151B26] border border-[#202735] text-[#9AA4B2] hover:text-[#5B7CFA] transition-colors"
                            title={language === 'ar' ? `مراسلة: ${client.email}` : `Email: ${client.email}`}
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </a>
                        )}

                        {/* Print / Dossier View */}
                        <button
                          onClick={() => setPrintClient(client)}
                          className="p-2 rounded-xl bg-[#111722] hover:bg-[#151B26] border border-[#202735] text-[#9AA4B2] hover:text-[#F3F5F7] transition-colors cursor-pointer"
                          title={language === 'ar' ? 'طباعة ومعاينة ملف العميل' : 'Print Client Dossier'}
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => handleEdit(client)}
                          className="p-2 rounded-xl bg-[#111722] hover:bg-[#151B26] border border-[#202735] text-[#9AA4B2] hover:text-[#5B7CFA] transition-colors cursor-pointer"
                          title={language === 'ar' ? 'تعديل البيانات' : 'Edit Client'}
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => setClientToDelete(client)}
                          className="p-2 rounded-xl bg-[#111722] hover:bg-red-500/20 border border-[#202735] text-[#9AA4B2] hover:text-red-400 transition-colors cursor-pointer"
                          title={language === 'ar' ? 'حذف العميل' : 'Delete Client'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Collapse / Expand Toggle */}
                        <button
                          onClick={() => toggleCardExpand(client.id)}
                          className="p-2 rounded-xl bg-[#111722] hover:bg-[#151B26] border border-[#202735] text-[#9AA4B2] hover:text-[#F3F5F7] transition-colors cursor-pointer ms-1"
                        >
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>

                      </div>

                    </div>

                    {/* Middle: Contact Coordinates & Meta Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                      
                      <div className="p-3 rounded-xl bg-[#111722]/80 border border-[#202735] space-y-1">
                        <span className="text-[10px] text-[#64748B] font-mono flex items-center gap-1 uppercase">
                          <Mail className="w-3 h-3 text-[#5B7CFA]" />
                          <span>Email Address</span>
                        </span>
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[#F3F5F7] font-mono truncate">{client.email}</span>
                          <button
                            onClick={() => handleCopy(client.email, `email_${client.id}`)}
                            className="text-[#64748B] hover:text-[#5B7CFA] p-1"
                            title="Copy Email"
                          >
                            {copiedField === `email_${client.id}` ? <Check className="w-3 h-3 text-[#10B981]" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-[#111722]/80 border border-[#202735] space-y-1">
                        <span className="text-[10px] text-[#64748B] font-mono flex items-center gap-1 uppercase">
                          <Phone className="w-3 h-3 text-[#10B981]" />
                          <span>Phone / WhatsApp</span>
                        </span>
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[#F3F5F7] font-mono truncate">{client.phone}</span>
                          <button
                            onClick={() => handleCopy(client.phone, `phone_${client.id}`)}
                            className="text-[#64748B] hover:text-[#5B7CFA] p-1"
                            title="Copy Phone"
                          >
                            {copiedField === `phone_${client.id}` ? <Check className="w-3 h-3 text-[#10B981]" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-[#111722]/80 border border-[#202735] space-y-1">
                        <span className="text-[10px] text-[#64748B] font-mono flex items-center gap-1 uppercase">
                          <DollarSign className="w-3 h-3 text-amber-400" />
                          <span>Total Revenue / التعاملات</span>
                        </span>
                        <p className="text-[#F3F5F7] font-mono font-bold">
                          {(client.totalRevenue || 0).toLocaleString()} {client.currency || 'EGP'}
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-[#111722]/80 border border-[#202735] space-y-1">
                        <span className="text-[10px] text-[#64748B] font-mono flex items-center gap-1 uppercase">
                          <Tag className="w-3 h-3 text-purple-400" />
                          <span>Tags & Category</span>
                        </span>
                        <div className="flex items-center flex-wrap gap-1">
                          {(client.tags && client.tags.length > 0) ? (
                            client.tags.map((t, idx) => (
                              <span key={idx} className="px-1.5 py-0.5 rounded bg-[#080B12] text-[10px] text-[#9AA4B2] font-mono">
                                #{t}
                              </span>
                            ))
                          ) : (
                            <span className="text-[11px] text-[#64748B]">—</span>
                          )}
                        </div>
                      </div>

                    </div>

                    {/* Expandable Section: Secret Notes & Credentials Vault */}
                    {isExpanded && (
                      <div className="space-y-4 pt-2">
                        
                        {/* Secret Notes */}
                        {client.notes && (
                          <div className="p-3.5 rounded-xl bg-[#111722]/50 border border-[#202735] space-y-1 text-xs">
                            <span className="text-[10px] font-bold text-[#9AA4B2] uppercase flex items-center gap-1">
                              <FileText className="w-3 h-3 text-[#5B7CFA]" />
                              <span>{language === 'ar' ? 'ملاحظات سرية وتعليمات التعاقد' : 'Confidential Notes & Instructions'}</span>
                            </span>
                            <p className="text-[#9AA4B2] whitespace-pre-wrap leading-relaxed text-[11px] font-mono">
                              {client.notes}
                            </p>
                          </div>
                        )}

                        {/* Credentials Vault Box */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Shield className="w-4 h-4 text-[#10B981]" />
                              <h4 className="text-xs font-bold text-[#F3F5F7] uppercase tracking-wider">
                                {language === 'ar' 
                                  ? `خزنة الحسابات وكلمات المرور (${(client.credentials || []).length})` 
                                  : `Encrypted Credentials Vault (${(client.credentials || []).length})`}
                              </h4>
                            </div>
                            <span className="text-[10px] text-[#64748B] font-mono">
                              {language === 'ar' ? 'محمية ومشفرة' : 'Encrypted & Safe'}
                            </span>
                          </div>

                          {(!client.credentials || client.credentials.length === 0) ? (
                            <div className="p-4 rounded-xl bg-[#111722]/40 border border-[#202735] text-center text-xs text-[#64748B]">
                              {language === 'ar' ? 'لا توجد كلمات مرور أو حسابات مسجلة لهذا العميل حالياً.' : 'No credentials stored for this client.'}
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {client.credentials.map((cred) => {
                                const isPassVisible = visiblePasswords[cred.id];
                                return (
                                  <div
                                    key={cred.id}
                                    className="p-3.5 rounded-xl bg-[#111722] border border-[#202735] hover:border-[#5B7CFA]/40 space-y-2.5 transition-all text-xs"
                                  >
                                    {/* Credential Header */}
                                    <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#202735]/60">
                                      <div className="flex items-center gap-2 min-w-0">
                                        <div className="p-1.5 rounded-lg bg-[#080B12] border border-[#202735] shrink-0">
                                          {getCredentialIcon(cred.type)}
                                        </div>
                                        <div className="min-w-0">
                                          <p className="font-bold text-[#F3F5F7] truncate text-xs">{cred.title}</p>
                                          <span className="text-[10px] text-[#64748B] block truncate">
                                            {getCredentialTypeLabel(cred.type)}
                                          </span>
                                        </div>
                                      </div>

                                      {cred.url && (
                                        <a
                                          href={cred.url.startsWith('http') ? cred.url : `https://${cred.url}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="p-1.5 rounded-lg bg-[#080B12] hover:bg-[#151B26] border border-[#202735] text-[#9AA4B2] hover:text-[#5B7CFA] transition-colors"
                                          title={language === 'ar' ? 'فتح رابط لوحة التحكم' : 'Open Login URL'}
                                        >
                                          <ExternalLink className="w-3.5 h-3.5" />
                                        </a>
                                      )}
                                    </div>

                                    {/* Credentials Data Fields */}
                                    <div className="space-y-1.5 font-mono text-[11px]">
                                      
                                      {/* Username / ID */}
                                      {cred.username && (
                                        <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#080B12] border border-[#202735]">
                                          <span className="text-[#64748B] text-[10px] uppercase">User:</span>
                                          <div className="flex items-center gap-2 min-w-0">
                                            <span className="text-[#F3F5F7] truncate">{cred.username}</span>
                                            <button
                                              onClick={() => handleCopy(cred.username!, `usr_${cred.id}`)}
                                              className="text-[#64748B] hover:text-[#5B7CFA]"
                                              title="Copy Username"
                                            >
                                              {copiedField === `usr_${cred.id}` ? <Check className="w-3 h-3 text-[#10B981]" /> : <Copy className="w-3 h-3" />}
                                            </button>
                                          </div>
                                        </div>
                                      )}

                                      {/* Password Field with Hide/Show & Copy */}
                                      {cred.password && (
                                        <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#080B12] border border-[#202735]">
                                          <span className="text-[#64748B] text-[10px] uppercase">Pass:</span>
                                          <div className="flex items-center gap-2 min-w-0">
                                            <span className="text-[#10B981] font-bold tracking-wider">
                                              {isPassVisible ? cred.password : '••••••••••••'}
                                            </span>
                                            
                                            <button
                                              onClick={() => togglePasswordVisibility(cred.id)}
                                              className="text-[#64748B] hover:text-[#F3F5F7] p-0.5"
                                              title={isPassVisible ? 'Hide' : 'Show'}
                                            >
                                              {isPassVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                            </button>

                                            <button
                                              onClick={() => handleCopy(cred.password!, `pass_${cred.id}`)}
                                              className="text-[#64748B] hover:text-[#5B7CFA] p-0.5"
                                              title="Copy Password"
                                            >
                                              {copiedField === `pass_${cred.id}` ? <Check className="w-3 h-3 text-[#10B981]" /> : <Copy className="w-3 h-3" />}
                                            </button>
                                          </div>
                                        </div>
                                      )}

                                      {/* Access Key / Port / Secret */}
                                      {cred.accessKey && (
                                        <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#080B12] border border-[#202735]">
                                          <span className="text-[#64748B] text-[10px] uppercase">Key/Port:</span>
                                          <div className="flex items-center gap-2 min-w-0">
                                            <span className="text-amber-300 truncate max-w-[140px]">{cred.accessKey}</span>
                                            <button
                                              onClick={() => handleCopy(cred.accessKey!, `key_${cred.id}`)}
                                              className="text-[#64748B] hover:text-[#5B7CFA]"
                                              title="Copy Key"
                                            >
                                              {copiedField === `key_${cred.id}` ? <Check className="w-3 h-3 text-[#10B981]" /> : <Copy className="w-3 h-3" />}
                                            </button>
                                          </div>
                                        </div>
                                      )}

                                      {/* Extra Notes */}
                                      {cred.notes && (
                                        <p className="text-[10px] text-[#9AA4B2] italic pt-1 leading-relaxed">
                                          ℹ️ {cred.notes}
                                        </p>
                                      )}

                                    </div>

                                  </div>
                                );
                              })}
                            </div>
                          )}

                        </div>

                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          )}

        </div>
      ) : (
        /* 4. Add / Edit Client Form */
        <form onSubmit={handleSubmit} className="space-y-6 bg-[#0D111A] border border-[#202735] p-5 sm:p-8 rounded-2xl shadow-xl">
          
          <div className="pb-4 border-b border-[#202735] flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#F3F5F7]">
                {editingId ? (language === 'ar' ? 'تعديل بيانات وملف العميل' : 'Edit Client Profile') : (language === 'ar' ? 'إضافة عميل جديد والخزنة' : 'Create New Client & Vault')}
              </h2>
              <p className="text-xs text-[#9AA4B2]">
                {language === 'ar' ? 'أدخل البيانات الأساسية، وسجل الحسابات ولوحات التحكم وكلمات المرور.' : 'Fill in contact coordinates, company info, and credentials.'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                resetForm();
                setActiveTab('list');
              }}
              className="p-2 rounded-xl bg-[#111722] hover:bg-[#151B26] border border-[#202735] text-[#9AA4B2]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* General Client Details */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-[#5B7CFA] uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              <span>{language === 'ar' ? '1. البيانات الشخصية وجهات الاتصال' : '1. Personal & Contact Details'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#9AA4B2] uppercase">
                  {language === 'ar' ? 'اسم العميل / المسؤول *' : 'Client Full Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={language === 'ar' ? 'مثال: م. أحمد الشناوي' : 'e.g. Ahmed El-Shinawy'}
                  className="w-full bg-[#111722] border border-[#202735] focus:border-[#5B7CFA] text-xs text-[#F3F5F7] px-4 py-2.5 rounded-xl focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#9AA4B2] uppercase">
                  {language === 'ar' ? 'اسم الشركة أو النشاط التجاري' : 'Company / Business Name'}
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder={language === 'ar' ? 'مثال: مؤسسة التقنية الذكية' : 'e.g. Smart Tech Solutions'}
                  className="w-full bg-[#111722] border border-[#202735] focus:border-[#5B7CFA] text-xs text-[#F3F5F7] px-4 py-2.5 rounded-xl focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#9AA4B2] uppercase">
                  {language === 'ar' ? 'البريد الإلكتروني *' : 'Email Address *'}
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="client@company.com"
                  className="w-full bg-[#111722] border border-[#202735] focus:border-[#5B7CFA] text-xs text-[#F3F5F7] px-4 py-2.5 rounded-xl focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#9AA4B2] uppercase">
                  {language === 'ar' ? 'رقم الهاتف الرئيسي *' : 'Primary Phone *'}
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+201023456789"
                  className="w-full bg-[#111722] border border-[#202735] focus:border-[#5B7CFA] text-xs text-[#F3F5F7] px-4 py-2.5 rounded-xl focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#9AA4B2] uppercase">
                  {language === 'ar' ? 'رقم الواتساب (WhatsApp)' : 'WhatsApp Number'}
                </label>
                <input
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="+201023456789"
                  className="w-full bg-[#111722] border border-[#202735] focus:border-[#5B7CFA] text-xs text-[#F3F5F7] px-4 py-2.5 rounded-xl focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#9AA4B2] uppercase">
                  {language === 'ar' ? 'حالة العميل' : 'Client Status'}
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ClientStatus)}
                  className="w-full bg-[#111722] border border-[#202735] focus:border-[#5B7CFA] text-xs text-[#F3F5F7] px-4 py-2.5 rounded-xl focus:outline-none"
                >
                  <option value="active">{language === 'ar' ? 'نشط (Active)' : 'Active'}</option>
                  <option value="vip">{language === 'ar' ? 'عميل مميز (⭐ VIP)' : 'VIP Client'}</option>
                  <option value="pending">{language === 'ar' ? 'معلق (Pending)' : 'Pending'}</option>
                  <option value="archived">{language === 'ar' ? 'مؤرشف (Archived)' : 'Archived'}</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#9AA4B2] uppercase">
                  {language === 'ar' ? 'نوع الخدمة أو المشروع' : 'Service or Project Type'}
                </label>
                <input
                  type="text"
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  placeholder={language === 'ar' ? 'مثال: متجر إلكتروني، استضافة سحابية، استشارة أمنية' : 'e.g. Web App, Cloud Hosting, Cybersecurity'}
                  className="w-full bg-[#111722] border border-[#202735] focus:border-[#5B7CFA] text-xs text-[#F3F5F7] px-4 py-2.5 rounded-xl focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#9AA4B2] uppercase">
                  {language === 'ar' ? 'إجمالي التعاملات المالية' : 'Total Revenue'}
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    value={totalRevenue}
                    onChange={(e) => setTotalRevenue(Number(e.target.value))}
                    className="flex-1 bg-[#111722] border border-[#202735] focus:border-[#5B7CFA] text-xs text-[#F3F5F7] px-4 py-2.5 rounded-xl focus:outline-none font-mono"
                  />
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as SupportedCurrency)}
                    className="w-24 bg-[#111722] border border-[#202735] text-xs text-[#F3F5F7] px-2 py-2.5 rounded-xl focus:outline-none"
                  >
                    <option value="EGP">EGP</option>
                    <option value="USD">USD</option>
                    <option value="SAR">SAR</option>
                    <option value="AED">AED</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#9AA4B2] uppercase">
                  {language === 'ar' ? 'العنوان / المدينة / الدولة' : 'Address / Location'}
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={language === 'ar' ? 'القاهرة، مصر' : 'Cairo, Egypt'}
                  className="w-full bg-[#111722] border border-[#202735] focus:border-[#5B7CFA] text-xs text-[#F3F5F7] px-4 py-2.5 rounded-xl focus:outline-none"
                />
              </div>

            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#9AA4B2] uppercase">
                {language === 'ar' ? 'وسوم تصنيف العميل (Tags - مفصولة بفواصل)' : 'Tags (Comma separated)'}
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="VIP, E-Commerce, React, Paymob, Security"
                className="w-full bg-[#111722] border border-[#202735] focus:border-[#5B7CFA] text-xs text-[#F3F5F7] px-4 py-2.5 rounded-xl focus:outline-none font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#9AA4B2] uppercase">
                {language === 'ar' ? 'ملاحظات سرية وتعليمات المشروع' : 'Private Notes & Confidential Instructions'}
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={language === 'ar' ? 'سجل أي ملاحظات خاصة بالعميل، مواعيد التجديد، متطلبات الاتفاق...' : 'Enter client notes, renewal deadlines, preferences...'}
                className="w-full bg-[#111722] border border-[#202735] focus:border-[#5B7CFA] text-xs text-[#F3F5F7] p-3 rounded-xl focus:outline-none font-mono"
              />
            </div>

          </div>

          {/* Dynamic Credentials Vault Builder */}
          <div className="space-y-4 pt-4 border-t border-[#202735]">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h3 className="text-xs font-bold text-[#10B981] uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>{language === 'ar' ? '2. خزنة الحسابات وكلمات المرور والاعتمادات' : '2. Credentials Vault & Logins'}</span>
                </h3>
                <p className="text-[11px] text-[#9AA4B2]">
                  {language === 'ar' ? 'أضف بيانات الـ cPanel، وردبريس، قواعد البيانات، الـ API Keys وكلمات المرور.' : 'Add cPanel, WordPress, DB credentials, API keys & passwords.'}
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddCredential}
                className="px-3 py-1.5 rounded-xl bg-[#10B981]/15 hover:bg-[#10B981]/25 border border-[#10B981]/30 text-[#10B981] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'إضافة حساب جديد' : 'Add Credential'}</span>
              </button>
            </div>

            {credentials.length === 0 ? (
              <div className="p-6 rounded-2xl bg-[#111722]/40 border border-dashed border-[#202735] text-center space-y-2">
                <Lock className="w-6 h-6 text-[#64748B] mx-auto" />
                <p className="text-xs text-[#9AA4B2]">
                  {language === 'ar' ? 'لم تقم بإضافة حسابات أو كلمات مرور بعد.' : 'No credentials added to this vault yet.'}
                </p>
                <button
                  type="button"
                  onClick={handleAddCredential}
                  className="px-3.5 py-1.5 rounded-xl bg-[#111722] hover:bg-[#151B26] border border-[#202735] text-[#5B7CFA] text-xs font-semibold"
                >
                  {language === 'ar' ? '+ إضافة أول حساب' : '+ Add First Credential'}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {credentials.map((cred, idx) => (
                  <div
                    key={cred.id || idx}
                    className="p-4 rounded-2xl bg-[#111722] border border-[#202735] space-y-3 relative group"
                  >
                    <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#202735]">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#080B12] border border-[#202735] flex items-center justify-center text-[10px] font-bold text-[#5B7CFA]">
                          {idx + 1}
                        </span>
                        <select
                          value={cred.type}
                          onChange={(e) => handleUpdateCredential(idx, 'type', e.target.value)}
                          className="bg-[#080B12] border border-[#202735] text-xs text-[#F3F5F7] px-2.5 py-1 rounded-lg focus:outline-none"
                        >
                          <option value="cpanel">cPanel Hosting</option>
                          <option value="wordpress">WordPress Admin</option>
                          <option value="database">Database (MySQL / Postgres)</option>
                          <option value="api_key">API Key / Token</option>
                          <option value="admin_panel">Custom Admin Panel</option>
                          <option value="ftp">FTP / SFTP</option>
                          <option value="server_ssh">SSH / VPS Server</option>
                          <option value="email_account">Email / Webmail</option>
                          <option value="social_media">Social Media Account</option>
                          <option value="other">Other / Custom</option>
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveCredential(idx)}
                        className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                        title="Delete Credential"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                      
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[#9AA4B2] uppercase">
                          {language === 'ar' ? 'عنوان الحساب / الخدمة *' : 'Service / Account Title *'}
                        </label>
                        <input
                          type="text"
                          required
                          value={cred.title}
                          onChange={(e) => handleUpdateCredential(idx, 'title', e.target.value)}
                          placeholder="Hostinger Cloud cPanel / WP Admin"
                          className="w-full bg-[#080B12] border border-[#202735] text-xs text-[#F3F5F7] px-3 py-2 rounded-xl focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[#9AA4B2] uppercase">
                          {language === 'ar' ? 'رابط الدخول / URL' : 'Login URL'}
                        </label>
                        <input
                          type="text"
                          value={cred.url || ''}
                          onChange={(e) => handleUpdateCredential(idx, 'url', e.target.value)}
                          placeholder="https://cpanel.domain.com:2083"
                          className="w-full bg-[#080B12] border border-[#202735] text-xs text-[#F3F5F7] px-3 py-2 rounded-xl focus:outline-none font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[#9AA4B2] uppercase">
                          {language === 'ar' ? 'اسم المستخدم / Username / Email' : 'Username / Login ID'}
                        </label>
                        <input
                          type="text"
                          value={cred.username || ''}
                          onChange={(e) => handleUpdateCredential(idx, 'username', e.target.value)}
                          placeholder="admin / root / user@domain.com"
                          className="w-full bg-[#080B12] border border-[#202735] text-xs text-[#F3F5F7] px-3 py-2 rounded-xl focus:outline-none font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-bold text-[#9AA4B2] uppercase">
                            {language === 'ar' ? 'كلمة المرور / Password' : 'Password'}
                          </label>
                          <button
                            type="button"
                            onClick={() => generateStrongPassword(idx)}
                            className="text-[10px] text-[#5B7CFA] hover:underline flex items-center gap-0.5 cursor-pointer"
                          >
                            <Sparkles className="w-2.5 h-2.5" />
                            <span>{language === 'ar' ? 'توليد كلمة سر قوية' : 'Generate Strong'}</span>
                          </button>
                        </div>
                        <input
                          type="text"
                          value={cred.password || ''}
                          onChange={(e) => handleUpdateCredential(idx, 'password', e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full bg-[#080B12] border border-[#202735] text-xs text-[#10B981] font-mono px-3 py-2 rounded-xl focus:outline-none font-bold"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[#9AA4B2] uppercase">
                          {language === 'ar' ? 'مفتاح سري / Port / DB Name' : 'API Key / Secret / Port'}
                        </label>
                        <input
                          type="text"
                          value={cred.accessKey || ''}
                          onChange={(e) => handleUpdateCredential(idx, 'accessKey', e.target.value)}
                          placeholder="Port 3306 / secret_key_123"
                          className="w-full bg-[#080B12] border border-[#202735] text-xs text-[#F3F5F7] px-3 py-2 rounded-xl focus:outline-none font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[#9AA4B2] uppercase">
                          {language === 'ar' ? 'ملاحظات إضافية' : 'Notes / Instructions'}
                        </label>
                        <input
                          type="text"
                          value={cred.notes || ''}
                          onChange={(e) => handleUpdateCredential(idx, 'notes', e.target.value)}
                          placeholder={language === 'ar' ? 'مجلد المشروع الرئيسي، توثيق إضافي...' : 'Public html directory, instructions...'}
                          className="w-full bg-[#080B12] border border-[#202735] text-xs text-[#F3F5F7] px-3 py-2 rounded-xl focus:outline-none"
                        />
                      </div>

                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-[#202735] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                resetForm();
                setActiveTab('list');
              }}
              className="px-5 py-2.5 rounded-xl bg-[#111722] hover:bg-[#151B26] border border-[#202735] text-[#9AA4B2] text-xs font-semibold cursor-pointer"
            >
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#5B7CFA] hover:bg-[#4A6BD8] text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg shadow-[#5B7CFA]/30"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{editingId ? (language === 'ar' ? 'حفظ التعديلات' : 'Save Changes') : (language === 'ar' ? 'إنشاء وحفظ العميل' : 'Save Client to Vault')}</span>
            </button>
          </div>

        </form>
      )}

      {/* 5. Printable Dossier / Client Sheet Modal */}
      {printClient && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-[#0D111A] border border-[#202735] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#202735]">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-[#5B7CFA]/15 text-[#5B7CFA] border border-[#5B7CFA]/30">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#F3F5F7]">
                    {language === 'ar' ? 'ملف العميل وسجل الحسابات السرية' : 'Client Profile & Credentials Dossier'}
                  </h3>
                  <p className="text-xs text-[#9AA4B2]">
                    {language === 'ar' ? 'نسخة مهيأة للطباعة والأرشفة والمراجعة' : 'Printable & archivable profile record'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 rounded-xl bg-[#5B7CFA] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{language === 'ar' ? 'طباعة' : 'Print'}</span>
                </button>

                <button
                  onClick={() => setPrintClient(null)}
                  className="p-1.5 rounded-xl bg-[#111722] hover:bg-[#151B26] border border-[#202735] text-[#9AA4B2]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content to Print */}
            <div className="space-y-6 text-xs text-[#F3F5F7]">
              
              {/* Identity Box */}
              <div className="p-5 rounded-2xl bg-[#111722] border border-[#202735] space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-white">{printClient.name}</h2>
                  {getStatusBadge(printClient.status)}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
                  <div>
                    <span className="text-[#64748B] block">Company / الشركة</span>
                    <span className="font-semibold">{printClient.company || '—'}</span>
                  </div>
                  <div>
                    <span className="text-[#64748B] block">Email / البريد</span>
                    <span className="font-mono">{printClient.email}</span>
                  </div>
                  <div>
                    <span className="text-[#64748B] block">Phone / الهاتف</span>
                    <span className="font-mono">{printClient.phone}</span>
                  </div>
                  <div>
                    <span className="text-[#64748B] block">Location / العنوان</span>
                    <span>{printClient.address || '—'}</span>
                  </div>
                </div>
              </div>

              {/* Private Notes */}
              {printClient.notes && (
                <div className="p-4 rounded-xl bg-[#111722]/50 border border-[#202735] space-y-1">
                  <span className="text-[10px] font-bold text-[#5B7CFA] uppercase">Confidential Notes</span>
                  <p className="text-[#9AA4B2] font-mono leading-relaxed">{printClient.notes}</p>
                </div>
              )}

              {/* Credentials List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-[#10B981]" />
                  <span>Credentials & Logins Directory</span>
                </h4>

                <div className="space-y-2.5">
                  {(printClient.credentials || []).map((c, i) => (
                    <div key={i} className="p-3.5 rounded-xl bg-[#111722] border border-[#202735] space-y-2 font-mono text-[11px]">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-xs">{c.title}</span>
                        <span className="text-[10px] text-[#64748B] uppercase">{c.type}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 border-t border-[#202735]/60 text-[10px]">
                        {c.url && <div><span className="text-[#64748B]">URL:</span> <span className="text-slate-300">{c.url}</span></div>}
                        {c.username && <div><span className="text-[#64748B]">User:</span> <span className="text-slate-300">{c.username}</span></div>}
                        {c.password && <div><span className="text-[#64748B]">Pass:</span> <span className="text-[#10B981] font-bold">{c.password}</span></div>}
                        {c.accessKey && <div><span className="text-[#64748B]">Key/Port:</span> <span className="text-amber-300">{c.accessKey}</span></div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* 6. Delete Confirmation Modal */}
      {clientToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0D111A] border border-red-500/30 rounded-2xl p-6 space-y-5 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center mx-auto border border-red-500/20">
              <Trash2 className="w-6 h-6" />
            </div>
            
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#F3F5F7]">
                {language === 'ar' ? 'تأكيد حذف العميل وسجلاته' : 'Delete Client & Credentials?'}
              </h3>
              <p className="text-xs text-[#9AA4B2] leading-relaxed">
                {language === 'ar'
                  ? `هل أنت متأكد من رغبتك في حذف ملف (${clientToDelete.name})؟ سيتم مسح جميع الحسابات وكلمات المرور المرتبطة به نهائياً.`
                  : `Are you sure you want to delete profile for (${clientToDelete.name})? All stored passwords and accounts will be permanently removed.`}
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setClientToDelete(null)}
                className="flex-1 py-2.5 rounded-xl bg-[#111722] hover:bg-[#151B26] border border-[#202735] text-[#9AA4B2] text-xs font-semibold cursor-pointer"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>

              <button
                onClick={handleDeleteClient}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold cursor-pointer shadow-lg shadow-red-500/20"
              >
                {language === 'ar' ? 'نعم، احذف' : 'Confirm Delete'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
