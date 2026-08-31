import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface SplashScreenProps {
  isVisible: boolean;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ isVisible }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#080B12]"
        >
          <div className="relative flex flex-col items-center">
            {/* Background Glow */}
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1.2, opacity: 0.3 }}
              transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
              className="absolute w-40 h-40 bg-[#5B7CFA] rounded-full blur-[60px] pointer-events-none"
            />
            
            {/* Logo Container */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative z-10 w-24 h-24 rounded-2xl bg-[#111722] border border-[#202735] flex items-center justify-center shadow-2xl overflow-hidden"
            >
              <img 
                src="https://res.cloudinary.com/f6t2sqiv/image/upload/v1787853834/Artboard_1_9x.png" 
                alt="Abu Al-Saud Logo" 
                className="w-16 h-16 object-contain"
              />
            </motion.div>

            {/* Loading text / bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="mt-8 flex flex-col items-center gap-3"
            >
              <div className="w-32 h-1 bg-[#151B26] rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 3.5, ease: "easeInOut" }}
                  className="h-full bg-gradient-to-r from-[#5B7CFA] to-[#10B981]"
                />
              </div>
              <span className="text-[#64748B] text-sm font-medium tracking-widest">
                مرحباً بك في عالمي ...
              </span>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
