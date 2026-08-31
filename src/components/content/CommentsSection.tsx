import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { User, MessageSquare, Send, Loader2 } from 'lucide-react';
import { db } from '../../lib/firebase';
import { collection, query, where, onSnapshot, addDoc } from 'firebase/firestore';

interface Comment {
  id: string;
  text: string;
  date: string;
  author: string;
  createdAt?: string;
}

interface CommentsSectionProps {
  articleSlug: string;
}

export const CommentsSection: React.FC<CommentsSectionProps> = ({ articleSlug }) => {
  const { language, t } = useLanguage();
  const [comments, setComments] = useState<Comment[]>([]);
  const [authorName, setAuthorName] = useState('');
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Subscribe to real-time comments from Firestore
  useEffect(() => {
    setIsLoading(true);
    const commentsRef = collection(db, 'comments');
    const q = query(commentsRef, where('articleSlug', '==', articleSlug));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedComments: Comment[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          fetchedComments.push({
            id: doc.id,
            text: data.text,
            author: data.author,
            date: data.createdAt
              ? new Date(data.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })
              : '',
            createdAt: data.createdAt,
          });
        });

        // Sort comments by createdAt ascending client-side
        fetchedComments.sort((a, b) => {
          if (!a.createdAt) return -1;
          if (!b.createdAt) return 1;
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        });

        setComments(fetchedComments);
        setIsLoading(false);
      },
      (error) => {
        console.error('Error fetching comments:', error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [articleSlug, language]);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const finalAuthor = authorName.trim() || (language === 'ar' ? 'زائر' : 'Visitor');
      const now = new Date().toISOString();

      await addDoc(collection(db, 'comments'), {
        articleSlug,
        author: finalAuthor,
        text: newComment.trim(),
        createdAt: now,
      });

      setNewComment('');
    } catch (err) {
      console.error('Error posting comment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-12 border-t border-[#202735] space-y-8 text-start">
      <div className="flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-[#5B7CFA]" />
        <h3 className="text-xl font-bold text-[#F3F5F7]">
          {t.content.commentsTitle} ({comments.length})
        </h3>
      </div>

      <form onSubmit={handlePostComment} className="flex gap-3">
        <div className="w-10 h-10 rounded-full bg-[#111722] border border-[#202735] flex items-center justify-center shrink-0">
          <User className="w-5 h-5 text-[#9AA4B2]" />
        </div>
        <div className="flex-1 space-y-3">
          <input
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder={(t.content as any).authorPlaceholder || (language === 'ar' ? 'اسمك (اختياري)...' : 'Your name (optional)...')}
            className="w-full bg-[#0D111A] border border-[#202735] text-xs text-[#F3F5F7] placeholder-[#64748B] px-4 py-2.5 rounded-xl focus:outline-none focus:border-[#5B7CFA] transition-colors"
          />
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={t.content.leaveComment}
            className="w-full bg-[#0D111A] border border-[#202735] text-sm text-[#F3F5F7] placeholder-[#64748B] p-4 rounded-xl focus:outline-none focus:border-[#5B7CFA] resize-none h-24 transition-colors"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!newComment.trim() || isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#5B7CFA] hover:bg-[#4B6EF5] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-md transition-all shrink-0 cursor-pointer"
            >
              {isSubmitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <span>{t.content.postComment}</span>
                  <Send className={`w-3.5 h-3.5 ${language === 'ar' ? 'rotate-180' : ''}`} />
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      <div className="space-y-6 pt-4">
        {isLoading ? (
          <div className="flex justify-center py-8 text-[#5B7CFA]">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : comments.length === 0 ? (
          <p className="text-sm text-[#64748B] text-center py-8">
            {t.content.noComments}
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-[#111722] border border-[#202735] flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-[#64748B]" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-sm text-[#F3F5F7]">{comment.author}</span>
                  <span className="text-xs text-[#64748B]">{comment.date}</span>
                </div>
                <p className="text-sm text-[#9AA4B2] leading-relaxed whitespace-pre-wrap">
                  {comment.text}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
