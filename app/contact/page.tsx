"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@/lib/contexts/UserContext';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const { user } = useUser();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
      }));
    }
  }, [user]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      toast.success(data.message || 'Thank you for your message! We\'ll get back to you soon.');
      setFormData({ name: '', email: '', message: '' });
    } catch (error: any) {
      console.error('Contact form error:', error);
      toast.error(error.message || 'Failed to send message. Please try again later.');
    } finally {
      setLoading(false);
    }
  }

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText('support@blackspot.local');
      toast.success('Email copied to clipboard');
    } catch (e) {
      toast('support@blackspot.local');
    }
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-stone-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="block text-white/60 text-sm font-bold tracking-widest uppercase mb-4">Support</span>
          <h1 className="text-4xl md:text-5xl font-serif">Get in Touch</h1>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
          
          {/* Contact Info Card */}
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-stone-100 flex flex-col justify-between h-full">
            <div>
              <h2 className="text-2xl font-serif text-stone-900 mb-6">We're Here to Help</h2>
              <p className="text-stone-600 leading-relaxed mb-8">
                Have a question about wellness tools, account access, or feature suggestions?
                Our team is available Monday through Friday, 9am - 5pm IST.
              </p>
              
              <div className="space-y-8">
                <ContactItem 
                  icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />}
                  label="Email"
                  value="support@blackspot.local"
                  action={
                    <button onClick={copyEmail} className="text-xs text-primary-600 font-medium uppercase tracking-wider hover:text-primary-700 ml-2">
                      Copy
                    </button>
                  }
                />
                <ContactItem 
                  icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />}
                  label="Phone"
                  value="+91 9876543210"
                />
                <ContactItem 
                  icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />}
                  label="Studio"
                  value="Delhi, India"
                />
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-stone-100">
               <h3 className="font-serif text-stone-900 mb-4">Follow Our Journey</h3>
               <div className="flex gap-4">
                 <SocialButton label="Instagram" />
                 <SocialButton label="Twitter" />
                 <SocialButton label="Pinterest" />
               </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-stone-100">
            <h2 className="text-2xl font-serif text-stone-900 mb-6">Send a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-primary-500 focus:bg-white transition-all"
                  placeholder="Your Name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-primary-500 focus:bg-white transition-all"
                  placeholder="email@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Message</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-primary-500 focus:bg-white transition-all h-40 resize-none"
                  placeholder="How can we help?"
                  required
                />
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full btn btn-primary py-4"
              >
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>

        </div>
      </main>
    </div>
  );
}

function ContactItem({ icon, label, value, action }: { icon: React.ReactNode; label: string; value: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center text-primary-600 flex-shrink-0">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {icon}
        </svg>
      </div>
      <div>
        <p className="text-sm font-medium text-stone-900">{label}</p>
        <div className="flex items-center">
          <p className="text-stone-600">{value}</p>
          {action}
        </div>
      </div>
    </div>
  );
}

function SocialButton({ label }: { label: string }) {
  return (
    <button className="px-4 py-2 rounded-full border border-stone-200 text-stone-600 text-sm hover:bg-stone-50 hover:border-stone-300 transition-colors">
      {label}
    </button>
  );
}
