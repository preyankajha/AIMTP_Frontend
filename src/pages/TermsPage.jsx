import React, { useState, useEffect } from 'react';
import { ShieldCheck, FileText, AlertTriangle, ArrowLeft, Lock, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

const TermsPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Individual language states for each section
  const [langDecl, setLangDecl] = useState('en');
  const [langTerms, setLangTerms] = useState('en');
  const [langDisc, setLangDisc] = useState('en');
  const [langPrivacy, setLangPrivacy] = useState('en');
  const [langRefund, setLangRefund] = useState('en');

  const LanguageToggle = ({ currentLang, setLang }) => (
    <div className="flex bg-slate-100 p-1 rounded-xl shrink-0">
      <button
        onClick={() => setLang('en')}
        className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${currentLang === 'en' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
      >
        English
      </button>
      <button
        onClick={() => setLang('hi')}
        className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${currentLang === 'hi' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
      >
        हिन्दी
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <header className="bg-primary-900 text-white sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link to="/" className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight">All India Mutual Transfer Portal (AITP)</h1>
            <p className="text-primary-200 text-xs md:text-sm font-medium">Legal Information & Policies</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 pb-24 space-y-12">

        {/* Page Intro */}
        <div className="text-center space-y-4 mb-4">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Declaration, Terms & Disclaimer</h2>
          <p className="text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
            Please carefully read our declaration, terms of service, and disclaimer. This portal is a facilitation platform designed to help employees connect for mutual transfers.
          </p>
        </div>

        {/* 1. Declaration */}
        <section className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-slate-50/50 border-b border-slate-100 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-indigo-100 text-indigo-600 p-3 rounded-2xl">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900">1. Declaration</h3>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">घोषणा</p>
              </div>
            </div>
            <LanguageToggle currentLang={langDecl} setLang={setLangDecl} />
          </div>

          <div className="p-6 sm:p-8">
            {langDecl === 'en' ? (
              <ul className="space-y-4 text-slate-700 leading-relaxed font-medium animate-fade-in">
                <li className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0 mt-2.5"></div>
                  <p>I hereby declare that the information provided by me on the All India Mutual Transfer Portal (AITP) is true and correct to the best of my knowledge and belief.</p>
                </li>
                <li className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0 mt-2.5"></div>
                  <p>I understand that this platform is only a facilitation service that helps employees from different organizations, departments, or sectors connect with others who are interested in mutual transfers.</p>
                </li>
                <li className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0 mt-2.5"></div>
                  <p>I agree that any transfer process, approval, or decision will be governed solely by the rules, policies, and procedures of the respective organization or employer.</p>
                </li>
                <li className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0 mt-2.5"></div>
                  <p>I also confirm that I will use this platform responsibly and will not misuse the personal information or contact details of other users.</p>
                </li>
              </ul>
            ) : (
              <ul className="space-y-4 text-slate-700 leading-relaxed font-medium text-lg animate-fade-in">
                <li className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0 mt-2.5"></div>
                  <p>मैं यह घोषित करता/करती हूँ कि ऑल इंडिया म्यूचुअल ट्रांसफर पोर्टल (AITP) पर मेरे द्वारा दी गई सभी जानकारी मेरी जानकारी और विश्वास के अनुसार सत्य एवं सही है।</p>
                </li>
                <li className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0 mt-2.5"></div>
                  <p>मैं समझता/समझती हूँ कि यह प्लेटफॉर्म केवल एक सुविधा प्रदान करने वाला माध्यम है जो विभिन्न संगठनों, विभागों या क्षेत्रों के कर्मचारियों को म्यूचुअल ट्रांसफर के इच्छुक अन्य कर्मचारियों से जोड़ने में सहायता करता है।</p>
                </li>
                <li className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0 mt-2.5"></div>
                  <p>मैं सहमत हूँ कि किसी भी प्रकार का स्थानांतरण, स्वीकृति या निर्णय पूरी तरह से संबंधित संस्था, विभाग या नियोक्ता के नियमों और नीतियों के अनुसार ही होगा।</p>
                </li>
                <li className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0 mt-2.5"></div>
                  <p>मैं यह भी पुष्टि करता/करती हूँ कि मैं इस प्लेटफॉर्म का उपयोग जिम्मेदारीपूर्वक करूँगा/करूँगी और अन्य उपयोगकर्ताओं की व्यक्तिगत जानकारी का दुरुपयोग नहीं करूँगा/करूँगी।</p>
                </li>
              </ul>
            )}
          </div>
        </section>

        {/* 2. Terms and Conditions */}
        <section className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-slate-50/50 border-b border-slate-100 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-emerald-100 text-emerald-600 p-3 rounded-2xl">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900">2. Terms & Conditions</h3>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">नियम एवं शर्तें</p>
              </div>
            </div>
            <LanguageToggle currentLang={langTerms} setLang={setLangTerms} />
          </div>

          <div className="p-6 sm:p-8">
            {langTerms === 'en' ? (
              <ol className="list-decimal list-outside ml-5 space-y-4 text-slate-700 leading-relaxed font-medium animate-fade-in">
                <li className="pl-2">All India Mutual Transfer Portal (AITP) is an independent platform designed to help employees from different sectors find potential mutual transfer partners.</li>
                <li className="pl-2">This platform is not affiliated with, endorsed by, or officially connected to any government organization, company, or department unless explicitly stated.</li>
                <li className="pl-2">The platform only facilitates communication between users who are interested in exploring mutual transfer opportunities.</li>
                <li className="pl-2">Users must provide accurate and genuine information while registering and posting transfer requests.</li>
                <li className="pl-2">Any misuse of the platform, including providing false information, impersonation, or harassment of other users, may lead to account suspension or permanent removal.</li>
                <li className="pl-2">The portal does not guarantee any transfer, as the final decision depends on the respective employer or organization.</li>
                <li className="pl-2">Users are responsible for verifying the authenticity of the information shared by other users before taking further action.</li>
                <li className="pl-2">The platform reserves the right to modify or update these terms at any time without prior notice.</li>
                <li className="pl-2">By using this platform, users agree to comply with these terms and all applicable laws.</li>
              </ol>
            ) : (
              <ol className="list-decimal list-outside ml-5 space-y-4 text-slate-700 leading-relaxed font-medium text-lg animate-fade-in">
                <li className="pl-2">ऑल इंडिया म्यूचुअल ट्रांसफर पोर्टल (AITP) एक स्वतंत्र प्लेटफॉर्म है जिसका उद्देश्य विभिन्न क्षेत्रों के कर्मचारियों को संभावित म्यूचुअल ट्रांसफर पार्टनर खोजने में सहायता करना है।</li>
                <li className="pl-2">यह प्लेटफॉर्म किसी भी सरकारी संगठन, कंपनी या विभाग से आधिकारिक रूप से संबद्ध नहीं है जब तक कि स्पष्ट रूप से उल्लेख न किया गया हो।</li>
                <li className="pl-2">यह प्लेटफॉर्म केवल उन उपयोगकर्ताओं के बीच संपर्क स्थापित करने का माध्यम है जो म्यूचुअल ट्रांसफर के अवसरों की तलाश कर रहे हैं।</li>
                <li className="pl-2">उपयोगकर्ताओं को पंजीकरण और ट्रांसफर अनुरोध करते समय सही और सत्य जानकारी प्रदान करनी होगी।</li>
                <li className="pl-2">प्लेटफॉर्म का दुरुपयोग, गलत जानकारी देना, किसी और की पहचान का उपयोग करना या अन्य उपयोगकर्ताओं को परेशान करना खाते के निलंबन या स्थायी हटाए जाने का कारण बन सकता है।</li>
                <li className="pl-2">यह पोर्टल किसी भी प्रकार के स्थानांतरण की गारंटी नहीं देता क्योंकि अंतिम निर्णय संबंधित संस्था या नियोक्ता पर निर्भर करेगा।</li>
                <li className="pl-2">उपयोगकर्ताओं को अन्य उपयोगकर्ताओं द्वारा दी गई जानकारी की सत्यता स्वयं जांचनी चाहिए।</li>
                <li className="pl-2">प्लेटफॉर्म को इन नियमों और शर्तों में बिना पूर्व सूचना के परिवर्तन करने का अधिकार है।</li>
                <li className="pl-2">इस प्लेटफॉर्म का उपयोग करके उपयोगकर्ता इन सभी नियमों और शर्तों से सहमत होते हैं।</li>
              </ol>
            )}
          </div>
        </section>

        {/* 3. Disclaimer */}
        <section className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-slate-50/50 border-b border-slate-100 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-rose-100 text-rose-600 p-3 rounded-2xl">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900">3. Disclaimer</h3>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">अस्वीकरण</p>
              </div>
            </div>
            <LanguageToggle currentLang={langDisc} setLang={setLangDisc} />
          </div>

          <div className="p-6 sm:p-8">
            <div className="bg-rose-50/50 p-6 rounded-2xl border border-rose-100">
              {langDisc === 'en' ? (
                <ul className="space-y-4 text-rose-900 leading-relaxed font-medium animate-fade-in">
                  <li className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0 mt-2.5"></div>
                    <p>The All India Mutual Transfer Portal (AITP) is a private and independent platform that aims to help employees connect with others who are interested in mutual transfers across various sectors, organizations, or departments.</p>
                  </li>
                  <li className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0 mt-2.5"></div>
                    <p>This platform is not an official website of any government body, organization, or company unless explicitly stated.</p>
                  </li>
                  <li className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0 mt-2.5"></div>
                    <p>The portal only provides a communication medium and does not participate in or influence any official transfer process.</p>
                  </li>
                  <li className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0 mt-2.5"></div>
                    <p>Any transfer or job movement will be subject to the rules, policies, and approval procedures of the respective employer or organization.</p>
                  </li>
                  <li className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0 mt-2.5"></div>
                    <p>The platform shall not be responsible for any disputes, misunderstandings, losses, or consequences arising from interactions between users or from the use of this platform.</p>
                  </li>
                </ul>
              ) : (
                <ul className="space-y-4 text-rose-900 leading-relaxed font-medium text-lg animate-fade-in">
                  <li className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0 mt-2.5"></div>
                    <p>ऑल इंडिया म्यूचुअल ट्रांसफर पोर्टल (AITP) एक निजी और स्वतंत्र प्लेटफॉर्म है जिसका उद्देश्य विभिन्न क्षेत्रों, संगठनों या विभागों के कर्मचारियों को म्यूचुअल ट्रांसफर के इच्छुक अन्य कर्मचारियों से जोड़ना है।</p>
                  </li>
                  <li className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0 mt-2.5"></div>
                    <p>यह प्लेटफॉर्म किसी भी सरकारी संस्था, संगठन या कंपनी की आधिकारिक वेबसाइट नहीं है जब तक कि स्पष्ट रूप से उल्लेख न किया गया हो।</p>
                  </li>
                  <li className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0 mt-2.5"></div>
                    <p>यह पोर्टल केवल उपयोगकर्ताओं के बीच संपर्क स्थापित करने का माध्यम प्रदान करता है और किसी भी आधिकारिक स्थानांतरण प्रक्रिया में प्रत्यक्ष भूमिका नहीं निभाता।</p>
                  </li>
                  <li className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0 mt-2.5"></div>
                    <p>किसी भी प्रकार का स्थानांतरण या पद परिवर्तन संबंधित संस्था या नियोक्ता के नियमों, नीतियों और स्वीकृति प्रक्रियाओं के अधीन होगा।</p>
                  </li>
                  <li className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0 mt-2.5"></div>
                    <p>इस प्लेटफॉर्म के उपयोग से उत्पन्न किसी भी विवाद, गलतफहमी, नुकसान या परिणाम के लिए यह पोर्टल जिम्मेदार नहीं होगा।</p>
                  </li>
                </ul>
              )}
            </div>
          </div>
        </section>

        {/* 4. Privacy Policy */}
        <section className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-slate-50/50 border-b border-slate-100 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 text-blue-600 p-3 rounded-2xl">
                <Lock className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900">4. Privacy Policy</h3>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">गोपनीयता नीति</p>
              </div>
            </div>
            <LanguageToggle currentLang={langPrivacy} setLang={setLangPrivacy} />
          </div>

          <div className="p-6 sm:p-8">
            {langPrivacy === 'en' ? (
              <ul className="space-y-4 text-slate-700 leading-relaxed font-medium animate-fade-in">
                <li className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0 mt-2.5"></div>
                  <p><strong>Information Collected:</strong> We may collect personal data inside employee records (Name, Contact Number, Email, Designation, working remarks) directly using your manual inputs to strictly perform matched indexing.</p>
                </li>
                <li className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0 mt-2.5"></div>
                  <p><strong>Data Usage:</strong> Your professional details represent essential data vectors on our facilitation software and are exclusively shown to matched partners on the application or public lists as necessary to reveal compatible matches.</p>
                </li>
                <li className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0 mt-2.5"></div>
                  <p><strong>We Don't Sell Data:</strong> AIMTP strictly respects explicitly strict privacy rules. We NEVER sell, lease, or distribute your credentials or telephone numbers to aggregators or marketers for monetary compensation.</p>
                </li>
              </ul>
            ) : (
              <ul className="space-y-4 text-slate-700 leading-relaxed font-medium text-lg animate-fade-in">
                <li className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0 mt-2.5"></div>
                  <p><strong>डेटा संग्रह (Information Collected):</strong> आवश्यकतानुसार, आपके द्वारा प्रदान की गई व्यक्तिगत जानकारी (जैसे नाम, नंबर, पीएफ नंबर, पद, विभाग इत्यादि) सीधे हमारे प्लेटफ़ॉर्म पर फ़िल्टर मैचिंग के प्रदर्शन हेतु सुरक्षित रूप से व्यवस्थित की जाती हैं।</p>
                </li>
                <li className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0 mt-2.5"></div>
                  <p><strong>डेटा का उपयोग (Data Usage):</strong> ट्रांसफ़र की खोज हेतु, आपके व्यावसायिक विवरण अन्य ट्रांसफ़र पार्टनर को हमारी मैचिंग एल्गो के माध्यम से उपयुक्त रूप से दिखाए जा सकते हैं।</p>
                </li>
                <li className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0 mt-2.5"></div>
                  <p><strong>कोई डेटा बिक्री नहीं (We Don't Sell):</strong> AIMTP आपके डेटा और गोपनीयता का सम्मान करता है। हम आपका नंबर या अन्य विवरण किसी भी थर्ड पार्टी (third party) या विज्ञापन कंपनियों को कभी नहीं बेचते हैं।</p>
                </li>
              </ul>
            )}
          </div>
        </section>

       
      </main>

      {/* Footer minimal */}
      <footer className="bg-slate-900 py-8 border-t border-white/10 text-center text-slate-400 text-sm font-medium">
        <p>&copy; {new Date().getFullYear()} All India Mutual Transfer Portal. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default TermsPage;
