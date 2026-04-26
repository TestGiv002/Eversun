'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import UserMenu from './UserMenu';
import ThemeToggle from './ThemeToggle';
import { Sun } from '@phosphor-icons/react';

export default function ConditionalHeader() {
  const pathname = usePathname();
  const [time, setTime] = useState('');
  const activeSection = useAppStore((state) => state.activeSection);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Europe/Paris',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      };
      setTime(now.toLocaleTimeString('fr-FR', options));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  const isAuthPage =
    pathname?.startsWith('/login') || pathname?.startsWith('/reset-password');

  if (isAuthPage) {
    return null;
  }

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="fixed top-0 left-0 right-0 z-40 w-full h-14 bg-gradient-to-r from-white via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 flex items-center px-4 shadow-lg relative overflow-hidden"
        style={{ position: 'fixed', top: 0, left: 0, right: 0 }}
        role="banner"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-amber-50/50 via-transparent to-orange-50/50 dark:from-amber-900/10 dark:via-transparent dark:to-orange-900/10" />
        <div className="flex-1 flex items-center gap-3 relative z-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="flex items-center gap-2.5"
          >
            <motion.div
              initial={{ rotate: -180, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full blur-lg opacity-60" />
              <div className="relative bg-gradient-to-br from-amber-500 to-orange-600 rounded-full p-1.5 shadow-md hover:shadow-lg transition-shadow duration-200">
                <Sun size={20} weight="fill" className="text-white" />
              </div>
            </motion.div>
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.3,
                delay: 0.15,
                ease: [0.4, 0, 0.2, 1],
              }}
              className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent tracking-tight"
            >
              Eversun
            </motion.span>
          </motion.div>
        </div>
        <div className="flex items-center gap-2.5 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1.5 rounded-lg shadow-md border border-amber-400/30"
          >
            {time}
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="flex items-center gap-2 pl-3 border-l border-gray-200 dark:border-gray-700"
          >
            <ThemeToggle />
            <UserMenu />
          </motion.div>
        </div>
      </motion.header>
      <div id="logout-dialog-portal" />
    </>
  );
}
