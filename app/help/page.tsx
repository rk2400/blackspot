"use client";

import { useState } from 'react';
// Header and Footer are provided by `app/layout.tsx`
import Link from 'next/link';

export default function HelpPage() {
  const faqs = [
    {
      question: 'How do I use the tools?',
      answer: 'Create an account or log in, then explore meditation, journaling, and cosmic cycle tools as we roll them out.',
    },
    {
      question: 'Is my data private?',
      answer: 'Yes. Your personal information is protected and used only to provide the service as described in our Privacy Policy.',
    },
    {
      question: 'Will there be new features?',
      answer: 'We are actively building new spiritual and wellness tools. Updates will be announced periodically.',
    },
    {
      question: 'How can I reset my account?',
      answer: 'Reach out via the Contact page and we will help with account issues.',
    },
    {
      question: 'Can I suggest a feature?',
      answer: 'Yes. Use the Contact page to share ideas or feedback.',
    },
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-stone-900 text-white">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center gap-8 mb-8">
          <div className="flex-1">
            <h1 className="text-4xl font-bold">Help & Support</h1>
            <p className="text-stone-300 mt-2">Quick answers and support resources for your wellness journey.</p>
          </div>

        </div>

        <div className="card mb-8">
          <h2 className="text-2xl font-semibold mb-4">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div key={index} className="border rounded-md overflow-hidden">
                <button
                  className="w-full text-left px-4 py-3 flex justify-between items-center text-stone-200"
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                >
                  <span className="font-medium">{faq.question}</span>
                  <span className="text-stone-400">{openIndex === index ? '−' : '+'}</span>
                </button>
                {openIndex === index && (
                  <div className="px-4 pb-4 text-stone-300">{faq.answer}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="text-2xl font-semibold mb-4">Still Need Help?</h2>
          <p className="text-stone-300 mb-4">Can't find what you're looking for? Our support team is here to help.</p>
          <Link href="/contact" className="btn btn-primary">Contact Support</Link>
        </div>
      </main>
    </div>
  );
}



