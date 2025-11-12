import React, { useState, useContext, useMemo } from 'react';
import { AppContext, AppContextType } from '../context/AppContext.tsx';
import { Search, ChevronDown, MailIcon, Send, LifeBuoy } from '../components/icons.tsx';

// FAQ Accordion Item Component
const FAQItem: React.FC<{
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
}> = ({ question, answer, isOpen, onClick }) => {
  return (
    <div className="border-b border-gray-700 last:border-b-0">
      <button
        onClick={onClick}
        className="w-full flex justify-between items-center text-left py-4 px-2 hover:bg-gray-700/50 rounded-md"
        aria-expanded={isOpen}
      >
        <span className="font-semibold text-white">{question}</span>
        <ChevronDown
          size={20}
          className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="text-gray-300 pb-4 px-2 prose prose-sm prose-invert max-w-none">
            <p>{answer}</p>
          </div>
        </div>
      </div>
    </div>
  );
};


const SupportPage: React.FC = () => {
    const context = useContext(AppContext) as AppContextType;
    const [searchTerm, setSearchTerm] = useState('');
    const [openAccordion, setOpenAccordion] = useState<number | null>(null);

    if (!context) return null;

    const { supportFAQs } = context;

    const allFAQs = useMemo(() => supportFAQs.flatMap(category => category.faqs), [supportFAQs]);

    const filteredFAQs = useMemo(() => {
        if (!searchTerm.trim()) {
            return allFAQs;
        }
        const lowercasedTerm = searchTerm.toLowerCase();
        return allFAQs.filter(
            faq =>
                faq.q.toLowerCase().includes(lowercasedTerm) ||
                faq.a.toLowerCase().includes(lowercasedTerm)
        );
    }, [searchTerm, allFAQs]);


    const handleToggle = (index: number) => {
        setOpenAccordion(openAccordion === index ? null : index);
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Hero Section */}
            <div className="text-center max-w-2xl mx-auto mb-16">
                 <div className="flex justify-center mb-4">
                    <div className="p-4 bg-primary-500/10 rounded-full">
                        <LifeBuoy size={48} className="text-primary-400" />
                    </div>
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-white">
                    Chúng tôi có thể giúp gì cho bạn?
                </h1>
                <p className="mt-4 text-lg text-gray-300">
                    Tìm kiếm câu trả lời, duyệt qua các câu hỏi thường gặp hoặc liên hệ trực tiếp với chúng tôi.
                </p>
                <div className="mt-8 max-w-lg mx-auto">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="w-5 h-5 text-gray-400" />
                        </div>
                        <input
                            type="search"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 border border-gray-600 rounded-full bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="Nhập câu hỏi của bạn..."
                        />
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto">
                <main>
                    {filteredFAQs.length > 0 ? (
                        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                            {filteredFAQs.map((faq, index) => (
                                <FAQItem
                                    key={index}
                                    question={faq.q}
                                    answer={faq.a}
                                    isOpen={openAccordion === index}
                                    onClick={() => handleToggle(index)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center bg-gray-800 p-12 rounded-lg border border-gray-700">
                            <h3 className="text-xl font-semibold text-white">Không tìm thấy kết quả</h3>
                            <p className="text-gray-400 mt-2">Chúng tôi không tìm thấy câu trả lời nào cho "{searchTerm}". Vui lòng thử một từ khóa khác hoặc liên hệ hỗ trợ.</p>
                        </div>
                    )}
                </main>
            </div>
            
            {/* Contact Section */}
            <div className="mt-20 text-center bg-gray-800 border border-primary-500/20 p-8 rounded-lg max-w-3xl mx-auto">
                 <h2 className="text-2xl font-bold text-white">Không tìm thấy câu trả lời bạn cần?</h2>
                 <p className="text-gray-300 mt-2">Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng giúp đỡ.</p>
                 <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
                     <a href="mailto:support@digimarket.dev" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors">
                        <MailIcon size={20} /> Gửi Email
                     </a>
                      <a href="https://t.me/digimarketsupport" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors">
                        <Send size={20} /> Chat trên Telegram
                     </a>
                 </div>
            </div>
        </div>
    );
};

export default SupportPage;