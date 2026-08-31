import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  Key, 
  FileText, 
  FolderKanban, 
  BookOpen, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  Lock, 
  ShieldCheck, 
  Calendar, 
  Tag, 
  Sparkles, 
  Search, 
  Edit, 
  Save, 
  X, 
  Globe, 
  User, 
  Clock, 
  AlertCircle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface TaskItem {
  id: string;
  title: string;
  category: 'work' | 'personal' | 'dev' | 'content';
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  date: string;
}

interface PasswordItem {
  id: string;
  title: string;
  username: string;
  pass: string;
  url?: string;
  category: 'social' | 'hosting' | 'email' | 'banking' | 'other';
  notes?: string;
}

interface ContentItem {
  id: string;
  title: string;
  platform: 'tiktok' | 'instagram' | 'facebook' | 'youtube' | 'blog' | 'other';
  status: 'idea' | 'draft' | 'ready' | 'published';
  publishDate: string;
  notes?: string;
}

interface ProjectNoteItem {
  id: string;
  title: string;
  category: string;
  content: string;
  updatedAt: string;
}

export const AdminWorkspace: React.FC = () => {
  const { language } = useLanguage();
  const [activeSubTab, setActiveSubTab] = useState<'tasks' | 'passwords' | 'content' | 'projects' | 'notes'>('tasks');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // 1. Tasks State
  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    try {
      const saved = localStorage.getItem('workspace_tasks');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return [
      { id: 't1', title: 'مراجعة طلبات العملاء والرسائل الجديدة', category: 'work', priority: 'high', completed: false, date: new Date().toISOString().split('T')[0] },
      { id: 't2', title: 'تصوير فيديو تيك توك جديد للبرمجة وتطوير الويب', category: 'content', priority: 'medium', completed: false, date: new Date().toISOString().split('T')[0] },
      { id: 't3', title: 'تحديث سيرفر الاستضافة وصيانة قاعدة البيانات', category: 'dev', priority: 'high', completed: true, date: new Date().toISOString().split('T')[0] },
    ];
  });
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<'work' | 'personal' | 'dev' | 'content'>('work');
  const [newTaskPriority, setNewTaskPriority] = useState<'high' | 'medium' | 'low'>('medium');

  // 2. Passwords State
  const [passwords, setPasswords] = useState<PasswordItem[]>(() => {
    try {
      const saved = localStorage.getItem('workspace_passwords');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return [
      { id: 'p1', title: 'حساب فيسبوك الرسمي', username: 'abualss3ud', pass: 'ByteraSecure2026!', url: 'https://facebook.com', category: 'social', notes: 'الحساب الرئيسي لإدارة الإعلانات والصفحة' },
      { id: 'p2', title: 'لوحة تحكم Firebase', username: 'bytera.ttech@gmail.com', pass: 'FirebaseAdmin2026#', url: 'https://console.firebase.google.com', category: 'hosting', notes: 'قاعدة البيانات ومصادقة المستخدمين' },
    ];
  });
  const [showPassMap, setShowPassMap] = useState<Record<string, boolean>>({});
  const [isAddingPass, setIsAddingPass] = useState(false);
  const [newPassTitle, setNewPassTitle] = useState('');
  const [newPassUser, setNewPassUser] = useState('');
  const [newPassValue, setNewPassValue] = useState('');
  const [newPassUrl, setNewPassUrl] = useState('');
  const [newPassCat, setNewPassCat] = useState<'social' | 'hosting' | 'email' | 'banking' | 'other'>('social');
  const [newPassNotes, setNewPassNotes] = useState('');

  // 3. Content Planner State
  const [contents, setContents] = useState<ContentItem[]>(() => {
    try {
      const saved = localStorage.getItem('workspace_contents');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return [
      { id: 'c1', title: 'سلسلة تعلم البرمجة من الصفر للمحترفين', platform: 'tiktok', status: 'ready', publishDate: '2026-09-01', notes: 'تجهيز المونتاج والسكريبت' },
      { id: 'c2', title: 'كيف تحمي حساباتك على السوشيال ميديا', platform: 'facebook', status: 'draft', publishDate: '2026-09-03', notes: 'كتابة المقال والبوست' },
    ];
  });
  const [isAddingContent, setIsAddingContent] = useState(false);
  const [newContentTitle, setNewContentTitle] = useState('');
  const [newContentPlatform, setNewContentPlatform] = useState<'tiktok' | 'instagram' | 'facebook' | 'youtube' | 'blog' | 'other'>('tiktok');
  const [newContentStatus, setNewContentStatus] = useState<'idea' | 'draft' | 'ready' | 'published'>('idea');
  const [newContentDate, setNewContentDate] = useState('');
  const [newContentNotes, setNewContentNotes] = useState('');

  // 4. Notes & Scratchpad State
  const [notes, setNotes] = useState<ProjectNoteItem[]>(() => {
    try {
      const saved = localStorage.getItem('workspace_notes');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return [
      { id: 'n1', title: 'أفكار ومشاريع مستقبلية', category: 'تطوير', content: 'تطوير منصة رقمية متكاملة لتقديم الخدمات الاستشارية وإدارة المشاريع للعملاء.', updatedAt: '2026-08-31' }
    ];
  });
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteCat, setNewNoteCat] = useState('عام');
  const [newNoteContent, setNewNoteContent] = useState('');

  // Save effects
  useEffect(() => {
    try { localStorage.setItem('workspace_tasks', JSON.stringify(tasks)); } catch (_) {}
  }, [tasks]);

  useEffect(() => {
    try { localStorage.setItem('workspace_passwords', JSON.stringify(passwords)); } catch (_) {}
  }, [passwords]);

  useEffect(() => {
    try { localStorage.setItem('workspace_contents', JSON.stringify(contents)); } catch (_) {}
  }, [contents]);

  useEffect(() => {
    try { localStorage.setItem('workspace_notes', JSON.stringify(notes)); } catch (_) {}
  }, [notes]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Add Task
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const newTask: TaskItem = {
      id: 't-' + Date.now(),
      title: newTaskTitle.trim(),
      category: newTaskCategory,
      priority: newTaskPriority,
      completed: false,
      date: new Date().toISOString().split('T')[0]
    };
    setTasks([newTask, ...tasks]);
    setNewTaskTitle('');
  };

  // Add Password
  const handleAddPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassTitle.trim() || !newPassValue.trim()) return;
    const item: PasswordItem = {
      id: 'p-' + Date.now(),
      title: newPassTitle.trim(),
      username: newPassUser.trim(),
      pass: newPassValue.trim(),
      url: newPassUrl.trim(),
      category: newPassCat,
      notes: newPassNotes.trim()
    };
    setPasswords([item, ...passwords]);
    setNewPassTitle('');
    setNewPassUser('');
    setNewPassValue('');
    setNewPassUrl('');
    setNewPassNotes('');
    setIsAddingPass(false);
  };

  // Add Content
  const handleAddContent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContentTitle.trim()) return;
    const item: ContentItem = {
      id: 'c-' + Date.now(),
      title: newContentTitle.trim(),
      platform: newContentPlatform,
      status: newContentStatus,
      publishDate: newContentDate || new Date().toISOString().split('T')[0],
      notes: newContentNotes.trim()
    };
    setContents([item, ...contents]);
    setNewContentTitle('');
    setNewContentNotes('');
    setIsAddingContent(false);
  };

  // Add Note
  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim()) return;
    const item: ProjectNoteItem = {
      id: 'n-' + Date.now(),
      title: newNoteTitle.trim(),
      category: newNoteCat.trim() || 'عام',
      content: newNoteContent.trim(),
      updatedAt: new Date().toISOString().split('T')[0]
    };
    setNotes([item, ...notes]);
    setNewNoteTitle('');
    setNewNoteContent('');
    setIsAddingNote(false);
  };

  return (
    <div className="space-y-6 text-start">
      {/* Header Banner */}
      <div className="bg-[#0D111A] border border-[#202735] rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#5B7CFA]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-[#5B7CFA]/10 text-[#5B7CFA] border border-[#5B7CFA]/20 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'مساحة العمل الشخصية (Notion Style Workspace)' : 'Personal Notion-Style Workspace'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#F3F5F7] tracking-tight">
              {language === 'ar' ? 'إدارة يومك، مهامك، وكلمات سرك بأمان' : 'Organize Day, Tasks & Credentials'}
            </h1>
            <p className="text-xs sm:text-sm text-[#9AA4B2] max-w-2xl leading-relaxed">
              {language === 'ar'
                ? 'مساحة مركزية متكاملة لترتيب المهام اليومية، تخزين كلمات السر بشكل مشفر وآمن، تخطيط المحتوى والمشاريع، وتدوين الأفكار السريعة.'
                : 'Your centralized workspace to manage daily routine, secure password vault, content planning, and scratchpad notes.'}
            </p>
          </div>
          
          {/* Quick stats badges */}
          <div className="flex items-center gap-3 bg-[#111722] border border-[#202735] p-3 rounded-2xl">
            <div className="text-center px-3 border-e border-[#202735]">
              <span className="block text-lg font-bold text-[#5B7CFA] font-mono">
                {tasks.filter(t => !t.completed).length}
              </span>
              <span className="text-[10px] text-[#9AA4B2] uppercase font-mono">
                {language === 'ar' ? 'مهام نشطة' : 'Active Tasks'}
              </span>
            </div>
            <div className="text-center px-3 border-e border-[#202735]">
              <span className="block text-lg font-bold text-[#10B981] font-mono">
                {passwords.length}
              </span>
              <span className="text-[10px] text-[#9AA4B2] uppercase font-mono">
                {language === 'ar' ? 'كلمات سر' : 'Passwords'}
              </span>
            </div>
            <div className="text-center px-3">
              <span className="block text-lg font-bold text-amber-400 font-mono">
                {contents.length}
              </span>
              <span className="text-[10px] text-[#9AA4B2] uppercase font-mono">
                {language === 'ar' ? 'منشورات' : 'Content'}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-6 border-t border-[#202735]">
          <button
            onClick={() => setActiveSubTab('tasks')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'tasks'
                ? 'bg-[#5B7CFA] text-white shadow-md'
                : 'bg-[#111722] text-[#9AA4B2] hover:text-white border border-[#202735]'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>{language === 'ar' ? 'جدول المهام اليومي' : 'Daily Tasks'}</span>
          </button>

          <button
            onClick={() => setActiveSubTab('passwords')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'passwords'
                ? 'bg-[#5B7CFA] text-white shadow-md'
                : 'bg-[#111722] text-[#9AA4B2] hover:text-white border border-[#202735]'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>{language === 'ar' ? 'خزنة كلمات المرور' : 'Password Vault'}</span>
          </button>

          <button
            onClick={() => setActiveSubTab('content')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'content'
                ? 'bg-[#5B7CFA] text-white shadow-md'
                : 'bg-[#111722] text-[#9AA4B2] hover:text-white border border-[#202735]'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>{language === 'ar' ? 'مخطط المحتوى والأفكار' : 'Content Planner'}</span>
          </button>

          <button
            onClick={() => setActiveSubTab('notes')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'notes'
                ? 'bg-[#5B7CFA] text-white shadow-md'
                : 'bg-[#111722] text-[#9AA4B2] hover:text-white border border-[#202735]'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>{language === 'ar' ? 'المفكرة والأفكار' : 'Notes & Scratchpad'}</span>
          </button>
        </div>
      </div>

      {/* ---------------- 1. TASKS TAB ---------------- */}
      {activeSubTab === 'tasks' && (
        <div className="space-y-6">
          {/* Add Task Bar */}
          <div className="bg-[#0D111A] border border-[#202735] rounded-2xl p-4 sm:p-6 shadow-md">
            <form onSubmit={handleAddTask} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                required
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder={language === 'ar' ? 'أضف مهمة جديدة ليومك...' : 'Add a new daily task...'}
                className="flex-1 bg-[#111722] border border-[#202735] focus:border-[#5B7CFA] text-xs text-[#F3F5F7] px-4 py-3 rounded-xl focus:outline-none"
              />
              <select
                value={newTaskCategory}
                onChange={(e: any) => setNewTaskCategory(e.target.value)}
                className="bg-[#111722] border border-[#202735] text-xs text-[#9AA4B2] px-3 py-3 rounded-xl focus:outline-none"
              >
                <option value="work">{language === 'ar' ? 'عمل' : 'Work'}</option>
                <option value="content">{language === 'ar' ? 'محتوى' : 'Content'}</option>
                <option value="dev">{language === 'ar' ? 'برمجة' : 'Dev'}</option>
                <option value="personal">{language === 'ar' ? 'شخصي' : 'Personal'}</option>
              </select>
              <select
                value={newTaskPriority}
                onChange={(e: any) => setNewTaskPriority(e.target.value)}
                className="bg-[#111722] border border-[#202735] text-xs text-[#9AA4B2] px-3 py-3 rounded-xl focus:outline-none"
              >
                <option value="high">{language === 'ar' ? 'أولوية عالية 🔥' : 'High Priority'}</option>
                <option value="medium">{language === 'ar' ? 'أولوية متوسطة ⚡' : 'Medium'}</option>
                <option value="low">{language === 'ar' ? 'عادية ☕' : 'Low'}</option>
              </select>
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-[#5B7CFA] hover:bg-[#4A6BD8] text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>{language === 'ar' ? 'إضافة مهمة' : 'Add Task'}</span>
              </button>
            </form>
          </div>

          {/* Tasks List */}
          <div className="bg-[#0D111A] border border-[#202735] rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 sm:p-5 border-b border-[#202735] flex items-center justify-between">
              <h3 className="font-bold text-sm text-[#F3F5F7] flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-[#5B7CFA]" />
                <span>{language === 'ar' ? 'مهام اليوم والأسبوع' : 'Daily & Weekly Checklist'}</span>
              </h3>
              <span className="text-xs font-mono text-[#9AA4B2]">
                {tasks.filter(t => t.completed).length} / {tasks.length} {language === 'ar' ? 'مكتملة' : 'Completed'}
              </span>
            </div>

            <div className="divide-y divide-[#202735]">
              {tasks.length === 0 ? (
                <div className="p-12 text-center text-xs text-[#64748B]">
                  {language === 'ar' ? 'لا توجد مهام حالياً. أضف مهامك لترتيب يومك!' : 'No tasks recorded yet.'}
                </div>
              ) : (
                tasks.map((task) => (
                  <div key={task.id} className="p-4 sm:px-6 flex items-center justify-between gap-4 hover:bg-[#111722]/50 transition-colors">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => {
                          setTasks(tasks.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t));
                        }}
                        className="w-4 h-4 rounded border-[#202735] text-[#5B7CFA] focus:ring-0 cursor-pointer accent-[#5B7CFA]"
                      />
                      <div className="min-w-0">
                        <p className={`text-xs sm:text-sm font-medium transition-all ${task.completed ? 'line-through text-[#64748B]' : 'text-[#F3F5F7]'}`}>
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
                            task.category === 'work' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/25' :
                            task.category === 'content' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/25' :
                            task.category === 'dev' ? 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/25' :
                            'bg-amber-500/10 text-amber-400 border border-amber-500/25'
                          }`}>
                            {task.category}
                          </span>
                          <span className={`text-[10px] font-mono ${
                            task.priority === 'high' ? 'text-red-400 font-bold' : 'text-[#64748B]'
                          }`}>
                            {task.priority === 'high' ? '🔥 High' : task.priority === 'medium' ? '⚡ Med' : '☕ Low'}
                          </span>
                          <span className="text-[10px] text-[#64748B] font-mono">{task.date}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setTasks(tasks.filter(t => t.id !== task.id))}
                      className="p-2 rounded-lg text-[#64748B] hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ---------------- 2. PASSWORDS VAULT TAB ---------------- */}
      {activeSubTab === 'passwords' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 bg-[#0D111A] border border-[#202735] px-4 py-2.5 rounded-xl flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#64748B]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={language === 'ar' ? 'بحث في كلمات المرور الحسابات والاستضافات...' : 'Search credentials...'}
                className="bg-transparent text-xs text-[#F3F5F7] focus:outline-none w-full"
              />
            </div>

            <button
              onClick={() => setIsAddingPass(!isAddingPass)}
              className="px-5 py-2.5 rounded-xl bg-[#5B7CFA] hover:bg-[#4A6BD8] text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'ar' ? 'إضافة كلمة مرور جديدة' : 'Add Credential'}</span>
            </button>
          </div>

          {/* Add Password Form Modal/Card */}
          {isAddingPass && (
            <div className="bg-[#0D111A] border border-[#5B7CFA]/40 rounded-2xl p-6 shadow-xl space-y-4 animate-slide-in">
              <div className="flex justify-between items-center pb-3 border-b border-[#202735]">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#5B7CFA]" />
                  <span>{language === 'ar' ? 'إضافة كلمة سر جديدة للخزنة' : 'New Vault Credential'}</span>
                </h3>
                <button onClick={() => setIsAddingPass(false)} className="text-[#9AA4B2] hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddPassword} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#9AA4B2] uppercase">{language === 'ar' ? 'اسم الحساب / الموقع' : 'Title / Service'}</label>
                  <input
                    type="text"
                    required
                    value={newPassTitle}
                    onChange={(e) => setNewPassTitle(e.target.value)}
                    placeholder="مثال: حساب فيسبوك / استضافة Vercel"
                    className="w-full bg-[#111722] border border-[#202735] focus:border-[#5B7CFA] text-[#F3F5F7] px-3.5 py-2.5 rounded-xl focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#9AA4B2] uppercase">{language === 'ar' ? 'التصنيف' : 'Category'}</label>
                  <select
                    value={newPassCat}
                    onChange={(e: any) => setNewPassCat(e.target.value)}
                    className="w-full bg-[#111722] border border-[#202735] focus:border-[#5B7CFA] text-[#F3F5F7] px-3.5 py-2.5 rounded-xl focus:outline-none"
                  >
                    <option value="social">{language === 'ar' ? 'حسابات التواصل (Social)' : 'Social Media'}</option>
                    <option value="hosting">{language === 'ar' ? 'استضافات وسيرفرات (Hosting)' : 'Hosting & Servers'}</option>
                    <option value="email">{language === 'ar' ? 'بريد إلكتروني (Email)' : 'Email'}</option>
                    <option value="banking">{language === 'ar' ? 'مالي وبنوك (Banking)' : 'Banking'}</option>
                    <option value="other">{language === 'ar' ? 'أخرى (Other)' : 'Other'}</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#9AA4B2] uppercase">{language === 'ar' ? 'اسم المستخدم / البريد' : 'Username / Email'}</label>
                  <input
                    type="text"
                    value={newPassUser}
                    onChange={(e) => setNewPassUser(e.target.value)}
                    placeholder="username@gmail.com"
                    className="w-full bg-[#111722] border border-[#202735] focus:border-[#5B7CFA] text-[#F3F5F7] px-3.5 py-2.5 rounded-xl focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#9AA4B2] uppercase">{language === 'ar' ? 'كلمة المرور' : 'Password'}</label>
                  <input
                    type="text"
                    required
                    value={newPassValue}
                    onChange={(e) => setNewPassValue(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-[#111722] border border-[#202735] focus:border-[#5B7CFA] text-[#F3F5F7] px-3.5 py-2.5 rounded-xl focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[10px] font-bold text-[#9AA4B2] uppercase">{language === 'ar' ? 'رابط الموقع (اختياري)' : 'Website URL (Optional)'}</label>
                  <input
                    type="url"
                    value={newPassUrl}
                    onChange={(e) => setNewPassUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full bg-[#111722] border border-[#202735] focus:border-[#5B7CFA] text-[#F3F5F7] px-3.5 py-2.5 rounded-xl focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[10px] font-bold text-[#9AA4B2] uppercase">{language === 'ar' ? 'ملاحظات وتفاصيل' : 'Notes & Details'}</label>
                  <input
                    type="text"
                    value={newPassNotes}
                    onChange={(e) => setNewPassNotes(e.target.value)}
                    placeholder="معلومات إضافية أو مفتاح استرجاع..."
                    className="w-full bg-[#111722] border border-[#202735] focus:border-[#5B7CFA] text-[#F3F5F7] px-3.5 py-2.5 rounded-xl focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingPass(false)}
                    className="px-4 py-2 rounded-xl bg-[#111722] border border-[#202735] text-[#9AA4B2]"
                  >
                    {language === 'ar' ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-xl bg-[#5B7CFA] hover:bg-[#4A6BD8] text-white font-bold"
                  >
                    {language === 'ar' ? 'حفظ في الخزنة الآمنة' : 'Save to Vault'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Passwords Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {passwords
              .filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()) || p.username.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((item) => {
                const isRevealed = showPassMap[item.id];
                return (
                  <div key={item.id} className="bg-[#0D111A] border border-[#202735] rounded-2xl p-5 space-y-4 shadow-lg relative group">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 rounded-lg bg-[#5B7CFA]/10 text-[#5B7CFA]">
                            <Key className="w-4 h-4" />
                          </span>
                          <h4 className="font-bold text-sm text-[#F3F5F7]">{item.title}</h4>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#111722] border border-[#202735] text-[#9AA4B2] inline-block">
                          {item.category}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        {item.url && (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg bg-[#111722] border border-[#202735] text-[#9AA4B2] hover:text-[#5B7CFA] transition-colors"
                            title="فتح الرابط"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <button
                          onClick={() => setPasswords(passwords.filter(p => p.id !== item.id))}
                          className="p-2 rounded-lg bg-[#111722] border border-[#202735] text-[#64748B] hover:text-red-400 transition-colors cursor-pointer"
                          title="حذف"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 bg-[#111722] p-3 rounded-xl border border-[#202735] text-xs font-mono">
                      <div className="flex items-center justify-between">
                        <span className="text-[#64748B]">{language === 'ar' ? 'المستخدم:' : 'User:'}</span>
                        <span className="text-[#F3F5F7] select-all">{item.username}</span>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-[#202735]/60">
                        <span className="text-[#64748B]">{language === 'ar' ? 'الكلمة:' : 'Pass:'}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[#10B981] font-bold tracking-wider">
                            {isRevealed ? item.pass : '••••••••••••'}
                          </span>
                          <button
                            onClick={() => setShowPassMap({ ...showPassMap, [item.id]: !isRevealed })}
                            className="text-[#9AA4B2] hover:text-white"
                          >
                            {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => handleCopy(item.pass, item.id)}
                            className="text-[#5B7CFA] hover:text-[#4A6BD8]"
                            title="نسخ"
                          >
                            {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {item.notes && (
                      <p className="text-[11px] text-[#9AA4B2] bg-[#080B12] p-2.5 rounded-lg border border-[#202735] leading-relaxed">
                        {item.notes}
                      </p>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ---------------- 3. CONTENT PLANNER TAB ---------------- */}
      {activeSubTab === 'content' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-sm text-[#F3F5F7] flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#5B7CFA]" />
              <span>{language === 'ar' ? 'أفكار ومحتوى السوشيال ميديا' : 'Social Content Pipeline'}</span>
            </h3>

            <button
              onClick={() => setIsAddingContent(!isAddingContent)}
              className="px-5 py-2.5 rounded-xl bg-[#5B7CFA] hover:bg-[#4A6BD8] text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'ar' ? 'إضافة فكرة محتوى جديدة' : 'Add Content Idea'}</span>
            </button>
          </div>

          {/* Add Content Modal */}
          {isAddingContent && (
            <div className="bg-[#0D111A] border border-[#5B7CFA]/40 rounded-2xl p-6 shadow-xl space-y-4 animate-slide-in">
              <div className="flex justify-between items-center pb-3 border-b border-[#202735]">
                <h3 className="text-sm font-bold text-white">
                  {language === 'ar' ? 'جدولة فكرة محتوى أو منشور جديد' : 'New Content Idea'}
                </h3>
                <button onClick={() => setIsAddingContent(false)} className="text-[#9AA4B2] hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddContent} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[10px] font-bold text-[#9AA4B2] uppercase">{language === 'ar' ? 'عنوان الموضوع / الفيديو' : 'Topic / Video Title'}</label>
                  <input
                    type="text"
                    required
                    value={newContentTitle}
                    onChange={(e) => setNewContentTitle(e.target.value)}
                    placeholder="مثال: أسرار البرمجة وتطوير الويب الحديث"
                    className="w-full bg-[#111722] border border-[#202735] focus:border-[#5B7CFA] text-[#F3F5F7] px-3.5 py-2.5 rounded-xl focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#9AA4B2] uppercase">{language === 'ar' ? 'المنصة المستهدفة' : 'Platform'}</label>
                  <select
                    value={newContentPlatform}
                    onChange={(e: any) => setNewContentPlatform(e.target.value)}
                    className="w-full bg-[#111722] border border-[#202735] focus:border-[#5B7CFA] text-[#F3F5F7] px-3.5 py-2.5 rounded-xl focus:outline-none font-mono uppercase text-[11px]"
                  >
                    <option value="tiktok">TikTok</option>
                    <option value="facebook">Facebook</option>
                    <option value="instagram">Instagram</option>
                    <option value="youtube">YouTube</option>
                    <option value="blog">Blog / Article</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#9AA4B2] uppercase">{language === 'ar' ? 'حالة الإنجاز' : 'Status'}</label>
                  <select
                    value={newContentStatus}
                    onChange={(e: any) => setNewContentStatus(e.target.value)}
                    className="w-full bg-[#111722] border border-[#202735] focus:border-[#5B7CFA] text-[#F3F5F7] px-3.5 py-2.5 rounded-xl focus:outline-none"
                  >
                    <option value="idea">{language === 'ar' ? '💡 فكرة مبدئية' : 'Idea'}</option>
                    <option value="draft">{language === 'ar' ? '✍️ قيد التجهيز / مسودة' : 'Drafting'}</option>
                    <option value="ready">{language === 'ar' ? '🚀 جاهز للنشر' : 'Ready'}</option>
                    <option value="published">{language === 'ar' ? '✅ تم النشر' : 'Published'}</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#9AA4B2] uppercase">{language === 'ar' ? 'تاريخ النشر المستهدف' : 'Publish Date'}</label>
                  <input
                    type="date"
                    value={newContentDate}
                    onChange={(e) => setNewContentDate(e.target.value)}
                    className="w-full bg-[#111722] border border-[#202735] focus:border-[#5B7CFA] text-[#F3F5F7] px-3.5 py-2.5 rounded-xl focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[10px] font-bold text-[#9AA4B2] uppercase">{language === 'ar' ? 'ملاحظات وسكريبت' : 'Script & Notes'}</label>
                  <textarea
                    rows={3}
                    value={newContentNotes}
                    onChange={(e) => setNewContentNotes(e.target.value)}
                    placeholder="الأفكار الرئيسية أو الهاشتاجات..."
                    className="w-full bg-[#111722] border border-[#202735] focus:border-[#5B7CFA] text-[#F3F5F7] px-3.5 py-2.5 rounded-xl focus:outline-none resize-none"
                  ></textarea>
                </div>

                <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingContent(false)}
                    className="px-4 py-2 rounded-xl bg-[#111722] border border-[#202735] text-[#9AA4B2]"
                  >
                    {language === 'ar' ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-xl bg-[#5B7CFA] hover:bg-[#4A6BD8] text-white font-bold"
                  >
                    {language === 'ar' ? 'حفظ في خطة المحتوى' : 'Save to Content Plan'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Contents Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contents.map((item) => (
              <div key={item.id} className="bg-[#0D111A] border border-[#202735] rounded-2xl p-5 space-y-4 shadow-lg flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase bg-[#111722] text-[#5B7CFA] border border-[#5B7CFA]/30">
                      {item.platform}
                    </span>
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-mono uppercase ${
                      item.status === 'published' ? 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30' :
                      item.status === 'ready' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30' :
                      item.status === 'draft' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' :
                      'bg-slate-500/10 text-slate-400 border border-slate-500/30'
                    }`}>
                      {item.status}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-[#F3F5F7] leading-snug">{item.title}</h4>

                  {item.notes && (
                    <p className="text-xs text-[#9AA4B2] bg-[#111722] p-3 rounded-xl border border-[#202735] line-clamp-3">
                      {item.notes}
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-[#202735] flex items-center justify-between text-xs text-[#64748B]">
                  <span className="flex items-center gap-1.5 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-[#5B7CFA]" />
                    {item.publishDate}
                  </span>

                  <button
                    onClick={() => setContents(contents.filter(c => c.id !== item.id))}
                    className="p-1.5 rounded-lg hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------------- 4. NOTES & SCRATCHPAD TAB ---------------- */}
      {activeSubTab === 'notes' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-sm text-[#F3F5F7] flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#5B7CFA]" />
              <span>{language === 'ar' ? 'المفكرة السريعة وأفكار المشاريع' : 'Scratchpad & Notes'}</span>
            </h3>

            <button
              onClick={() => setIsAddingNote(!isAddingNote)}
              className="px-5 py-2.5 rounded-xl bg-[#5B7CFA] hover:bg-[#4A6BD8] text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'ar' ? 'إضافة ملاحظة جديدة' : 'Add Note'}</span>
            </button>
          </div>

          {/* Add Note Modal */}
          {isAddingNote && (
            <div className="bg-[#0D111A] border border-[#5B7CFA]/40 rounded-2xl p-6 shadow-xl space-y-4 animate-slide-in">
              <div className="flex justify-between items-center pb-3 border-b border-[#202735]">
                <h3 className="text-sm font-bold text-white">
                  {language === 'ar' ? 'إضافة ملاحظة أو فكرة جديدة' : 'New Note'}
                </h3>
                <button onClick={() => setIsAddingNote(false)} className="text-[#9AA4B2] hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddNote} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-[10px] font-bold text-[#9AA4B2] uppercase">{language === 'ar' ? 'عنوان الملاحظة' : 'Title'}</label>
                    <input
                      type="text"
                      required
                      value={newNoteTitle}
                      onChange={(e) => setNewNoteTitle(e.target.value)}
                      placeholder="عنوان مختصر..."
                      className="w-full bg-[#111722] border border-[#202735] focus:border-[#5B7CFA] text-[#F3F5F7] px-3.5 py-2.5 rounded-xl focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#9AA4B2] uppercase">{language === 'ar' ? 'التصنيف' : 'Category'}</label>
                    <input
                      type="text"
                      value={newNoteCat}
                      onChange={(e) => setNewNoteCat(e.target.value)}
                      placeholder="تطوير، أفكار، عام..."
                      className="w-full bg-[#111722] border border-[#202735] focus:border-[#5B7CFA] text-[#F3F5F7] px-3.5 py-2.5 rounded-xl focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#9AA4B2] uppercase">{language === 'ar' ? 'محتوى الملاحظة' : 'Content'}</label>
                  <textarea
                    rows={4}
                    required
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    placeholder="اكتب أفكارك وملاحظاتك هنا..."
                    className="w-full bg-[#111722] border border-[#202735] focus:border-[#5B7CFA] text-[#F3F5F7] px-3.5 py-2.5 rounded-xl focus:outline-none resize-none"
                  ></textarea>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingNote(false)}
                    className="px-4 py-2 rounded-xl bg-[#111722] border border-[#202735] text-[#9AA4B2]"
                  >
                    {language === 'ar' ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-xl bg-[#5B7CFA] hover:bg-[#4A6BD8] text-white font-bold"
                  >
                    {language === 'ar' ? 'حفظ الملاحظة' : 'Save Note'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Notes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notes.map((note) => (
              <div key={note.id} className="bg-[#0D111A] border border-[#202735] rounded-2xl p-5 space-y-3 shadow-lg flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-mono uppercase bg-[#111722] border border-[#202735] text-[#5B7CFA]">
                      {note.category}
                    </span>
                    <span className="text-[10px] text-[#64748B] font-mono">{note.updatedAt}</span>
                  </div>
                  <h4 className="font-bold text-sm text-[#F3F5F7]">{note.title}</h4>
                  <p className="text-xs text-[#9AA4B2] leading-relaxed whitespace-pre-wrap bg-[#111722] p-3.5 rounded-xl border border-[#202735]">
                    {note.content}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#202735] flex justify-end">
                  <button
                    onClick={() => setNotes(notes.filter(n => n.id !== note.id))}
                    className="p-1.5 rounded-lg text-[#64748B] hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
