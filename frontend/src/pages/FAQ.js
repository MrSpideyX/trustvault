import React, { useState } from 'react';
import { ChevronDown, Search, ShieldCheck, CreditCard, Truck, RefreshCw, HelpCircle } from 'lucide-react';
import { Input } from '../components/ui/input';

const faqData = [
  {
    category: 'General',
    icon: <HelpCircle className="w-5 h-5" />,
    questions: [
      {
        q: 'What is Trust Vault?',
        a: 'Trust Vault is a premium digital gaming marketplace where you can purchase verified game accounts for Steam, Epic Games, PlayStation, Xbox, and Nintendo platforms. We offer secure transactions and 24/7 customer support.'
      },
      {
        q: 'How does Trust Vault work?',
        a: 'Simply browse our catalog, add your desired game accounts to cart, and complete checkout using Razorpay. After payment verification, you\'ll receive your account credentials via email within 24 hours.'
      },
      {
        q: 'Is Trust Vault legitimate?',
        a: 'Yes! Trust Vault is a legitimate marketplace with verified sellers and secure payment processing. We have served thousands of satisfied customers worldwide.'
      }
    ]
  },
  {
    category: 'Payments',
    icon: <CreditCard className="w-5 h-5" />,
    questions: [
      {
        q: 'What payment methods do you accept?',
        a: 'We accept all major payment methods through Razorpay including Credit/Debit Cards, UPI, Net Banking, and Wallets. We support both INR and USD currencies.'
      },
      {
        q: 'Is my payment information secure?',
        a: 'Absolutely! All payments are processed through Razorpay\'s secure payment gateway with bank-level encryption. We never store your payment details on our servers.'
      },
      {
        q: 'Can I get a refund?',
        a: 'Refunds are handled on a case-by-case basis. If you receive an invalid account or face any issues, contact our support team within 24 hours of purchase for assistance.'
      },
      {
        q: 'Do you offer discount codes?',
        a: 'Yes! We regularly offer discount codes for our customers. Follow us on social media and subscribe to our newsletter to stay updated on the latest deals.'
      }
    ]
  },
  {
    category: 'Delivery',
    icon: <Truck className="w-5 h-5" />,
    questions: [
      {
        q: 'How will I receive my game account?',
        a: 'After successful payment, you\'ll receive the account credentials (email and password) via email within 24 hours. Check your spam folder if you don\'t see it in your inbox.'
      },
      {
        q: 'How long does delivery take?',
        a: 'Most orders are delivered within 1-24 hours. During peak times, delivery may take up to 48 hours. You\'ll receive an email notification once your order is processed.'
      },
      {
        q: 'Can I track my order?',
        a: 'Yes! Log into your account and visit the "My Orders" section to track your order status. You\'ll also receive email updates at each stage.'
      }
    ]
  },
  {
    category: 'Account Security',
    icon: <ShieldCheck className="w-5 h-5" />,
    questions: [
      {
        q: 'Are the game accounts safe to use?',
        a: 'All accounts sold on Trust Vault are verified and come with full access. We recommend changing the password immediately after receiving your account for added security.'
      },
      {
        q: 'What if the account gets banned?',
        a: 'We guarantee all accounts are in good standing at the time of sale. If an account is banned within 7 days of purchase due to pre-existing issues, contact support for a replacement.'
      },
      {
        q: 'Should I change the password after purchase?',
        a: 'Yes, we strongly recommend changing the account password immediately after receiving it. This ensures your account remains secure.'
      }
    ]
  },
  {
    category: 'Returns & Support',
    icon: <RefreshCw className="w-5 h-5" />,
    questions: [
      {
        q: 'What if I receive wrong account details?',
        a: 'Contact our support team immediately at support@trustvault.com. We\'ll verify the issue and send you the correct details or process a refund.'
      },
      {
        q: 'How can I contact customer support?',
        a: 'You can reach us via email at support@trustvault.com or use the Contact Us page. Our support team is available 24/7 to assist you.'
      },
      {
        q: 'What is your response time?',
        a: 'We typically respond to all inquiries within 24 hours. For urgent matters, please mention "URGENT" in your email subject line.'
      }
    ]
  }
];

export const FAQ = () => {
  const [search, setSearch] = useState('');
  const [openItems, setOpenItems] = useState({});

  const toggleItem = (categoryIndex, questionIndex) => {
    const key = `${categoryIndex}-${questionIndex}`;
    setOpenItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const filteredFaq = faqData.map(category => ({
    ...category,
    questions: category.questions.filter(
      q => q.q.toLowerCase().includes(search.toLowerCase()) || 
           q.a.toLowerCase().includes(search.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="min-h-screen py-24 md:py-32">
      <div className="max-w-[900px] mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-[#00F0FF] text-sm uppercase tracking-widest font-medium mb-4">Help Center</p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">FREQUENTLY ASKED QUESTIONS</h1>
          <p className="text-white/50 max-w-xl mx-auto mb-8">
            Find answers to common questions about Trust Vault, payments, delivery, and more.
          </p>

          {/* Search */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search questions..."
              className="pl-12 bg-[#0a0a0a] border-white/10 h-14 text-lg"
              data-testid="faq-search"
            />
          </div>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-8">
          {filteredFaq.map((category, categoryIndex) => (
            <div key={categoryIndex} className="bg-[#0a0a0a] border border-white/5 rounded-lg overflow-hidden">
              {/* Category Header */}
              <div className="flex items-center gap-3 p-4 border-b border-white/5 bg-white/[0.02]">
                <div className="w-10 h-10 rounded-lg bg-[#00F0FF]/10 text-[#00F0FF] flex items-center justify-center">
                  {category.icon}
                </div>
                <h2 className="font-bold text-lg">{category.category}</h2>
              </div>

              {/* Questions */}
              <div className="divide-y divide-white/5">
                {category.questions.map((item, questionIndex) => {
                  const isOpen = openItems[`${categoryIndex}-${questionIndex}`];
                  return (
                    <div key={questionIndex}>
                      <button
                        onClick={() => toggleItem(categoryIndex, questionIndex)}
                        className="w-full p-4 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors"
                        data-testid={`faq-question-${categoryIndex}-${questionIndex}`}
                      >
                        <span className="font-medium pr-4">{item.q}</span>
                        <ChevronDown className={`w-5 h-5 flex-shrink-0 text-white/50 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-4 text-white/70 leading-relaxed">
                          {item.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Still Need Help */}
        <div className="mt-12 text-center p-8 bg-gradient-to-r from-[#00F0FF]/10 to-[#7000FF]/10 rounded-lg border border-white/5">
          <h3 className="text-xl font-bold mb-2">Still have questions?</h3>
          <p className="text-white/50 mb-4">Can't find what you're looking for? Our support team is here to help.</p>
          <a href="/contact" className="inline-flex items-center gap-2 text-[#00F0FF] hover:underline font-medium">
            Contact Support →
          </a>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
