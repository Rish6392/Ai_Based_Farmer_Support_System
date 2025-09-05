import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, Search, MessageCircle, Phone, Mail } from 'lucide-react';

const FaqPage = () => {
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  const faqData = [
    {
      category: "Getting Started",
      questions: [
        {
          id: 1,
          question: "How do I start using the KisanSewa AI assistant?",
          answer: "Simply navigate to the Chat section and start typing your agricultural questions. Our AI assistant is available 24/7 to help with farming advice, crop management, and disease identification."
        },
        {
          id: 2,
          question: "Is the service free to use?",
          answer: "Yes, KisanSewa's basic features are completely free for all farmers. We believe in supporting agriculture through accessible technology."
        },
        {
          id: 3,
          question: "Do I need to create an account?",
          answer: "No account registration is required for basic services. You can start asking questions immediately through our chat interface."
        }
      ]
    },
    {
      category: "Disease Detection",
      questions: [
        {
          id: 4,
          question: "How accurate is the crop disease detection?",
          answer: "Our AI model has been trained on thousands of images and maintains an accuracy rate of over 90%. However, we always recommend consulting with local agricultural experts for critical decisions."
        },
        {
          id: 5,
          question: "What types of crops can be analyzed?",
          answer: "Currently, we support rice, wheat, tomato, potato, corn, and several other major crops. We're continuously expanding our database to include more varieties."
        },
        {
          id: 6,
          question: "How do I take a good photo for disease detection?",
          answer: "Take clear, well-lit photos of affected leaves or plants. Ensure the diseased area is clearly visible, and avoid blurry or dark images for best results."
        }
      ]
    },
    {
      category: "Technical Support",
      questions: [
        {
          id: 7,
          question: "The voice feature is not working. What should I do?",
          answer: "Ensure your browser has microphone permissions enabled. Check your device's microphone settings and try refreshing the page. Our voice feature supports multiple languages including English and Hindi."
        },
        {
          id: 8,
          question: "Can I use this service on my mobile phone?",
          answer: "Absolutely! KisanSewa is fully optimized for mobile devices. You can access all features through your mobile browser."
        },
        {
          id: 9,
          question: "What languages are supported?",
          answer: "Currently, we support English and Hindi. We're working on adding more regional languages to better serve farmers across India."
        }
      ]
    },
    {
      category: "Agricultural Advice",
      questions: [
        {
          id: 10,
          question: "Can I get specific advice for my region?",
          answer: "Yes! Our AI considers regional factors like climate, soil type, and local growing conditions. Mention your location for more targeted advice."
        },
        {
          id: 11,
          question: "How current is the agricultural information?",
          answer: "Our database is regularly updated with the latest agricultural research, best practices, and government guidelines to ensure you get current and relevant information."
        },
        {
          id: 12,
          question: "Can I get help with organic farming methods?",
          answer: "Definitely! Our AI assistant is well-versed in both traditional and organic farming practices. Ask about natural pest control, organic fertilizers, and sustainable farming techniques."
        }
      ]
    }
  ];

  const toggleExpanded = (id) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const filteredFAQs = faqData.map(category => ({
    ...category,
    questions: category.questions.filter(
      q => 
        q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <HelpCircle className="mx-auto mb-6 w-16 h-16" />
            <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
            <p className="text-xl text-green-100 max-w-2xl mx-auto">
              Find answers to common questions about KisanSewa and get the help you need
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search frequently asked questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
            />
          </div>
        </div>

        {/* FAQ Content */}
        <div className="max-w-4xl mx-auto">
          {filteredFAQs.length > 0 ? (
            <div className="space-y-8">
              {filteredFAQs.map((category) => (
                <div key={category.category} className="bg-white rounded-lg shadow-sm border">
                  <div className="bg-gray-50 px-6 py-4 border-b">
                    <h2 className="text-xl font-semibold text-gray-800">{category.category}</h2>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {category.questions.map((faq) => (
                      <div key={faq.id} className="p-6">
                        <button
                          onClick={() => toggleExpanded(faq.id)}
                          className="w-full text-left flex items-center justify-between hover:text-green-600 transition-colors duration-200"
                        >
                          <h3 className="text-lg font-medium text-gray-900 pr-4">
                            {faq.question}
                          </h3>
                          {expandedItems.has(faq.id) ? (
                            <ChevronUp className="w-5 h-5 text-green-600 flex-shrink-0" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                          )}
                        </button>
                        
                        {expandedItems.has(faq.id) && (
                          <div className="mt-4 text-gray-600 leading-relaxed">
                            {faq.answer}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Search className="mx-auto w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-600">
                Try searching with different keywords or browse our categories above.
              </p>
            </div>
          )}
        </div>

        {/* Contact Support Section */}
        <div className="max-w-4xl mx-auto mt-16">
          <div className="bg-green-50 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Still need help?
            </h2>
            <p className="text-gray-600 mb-6">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm">
                <MessageCircle className="w-8 h-8 text-green-600 mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Live Chat</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Chat with our AI assistant anytime
                </p>
                <button className="text-green-600 hover:text-green-700 font-medium">
                  Start Chat →
                </button>
              </div>
              
              <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm">
                <Mail className="w-8 h-8 text-green-600 mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Email Support</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Get detailed help via email
                </p>
                <a 
                  href="mailto:support@kisansewa.com" 
                  className="text-green-600 hover:text-green-700 font-medium"
                >
                  Send Email →
                </a>
              </div>
              
              <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm">
                <Phone className="w-8 h-8 text-green-600 mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Phone Support</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Talk to our experts directly
                </p>
                <a 
                  href="tel:+911800123456" 
                  className="text-green-600 hover:text-green-700 font-medium"
                >
                  Call Now →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaqPage;
