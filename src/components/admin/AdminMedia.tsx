import React, { useState, useEffect, useRef } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { 
  Image as ImageIcon, 
  Upload, 
  Copy, 
  Trash2, 
  X, 
  Clock, 
  Check, 
  FileImage,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { MediaItem } from '../../types';

export const AdminMedia: React.FC = () => {
  const { language } = useLanguage();
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dragActive, setDragActive] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMedia = async () => {
    try {
      setIsLoading(true);
      const snap = await getDocs(collection(db, 'media'));
      const list: MediaItem[] = [];
      snap.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() } as MediaItem);
      });
      // Sort newest first
      list.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
      setMediaList(list);
    } catch (err) {
      console.error('Failed to load media:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleCopyUrl = (item: MediaItem) => {
    navigator.clipboard.writeText(item.url).then(() => {
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2500);
    }).catch(err => {
      console.error('Clipboard copy failed:', err);
    });
  };

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert(language === 'ar' ? 'الرجاء اختيار ملف صورة صالح.' : 'Please select a valid image file.');
      return;
    }

    // Restrict size to keep Firestore documents lightweight (<1MB)
    if (file.size > 800000) {
      alert(
        language === 'ar' 
          ? 'حجم الصورة كبير جداً! الرجاء اختيار صورة أقل من 800 كيلوبايت لضمان سرعة التحميل.' 
          : 'Image file is too large! Please choose an image smaller than 800KB for high performance.'
      );
      return;
    }

    setIsUploading(true);
    try {
      // Read file as Base64 data url
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Url = e.target?.result as string;
        if (!base64Url) return;

        const mediaId = `media-${Date.now()}`;
        const mediaDoc: any = {
          url: base64Url,
          fileName: file.name,
          createdAt: new Date().toISOString()
        };

        await setDoc(doc(db, 'media', mediaId), mediaDoc);
        await fetchMedia();
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Upload failed:', err);
      alert(language === 'ar' ? 'فشلت عملية التحميل' : 'Upload failed.');
      setIsUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDelete = async (docId: string) => {
    const confirmDelete = window.confirm(
      language === 'ar' 
        ? 'هل أنت متأكد من رغبتك في حذف هذا الملف نهائياً؟ ستتعطل الصور التي تظهر بهذا الرابط في الموقع.' 
        : 'Are you sure you want to permanently delete this file? Any site layout using this URL will break.'
    );
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, 'media', docId));
      setMediaList(prev => prev.filter(m => m.id !== docId));
    } catch (err) {
      console.error('Failed to delete media:', err);
    }
  };

  return (
    <div className="space-y-6 text-start">
      
      {/* Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#F3F5F7] tracking-tight flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-[#5B7CFA]" />
          <span>{language === 'ar' ? 'إدارة الوسائط والصور المرفوعة' : 'Media & Asset Gallery'}</span>
        </h1>
        <p className="text-xs text-[#9AA4B2] mt-0.5">
          {language === 'ar' ? 'رفع وإدارة الصور واللوجوهات لاستخدام روابطها المباشرة في كتابة المقالات وعرض المشاريع.' : 'Upload image attachments, background banners, or avatars, and copy their live URLs for use in markdown.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Upload Zone */}
        <div className="lg:col-span-1 space-y-4">
          <div 
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`p-8 rounded-2xl border border-dashed flex flex-col items-center justify-center gap-4 text-center cursor-pointer transition-all min-h-[220px] select-none ${
              dragActive 
                ? 'bg-[#5B7CFA]/10 border-[#5B7CFA] text-[#5B7CFA]' 
                : 'bg-[#0D111A] border-[#202735] text-[#9AA4B2] hover:border-[#5B7CFA]/40 hover:bg-[#111722]/30'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              className="hidden"
            />
            
            <div className="p-3.5 rounded-2xl bg-[#111722] border border-[#202735] text-[#5B7CFA] shrink-0">
              <Upload className={`w-6 h-6 ${isUploading ? 'animate-bounce' : ''}`} />
            </div>

            <div className="space-y-1.5">
              <p className="font-bold text-sm text-[#F3F5F7]">
                {isUploading ? (language === 'ar' ? 'جاري التحميل...' : 'Uploading Asset...') : (language === 'ar' ? 'اسحب وأفلت الصورة هنا' : 'Drag & Drop Image Here')}
              </p>
              <p className="text-xs text-[#9AA4B2]">
                {language === 'ar' ? 'أو انقر للتصفح من ملفاتك المحلية' : 'or click to browse local files'}
              </p>
              <p className="text-[10px] text-[#64748B] font-mono">Max size: 800KB (JPG, PNG, WEBP)</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#5B7CFA]/5 border border-[#5B7CFA]/10 text-[#9AA4B2] text-xs flex items-start gap-2.5 leading-relaxed">
            <Sparkles className="w-4 h-4 text-[#5B7CFA] shrink-0 mt-0.5" />
            <p>
              {language === 'ar' 
                ? 'يتم تخزين الصور محلياً كروابط Base64 متينة ومستقرة، مما يضمن عرضها الدائم والمقاوم للقطع دون الحاجة لباقات تخزين معقدة.'
                : 'Images are stored directly as durable Base64 Data URLs, enabling fast, robust offline loading with zero hosting limits.'}
            </p>
          </div>
        </div>

        {/* Gallery Zone */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#0D111A] border border-[#202735] rounded-2xl p-5 min-h-[300px]">
            <h3 className="text-sm font-bold text-[#F3F5F7] mb-4">
              {language === 'ar' ? 'مكتبة الملفات المرفوعة' : 'Uploaded File Library'} ({mediaList.length})
            </h3>

            {isLoading ? (
              <div className="py-24 text-center text-xs text-[#9AA4B2]">
                {language === 'ar' ? 'جاري تحميل المعرض...' : 'Loading media gallery...'}
              </div>
            ) : mediaList.length === 0 ? (
              <div className="py-24 text-center text-xs text-[#64748B] flex flex-col items-center gap-3 border border-dashed border-[#202735] rounded-xl bg-[#111722]/20">
                <FileImage className="w-8 h-8 stroke-1 text-[#64748B]" />
                <p>{language === 'ar' ? 'لم تقم برفع أي ملفات حتى الآن.' : 'No uploaded assets found.'}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {mediaList.map((item) => (
                  <div 
                    key={item.id} 
                    className="group rounded-xl overflow-hidden bg-[#111722] border border-[#202735] hover:border-[#5B7CFA]/40 transition-all flex flex-col relative"
                  >
                    
                    {/* Thumbnail */}
                    <div className="aspect-video w-full bg-[#080B12] overflow-hidden relative flex items-center justify-center border-b border-[#202735]">
                      <img 
                        src={item.url} 
                        alt={item.fileName} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                        referrerPolicy="no-referrer"
                      />
                      
                      {/* Copy alert overlay */}
                      {copiedId === item.id && (
                        <div className="absolute inset-0 bg-[#10B981]/90 backdrop-blur-sm flex flex-col items-center justify-center text-white gap-1 animate-fade-in">
                          <Check className="w-5 h-5 shrink-0" />
                          <span className="text-[10px] font-bold tracking-wider uppercase">Copied!</span>
                        </div>
                      )}
                    </div>

                    {/* Metadata & Actions */}
                    <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-[#F3F5F7] truncate select-all">{item.fileName}</p>
                        
                        <div className="flex items-center gap-1 text-[9px] text-[#64748B] font-mono mt-0.5">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(item.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}</span>
                        </div>
                      </div>

                      {/* Control buttons */}
                      <div className="flex gap-1.5 pt-1">
                        <button
                          onClick={() => handleCopyUrl(item)}
                          className="flex-1 py-1.5 rounded-lg bg-[#151B26] border border-[#202735] hover:border-[#5B7CFA]/40 text-xs text-[#9AA4B2] hover:text-[#5B7CFA] font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Copy className="w-3 h-3" />
                          <span className="text-[10px]">Copy URL</span>
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 rounded-lg bg-[#151B26] border border-[#202735] hover:border-red-500/40 text-[#9AA4B2] hover:text-red-500 transition-all cursor-pointer"
                          title="Delete file"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}

          </div>
        </div>

      </div>

    </div>
  );
};
