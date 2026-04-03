'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

export function FAQAccordion({ questions }: { questions: FAQItem[] }) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <div className="space-y-4">
      {questions.map((item, idx) => (
        <div
          key={idx}
          className="bg-white dark:bg-dark-umber border border-dark-umber/5 dark:border-off-white/10 rounded-3xl p-8 cursor-pointer overflow-hidden"
          onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
        >
          <div className="flex justify-between items-center text-left">
            <span className="font-bold text-dark-umber dark:text-off-white italic">
              {item.question}
            </span>
            <motion.div
              animate={{ rotate: openIdx === idx ? 45 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <Plus className="w-5 h-5 text-warm-gold shrink-0" />
            </motion.div>
          </div>

          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: openIdx === idx ? 'auto' : 0,
              opacity: openIdx === idx ? 1 : 0,
            }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="pt-4 text-sm text-soft-brown dark:text-off-white/70 italic leading-relaxed">
              {item.answer}
            </div>
          </motion.div>
        </div>
      ))}
    </div>
  );
}
