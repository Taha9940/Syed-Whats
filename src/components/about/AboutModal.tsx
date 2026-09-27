import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  HelpCircle,
  Mail,
  FileText,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
  Send,
  CheckCircle,
} from 'lucide-react';
import { SyedLogo } from '../SyedLogo';

interface AboutModalProps {
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'about' | 'faq' | 'support' | 'legal'>('about');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  const [supportMessage, setSupportMessage] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [supportSent, setSupportSent] = useState(false);

  const faqs = [
    {
      q: 'What is SYED and how is it different from social media?',
      a: 'SYED is a dedicated, secure, private messaging and communication application. It is NOT a social network: there are no public feeds, no followers, no likes, and no algorithmic timelines. Your conversations, calls, and shared files remain strictly between you and your chosen contacts.',
    },
    {
      q: 'How does the unique numerical UID system work?',
      a: 'Every SYED account is automatically provisioned a permanent 9-digit numerical UID upon registration (e.g. 583927461). Users can discover each other either by unique username or numerical UID without needing to expose private phone numbers or SIM card details.',
    },
    {
      q: 'What file formats and limits are supported?',
      a: 'SYED supports complete data and file sharing including Photos (JPG, PNG, WEBP), Videos (MP4, MKV), Audio (MP3, WAV), Documents (PDF, DOCX, XLSX, PPTX, TXT), and Archives (ZIP, RAR, 7Z). Files up to 500 MB can be transferred, with selectable compressed or original quality.',
    },
    {
      q: 'How long do Status updates last?',
      a: 'Statuses are temporary updates that automatically expire and disappear 24 hours after posting. Only contacts in your permitted audience can view them.',
    },
    {
      q: 'Does SYED require a phone number?',
      a: 'No. SYED authentication is built strictly on Email + Password. We never ask for phone numbers, WhatsApp credentials, or SIM card information.',
    },
  ];

  const handleSendSupport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportMessage.trim()) return;
    setSupportSent(true);
    setTimeout(() => {
      setSupportSent(false);
      setSupportMessage('');
      setSupportEmail('');
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/65 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#16222F] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <SyedLogo size="sm" />
            <h3 className="text-base font-bold text-slate-800 dark:text-white">More & Support</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 px-4 bg-slate-50 dark:bg-slate-900/40 text-xs font-semibold">
          {[
            { id: 'about', label: 'About SYED', icon: <Info size={14} /> },
            { id: 'faq', label: 'FAQ', icon: <HelpCircle size={14} /> },
            { id: 'support', label: 'Contact Support', icon: <Mail size={14} /> },
            { id: 'legal', label: 'Terms & Privacy', icon: <FileText size={14} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-3.5 border-b-2 flex items-center gap-1.5 transition-all ${
                activeTab === tab.id
                  ? 'border-[#16B8A6] text-[#16B8A6]'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* ABOUT TAB */}
          {activeTab === 'about' && (
            <div className="space-y-5 text-center max-w-lg mx-auto">
              <div className="flex flex-col items-center">
                <SyedLogo size="xl" withContainer className="mb-3" />
                <h2 className="text-2xl font-black text-[#16324F] dark:text-white tracking-tight">
                  SYED
                </h2>
                <p className="text-xs font-semibold text-[#16B8A6] uppercase tracking-widest mt-0.5">
                  Private Messaging & Communication Platform
                </p>
                <span className="text-[11px] font-mono text-slate-400 mt-1">Version 2.4.0 (Secure Release)</span>
              </div>

              <div className="text-left text-xs text-slate-600 dark:text-slate-300 space-y-3 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/60">
                <p>
                  <strong>SYED</strong> is engineered from the ground up as a modern, private, fast communication suite. Designed with sleek origami paper plane aesthetics, it puts private conversations and high-speed data transfer first.
                </p>
                <p>
                  <strong>Core Pillars:</strong>
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Zero Phone Number Requirement:</strong> Email & password credentials only.</li>
                  <li><strong>Permanent 9-Digit UID:</strong> Fast discovery without sharing personal phone numbers.</li>
                  <li><strong>Uncompromised Media Transfer:</strong> Photos, Videos, Documents, and Archives up to 500 MB.</li>
                  <li><strong>Encrypted Voice & Video:</strong> High-fidelity low-latency calling.</li>
                  <li><strong>Temporary 24h Status:</strong> Disappearing status updates for permitted contacts.</li>
                  <li><strong>No Social Media Noise:</strong> No public feeds, no followers, no algorithmic distraction.</li>
                </ul>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs font-mono text-slate-400">
                <ShieldCheck size={16} className="text-[#16B8A6]" />
                <span>Protected by 256-Bit Transport Layer & Device Encryption</span>
              </div>
            </div>
          )}

          {/* FAQ TAB */}
          {activeTab === 'faq' && (
            <div className="space-y-3 max-w-xl mx-auto">
              {faqs.map((faq, idx) => {
                const isOpen = expandedFaq === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/40 overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedFaq(isOpen ? null : idx)}
                      className="w-full p-4 text-left flex items-center justify-between text-xs font-bold text-slate-800 dark:text-white"
                    >
                      <span>{faq.q}</span>
                      {isOpen ? (
                        <ChevronUp size={16} className="text-[#16B8A6] shrink-0" />
                      ) : (
                        <ChevronDown size={16} className="text-slate-400 shrink-0" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* SUPPORT TAB */}
          {activeTab === 'support' && (
            <div className="max-w-md mx-auto space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                  Contact SYED Support
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Have a technical question or need assistance? Our team is available 24/7.
                </p>
              </div>

              {supportSent ? (
                <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-2">
                  <CheckCircle size={32} className="mx-auto text-emerald-500" />
                  <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    Message Dispatched Successfully!
                  </p>
                  <p className="text-xs text-slate-500">
                    Ticket #SYED-{Math.floor(100000 + Math.random() * 900000)} has been created.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSendSupport} className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="your.email@domain.com"
                      value={supportEmail}
                      onChange={(e) => setSupportEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-[#16B8A6]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1">
                      Message / Issue Details
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Describe what happened or how we can assist..."
                      value={supportMessage}
                      onChange={(e) => setSupportMessage(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-[#16B8A6] resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-[#16B8A6] hover:bg-[#14a090] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-colors"
                  >
                    <Send size={15} />
                    <span>Send Message to Support</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* LEGAL & PRIVACY TAB */}
          {activeTab === 'legal' && (
            <div className="space-y-4 max-w-xl mx-auto text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2">
                <h4 className="font-bold text-sm text-slate-800 dark:text-white">
                  Privacy Policy & Data Security
                </h4>
                <p>
                  SYED respects user autonomy. We do not sell your personal data, profile, or attachments to advertising networks. Communication occurs strictly over encrypted channels.
                </p>
                <p>
                  User accounts are uniquely identified by a randomly generated 9-digit numerical UID rather than a phone number, preserving anonymity and reducing spam.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2">
                <h4 className="font-bold text-sm text-slate-800 dark:text-white">
                  Community Guidelines
                </h4>
                <p>
                  Users must not transmit malware, abusive materials, or copyrighted materials without authorization. Violation of safety terms will lead to immediate account suspension.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
