import React, { useState, useEffect } from 'react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const ErrorBoundary: React.FC<Props> = ({ children, fallback }) => {
  const [hasError, setHasError] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Global caught error:', event.error);
      setHasError(true);
      setErrorMsg(event.message || 'Unknown runtime error');
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      console.error('Global unhandled rejection:', event.reason);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  if (hasError) {
    if (fallback) return <>{fallback}</>;
    return (
      <div className="min-h-screen bg-[#080B12] text-[#F3F5F7] flex flex-col items-center justify-center p-6 text-center">
        <div className="p-8 rounded-3xl bg-[#0D111A] border border-red-500/30 max-w-md w-full shadow-2xl space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center mx-auto text-xl font-bold">
            !
          </div>
          <h2 className="text-xl font-bold text-[#F3F5F7]">حدث خطأ أثناء تحميل الصفحة</h2>
          <p className="text-xs text-[#9AA4B2] font-mono leading-relaxed">
            {errorMsg || 'An unexpected error occurred.'}
          </p>
          <button
            onClick={() => {
              setHasError(false);
              window.location.href = './';
            }}
            className="px-6 py-2.5 rounded-xl bg-[#5B7CFA] hover:bg-[#4A6BD8] text-white text-xs font-bold transition-all cursor-pointer shadow-lg shadow-[#5B7CFA]/30"
          >
            إعادة تحميل الصفحة
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
