'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface AudioToggleProps {
  trackTitle: string;
  rawButton: string;
  masterButton: string;
}

export function AudioToggle({ trackTitle, rawButton, masterButton }: AudioToggleProps) {
  const [mode, setMode] = useState<'raw' | 'master'>('master');

  return (
    <div className="bg-white dark:bg-dark-umber p-12 rounded-[48px] border border-dark-umber/5 dark:border-off-white/10 shadow-xl flex flex-col md:flex-row items-center gap-12">
      <div className="flex-1">
        <h4 className="text-xl font-bold italic mb-6 text-dark-umber dark:text-off-white">
          {trackTitle}
        </h4>
        <div className="flex gap-4">
          <button
            onClick={() => setMode('raw')}
            className={`px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest transition ${
              mode === 'raw'
                ? 'bg-dark-umber text-white dark:bg-off-white dark:text-dark-umber'
                : 'border border-dark-umber dark:border-off-white text-dark-umber dark:text-off-white hover:bg-dark-umber/5 dark:hover:bg-off-white/5'
            }`}
          >
            {rawButton}
          </button>
          <button
            onClick={() => setMode('master')}
            className={`px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest transition ${
              mode === 'master'
                ? 'bg-brick-red text-white shadow-lg'
                : 'border border-dark-umber dark:border-off-white text-dark-umber dark:text-off-white hover:bg-dark-umber/5 dark:hover:bg-off-white/5'
            }`}
          >
            {masterButton}
          </button>
        </div>
      </div>

      <div className="flex-1 w-full h-16 flex items-end gap-1">
        {[0.4, 0.8, 1, 0.7, 0.5].map((height, idx) => (
          <motion.div
            key={idx}
            className={`flex-1 rounded-full ${
              mode === 'master'
                ? 'bg-brick-red'
                : 'bg-warm-gold/30'
            }`}
            animate={{ height: `${height * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        ))}
      </div>
    </div>
  );
}
