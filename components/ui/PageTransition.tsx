'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export default function PageTransition({ children, className = '' }: PageTransitionProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface SlideTransitionProps {
  children: React.ReactNode;
  direction?: 'left' | 'right' | 'up' | 'down';
  className?: string;
}

export function SlideTransition({ children, direction = 'right', className = '' }: SlideTransitionProps) {
  const variants = {
    left: { initial: { x: 50, opacity: 0 }, animate: { x: 0, opacity: 1 }, exit: { x: -50, opacity: 0 } },
    right: { initial: { x: -50, opacity: 0 }, animate: { x: 0, opacity: 1 }, exit: { x: 50, opacity: 0 } },
    up: { initial: { y: 50, opacity: 0 }, animate: { y: 0, opacity: 1 }, exit: { y: -50, opacity: 0 } },
    down: { initial: { y: -50, opacity: 0 }, animate: { y: 0, opacity: 1 }, exit: { y: 50, opacity: 0 } },
  };

  return (
    <motion.div
      initial={variants[direction].initial}
      animate={variants[direction].animate}
      exit={variants[direction].exit}
      transition={{
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
