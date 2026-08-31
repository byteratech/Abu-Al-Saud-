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
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Edit, 
  Printer, 
  Send, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText, 
  Receipt, 
  CreditCard, 
  X, 
  MessageCircle, 
  Eye, 
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  Download,
  Building
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { CMSInvoice, LineItem, InvoiceStatus, SupportedCurrency, CMSQuotation } from '../../types';

interface AdminInvoicesProps {
  initialInvoiceId?: string;
}

export const AdminInvoices: React.FC<AdminInvoicesProps> = ({ initialInvoiceId }) => {
  const { language } = useLanguage();
  const [invoices, setInvoices] = useState<CMSInvoice[]>([]);
  const [quotations, setQuotations] = useState<CMSQuotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'list' | 'form'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedInvoiceForPreview, setSelectedInvoiceForPreview] = useState<CMSInvoice | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [quotationId, setQuotationId] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientCompany, setClientCompany] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });
  const [currency, setCurrency] = useState<SupportedCurrency>('EGP');
  const [items, setItems] = useState<LineItem[]>([
    { id: '1', description: 'تطوير موقع ويب وتأمين السيرفر', quantity: 1, unitPrice: 20000, total: 20000 }
  ]);
  const [discount, setDiscount] = useState<number>(0);
  const [taxRate, setTaxRate] = useState<number>(0);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [paymentStatus, setPaymentStatus] = useState<InvoiceStatus>('pending');
  const [paymentMethod, setPaymentMethod] = useState('InstaPay / Vodafone Cash');
  const [paymentDetails, setPaymentDetails] = useState(
    '1. InstaPay: abualsaud@instapay\n2. Vodafone Cash: 01033108223\n3. تحويل بنكي / CIB Bank IBAN: EG0000000000000000000000'
  );
  const [notes, setNotes] = useState('شكراً لثقتكم وتعاملكم معنا!');

  // Initial Fetch Invoices & Quotations
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 1. Invoices
      const invSnap = await getDocs(collection(db, 'invoices'));
      const invList: CMSInvoice[] = [];
      invSnap.forEach((d) => {
        invList.push({ id: d.id, ...d.data() } as CMSInvoice);
      });
      invList.sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime());

      if (invList.length > 0) {
        setInvoices(invList);
        localStorage.setItem('cms_local_invoices', JSON.stringify(invList));
      } else {
        const cached = localStorage.getItem('cms_local_invoices');
        if (cached) {
          setInvoices(JSON.parse(cached));
        } else {
          const sample: CMSInvoice = {
            id: 'inv_sample_1',
            invoiceNumber: `INV-${new Date().getFullYear()}-001`,
            quotationNumber: `QUO-${new Date().getFullYear()}-001`,
            clientName: 'شركة النيل للتقنية والتجارة',
            clientCompany: 'Nile Tech Solutions',
            clientEmail: 'contact@niletech.com',
            clientPhone: '+201000000000',
            clientAddress: 'القاهرة، مصر',
            issueDate: new Date().toISOString().split('T')[0],
            dueDate: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
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
            paidAmount: 13500,
            remainingAmount: 13500,
            paymentStatus: 'partially_paid',
            paymentMethod: 'Vodafone Cash & InstaPay',
            paymentDetails: 'Vodafone Cash: 01033108223 | InstaPay: abualsaud@instapay',
            notes: 'تم سداد الدفعة الأولى مقدماً، والمتبقي عند اكتمال التسليم النهائي.',
            createdAt: new Date().toISOString()
          };
          setInvoices([sample]);
          localStorage.setItem('cms_local_invoices', JSON.stringify([sample]));
        }
      }

      // 2. Quotations for linking
      const quoSnap = await getDocs(collection(db, 'quotations'));
      const quoList: CMSQuotation[] = [];
      quoSnap.forEach((d) => {
        quoList.push({ id: d.id, ...d.data() } as CMSQuotation);
      });
      setQuotations(quoList);

    } catch (err) {
      console.warn('Error fetching invoices from Firestore:', err);
      const cached = localStorage.getItem('cms_local_invoices');
      if (cached) {
        setInvoices(JSON.parse(cached));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Line Items Handling
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

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
  const taxAmount = (subtotal - (Number(discount) || 0)) * ((Number(taxRate) || 0) / 100);
  const grandTotal = Math.max(0, subtotal - (Number(discount) || 0) + taxAmount);
  const remainingAmount = Math.max(0, grandTotal - (Number(paidAmount) || 0));

  // Generate Unique Invoice Number
  const generateNewInvoiceNumber = () => {
    const year = new Date().getFullYear();
    const count = invoices.length + 1;
    return `INV-${year}-${count.toString().padStart(3, '0')}`;
  };

  const handleOpenCreateForm = () => {
    setEditingId(null);
    setInvoiceNumber(generateNewInvoiceNumber());
    setQuotationId('');
    setClientName('');
    setClientCompany('');
    setClientEmail('');
    setClientPhone('');
    setClientAddress('');
    setIssueDate(new Date().toISOString().split('T')[0]);
    const d = new Date();
    d.setDate(d.getDate() + 14);
    setDueDate(d.toISOString().split('T')[0]);
    setCurrency('EGP');
    setItems([
      { id: '1', description: 'تطوير موقع ويب ونظام إدارة محتوى', quantity: 1, unitPrice: 20000, total: 20000 }
    ]);
    setDiscount(0);
    setTaxRate(0);
    setPaidAmount(0);
    setPaymentStatus('pending');
    setPaymentMethod('InstaPay / Vodafone Cash');
    setPaymentDetails(
      '1. InstaPay: abualsaud@instapay\n2. Vodafone Cash: 01033108223\n3. تحويل بنكي / CIB Bank IBAN: EG0000000000000000000000'
    );
    setNotes('شكراً لتعاملكم معنا! يسعدنا خدمتكم دائماً.');
    setActiveTab('form');
  };

  // Populate from chosen Quotation
  const handleSelectQuotation = (qId: string) => {
    setQuotationId(qId);
    if (!qId) return;
    const selected = quotations.find((q) => q.id === qId);
    if (selected) {
      setClientName(selected.clientName);
      setClientCompany(selected.clientCompany || '');
      setClientEmail(selected.clientEmail || '');
      setClientPhone(selected.clientPhone || '');
      setClientAddress(selected.clientAddress || '');
      setCurrency(selected.currency || 'EGP');
      setItems(selected.items || []);
      setDiscount(selected.discount || 0);
      setTaxRate(selected.taxRate || 0);
      setNotes(selected.notes || 'فاتورة مستحقة بناءً على عرض السعر المعتمد.');
    }
  };

  const handleEdit = (inv: CMSInvoice) => {
    setEditingId(inv.id);
    setInvoiceNumber(inv.invoiceNumber);
    setQuotationId(inv.quotationId || '');
    setClientName(inv.clientName);
    setClientCompany(inv.clientCompany || '');
    setClientEmail(inv.clientEmail || '');
    setClientPhone(inv.clientPhone || '');
    setClientAddress(inv.clientAddress || '');
    setIssueDate(inv.issueDate);
    setDueDate(inv.dueDate);
    setCurrency(inv.currency || 'EGP');
    setItems(inv.items && inv.items.length > 0 ? inv.items : [
      { id: '1', description: '', quantity: 1, unitPrice: 0, total: 0 }
    ]);
    setDiscount(inv.discount || 0);
    setTaxRate(inv.taxRate || 0);
    setPaidAmount(inv.paidAmount || 0);
    setPaymentStatus(inv.paymentStatus);
    setPaymentMethod(inv.paymentMethod || 'InstaPay / Vodafone Cash');
    setPaymentDetails(inv.paymentDetails || '');
    setNotes(inv.notes || '');
    setActiveTab('form');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) {
      alert(language === 'ar' ? 'يرجى كتابة اسم العميل' : 'Please enter client name');
      return;
    }

    // Auto calculate status based on paid amount
    let calculatedStatus = paymentStatus;
    if (paidAmount >= grandTotal && grandTotal > 0) {
      calculatedStatus = 'paid';
    } else if (paidAmount > 0 && paidAmount < grandTotal) {
      calculatedStatus = 'partially_paid';
    }

    const payload: Omit<CMSInvoice, 'id'> = {
      invoiceNumber: invoiceNumber.trim() || generateNewInvoiceNumber(),
      quotationId: quotationId || undefined,
      clientName: clientName.trim(),
      clientCompany: clientCompany.trim(),
      clientEmail: clientEmail.trim(),
      clientPhone: clientPhone.trim(),
      clientAddress: clientAddress.trim(),
      issueDate,
      dueDate,
      currency,
      items,
      subtotal,
      discount: Number(discount) || 0,
      taxRate: Number(taxRate) || 0,
      taxAmount,
      total: grandTotal,
      paidAmount: Number(paidAmount) || 0,
      remainingAmount,
      paymentStatus: calculatedStatus,
      paymentMethod: paymentMethod.trim(),
      paymentDetails: paymentDetails.trim(),
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      if (editingId) {
        await updateDoc(doc(db, 'invoices', editingId), payload);
        setInvoices((prev) =>
          prev.map((inv) => (inv.id === editingId ? { id: editingId, ...payload } : inv))
        );
      } else {
        const docRef = await addDoc(collection(db, 'invoices'), payload);
        setInvoices((prev) => [{ id: docRef.id, ...payload }, ...prev]);
      }
      setSuccessMessage(language === 'ar' ? 'تم حفظ الفاتورة بنجاح!' : 'Invoice saved successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
      setActiveTab('list');
    } catch (err) {
      console.warn('Firestore error, caching locally:', err);
      if (editingId) {
        setInvoices((prev) =>
          prev.map((inv) => (inv.id === editingId ? { id: editingId, ...payload } : inv))
        );
      } else {
        const localId = 'inv_' + Date.now();
        setInvoices((prev) => [{ id: localId, ...payload }, ...prev]);
      }
      setActiveTab('list');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذه الفاتورة؟' : 'Are you sure you want to delete this invoice?')) return;
    try {
      await deleteDoc(doc(db, 'invoices', id));
    } catch (err) {
      console.warn('Delete firestore fallback:', err);
    }
    setInvoices((prev) => prev.filter((i) => i.id !== id));
  };

  // Mark as Paid
  const handleMarkAsPaid = async (inv: CMSInvoice) => {
    try {
      await updateDoc(doc(db, 'invoices', inv.id), {
        paidAmount: inv.total,
        remainingAmount: 0,
        paymentStatus: 'paid',
        updatedAt: new Date().toISOString()
      });
      setInvoices((prev) =>
        prev.map((i) =>
          i.id === inv.id ? { ...i, paidAmount: inv.total, remainingAmount: 0, paymentStatus: 'paid' } : i
        )
      );
      setSuccessMessage(language === 'ar' ? `تم تسجيل سداد الفاتورة (${inv.invoiceNumber}) بالكامل!` : `Invoice (${inv.invoiceNumber}) marked as paid in full!`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.warn('Error marking as paid:', err);
      setInvoices((prev) =>
        prev.map((i) =>
          i.id === inv.id ? { ...i, paidAmount: inv.total, remainingAmount: 0, paymentStatus: 'paid' } : i
        )
      );
    }
  };

  // WhatsApp Share Invoice
  const getWhatsAppShareUrl = (inv: CMSInvoice) => {
    const isFullyPaid = inv.paymentStatus === 'paid';
    const statusText = isFullyPaid ? '✅ مدفوعة بالكامل' : `⏳ قيد السداد (المتبقي: ${inv.remainingAmount.toLocaleString()} ${inv.currency})`;

    const msg = `مرحباً أ/ *${inv.clientName}* 🌟\n\nإشعار فاتورة رقم *${inv.invoiceNumber}* من المهندس *أبو السعود (Abu Al-Saud)*:\n\n*إجمالي الفاتورة:* ${inv.total.toLocaleString()} ${inv.currency}\n*حالة الدفع:* ${statusText}\n*تاريخ الاستحقاق:* ${inv.dueDate}\n\n*طرق التحويل المتاحة:*\n- فودافون كاش: 01033108223\n- انستاباي (InstaPay): abualsaud@instapay\n\nشكراً لتعاملكم ويسعدنا دائماً خدمتكم. للتواصل: +201033108223`;

    const phone = inv.clientPhone ? inv.clientPhone.replace(/[^0-9]/g, '') : '';
    return phone
      ? `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`
      : `https://wa.me/?text=${encodeURIComponent(msg)}`;
  };

  // Filters & Metrics
  const filteredInvoices = invoices.filter((inv) => {
    const matchSearch =
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inv.clientCompany && inv.clientCompany.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchStatus = statusFilter === 'all' || inv.paymentStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.total, 0);
  const totalCollected = invoices.reduce((sum, inv) => sum + (inv.paidAmount || 0), 0);
  const totalReceivables = Math.max(0, totalInvoiced - totalCollected);

  const getStatusBadge = (st: InvoiceStatus) => {
    switch (st) {
      case 'paid':
        return <span className="px-2.5 py-1 rounded-lg bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 text-[11px] font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> {language === 'ar' ? 'مدفوعة بالكامل' : 'Paid in Full'}</span>;
      case 'partially_paid':
        return <span className="px-2.5 py-1 rounded-lg bg-blue-500/15 text-blue-400 border border-blue-500/30 text-[11px] font-bold flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5" /> {language === 'ar' ? 'سداد جزئي' : 'Partially Paid'}</span>;
      case 'overdue':
        return <span className="px-2.5 py-1 rounded-lg bg-red-500/15 text-red-400 border border-red-500/30 text-[11px] font-bold flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {language === 'ar' ? 'متأخرة' : 'Overdue'}</span>;
      case 'cancelled':
        return <span className="px-2.5 py-1 rounded-lg bg-slate-500/15 text-slate-400 border border-slate-500/30 text-[11px] font-bold flex items-center gap-1"><X className="w-3.5 h-3.5" /> {language === 'ar' ? 'ملغاة' : 'Cancelled'}</span>;
      default:
        return <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[11px] font-bold flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {language === 'ar' ? 'قيد السداد' : 'Pending'}</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#F3F5F7] flex items-center gap-2">
            <Receipt className="w-6 h-6 text-[#5B7CFA]" />
            <span>{language === 'ar' ? 'إدارة الفواتير والتحصيلات (Invoices)' : 'Invoices & Billing'}</span>
          </h1>
          <p className="text-xs text-[#9AA4B2] mt-0.5">
            {language === 'ar' ? 'إصدار الفواتير الرسمية للعملاء، متابعة السداد والتحويلات البنكية ومشاركة الإيصالات.' : 'Issue professional invoices, track payments & receivables, and generate PDF receipts.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'list' ? (
            <button
              onClick={handleOpenCreateForm}
              className="px-4 py-2.5 rounded-xl bg-[#5B7CFA] hover:bg-[#4A6BD8] text-white text-xs font-bold flex items-center gap-2 shadow-md hover:shadow-[#5B7CFA]/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'ar' ? 'فاتورة جديدة' : 'New Invoice'}</span>
            </button>
          ) : (
            <button
              onClick={() => setActiveTab('list')}
              className="px-4 py-2.5 rounded-xl bg-[#111722] hover:bg-[#151B26] text-[#9AA4B2] hover:text-[#F3F5F7] border border-[#202735] text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
            >
              <span>{language === 'ar' ? '← العودة لقائمة الفواتير' : '← Back to Invoices'}</span>
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
          {/* Revenue & Billing Summary Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-[#0D111A] border border-[#202735] space-y-1">
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                {language === 'ar' ? 'إجمالي المفوتر' : 'Total Invoiced'}
              </span>
              <p className="text-2xl font-bold text-[#F3F5F7]">{totalInvoiced.toLocaleString()} EGP</p>
              <p className="text-[10px] text-[#64748B]">{invoices.length} {language === 'ar' ? 'فاتورة صادرة' : 'invoices issued'}</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#0D111A] border border-[#202735] space-y-1">
              <span className="text-[10px] font-bold text-[#10B981] uppercase tracking-wider">
                {language === 'ar' ? 'إجمالي المحصل / المدفوع' : 'Total Collected (Paid)'}
              </span>
              <p className="text-2xl font-bold text-[#10B981]">{totalCollected.toLocaleString()} EGP</p>
              <p className="text-[10px] text-[#10B981]/80">
                {totalInvoiced > 0 ? `${Math.round((totalCollected / totalInvoiced) * 100)}% تحصيل` : '100%'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#0D111A] border border-[#202735] space-y-1">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                {language === 'ar' ? 'المستحقات المتبقية' : 'Outstanding Receivables'}
              </span>
              <p className="text-2xl font-bold text-amber-400">{totalReceivables.toLocaleString()} EGP</p>
              <p className="text-[10px] text-amber-400/80">
                {invoices.filter((i) => i.paymentStatus !== 'paid').length} {language === 'ar' ? 'فواتير قيد السداد' : 'pending invoices'}
              </p>
            </div>
          </div>

          {/* Search & Status Filters */}
          <div className="p-4 rounded-2xl bg-[#0D111A] border border-[#202735] flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-[#64748B] absolute start-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={language === 'ar' ? 'ابحث برقم الفاتورة أو اسم العميل...' : 'Search by invoice # or client...'}
                className="w-full bg-[#111722] border border-[#202735] focus:border-[#5B7CFA] text-xs text-[#F3F5F7] ps-9 pe-4 py-2.5 rounded-xl focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              <Filter className="w-4 h-4 text-[#64748B] shrink-0" />
              {['all', 'pending', 'partially_paid', 'paid', 'overdue'].map((st) => (
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
                  {st === 'pending' && (language === 'ar' ? 'قيد السداد' : 'Pending')}
                  {st === 'partially_paid' && (language === 'ar' ? 'مدفوعة جزئياً' : 'Partial')}
                  {st === 'paid' && (language === 'ar' ? 'مدفوعة' : 'Paid')}
                  {st === 'overdue' && (language === 'ar' ? 'متأخرة' : 'Overdue')}
                </button>
              ))}
            </div>
          </div>

          {/* Invoices List Table */}
          <div className="rounded-2xl bg-[#0D111A] border border-[#202735] overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-xs text-[#9AA4B2]">
                {language === 'ar' ? 'جاري تحميل الفواتير...' : 'Loading invoices...'}
              </div>
            ) : filteredInvoices.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <Receipt className="w-10 h-10 text-[#64748B] mx-auto opacity-50" />
                <p className="text-xs text-[#9AA4B2]">
                  {language === 'ar' ? 'لا توجد فواتير مطابقة للبحث.' : 'No invoices found matching your criteria.'}
                </p>
                <button
                  onClick={handleOpenCreateForm}
                  className="px-4 py-2 rounded-xl bg-[#5B7CFA] text-white text-xs font-bold cursor-pointer"
                >
                  {language === 'ar' ? 'إصدار أول فاتورة' : 'Issue First Invoice'}
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-start text-xs">
                  <thead className="bg-[#111722] text-[#64748B] uppercase font-mono text-[10px] border-b border-[#202735]">
                    <tr>
                      <th className="px-4 py-3.5 text-start">{language === 'ar' ? 'رقم الفاتورة' : 'Invoice #'}</th>
                      <th className="px-4 py-3.5 text-start">{language === 'ar' ? 'العميل' : 'Client'}</th>
                      <th className="px-4 py-3.5 text-start">{language === 'ar' ? 'التاريخ / الاستحقاق' : 'Date / Due'}</th>
                      <th className="px-4 py-3.5 text-start">{language === 'ar' ? 'الإجمالي / المدفوع' : 'Total / Paid'}</th>
                      <th className="px-4 py-3.5 text-start">{language === 'ar' ? 'حالة السداد' : 'Status'}</th>
                      <th className="px-4 py-3.5 text-end">{language === 'ar' ? 'الإجراءات' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#202735]">
                    {filteredInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-[#111722]/50 transition-colors">
                        <td className="px-4 py-3.5 font-mono font-bold text-[#5B7CFA]">
                          <div>{inv.invoiceNumber}</div>
                          {inv.quotationNumber && (
                            <div className="text-[9px] text-[#64748B]">عرض: {inv.quotationNumber}</div>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="font-semibold text-[#F3F5F7]">{inv.clientName}</div>
                          {inv.clientCompany && (
                            <div className="text-[10px] text-[#64748B]">{inv.clientCompany}</div>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-[#9AA4B2] font-mono text-[11px]">
                          <div>{inv.issueDate}</div>
                          <div className="text-[9px] text-amber-400">استحقاق: {inv.dueDate}</div>
                        </td>
                        <td className="px-4 py-3.5 font-mono">
                          <div className="font-bold text-[#F3F5F7]">{inv.total.toLocaleString()} {inv.currency}</div>
                          <div className="text-[10px] text-[#10B981]">
                            مدفوع: {(inv.paidAmount || 0).toLocaleString()} {inv.currency}
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          {getStatusBadge(inv.paymentStatus)}
                        </td>
                        <td className="px-4 py-3.5 text-end">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Preview & Print */}
                            <button
                              onClick={() => setSelectedInvoiceForPreview(inv)}
                              title={language === 'ar' ? 'معاينة وطباعة الفاتورة' : 'Preview & Print'}
                              className="p-2 rounded-lg bg-[#111722] hover:bg-[#151B26] text-[#9AA4B2] hover:text-[#5B7CFA] border border-[#202735] transition-colors cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* WhatsApp Share */}
                            <a
                              href={getWhatsAppShareUrl(inv)}
                              target="_blank"
                              rel="noopener noreferrer"
                              title={language === 'ar' ? 'مشاركة عبر واتساب' : 'Share via WhatsApp'}
                              className="p-2 rounded-lg bg-[#111722] hover:bg-[#10B981]/20 text-[#9AA4B2] hover:text-[#10B981] border border-[#202735] transition-colors cursor-pointer inline-flex"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </a>

                            {/* Quick Mark Paid */}
                            {inv.paymentStatus !== 'paid' && (
                              <button
                                onClick={() => handleMarkAsPaid(inv)}
                                title={language === 'ar' ? 'تسجيل سداد بالكامل' : 'Mark as Paid in full'}
                                className="p-2 rounded-lg bg-[#10B981]/15 hover:bg-[#10B981]/30 text-[#10B981] border border-[#10B981]/30 transition-colors cursor-pointer"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Edit */}
                            <button
                              onClick={() => handleEdit(inv)}
                              title={language === 'ar' ? 'تعديل' : 'Edit'}
                              className="p-2 rounded-lg bg-[#111722] hover:bg-[#151B26] text-[#9AA4B2] hover:text-white border border-[#202735] transition-colors cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => handleDelete(inv.id)}
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
            <h3 className="text-sm font-bold text-[#F3F5F7] border-b border-[#202735] pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-[#5B7CFA]" />
                <span>{language === 'ar' ? 'بيانات الفاتورة والعميل' : 'Invoice & Client Details'}</span>
              </div>

              {quotations.length > 0 && !editingId && (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[#64748B]">{language === 'ar' ? 'استيراد من عرض سعر:' : 'Import from Quote:'}</span>
                  <select
                    value={quotationId}
                    onChange={(e) => handleSelectQuotation(e.target.value)}
                    className="bg-[#111722] border border-[#202735] text-xs text-[#5B7CFA] font-mono px-3 py-1.5 rounded-xl focus:outline-none"
                  >
                    <option value="">{language === 'ar' ? '-- اختر عرض سعر --' : '-- Select Quote --'}</option>
                    {quotations.map((q) => (
                      <option key={q.id} value={q.id}>
                        {q.quotationNumber} - {q.clientName} ({q.total} {q.currency})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#9AA4B2] uppercase">
                  {language === 'ar' ? 'رقم الفاتورة' : 'Invoice #'}
                </label>
                <input
                  type="text"
                  required
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
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
                  {language === 'ar' ? 'تاريخ الاستحقاق' : 'Due Date'}
                </label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
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
                <span>{language === 'ar' ? 'بنود الفاتورة والخدمات' : 'Invoice Line Items'}</span>
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
                    <label className="text-[10px] text-[#64748B] font-mono">#{index + 1} {language === 'ar' ? 'وصف الخدمة' : 'Description'}</label>
                    <input
                      type="text"
                      required
                      value={item.description}
                      onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                      placeholder="وصف الخدمة أو البرمجة"
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

            {/* Calculations & Totals */}
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

              <div className="p-4 rounded-xl bg-[#111722] border border-[#202735] w-full md:w-80 space-y-2 font-mono text-xs">
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
                <div className="flex justify-between text-sm font-bold text-[#F3F5F7] pt-2 border-t border-[#202735]">
                  <span>{language === 'ar' ? 'إجمالي الفاتورة:' : 'Total Amount:'}</span>
                  <span>{grandTotal.toLocaleString()} {currency}</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-[#10B981]">
                  <span>{language === 'ar' ? 'المبلغ المسدد:' : 'Paid Amount:'}</span>
                  <span>{paidAmount.toLocaleString()} {currency}</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-amber-400">
                  <span>{language === 'ar' ? 'المتبقي للسداد:' : 'Remaining:'}</span>
                  <span>{remainingAmount.toLocaleString()} {currency}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Payment Details & Methods */}
          <div className="p-6 rounded-2xl bg-[#0D111A] border border-[#202735] space-y-4">
            <h3 className="text-sm font-bold text-[#F3F5F7] border-b border-[#202735] pb-3 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#5B7CFA]" />
              <span>{language === 'ar' ? 'بيانات الدفع والتحصيل' : 'Payment & Collection Details'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#9AA4B2] uppercase">
                  {language === 'ar' ? 'المبلغ المسدد حالياً' : 'Paid Amount'}
                </label>
                <input
                  type="number"
                  min="0"
                  max={grandTotal}
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(Number(e.target.value))}
                  className="w-full bg-[#111722] border border-[#202735] text-xs text-[#10B981] font-bold font-mono px-3.5 py-2.5 rounded-xl focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#9AA4B2] uppercase">
                  {language === 'ar' ? 'حالة السداد' : 'Payment Status'}
                </label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value as InvoiceStatus)}
                  className="w-full bg-[#111722] border border-[#202735] text-xs text-[#F3F5F7] px-3.5 py-2.5 rounded-xl"
                >
                  <option value="pending">قيد الانتظار / غير مسددة (Pending)</option>
                  <option value="partially_paid">مدفوعة جزئياً (Partially Paid)</option>
                  <option value="paid">مدفوعة بالكامل (Paid)</option>
                  <option value="overdue">متأخرة عن الاستحقاق (Overdue)</option>
                  <option value="cancelled">ملغاة (Cancelled)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#9AA4B2] uppercase">
                  {language === 'ar' ? 'وسيلة الدفع' : 'Payment Method'}
                </label>
                <input
                  type="text"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  placeholder="InstaPay, Vodafone Cash, Bank Transfer"
                  className="w-full bg-[#111722] border border-[#202735] text-xs text-[#F3F5F7] px-3.5 py-2.5 rounded-xl focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-[#202735]">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#9AA4B2] uppercase">
                  {language === 'ar' ? 'بيانات التحويل والحسابات البنكية' : 'Bank & Transfer Instructions'}
                </label>
                <textarea
                  rows={3}
                  value={paymentDetails}
                  onChange={(e) => setPaymentDetails(e.target.value)}
                  className="w-full bg-[#111722] border border-[#202735] text-xs text-[#F3F5F7] p-3 rounded-xl focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#9AA4B2] uppercase">
                  {language === 'ar' ? 'ملاحظات الفاتورة' : 'Invoice Notes'}
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={language === 'ar' ? 'شكراً لتعاملكم معنا...' : 'Thank you for your business...'}
                  className="w-full bg-[#111722] border border-[#202735] text-xs text-[#F3F5F7] p-3 rounded-xl focus:outline-none"
                />
              </div>
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
              <Receipt className="w-4 h-4" />
              <span>{editingId ? (language === 'ar' ? 'تحديث الفاتورة' : 'Update Invoice') : (language === 'ar' ? 'حفظ الفاتورة' : 'Save Invoice')}</span>
            </button>
          </div>

        </form>
      )}

      {/* Official Invoice Printable Modal / Preview */}
      {selectedInvoiceForPreview && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0D111A] border border-[#202735] rounded-2xl w-full max-w-4xl overflow-hidden my-8 shadow-2xl flex flex-col max-h-[90vh]">
            
            {/* Modal Top Bar (Non-Printable) */}
            <div className="p-4 bg-[#111722] border-b border-[#202735] flex items-center justify-between print:hidden">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-[#5B7CFA]" />
                <span className="font-bold text-sm text-[#F3F5F7]">
                  {language === 'ar' ? `معاينة الفاتورة: ${selectedInvoiceForPreview.invoiceNumber}` : `Invoice Preview: ${selectedInvoiceForPreview.invoiceNumber}`}
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
                  href={getWhatsAppShareUrl(selectedInvoiceForPreview)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>{language === 'ar' ? 'واتساب' : 'WhatsApp'}</span>
                </a>

                <button
                  onClick={() => setSelectedInvoiceForPreview(null)}
                  className="p-1.5 rounded-lg bg-[#111722] hover:bg-[#151B26] text-[#9AA4B2] hover:text-[#F3F5F7] border border-[#202735] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable Document Body */}
            <div className="p-8 sm:p-12 overflow-y-auto bg-white text-slate-900 space-y-8 text-start font-sans select-text print:p-0 relative">
              
              {/* PAID Watermark */}
              {selectedInvoiceForPreview.paymentStatus === 'paid' && (
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-25deg] pointer-events-none opacity-15 border-8 border-green-600 rounded-3xl p-8">
                  <span className="text-7xl font-black text-green-700 uppercase tracking-widest">
                    PAID / مدفوعة
                  </span>
                </div>
              )}

              {/* Document Header */}
              <div className="flex justify-between items-start border-b border-slate-200 pb-6">
                <div className="space-y-1.5">
                  <h2 className="text-2xl font-black tracking-tight text-slate-900 uppercase">Abu Al-Saud</h2>
                  <p className="text-xs font-semibold text-slate-500">Web Development & Cybersecurity Specialist</p>
                  <p className="text-xs text-slate-500">Email: bytera.ttech@gmail.com | Phone: +201033108223</p>
                  <p className="text-xs text-slate-500">Cairo, Egypt</p>
                </div>

                <div className="text-end space-y-1">
                  <span className={`inline-block px-3 py-1 rounded font-bold text-xs uppercase tracking-wider ${
                    selectedInvoiceForPreview.paymentStatus === 'paid'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {selectedInvoiceForPreview.paymentStatus === 'paid' ? 'فاتورة رسمية مدفوعة' : 'فاتورة مطالبة مالية'}
                  </span>
                  <p className="text-sm font-mono font-bold text-slate-900">{selectedInvoiceForPreview.invoiceNumber}</p>
                  <p className="text-xs text-slate-500">{language === 'ar' ? 'تاريخ الإصدار:' : 'Issue Date:'} {selectedInvoiceForPreview.issueDate}</p>
                  <p className="text-xs text-slate-500">{language === 'ar' ? 'تاريخ الاستحقاق:' : 'Due Date:'} {selectedInvoiceForPreview.dueDate}</p>
                </div>
              </div>

              {/* Client Info */}
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    {language === 'ar' ? 'فاتورة موجهة إلى:' : 'Billed To:'}
                  </span>
                  <p className="font-bold text-sm text-slate-900">{selectedInvoiceForPreview.clientName}</p>
                  {selectedInvoiceForPreview.clientCompany && (
                    <p className="text-slate-600 font-medium">{selectedInvoiceForPreview.clientCompany}</p>
                  )}
                  {selectedInvoiceForPreview.clientAddress && (
                    <p className="text-slate-500">{selectedInvoiceForPreview.clientAddress}</p>
                  )}
                </div>

                <div className="space-y-1 sm:text-end">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    {language === 'ar' ? 'بيانات الاتصال:' : 'Contact Info:'}
                  </span>
                  {selectedInvoiceForPreview.clientPhone && (
                    <p className="font-mono text-slate-700">{selectedInvoiceForPreview.clientPhone}</p>
                  )}
                  {selectedInvoiceForPreview.clientEmail && (
                    <p className="font-mono text-slate-700">{selectedInvoiceForPreview.clientEmail}</p>
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
                    {selectedInvoiceForPreview.items.map((item, idx) => (
                      <tr key={item.id || idx}>
                        <td className="p-3 text-slate-400 font-mono">{idx + 1}</td>
                        <td className="p-3 font-semibold text-slate-800">{item.description}</td>
                        <td className="p-3 text-center font-mono text-slate-600">{item.quantity}</td>
                        <td className="p-3 text-end font-mono text-slate-600">{item.unitPrice.toLocaleString()} {selectedInvoiceForPreview.currency}</td>
                        <td className="p-3 text-end font-mono font-bold text-slate-900">{item.total.toLocaleString()} {selectedInvoiceForPreview.currency}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals & Payments Breakdown */}
              <div className="flex justify-between items-start pt-2">
                <div className="space-y-2 max-w-sm text-xs">
                  <span className="font-bold text-slate-700 block">{language === 'ar' ? 'طرق وتعليمات السداد:' : 'Payment Instructions:'}</span>
                  <p className="text-slate-600 whitespace-pre-line leading-relaxed font-mono bg-slate-50 p-3 rounded-lg border border-slate-200">
                    {selectedInvoiceForPreview.paymentDetails || 'Vodafone Cash: 01033108223\nInstaPay: abualsaud@instapay'}
                  </p>
                </div>

                <div className="w-72 space-y-2 text-xs font-mono">
                  <div className="flex justify-between text-slate-600">
                    <span>{language === 'ar' ? 'المجموع الفرعي:' : 'Subtotal:'}</span>
                    <span>{selectedInvoiceForPreview.subtotal.toLocaleString()} {selectedInvoiceForPreview.currency}</span>
                  </div>
                  {selectedInvoiceForPreview.discount > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>{language === 'ar' ? 'الخصم:' : 'Discount:'}</span>
                      <span>- {selectedInvoiceForPreview.discount.toLocaleString()} {selectedInvoiceForPreview.currency}</span>
                    </div>
                  )}
                  {selectedInvoiceForPreview.taxAmount > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>{language === 'ar' ? `الضريبة (${selectedInvoiceForPreview.taxRate}%):` : `Tax (${selectedInvoiceForPreview.taxRate}%):`}</span>
                      <span>+ {selectedInvoiceForPreview.taxAmount.toLocaleString()} {selectedInvoiceForPreview.currency}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-300">
                    <span>{language === 'ar' ? 'إجمالي الفاتورة:' : 'Total Amount:'}</span>
                    <span>{selectedInvoiceForPreview.total.toLocaleString()} {selectedInvoiceForPreview.currency}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold text-green-700">
                    <span>{language === 'ar' ? 'المسدد:' : 'Amount Paid:'}</span>
                    <span>{selectedInvoiceForPreview.paidAmount.toLocaleString()} {selectedInvoiceForPreview.currency}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t-2 border-slate-900">
                    <span>{language === 'ar' ? 'المتبقي للدفع:' : 'Balance Due:'}</span>
                    <span>{selectedInvoiceForPreview.remainingAmount.toLocaleString()} {selectedInvoiceForPreview.currency}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedInvoiceForPreview.notes && (
                <div className="border-t border-slate-200 pt-4 text-xs">
                  <span className="font-bold text-slate-700 block">{language === 'ar' ? 'ملاحظات:' : 'Notes:'}</span>
                  <p className="text-slate-600 mt-1">{selectedInvoiceForPreview.notes}</p>
                </div>
              )}

              {/* Stamp / Authorization */}
              <div className="pt-8 border-t border-slate-200 flex justify-between items-end text-xs">
                <div>
                  <p className="text-slate-500">{language === 'ar' ? 'الحالة المالية:' : 'Payment Status:'}</p>
                  <p className="font-bold text-slate-800 uppercase mt-1">
                    {selectedInvoiceForPreview.paymentStatus === 'paid' ? 'مدفوعة ومسددة بالكامل' : 'قيد المتابعة والتحصيل'}
                  </p>
                </div>

                <div className="text-end">
                  <p className="text-slate-500">{language === 'ar' ? 'المهندس / أبو السعود' : 'Abu Al-Saud'}</p>
                  <p className="text-[11px] font-mono text-blue-600 font-bold mt-2">Official Financial Receipt</p>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
