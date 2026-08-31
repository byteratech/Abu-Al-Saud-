import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { 
  Mail, 
  Trash2, 
  Check, 
  Eye, 
  CheckSquare, 
  Clock, 
  X,
  MailOpen,
  MessageSquare,
  Volume2
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { CMSMessage } from '../../types';

interface AdminMessagesProps {
  onMessagesCountChange?: (unreadCount: number) => void;
}

export const AdminMessages: React.FC<AdminMessagesProps> = ({ onMessagesCountChange }) => {
  const { language } = useLanguage();
  const [messages, setMessages] = useState<CMSMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMsg, setSelectedMsg] = useState<CMSMessage | null>(null);

  useEffect(() => {
    setIsLoading(true);
    let unsubscribe: () => void = () => {};

    try {
      unsubscribe = onSnapshot(collection(db, 'messages'), (snapshot) => {
        const list: CMSMessage[] = [];
        snapshot.forEach(docSnap => {
          list.push({ id: docSnap.id, ...docSnap.data() } as CMSMessage);
        });
        list.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
        setMessages(list);
        setIsLoading(false);

        const unread = list.filter(m => !m.read).length;
        if (onMessagesCountChange) {
          onMessagesCountChange(unread);
        }
        try {
          localStorage.setItem('cms_local_messages', JSON.stringify(list));
        } catch (_) {}
      }, (error) => {
        console.warn('Firestore real-time messages listener fallback to localStorage:', error);
        setIsLoading(false);
        try {
          const saved = localStorage.getItem('cms_local_messages');
          if (saved) {
            const list = JSON.parse(saved);
            setMessages(list);
            const unread = list.filter((m: any) => !m.read).length;
            if (onMessagesCountChange) {
              onMessagesCountChange(unread);
            }
          }
        } catch (_) {}
      });
    } catch (err) {
      console.error('Error setting up onSnapshot for messages:', err);
      setIsLoading(false);
    }

    return () => {
      unsubscribe();
    };
  }, [onMessagesCountChange]);

  const handleMarkAsRead = async (msg: CMSMessage, forceRead = true) => {
    try {
      const docRef = doc(db, 'messages', msg.id);
      await setDoc(docRef, { read: forceRead }, { merge: true });
      
      const updatedList = messages.map(m => m.id === msg.id ? { ...m, read: forceRead } : m);
      setMessages(updatedList);
      const unread = updatedList.filter(m => !m.read).length;
      if (onMessagesCountChange) {
        onMessagesCountChange(unread);
      }
      if (selectedMsg && selectedMsg.id === msg.id) {
        setSelectedMsg({ ...selectedMsg, read: forceRead });
      }
      try {
        localStorage.setItem('cms_local_messages', JSON.stringify(updatedList));
      } catch (_) {}
    } catch (err) {
      console.warn('Firestore mark as read failed, updating local state:', err);
      const updatedList = messages.map(m => m.id === msg.id ? { ...m, read: forceRead } : m);
      setMessages(updatedList);
      const unread = updatedList.filter(m => !m.read).length;
      if (onMessagesCountChange) {
        onMessagesCountChange(unread);
      }
      if (selectedMsg && selectedMsg.id === msg.id) {
        setSelectedMsg({ ...selectedMsg, read: forceRead });
      }
      try {
        localStorage.setItem('cms_local_messages', JSON.stringify(updatedList));
      } catch (_) {}
    }
  };

  const handleDelete = async (docId: string) => {
    const confirmDelete = window.confirm(
      language === 'ar' 
        ? 'هل أنت متأكد من رغبتك في حذف هذه الرسالة نهائياً؟' 
        : 'Are you sure you want to permanently delete this message?'
    );
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, 'messages', docId));
      const updatedList = messages.filter(m => m.id !== docId);
      setMessages(updatedList);
      const unread = updatedList.filter(m => !m.read).length;
      if (onMessagesCountChange) {
        onMessagesCountChange(unread);
      }
      if (selectedMsg && selectedMsg.id === docId) {
        setSelectedMsg(null);
      }
      try {
        localStorage.setItem('cms_local_messages', JSON.stringify(updatedList));
      } catch (_) {}
    } catch (err) {
      console.warn('Firestore delete message failed, updating local state:', err);
      const updatedList = messages.filter(m => m.id !== docId);
      setMessages(updatedList);
      const unread = updatedList.filter(m => !m.read).length;
      if (onMessagesCountChange) {
        onMessagesCountChange(unread);
      }
      if (selectedMsg && selectedMsg.id === docId) {
        setSelectedMsg(null);
      }
      try {
        localStorage.setItem('cms_local_messages', JSON.stringify(updatedList));
      } catch (_) {}
    }
  };

  return (
    <div className="space-y-6 text-start">
      
      {/* Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#F3F5F7] tracking-tight flex items-center gap-2">
          <Mail className="w-5 h-5 text-[#5B7CFA]" />
          <span>{language === 'ar' ? 'رسائل تواصل الزوار والعملاء' : 'Visitor Contacts & Inquiries'}</span>
        </h1>
        <p className="text-xs text-[#9AA4B2] mt-0.5">
          {language === 'ar' ? 'استعراض رسائل واستفسارات زوار الموقع المباشرة الواردة من صفحة اتصل بنا.' : 'Review incoming inquiries, feedback, and job proposals submitted through the contact page.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Messages List Area */}
        <div className={`bg-[#0D111A] border border-[#202735] rounded-2xl overflow-hidden ${selectedMsg ? 'lg:col-span-7' : 'lg:col-span-12'}`}>
          {isLoading ? (
            <div className="py-24 text-center text-xs text-[#9AA4B2]">
              {language === 'ar' ? 'جاري تحميل الرسائل المباشرة...' : 'Loading messages...'}
            </div>
          ) : messages.length === 0 ? (
            <div className="py-24 text-center text-xs text-[#64748B] flex flex-col items-center gap-3">
              <MailOpen className="w-10 h-10 stroke-1 text-[#5B7CFA]" />
              <p>{language === 'ar' ? 'بريدك الوارد فارغ تماماً!' : 'Inbox is empty. No messages received yet.'}</p>
            </div>
          ) : (
            <div className="divide-y divide-[#202735]">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  onClick={() => {
                    setSelectedMsg(msg);
                    if (!msg.read) {
                      handleMarkAsRead(msg, true);
                    }
                  }}
                  className={`p-4 sm:p-5 flex justify-between gap-4 cursor-pointer transition-all ${
                    !msg.read ? 'bg-[#5B7CFA]/5 border-s-2 border-s-[#5B7CFA]' : 'hover:bg-[#111722]/40 border-s-2 border-s-transparent'
                  } ${selectedMsg?.id === msg.id ? 'bg-[#111722]' : ''}`}
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-sm font-bold ${!msg.read ? 'text-[#F3F5F7]' : 'text-slate-300'}`}>
                        {msg.senderName}
                      </span>
                      <span className="text-[10px] text-[#64748B] font-mono select-all truncate max-w-xs">{msg.email}</span>
                      {!msg.read && (
                        <span className="px-1.5 py-0.5 rounded bg-[#EF4444]/10 text-[#EF4444] text-[9px] font-bold font-mono">NEW</span>
                      )}
                    </div>
                    
                    <p className="text-xs text-[#9AA4B2] line-clamp-1">{msg.message}</p>
                    
                    <div className="flex items-center gap-1 text-[10px] text-[#64748B] font-mono">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{new Date(msg.createdAt).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')}</span>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => handleMarkAsRead(msg, !msg.read)}
                      className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                        msg.read 
                          ? 'bg-[#111722] border-[#202735] text-[#9AA4B2] hover:text-[#5B7CFA]' 
                          : 'bg-[#5B7CFA]/15 border-[#5B7CFA]/30 text-[#5B7CFA] hover:bg-[#5B7CFA]/25'
                      }`}
                      title={msg.read ? 'Mark as Unread' : 'Mark as Read'}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(msg.id)}
                      className="p-1.5 rounded-lg bg-[#111722] border border-[#202735] text-[#9AA4B2] hover:text-red-500 hover:border-red-500/40 transition-all cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Message Reader Pane */}
        {selectedMsg && (
          <div className="bg-[#0D111A] border border-[#202735] rounded-2xl p-5 sm:p-6 lg:col-span-5 space-y-5 relative animate-fade-in">
            <button
              onClick={() => setSelectedMsg(null)}
              className="absolute top-4 right-4 p-1 rounded-lg bg-[#111722] border border-[#202735] text-[#9AA4B2] hover:text-[#F3F5F7] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 border-b border-[#202735] pb-4 pr-6">
              <div className="w-10 h-10 rounded-full bg-[#111722] border border-[#202735] flex items-center justify-center text-[#5B7CFA] shrink-0">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-[#F3F5F7] text-sm truncate">{selectedMsg.senderName}</h4>
                <a 
                  href={`mailto:${selectedMsg.email}`} 
                  className="text-xs text-[#5B7CFA] hover:underline truncate block select-all font-mono"
                >
                  {selectedMsg.email}
                </a>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider block">Submitted Message</span>
              <div className="bg-[#111722] rounded-xl p-4 border border-[#202735] text-xs sm:text-sm text-[#9AA4B2] whitespace-pre-wrap leading-relaxed select-text font-sans">
                {selectedMsg.message}
              </div>
            </div>

            <div className="pt-2 border-t border-[#202735] flex justify-between items-center text-[10px] text-[#64748B] font-mono">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{new Date(selectedMsg.createdAt).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')}</span>
              </span>
              
              <button
                onClick={() => handleDelete(selectedMsg.id)}
                className="text-red-400 hover:text-red-500 font-semibold"
              >
                Delete Message
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
