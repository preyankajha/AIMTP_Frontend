import { HelpCircle, Mail, MessageCircle, ChevronRight, ExternalLink, Phone } from 'lucide-react';

const faqs = [
  { q: 'How does the matching engine work?', a: 'Our engine automatically scans all active transfer requests and matches employees with perfectly reverse-matching station preferences in the same designation.' },
  { q: 'Can I post multiple transfer requests?', a: 'Yes! You can post multiple requests for different routes or departments, up to the limit configured by your admin.' },
  { q: 'How is my contact information shared?', a: 'Your mobile number is hidden by default. It is only revealed to a matched partner when you explicitly click "Reveal Contact".' },
  { q: 'What does "Matched" status mean?', a: 'It means the engine has found a qualified partner for that specific request. You can view their details in the "My Matches" section.' },
  { q: 'Is this portal affiliated with any specific organization?', a: 'No. This is an independent platform to help employees connect. All transfer approvals must go through official department channels.' },
];

const HelpPage = () => (
  <div className="animate-fade-in max-w-3xl mx-auto">
    <div className="mb-8">
      <h1 className="text-3xl font-black text-slate-900 tracking-tight">Help & Support</h1>
      <p className="text-slate-500 font-medium text-sm mt-1">Get answers and contact our support team</p>
    </div>

    {/* Contact Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
      <a
        href="mailto:support@aimtp.in"
        className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-primary-200 hover:shadow-md transition-all group"
      >
        <div className="h-12 w-12 bg-primary-50 border border-primary-100 rounded-xl flex items-center justify-center text-primary-700 group-hover:bg-primary-100 transition-colors shrink-0">
          <Mail className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-black text-slate-900 text-sm">Email Support</p>
          <p className="text-[11px] font-medium text-slate-400 mt-0.5 truncate">support@aimtp.in</p>
        </div>
        <ExternalLink className="h-4 w-4 text-slate-300 group-hover:text-primary-500 transition-colors" />
      </a>

      <div className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="h-12 w-12 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center text-emerald-700 shrink-0">
          <MessageCircle className="h-5 w-5" />
        </div>
        <div>
          <p className="font-black text-slate-900 text-sm">Response Time</p>
          <p className="text-[11px] font-medium text-slate-400 mt-0.5">Usually within 24-48 hours</p>
        </div>
      </div>
    </div>

    {/* FAQ */}
    <div>
      <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Frequently Asked Questions</h2>
      <div className="space-y-3">
        {faqs.map((faq, i) => (
          <details key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm group overflow-hidden">
            <summary className="flex items-center justify-between p-5 cursor-pointer list-none font-black text-slate-900 text-sm select-none">
              {faq.q}
              <ChevronRight className="h-4 w-4 text-slate-400 shrink-0 ml-4 group-open:rotate-90 transition-transform" />
            </summary>
            <div className="px-5 pb-5 text-slate-500 font-medium text-sm leading-relaxed border-t border-slate-50 pt-4">
              {faq.a}
            </div>
          </details>
        ))}
      </div>
    </div>

    {/* Developer Info */}
    <div className="mt-8 bg-primary-50 border border-primary-100 rounded-[1.5rem] p-6">
      <p className="text-sm text-primary-800 font-medium">
        <span className="font-black">Developed by</span> Priyanka Jha · This platform is independently operated and domain-neutral.
      </p>
    </div>
  </div>
);

export default HelpPage;
