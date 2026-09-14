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
                    className="bg-white dark:bg-dark-umber border border-dark-umber/5 dark:border-off-white/10 rounded-3xl p-8 overflow-hidden"
                >
                    {/* A <button> rather than a clickable <div>: the previous markup
                        could not be reached or toggled with a keyboard at all. */}
                    <h3>
                        <button
                            type="button"
                            aria-expanded={openIdx === idx}
                            aria-controls={`faq-answer-${idx}`}
                            id={`faq-question-${idx}`}
                            onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                            className="flex w-full cursor-pointer items-center justify-between gap-4 text-left font-bold text-dark-umber dark:text-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warm-gold/80 rounded-lg"
                        >
                            <span>{item.question}</span>
                            <motion.span
                                animate={{ rotate: openIdx === idx ? 45 : 0 }}
                                transition={{ duration: 0.3 }}
                                className="inline-flex shrink-0"
                            >
                                <Plus
                                    className="w-5 h-5 text-warm-gold shrink-0"
                                    aria-hidden="true"
                                    focusable="false"
                                />
                            </motion.span>
                        </button>
                    </h3>

                    <motion.div
                        id={`faq-answer-${idx}`}
                        role="region"
                        aria-labelledby={`faq-question-${idx}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{
                            height: openIdx === idx ? 'auto' : 0,
                            opacity: openIdx === idx ? 1 : 0,
                        }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <div className="pt-4 text-sm text-soft-brown dark:text-off-white/70 leading-relaxed">
                            {item.answer}
                        </div>
                    </motion.div>
                </div>
            ))}
        </div>
    );
}
