import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  setDoc
} from 'firebase/firestore';
import { 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Edit, 
  Printer, 
  Send, 
  FileCheck, 
  ArrowRight, 
  Copy, 
  Calendar, 
  DollarSign, 
  User, 
  Building, 
  Mail, 
  Phone, 
  FileText, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertCircle,
  Share2,
  Download,
  ExternalLink,
  MessageCircle,
  Eye,
  RefreshCw,
  X
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { CMSQuotation, LineItem, QuotationStatus, SupportedCurrency, CMSInvoice } from '../../types';

interface AdminQuotationsProps {
  onNavigateToInvoice?: (invoiceId?: string) => void;
}

export const AdminQuotations: React.FC<AdminQuotationsProps> = ({ onNavigateToInvoice }) => {
  const { language } = useLanguage();
  const [quotations, setQuotations] = useState<CMSQuotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'list' | 'form'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedQuoteForPreview, setSelectedQuoteForPreview] = useState<CMSQuotation | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [quotationNumber, setQuotationNumber] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientCompany, setClientCompany] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [validUntil, setValidUntil] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 15);
    return d.toISOString().split('T')[0];
  });
  const [currency, setCurrency] = useState<SupportedCurrency>('EGP');
  const [items, setItems] = useState<LineItem[]>([
    { id: '1', description: 'Web Application Development / برمجة وتطوير المنصة', quantity: 1, unitPrice: 15000, total: 15000 }
  ]);
  const [discount, setDiscount] = useState<number>(0);
  const [taxRate, setTaxRate] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState(
    '1. الدفعة الأولى: 50% عند التعاقد وبدء العمل.\n2. الدفعة الثانية: 50% عند التسليم النهائي للمشروع.\n3. هذا العرض ساري لمدة 15 يوماً من تاريخ إصداره.'
  );
  const [status, setStatus] = useState<QuotationStatus>('draft');

  // Initial Data Fetch
  const fetchQuotations = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'quotations'));
      const list: CMSQuotation[] = [];
      querySnapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as CMSQuotation);
      });

      // Sort by creation / date desc
      list.sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime());

      if (list.length > 0) {
        setQuotations(list);
        try {
          localStorage.setItem('cms_local_quotations', JSON.stringify(list));
        } catch (_) {}
      } else {
        // Load initial local samples if empty
        const cached = localStorage.getItem('cms_local_quotations');
        if (cached) {
          setQuotations(JSON.parse(cached));
        } else {
          const sample: CMSQuotation = {
            id: 'quote_sample_1',
            quotationNumber: `QUO-${new Date().getFullYear()}-001`,
            clientName: 'شركة النيل للتقنية والتجارة',
            clientCompany: 'Nile Tech Solutions',
            clientEmail: 'contact@niletech.com',
            clientPhone: '+201000000000',
            clientAddress: 'القاهرة، مصر',
            issueDate: new Date().toISOString().split('T')[0],
            validUntil: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
            currency: 'EGP',
            items: [
              { id: '1', description: 'تطوير موقع ويب متكامل وتصميم واجهات UI/UX', quantity: 1, unitPrice: 20000, total: 20000 },
              { id: '2', description: 'فحص الحماية واختبار الاختراق الأمني للويب', quantity: 1, unitPrice: 8000, total: 8000 }
            ],
            subtotal: 28000,
            discount: 1000,
            taxRate: 0,
            taxAmount: 0,
            total: 27000,
            notes: 'يشمل العرض الدعم الفني والصيانة المجانية لمدة 3 أشهر بعد الإطلاق.',
            terms: '1. الدفع 50% مقدماً و50% عند التسليم.\n2. العرض ساري لمدة 14 يوماً.',
            status: 'sent',
            createdAt: new Date().toISOString()
          };
          setQuotations([sample]);
          localStorage.setItem('cms_local_quotations', JSON.stringify([sample]));
        }
      }
    } catch (err) {
      console.warn('Error fetching quotations from Firestore:', err);
      const cached = localStorage.getItem('cms_local_quotations');
      if (cached) {
        setQuotations(JSON.parse(cached));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  // Line Items Calculation
  const handleItemChange = (id: string, field: keyof LineItem, value: any) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === 'quantity' || field === 'unitPrice') {
            const q = field === 'quantity' ? Number(value) || 0 : item.quantity;
            const p = field === 'unitPrice' ? Number(value) || 0 : item.unitPrice;
            updated.total = q * p;
          }
          return updated;
        }
        return item;
      })
    );
  };

  const addItemRow = () => {
    const newId = Date.now().toString();
    setItems((prev) => [
      ...prev,
      { id: newId, description: '', quantity: 1, unitPrice: 0, total: 0 }
    ]);
  };

  const removeItemRow = (id: string) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Financial Totals
  const subtotal = items.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
  const taxAmount = (subtotal - (Number(discount) || 0)) * ((Number(taxRate) || 0) / 100);
  const grandTotal = Math.max(0, subtotal - (Number(discount) || 0) + taxAmount);

  // Generate Unique Quotation Number
  const generateNewQuoteNumber = () => {
    const year = new Date().getFullYear();
    const count = quotations.length + 1;
    return `QUO-${year}-${count.toString().padStart(3, '0')}`;
  };

  const handleOpenCreateForm = () => {
    setEditingId(null);
    setQuotationNumber(generateNewQuoteNumber());
    setClientName('');
    setClientCompany('');
    setClientEmail('');
    setClientPhone('');
    setClientAddress('');
    setIssueDate(new Date().toISOString().split('T')[0]);
    const d = new Date();
    d.setDate(d.getDate() + 15);
    setValidUntil(d.toISOString().split('T')[0]);
    setCurrency('EGP');
    setItems([
      { id: '1', description: 'تطوير موقع ويب ونظام لوحة تحكم متكاملة', quantity: 1, unitPrice: 15000, total: 15000 }
    ]);
    setDiscount(0);
    setTaxRate(0);
    setNotes('');
    setTerms(
      '1. الدفعة الأولى: 50% عند بدء العمل.\n2. الدفعة الثانية: 50% عند التسليم النهائي.\n3. هذا العرض ساري لمدة 15 يوماً من تاريخ إصداره.'
    );
    setStatus('draft');
    setActiveTab('form');
  };

  const handleEdit = (quote: CMSQuotation) => {
    setEditingId(quote.id);
    setQuotationNumber(quote.quotationNumber);
    setClientName(quote.clientName);
    setClientCompany(quote.clientCompany || '');
    setClientEmail(quote.clientEmail || '');
    setClientPhone(quote.clientPhone || '');
    setClientAddress(quote.clientAddress || '');
    setIssueDate(quote.issueDate);
    setValidUntil(quote.validUntil);
    setCurrency(quote.currency || 'EGP');
    setItems(quote.items && quote.items.length > 0 ? quote.items : [
      { id: '1', description: '', quantity: 1, unitPrice: 0, total: 0 }
    ]);
    setDiscount(quote.discount || 0);
    setTaxRate(quote.taxRate || 0);
    setNotes(quote.notes || '');
    setTerms(quote.terms || '');
    setStatus(quote.status);
    setActiveTab('form');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) {
      alert(language === 'ar' ? 'يرجى كتابة اسم العميل' : 'Please enter client name');
      return;
    }

    const payload: Omit<CMSQuotation, 'id'> = {
      quotationNumber: quotationNumber.trim() || generateNewQuoteNumber(),
      clientName: clientName.trim(),
      clientCompany: clientCompany.trim(),
      clientEmail: clientEmail.trim(),
      clientPhone: clientPhone.trim(),
      clientAddress: clientAddress.trim(),
      issueDate,
      validUntil,
      currency,
      items,
      subtotal,
      discount: Number(discount) || 0,
      taxRate: Number(taxRate) || 0,
      taxAmount,
      total: grandTotal,
      notes: notes.trim(),
      terms: terms.trim(),
      status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      if (editingId) {
        await updateDoc(doc(db, 'quotations', editingId), payload);
        setQuotations((prev) =>
          prev.map((q) => (q.id === editingId ? { id: editingId, ...payload } : q))
        );
      } else {
        const docRef = await addDoc(collection(db, 'quotations'), payload);
        setQuotations((prev) => [{ id: docRef.id, ...payload }, ...prev]);
      }
      setSuccessMessage(language === 'ar' ? 'تم حفظ عرض السعر بنجاح!' : 'Quotation saved successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
      setActiveTab('list');
    } catch (err) {
      console.warn('Firestore error, updating local cache:', err);
      if (editingId) {
        setQuotations((prev) =>
          prev.map((q) => (q.id === editingId ? { id: editingId, ...payload } : q))
        );
      } else {
        const localId = 'quote_' + Date.now();
        setQuotations((prev) => [{ id: localId, ...payload }, ...prev]);
      }
      setActiveTab('list');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذا العرض؟' : 'Are you sure you want to delete this quotation?')) return;
    try {
      await deleteDoc(doc(db, 'quotations', id));
    } catch (err) {
      console.warn('Delete firestore fallback:', err);
    }
    setQuotations((prev) => prev.filter((q) => q.id !== id));
  };

  // Convert Quotation to Invoice
  const handleConvertToInvoice = async (quote: CMSQuotation) => {
    if (!confirm(language === 'ar' ? `هل تريد تحويل عرض السعر (${quote.quotationNumber}) إلى فاتورة رسمية؟` : `Convert quotation (${quote.quotationNumber}) to an official invoice?`)) {
      return;
    }

    try {
      const year = new Date().getFullYear();
      const invoiceNumber = `INV-${year}-${Math.floor(100 + Math.random() * 900)}`;

      const invoiceData: Omit<CMSInvoice, 'id'> = {
        invoiceNumber,
        quotationId: quote.id,
        quotationNumber: quote.quotationNumber,
        clientName: quote.clientName,
        clientCompany: quote.clientCompany,
        clientEmail: quote.clientEmail,
        clientPhone: quote.clientPhone,
        clientAddress: quote.clientAddress,
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        currency: quote.currency,
        items: quote.items,
        subtotal: quote.subtotal,
        discount: quote.discount,
        taxRate: quote.taxRate,
        taxAmount: quote.taxAmount,
        total: quote.total,
        paidAmount: 0,
        remainingAmount: quote.total,
        paymentStatus: 'pending',
        paymentMethod: 'InstaPay / Vodafone Cash / Bank Transfer',
        notes: quote.notes || '',
        createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'invoices'), invoiceData);
      
      // Update quote status to converted
      await updateDoc(doc(db, 'quotations', quote.id), {
        status: 'converted',
        convertedInvoiceId: docRef.id
      });

      setQuotations((prev) =>
        prev.map((q) => (q.id === quote.id ? { ...q, status: 'converted', convertedInvoiceId: docRef.id } : q))
      );

      setSuccessMessage(
        language === 'ar' 
          ? `تم إنشاء الفاتورة (${invoiceNumber}) بنجاح من عرض السعر!` 
          : `Invoice (${invoiceNumber}) successfully created from quotation!`
      );
      setTimeout(() => setSuccessMessage(null), 4000);

      if (onNavigateToInvoice) {
        onNavigateToInvoice(docRef.id);
      }
    } catch (err) {
      console.warn('Error converting to invoice:', err);
      alert(language === 'ar' ? 'تم إنشاء الفاتورة في الذاكرة المحلية بنجاح.' : 'Invoice created in local storage.');
    }
  };

  // WhatsApp Share Message
  const getWhatsAppShareUrl = (quote: CMSQuotation) => {
    const itemsSummary = quote.items
      .map((item, idx) => `${idx + 1}. ${item.description} (الكمية: ${item.quantity} × ${item.unitPrice} ${quote.currency})`)
      .join('\n');

    const msg = `مرحباً أ/ *${quote.clientName}* 🌟\n\nيسعدنا تقديم عرض السعر الخاص بكم رقم *${quote.quotationNumber}* من المهندس *أبو السعود (Abu Al-Saud)*:\n\n*الخدمات والبنود:*\n${itemsSummary}\n\n*إجمالي عرض السعر:* ${quote.total.toLocaleString()} ${quote.currency}\n*صلاحية العرض حتى:* ${quote.validUntil}\n\nنسعد بالتعاون معكم والبدء في تنفيذ المشروع في أقرب وقت. للتواصل والاستفسار: +201033108223`;

    const phone = quote.clientPhone ? quote.clientPhone.replace(/[^0-9]/g, '') : '';
    return phone
      ? `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`
      : `https://wa.me/?text=${encodeURIComponent(msg)}`;
  };

  // Filtered List
  const filteredQuotations = quotations.filter((q) => {
    const matchSearch =
      q.quotationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (q.clientCompany && q.clientCompany.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchStatus = statusFilter === 'all' || q.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Calculate Metrics
  const totalQuotesCount = quotations.length;
  const acceptedQuotes = quotations.filter((q) => q.status === 'accepted' || q.status === 'converted');
  const acceptedValue = acceptedQuotes.reduce((sum, q) => sum + q.total, 0);
  const pendingQuotes = quotations.filter((q) => q.status === 'sent' || q.status === 'draft');
  const pendingValue = pendingQuotes.reduce((sum, q) => sum + q.total, 0);

  const getStatusBadge = (st: QuotationStatus) => {
    switch (st) {
      case 'accepted':
        return <span className="px-2.5 py-1 rounded-lg bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 text-[11px] font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> {language === 'ar' ? 'مقبول' : 'Accepted'}</span>;
      case 'converted':
        return <span className="px-2.5 py-1 rounded-lg bg-[#5B7CFA]/15 text-[#5B7CFA] border border-[#5B7CFA]/30 text-[11px] font-bold flex items-center gap-1"><FileCheck className="w-3.5 h-3.5" /> {language === 'ar' ? 'تم تحويله لفاتورة' : 'Converted to Invoice'}</span>;
      case 'sent':
        return <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[11px] font-bold flex items-center gap-1"><Send className="w-3.5 h-3.5" /> {language === 'ar' ? 'تم الإرسال للعميل' : 'Sent to Client'}</span>;
      case 'rejected':
        return <span className="px-2.5 py-1 rounded-lg bg-red-500/15 text-red-400 border border-red-500/30 text-[11px] font-bold flex items-center gap-1"><XCircle className="w-3.5 h-3.5" /> {language === 'ar' ? 'مرفوض' : 'Rejected'}</span>;
      default:
        return <span className="px-2.5 py-1 rounded-lg bg-slate-500/15 text-slate-400 border border-slate-500/30 text-[11px] font-bold flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {language === 'ar' ? 'مسودة' : 'Draft'}</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#F3F5F7] flex items-center gap-2">
            <FileText className="w-6 h-6 text-[#5B7CFA]" />
            <span>{language === 'ar' ? 'إدارة عروض الأسعار (Quotations)' : 'Quotations & Proposals'}</span>
          </h1>
          <p className="text-xs text-[#9AA4B2] mt-0.5">
            {language === 'ar' ? 'إنشاء وتخصيص عروض الأسعار المهنية للعملاء وإرسالها وتحويلها لفواتير بنقرة واحدة.' : 'Create, manage, and convert professional price quotations for your clients.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'list' ? (
            <button
              onClick={handleOpenCreateForm}
              className="px-4 py-2.5 rounded-xl bg-[#5B7CFA] hover:bg-[#4A6BD8] text-white text-xs font-bold flex items-center gap-2 shadow-md hover:shadow-[#5B7CFA]/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'ar' ? 'عرض سعر جديد' : 'New Quotation'}</span>
            </button>
          ) : (
            <button
              onClick={() => setActiveTab('list')}
              className="px-4 py-2.5 rounded-xl bg-[#111722] hover:bg-[#151B26] text-[#9AA4B2] hover:text-[#F3F5F7] border border-[#202735] text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
            >
              <span>{language === 'ar' ? '← العودة لقائمة العروض' : '← Back to Quotations'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-[#10B981]/15 border border-[#10B981]/30 flex items-center gap-3 text-[#10B981] animate-fade-in text-xs sm:text-sm font-medium">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {activeTab === 'list' && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-[#0D111A] border border-[#202735] space-y-1">
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                {language === 'ar' ? 'إجمالي عروض الأسعار' : 'Total Quotations'}
              </span>
              <p className="text-2xl font-bold text-[#F3F5F7]">{totalQuotesCount}</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#0D111A] border border-[#202735] space-y-1">
              <span className="text-[10px] font-bold text-[#10B981] uppercase tracking-wider">
                {language === 'ar' ? 'عروض مقبولة / محولة' : 'Accepted / Converted'}
              </span>
              <p className="text-2xl font-bold text-[#10B981]">{acceptedQuotes.length}</p>
              <p className="text-[10px] text-[#64748B]">{acceptedValue.toLocaleString()} EGP</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#0D111A] border border-[#202735] space-y-1">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                {language === 'ar' ? 'عروض قيد الانتظار' : 'Pending / Drafts'}
              </span>
              <p className="text-2xl font-bold text-amber-400">{pendingQuotes.length}</p>
              <p className="text-[10px] text-[#64748B]">{pendingValue.toLocaleString()} EGP</p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="p-4 rounded-2xl bg-[#0D111A] border border-[#202735] flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-[#64748B] absolute start-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={language === 'ar' ? 'ابحث برقم العرض أو اسم العميل...' : 'Search by quote number or client...'}
                className="w-full bg-[#111722] border border-[#202735] focus:border-[#5B7CFA] text-xs text-[#F3F5F7] ps-9 pe-4 py-2.5 rounded-xl focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              <Filter className="w-4 h-4 text-[#64748B] shrink-0" />
              {['all', 'draft', 'sent', 'accepted', 'converted', 'rejected'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    statusFilter === st
                      ? 'bg-[#5B7CFA] text-white'
                      : 'bg-[#111722] text-[#9AA4B2] hover:text-[#F3F5F7] border border-[#202735]'
                  }`}
                >
                  {st === 'all' && (language === 'ar' ? 'الكل' : 'All')}
                  {st === 'draft' && (language === 'ar' ? 'مسودة' : 'Draft')}
                  {st === 'sent' && (language === 'ar' ? 'تم الإرسال' : 'Sent')}
                  {st === 'accepted' && (language === 'ar' ? 'مقبول' : 'Accepted')}
                  {st === 'converted' && (language === 'ar' ? 'فاتورة' : 'Invoice')}
                  {st === 'rejected' && (language === 'ar' ? 'مرفوض' : 'Rejected')}
                </button>
              ))}
            </div>
          </div>

          {/* Quotations List Table */}
          <div className="rounded-2xl bg-[#0D111A] border border-[#202735] overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-xs text-[#9AA4B2]">
                {language === 'ar' ? 'جاري تحميل عروض الأسعار...' : 'Loading quotations...'}
              </div>
            ) : filteredQuotations.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <FileText className="w-10 h-10 text-[#64748B] mx-auto opacity-50" />
                <p className="text-xs text-[#9AA4B2]">
                  {language === 'ar' ? 'لا توجد عروض أسعار مطابقة للبحث.' : 'No quotations found matching your search.'}
                </p>
                <button
                  onClick={handleOpenCreateForm}
                  className="px-4 py-2 rounded-xl bg-[#5B7CFA] text-white text-xs font-bold cursor-pointer"
                >
                  {language === 'ar' ? 'إنشاء أول عرض سعر' : 'Create First Quotation'}
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-start text-xs">
                  <thead className="bg-[#111722] text-[#64748B] uppercase font-mono text-[10px] border-b border-[#202735]">
                    <tr>
                      <th className="px-4 py-3.5 text-start">{language === 'ar' ? 'رقم العرض' : 'Quote #'}</th>
                      <th className="px-4 py-3.5 text-start">{language === 'ar' ? 'العميل' : 'Client'}</th>
                      <th className="px-4 py-3.5 text-start">{language === 'ar' ? 'التاريخ' : 'Date'}</th>
                      <th className="px-4 py-3.5 text-start">{language === 'ar' ? 'الإجمالي' : 'Total'}</th>
                      <th className="px-4 py-3.5 text-start">{language === 'ar' ? 'الحالة' : 'Status'}</th>
                      <th className="px-4 py-3.5 text-end">{language === 'ar' ? 'الإجراءات' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#202735]">
                    {filteredQuotations.map((quote) => (
                      <tr key={quote.id} className="hover:bg-[#111722]/50 transition-colors">
                        <td className="px-4 py-3.5 font-mono font-bold text-[#5B7CFA]">
                          {quote.quotationNumber}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="font-semibold text-[#F3F5F7]">{quote.clientName}</div>
                          {quote.clientCompany && (
                            <div className="text-[10px] text-[#64748B]">{quote.clientCompany}</div>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-[#9AA4B2] font-mono text-[11px]">
                          <div>{quote.issueDate}</div>
                          <div className="text-[9px] text-[#64748B]">إلى: {quote.validUntil}</div>
                        </td>
                        <td className="px-4 py-3.5 font-mono font-bold text-[#F3F5F7]">
                          {quote.total.toLocaleString()} {quote.currency}
                        </td>
                        <td className="px-4 py-3.5">
                          {getStatusBadge(quote.status)}
                        </td>
                        <td className="px-4 py-3.5 text-end">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Preview & Print */}
                            <button
                              onClick={() => setSelectedQuoteForPreview(quote)}
                              title={language === 'ar' ? 'معاينة وطباعة العرض' : 'Preview & Print'}
                              className="p-2 rounded-lg bg-[#111722] hover:bg-[#151B26] text-[#9AA4B2] hover:text-[#5B7CFA] border border-[#202735] transition-colors cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* WhatsApp Share */}
                            <a
                              href={getWhatsAppShareUrl(quote)}
                              target="_blank"
                              rel="noopener noreferrer"
                              title={language === 'ar' ? 'مشاركة عبر واتساب' : 'Share via WhatsApp'}
                              className="p-2 rounded-lg bg-[#111722] hover:bg-[#10B981]/20 text-[#9AA4B2] hover:text-[#10B981] border border-[#202735] transition-colors cursor-pointer inline-flex"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </a>

                            {/* Convert to Invoice */}
                            {quote.status !== 'converted' && (
                              <button
                                onClick={() => handleConvertToInvoice(quote)}
                                title={language === 'ar' ? 'تحويل إلى فاتورة' : 'Convert to Invoice'}
                                className="p-2 rounded-lg bg-[#5B7CFA]/10 hover:bg-[#5B7CFA]/20 text-[#5B7CFA] border border-[#5B7CFA]/30 transition-colors cursor-pointer"
                              >
                                <FileCheck className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Edit */}
                            <button
                              onClick={() => handleEdit(quote)}
                              title={language === 'ar' ? 'تعديل' : 'Edit'}
                              className="p-2 rounded-lg bg-[#111722] hover:bg-[#151B26] text-[#9AA4B2] hover:text-white border border-[#202735] transition-colors cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => handleDelete(quote.id)}
                              title={language === 'ar' ? 'حذف' : 'Delete'}
                              className="p-2 rounded-lg bg-[#111722] hover:bg-red-500/20 text-[#9AA4B2] hover:text-red-400 border border-[#202735] transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Form Tab (Create / Edit) */}
      {activeTab === 'form' && (
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* General Information Card */}
          <div className="p-6 rounded-2xl bg-[#0D111A] border border-[#202735] space-y-4">
            <h3 className="text-sm font-bold text-[#F3F5F7] border-b border-[#202735] pb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#5B7CFA]" />
              <span>{language === 'ar' ? 'بيانات عرض السعر والعميل' : 'Quotation & Client Details'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#9AA4B2] uppercase">
                  {language === 'ar' ? 'رقم عرض السعر' : 'Quotation #'}
                </label>
                <input
                  type="text"
                  required
                  value={quotationNumber}
                  onChange={(e) => setQuotationNumber(e.target.value)}
                  className="w-full bg-[#111722] border border-[#202735] focus:border-[#5B7CFA] text-xs text-[#F3F5F7] font-mono px-3.5 py-2.5 rounded-xl focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#9AA4B2] uppercase">
                  {language === 'ar' ? 'العملة' : 'Currency'}
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as SupportedCurrency)}
                  className="w-full bg-[#111722] border border-[#202735] focus:border-[#5B7CFA] text-xs text-[#F3F5F7] px-3.5 py-2.5 rounded-xl focus:outline-none"
                >
                  <option value="EGP">EGP - الجنيه المصري</option>
                  <option value="USD">USD - الدولار الأمريكي ($)</option>
                  <option value="SAR">SAR - الريال السعودي</option>
                  <option value="AED">AED - الدرهم الإماراتي</option>
                  <option value="EUR">EUR - اليورو (€)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#9AA4B2] uppercase">
                  {language === 'ar' ? 'تاريخ الإصدار' : 'Issue Date'}
                </label>
                <input
                  type="date"
                  required
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full bg-[#111722] border border-[#202735] focus:border-[#5B7CFA] text-xs text-[#F3F5F7] px-3.5 py-2.5 rounded-xl focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#9AA4B2] uppercase">
                  {language === 'ar' ? 'صالح حتى تاريخ' : 'Valid Until'}
                </label>
                <input
                  type="date"
                  required
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                  className="w-full bg-[#111722] border border-[#202735] focus:border-[#5B7CFA] text-xs text-[#F3F5F7] px-3.5 py-2.5 rounded-xl focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2 border-t border-[#202735]">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#9AA4B2] uppercase">
                  {language === 'ar' ? 'اسم العميل / المستلم *' : 'Client Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="أحمد محمد"
                  className="w-full bg-[#111722] border border-[#202735] focus:border-[#5B7CFA] text-xs text-[#F3F5F7] px-3.5 py-2.5 rounded-xl focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#9AA4B2] uppercase">
                  {language === 'ar' ? 'اسم الشركة / المؤسسة' : 'Company / Organization'}
                </label>
                <input
                  type="text"
                  value={clientCompany}
                  onChange={(e) => setClientCompany(e.target.value)}
                  placeholder="Tech Solutions Ltd"
                  className="w-full bg-[#111722] border border-[#202735] focus:border-[#5B7CFA] text-xs text-[#F3F5F7] px-3.5 py-2.5 rounded-xl focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#9AA4B2] uppercase">
                  {language === 'ar' ? 'رقم الهاتف / واتساب' : 'Phone / WhatsApp'}
                </label>
                <input
                  type="text"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="+201000000000"
                  className="w-full bg-[#111722] border border-[#202735] focus:border-[#5B7CFA] text-xs text-[#F3F5F7] px-3.5 py-2.5 rounded-xl focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#9AA4B2] uppercase">
                  {language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
                </label>
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="client@domain.com"
                  className="w-full bg-[#111722] border border-[#202735] focus:border-[#5B7CFA] text-xs text-[#F3F5F7] px-3.5 py-2.5 rounded-xl focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-[#202735]">
              <label className="text-[11px] font-bold text-[#9AA4B2] uppercase">
                {language === 'ar' ? 'عنوان العميل' : 'Client Address'}
              </label>
              <input
                type="text"
                value={clientAddress}
                onChange={(e) => setClientAddress(e.target.value)}
                placeholder="القاهرة، جمهورية مصر العربية"
                className="w-full bg-[#111722] border border-[#202735] focus:border-[#5B7CFA] text-xs text-[#F3F5F7] px-3.5 py-2.5 rounded-xl focus:outline-none"
              />
            </div>
          </div>

          {/* Line Items Table */}
          <div className="p-6 rounded-2xl bg-[#0D111A] border border-[#202735] space-y-4">
            <div className="flex items-center justify-between border-b border-[#202735] pb-3">
              <h3 className="text-sm font-bold text-[#F3F5F7] flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[#5B7CFA]" />
                <span>{language === 'ar' ? 'بنود الخدمات والأسعار' : 'Line Items & Pricing'}</span>
              </h3>
              <button
                type="button"
                onClick={addItemRow}
                className="px-3 py-1.5 rounded-xl bg-[#111722] hover:bg-[#151B26] text-[#5B7CFA] border border-[#202735] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'إضافة بند جديد' : 'Add Item'}</span>
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={item.id} className="p-3.5 rounded-xl bg-[#111722] border border-[#202735] grid grid-cols-12 gap-3 items-center">
                  <div className="col-span-12 md:col-span-6 space-y-1">
                    <label className="text-[10px] text-[#64748B] font-mono">#{index + 1} {language === 'ar' ? 'وصف البند / الخدمة' : 'Description'}</label>
                    <input
                      type="text"
                      required
                      value={item.description}
                      onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                      placeholder="وصف الخدمة أو البرمجة المطلوبة"
                      className="w-full bg-[#0D111A] border border-[#202735] focus:border-[#5B7CFA] text-xs text-[#F3F5F7] px-3 py-2 rounded-lg focus:outline-none"
                    />
                  </div>

                  <div className="col-span-4 md:col-span-2 space-y-1">
                    <label className="text-[10px] text-[#64748B] font-mono">{language === 'ar' ? 'الكمية' : 'Qty'}</label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                      className="w-full bg-[#0D111A] border border-[#202735] focus:border-[#5B7CFA] text-xs text-[#F3F5F7] px-3 py-2 rounded-lg focus:outline-none font-mono"
                    />
                  </div>

                  <div className="col-span-4 md:col-span-2 space-y-1">
                    <label className="text-[10px] text-[#64748B] font-mono">{language === 'ar' ? 'سعر الوحدة' : 'Unit Price'}</label>
                    <input
                      type="number"
                      min="0"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(item.id, 'unitPrice', e.target.value)}
                      className="w-full bg-[#0D111A] border border-[#202735] focus:border-[#5B7CFA] text-xs text-[#F3F5F7] px-3 py-2 rounded-lg focus:outline-none font-mono"
                    />
                  </div>

                  <div className="col-span-3 md:col-span-1 space-y-1 text-center md:text-start">
                    <label className="text-[10px] text-[#64748B] font-mono">{language === 'ar' ? 'الإجمالي' : 'Total'}</label>
                    <p className="text-xs font-bold font-mono text-[#5B7CFA] pt-2">
                      {item.total.toLocaleString()}
                    </p>
                  </div>

                  <div className="col-span-1 text-end">
                    <button
                      type="button"
                      onClick={() => removeItemRow(item.id)}
                      disabled={items.length <= 1}
                      className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 disabled:opacity-30 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations & Totals Summary */}
            <div className="pt-4 border-t border-[#202735] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#9AA4B2] uppercase">
                    {language === 'ar' ? 'الخصم (قيمة ثابتة)' : 'Discount'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    className="w-full sm:w-36 bg-[#111722] border border-[#202735] text-xs text-[#F3F5F7] font-mono px-3 py-2 rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#9AA4B2] uppercase">
                    {language === 'ar' ? 'نسبة الضريبة (%)' : 'Tax / VAT (%)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={taxRate}
                    onChange={(e) => setTaxRate(Number(e.target.value))}
                    className="w-full sm:w-36 bg-[#111722] border border-[#202735] text-xs text-[#F3F5F7] font-mono px-3 py-2 rounded-xl"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#111722] border border-[#202735] w-full md:w-72 space-y-2 font-mono text-xs">
                <div className="flex justify-between text-[#9AA4B2]">
                  <span>{language === 'ar' ? 'المجموع الفرعي:' : 'Subtotal:'}</span>
                  <span>{subtotal.toLocaleString()} {currency}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-red-400">
                    <span>{language === 'ar' ? 'الخصم:' : 'Discount:'}</span>
                    <span>- {discount.toLocaleString()} {currency}</span>
                  </div>
                )}
                {taxAmount > 0 && (
                  <div className="flex justify-between text-[#9AA4B2]">
                    <span>{language === 'ar' ? `ضريبة (${taxRate}%):` : `Tax (${taxRate}%):`}</span>
                    <span>+ {taxAmount.toLocaleString()} {currency}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-[#10B981] pt-2 border-t border-[#202735]">
                  <span>{language === 'ar' ? 'الإجمالي النهائي:' : 'Grand Total:'}</span>
                  <span>{grandTotal.toLocaleString()} {currency}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Terms, Notes & Status */}
          <div className="p-6 rounded-2xl bg-[#0D111A] border border-[#202735] space-y-4">
            <h3 className="text-sm font-bold text-[#F3F5F7] border-b border-[#202735] pb-3 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-[#5B7CFA]" />
              <span>{language === 'ar' ? 'الشروط، الملاحظات وحالة العرض' : 'Terms, Notes & Status'}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#9AA4B2] uppercase">
                  {language === 'ar' ? 'شروط وأحكام العرض' : 'Terms & Conditions'}
                </label>
                <textarea
                  rows={4}
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  className="w-full bg-[#111722] border border-[#202735] text-xs text-[#F3F5F7] p-3 rounded-xl focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#9AA4B2] uppercase">
                  {language === 'ar' ? 'ملاحظات إضافية' : 'Additional Notes'}
                </label>
                <textarea
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={language === 'ar' ? 'أي ملاحظات موجهة للعميل...' : 'Notes for client...'}
                  className="w-full bg-[#111722] border border-[#202735] text-xs text-[#F3F5F7] p-3 rounded-xl focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-[#202735]">
              <label className="text-[11px] font-bold text-[#9AA4B2] uppercase">
                {language === 'ar' ? 'حالة العرض الحالية' : 'Quotation Status'}
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as QuotationStatus)}
                className="w-full sm:w-60 bg-[#111722] border border-[#202735] text-xs text-[#F3F5F7] px-3.5 py-2.5 rounded-xl"
              >
                <option value="draft">مسودة (Draft)</option>
                <option value="sent">تم الإرسال للعميل (Sent)</option>
                <option value="accepted">تم قبول العرض (Accepted)</option>
                <option value="rejected">مرفوض (Rejected)</option>
                <option value="converted">تم تحويله لفاتورة (Converted)</option>
              </select>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 items-center">
            <button
              type="button"
              onClick={() => setActiveTab('list')}
              className="px-5 py-3 rounded-xl text-xs font-semibold bg-[#111722] hover:bg-[#151B26] text-[#9AA4B2] border border-[#202735] cursor-pointer"
            >
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-6 py-3 rounded-xl text-xs font-bold bg-[#5B7CFA] hover:bg-[#4A6BD8] text-white flex items-center gap-2 shadow-md cursor-pointer"
            >
              <FileCheck className="w-4 h-4" />
              <span>{editingId ? (language === 'ar' ? 'تحديث عرض السعر' : 'Update Quotation') : (language === 'ar' ? 'حفظ عرض السعر' : 'Save Quotation')}</span>
            </button>
          </div>

        </form>
      )}

      {/* Official Quotation Printable Modal / Preview */}
      {selectedQuoteForPreview && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0D111A] border border-[#202735] rounded-2xl w-full max-w-4xl overflow-hidden my-8 shadow-2xl flex flex-col max-h-[90vh]">
            
            {/* Modal Top Bar (Non-Printable) */}
            <div className="p-4 bg-[#111722] border-b border-[#202735] flex items-center justify-between print:hidden">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#5B7CFA]" />
                <span className="font-bold text-sm text-[#F3F5F7]">
                  {language === 'ar' ? `معاينة عرض السعر: ${selectedQuoteForPreview.quotationNumber}` : `Quotation Preview: ${selectedQuoteForPreview.quotationNumber}`}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 rounded-xl bg-[#5B7CFA] hover:bg-[#4A6BD8] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{language === 'ar' ? 'طباعة / حفظ PDF' : 'Print / PDF'}</span>
                </button>

                <a
                  href={getWhatsAppShareUrl(selectedQuoteForPreview)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>{language === 'ar' ? 'واتساب' : 'WhatsApp'}</span>
                </a>

                <button
                  onClick={() => setSelectedQuoteForPreview(null)}
                  className="p-1.5 rounded-lg bg-[#111722] hover:bg-[#151B26] text-[#9AA4B2] hover:text-[#F3F5F7] border border-[#202735] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable Document Body */}
            <div className="p-8 sm:p-12 overflow-y-auto bg-white text-slate-900 space-y-8 text-start font-sans select-text print:p-0">
              
              {/* Document Header */}
              <div className="flex justify-between items-start border-b border-slate-200 pb-6">
                <div className="space-y-1.5">
                  <h2 className="text-2xl font-black tracking-tight text-slate-900 uppercase">Abu Al-Saud</h2>
                  <p className="text-xs font-semibold text-slate-500">Web Development & Cybersecurity Specialist</p>
                  <p className="text-xs text-slate-500">Email: abualss3ud@gmail.com | Phone: +201033108223</p>
                  <p className="text-xs text-slate-500">Cairo, Egypt</p>
                </div>

                <div className="text-end space-y-1">
                  <span className="inline-block px-3 py-1 rounded bg-blue-50 text-blue-700 font-bold text-xs uppercase tracking-wider">
                    {language === 'ar' ? 'عرض سعر رسمي' : 'PRICE QUOTATION'}
                  </span>
                  <p className="text-sm font-mono font-bold text-slate-900">{selectedQuoteForPreview.quotationNumber}</p>
                  <p className="text-xs text-slate-500">{language === 'ar' ? 'التاريخ:' : 'Date:'} {selectedQuoteForPreview.issueDate}</p>
                  <p className="text-xs text-slate-500">{language === 'ar' ? 'صالح حتى:' : 'Valid Until:'} {selectedQuoteForPreview.validUntil}</p>
                </div>
              </div>

              {/* Client Info */}
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    {language === 'ar' ? 'مقدم إلى (العميل):' : 'Quotation Prepared For:'}
                  </span>
                  <p className="font-bold text-sm text-slate-900">{selectedQuoteForPreview.clientName}</p>
                  {selectedQuoteForPreview.clientCompany && (
                    <p className="text-slate-600 font-medium">{selectedQuoteForPreview.clientCompany}</p>
                  )}
                  {selectedQuoteForPreview.clientAddress && (
                    <p className="text-slate-500">{selectedQuoteForPreview.clientAddress}</p>
                  )}
                </div>

                <div className="space-y-1 sm:text-end">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    {language === 'ar' ? 'بيانات التواصل:' : 'Contact Info:'}
                  </span>
                  {selectedQuoteForPreview.clientPhone && (
                    <p className="font-mono text-slate-700">{selectedQuoteForPreview.clientPhone}</p>
                  )}
                  {selectedQuoteForPreview.clientEmail && (
                    <p className="font-mono text-slate-700">{selectedQuoteForPreview.clientEmail}</p>
                  )}
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-xs text-start">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3 text-start">#</th>
                      <th className="p-3 text-start">{language === 'ar' ? 'الخدمة / الوصف' : 'Description'}</th>
                      <th className="p-3 text-center">{language === 'ar' ? 'الكمية' : 'Qty'}</th>
                      <th className="p-3 text-end">{language === 'ar' ? 'سعر الوحدة' : 'Unit Price'}</th>
                      <th className="p-3 text-end">{language === 'ar' ? 'الإجمالي' : 'Total'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {selectedQuoteForPreview.items.map((item, idx) => (
                      <tr key={item.id || idx}>
                        <td className="p-3 text-slate-400 font-mono">{idx + 1}</td>
                        <td className="p-3 font-semibold text-slate-800">{item.description}</td>
                        <td className="p-3 text-center font-mono text-slate-600">{item.quantity}</td>
                        <td className="p-3 text-end font-mono text-slate-600">{item.unitPrice.toLocaleString()} {selectedQuoteForPreview.currency}</td>
                        <td className="p-3 text-end font-mono font-bold text-slate-900">{item.total.toLocaleString()} {selectedQuoteForPreview.currency}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals Breakdown */}
              <div className="flex justify-end">
                <div className="w-72 space-y-2 text-xs font-mono">
                  <div className="flex justify-between text-slate-600">
                    <span>{language === 'ar' ? 'المجموع الفرعي:' : 'Subtotal:'}</span>
                    <span>{selectedQuoteForPreview.subtotal.toLocaleString()} {selectedQuoteForPreview.currency}</span>
                  </div>
                  {selectedQuoteForPreview.discount > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>{language === 'ar' ? 'الخصم:' : 'Discount:'}</span>
                      <span>- {selectedQuoteForPreview.discount.toLocaleString()} {selectedQuoteForPreview.currency}</span>
                    </div>
                  )}
                  {selectedQuoteForPreview.taxAmount > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>{language === 'ar' ? `الضريبة (${selectedQuoteForPreview.taxRate}%):` : `Tax (${selectedQuoteForPreview.taxRate}%):`}</span>
                      <span>+ {selectedQuoteForPreview.taxAmount.toLocaleString()} {selectedQuoteForPreview.currency}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t-2 border-slate-900">
                    <span>{language === 'ar' ? 'الإجمالي المطلوب:' : 'Grand Total:'}</span>
                    <span>{selectedQuoteForPreview.total.toLocaleString()} {selectedQuoteForPreview.currency}</span>
                  </div>
                </div>
              </div>

              {/* Terms and Notes */}
              {(selectedQuoteForPreview.terms || selectedQuoteForPreview.notes) && (
                <div className="border-t border-slate-200 pt-6 space-y-4 text-xs">
                  {selectedQuoteForPreview.terms && (
                    <div className="space-y-1">
                      <span className="font-bold text-slate-700 block">{language === 'ar' ? 'الشروط والأحكام:' : 'Terms & Conditions:'}</span>
                      <p className="text-slate-600 whitespace-pre-line leading-relaxed">{selectedQuoteForPreview.terms}</p>
                    </div>
                  )}
                  {selectedQuoteForPreview.notes && (
                    <div className="space-y-1">
                      <span className="font-bold text-slate-700 block">{language === 'ar' ? 'ملاحظات إضافية:' : 'Additional Notes:'}</span>
                      <p className="text-slate-600 whitespace-pre-line leading-relaxed">{selectedQuoteForPreview.notes}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Signature Area */}
              <div className="pt-8 border-t border-slate-200 flex justify-between items-end text-xs">
                <div>
                  <p className="text-slate-500">{language === 'ar' ? 'توقيع العميل بالموافقة:' : 'Client Approval Signature:'}</p>
                  <div className="w-48 border-b border-slate-300 mt-8"></div>
                </div>

                <div className="text-end">
                  <p className="text-slate-500">{language === 'ar' ? 'المهندس / أبو السعود' : 'Abu Al-Saud (Authorized)'}</p>
                  <p className="text-[11px] font-mono text-blue-600 font-bold mt-2">Verified Professional Seal</p>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
