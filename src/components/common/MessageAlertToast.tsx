import React, { useEffect } from 'react';
import { Mail, Volume2, X, ArrowUpRight, Clock } from 'lucide-react';
import { CMSMessage } from '../../types';

interface MessageAlertToastProps {
  message: CMSMessage;
  onOpen: () => void;
  onDismiss: () => void;
  language: 'ar' | 'en';
}

export const MessageAlertToast: React.FC<MessageAlertToastProps> = ({
  message,
  onOpen,
  onDismiss,
  language
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 10000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className="fixed top-5 right-5 z-50 max-w-sm w-full bg-[#0D111A] border border-[#5B7CFA] rounded-2xl p-4 shadow-2xl shadow-[#5B7CFA]/20 animate-in slide-in-from-top-4 duration-300 backdrop-blur-md">
      
      {/* Header with sound badge */}
      <div className="flex items-center justify-between pb-2.5 border-b border-[#202735]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#5B7CFA]/20 text-[#5B7CFA] animate-pulse">
            <Volume2 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-[#F3F5F7]">
              {language === 'ar' ? 'رسالة جديدة واردة!' : 'New Inbound Message!'}
            </span>
            <span className="text-[9px] text-[#10B981] font-mono block">
              {language === 'ar' ? 'تم إرسال إشعار صوتي وإيميل' : 'Audio chime & email dispatched'}
            </span>
          </div>
        </div>

        <button
          onClick={onDismiss}
          className="p-1 rounded-lg text-[#9AA4B2] hover:text-white hover:bg-[#111722] transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Message Body preview */}
      <div className="py-2.5 space-y-1 text-start">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-[#F3F5F7] truncate">{message.senderName}</span>
          <span className="text-[10px] text-[#64748B] font-mono">{message.email}</span>
        </div>
        <p className="text-[11px] text-[#9AA4B2] line-clamp-2 leading-relaxed bg-[#111722]/60 p-2 rounded-lg border border-[#202735]">
          {message.message}
        </p>
      </div>

      {/* Actions */}
      <div className="pt-2 border-t border-[#202735] flex items-center justify-between gap-2">
        <span className="text-[9px] text-[#64748B] flex items-center gap-1 font-mono">
          <Clock className="w-3 h-3 text-[#5B7CFA]" />
          <span>{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </span>

        <button
          onClick={() => {
            onOpen();
            onDismiss();
          }}
          className="px-3 py-1.5 rounded-lg bg-[#5B7CFA] hover:bg-[#4A6BD8] text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all shadow-md"
        >
          <span>{language === 'ar' ? 'عرض الرسالة' : 'View Message'}</span>
          <ArrowUpRight className="w-3 h-3" />
        </button>
      </div>

    </div>
  );
};
