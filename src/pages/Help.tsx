import { useState } from 'react';

interface FAQ {
  question: string;
  answer: string;
  category: string;
}

export default function Help() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const faqs: FAQ[] = [
    {
      category: 'Getting Started',
      question: 'How do I start my rehabilitation program?',
      answer: 'Navigate to "My Rehab Programs" from the dashboard, select your injury type (ACL, MCL, Meniscus, or Ankle Sprain), and follow the guided assessment to create your personalized program.'
    },
    {
      category: 'Getting Started',
      question: 'How do I track my exercises?',
      answer: 'Each exercise has a "Track with Camera" button that uses pose detection to count your repetitions and ensure proper form. You can also manually mark exercises as complete.'
    },
    {
      category: 'Exercises',
      question: 'What if I feel pain during an exercise?',
      answer: 'Stop immediately if you experience sharp or severe pain. Mild discomfort is normal, but sharp pain is a warning sign. Consult your healthcare provider before continuing.'
    },
    {
      category: 'Exercises',
      question: 'Can I skip exercises in my program?',
      answer: 'While we recommend completing all exercises, you can skip them if needed. However, you should complete most exercises in a phase before advancing to the next phase.'
    },
    {
      category: 'Exercises',
      question: 'How do I view exercise demonstrations?',
      answer: 'Click on any exercise card to open a detailed modal with video demonstrations, instructions, and tips for proper form.'
    },
    {
      category: 'Progress',
      question: 'When can I advance to the next phase?',
      answer: 'You can advance when you\'ve completed all exercises in your current phase, can perform them with minimal pain, and have consulted with your physical therapist. The app will prompt you with a checklist before advancing.'
    },
    {
      category: 'Progress',
      question: 'How is my progress calculated?',
      answer: 'Progress is based on the percentage of exercises completed in your current phase. You can view detailed statistics on your dashboard and rehab program page.'
    },
    {
      category: 'Progress',
      question: 'Can I reset my program and start over?',
      answer: 'Yes! On your rehab program page, click the "Reset Program" button to start from Phase 1. This will clear all your progress for that specific injury program.'
    },
    {
      category: 'Technical',
      question: 'Why isn\'t the camera working for exercise tracking?',
      answer: 'Make sure you\'ve granted camera permissions to your browser. The camera feature requires good lighting and should show your full body in the frame. If issues persist, try using a different browser or device.'
    },
    {
      category: 'Technical',
      question: 'What browsers are supported?',
      answer: 'RehabMotion works best on Chrome, Firefox, Safari, and Edge (latest versions). The AI pose detection feature requires a modern browser with camera support.'
    },
    {
      category: 'Technical',
      question: 'Is my data secure?',
      answer: 'Yes! All your data is encrypted and stored securely in Firebase. We never share your personal health information without your explicit consent.'
    },
    {
      category: 'Account',
      question: 'How do I change my password?',
      answer: 'Go to your Profile page and click "Edit Profile". You can update your password in the Change Password section.'
    },
    {
      category: 'Account',
      question: 'Can I have multiple injury programs active?',
      answer: 'Yes! You can work on rehabilitation for multiple injuries simultaneously. Each program tracks progress independently.'
    },
    {
      category: 'Account',
      question: 'How do I delete my account?',
      answer: 'Contact us at support@rehabmotion.com to request account deletion. We\'ll process your request within 48 hours.'
    }
  ];

  const categories = ['all', ...Array.from(new Set(faqs.map(faq => faq.category)))];

  const filteredFAQs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">❓ Help & Support</h1>
          <p className="text-xl text-gray-600">Find answers to common questions and get the help you need</p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="🔍 Search for help..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl text-lg transition-all focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
          />
        </div>

        {/* Category Filter */}
        <div className="flex gap-3 mb-8 flex-wrap justify-center">
          {categories.map(category => (
            <button
              key={category}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white border-2 border-blue-600'
                  : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              }`}
              onClick={() => setSelectedCategory(category)}
            >
              {category === 'all' ? 'All Topics' : category}
            </button>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {filteredFAQs.length > 0 ? (
              filteredFAQs.map((faq, index) => (
                <div
                  key={index}
                  className={`border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${
                    expandedFAQ === index
                      ? 'border-blue-600'
                      : 'border-gray-300 hover:border-gray-400 hover:shadow-sm'
                  }`}
                  onClick={() => toggleFAQ(index)}
                >
                  <div className={`flex items-center gap-4 p-5 ${
                    expandedFAQ === index 
                      ? 'bg-gradient-to-r from-blue-50 to-blue-100' 
                      : 'bg-gray-50'
                  }`}>
                    <span className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-bold uppercase tracking-wide flex-shrink-0">
                      {faq.category}
                    </span>
                    <h3 className="flex-1 text-lg font-semibold text-gray-900 leading-snug">
                      {faq.question}
                    </h3>
                    <span className="text-2xl text-blue-600 font-bold flex-shrink-0">
                      {expandedFAQ === index ? '−' : '+'}
                    </span>
                  </div>
                  {expandedFAQ === index && (
                    <div className="p-6 bg-white border-t border-gray-200 animate-fadeIn">
                      <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-600">
                <p>No results found for "{searchTerm}". Try different keywords.</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Quick Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <a href="#" className="bg-white p-8 rounded-xl border-2 border-gray-300 hover:border-blue-600 hover:-translate-y-1 hover:shadow-xl transition-all text-center group">
              <span className="text-5xl block mb-4">📚</span>
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600">User Guide</h3>
              <p className="text-gray-600 text-sm">Complete guide to using RehabMotion</p>
            </a>
            <a href="#" className="bg-white p-8 rounded-xl border-2 border-gray-300 hover:border-blue-600 hover:-translate-y-1 hover:shadow-xl transition-all text-center group">
              <span className="text-5xl block mb-4">🎥</span>
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600">Video Tutorials</h3>
              <p className="text-gray-600 text-sm">Watch step-by-step tutorials</p>
            </a>
            <a href="#" className="bg-white p-8 rounded-xl border-2 border-gray-300 hover:border-blue-600 hover:-translate-y-1 hover:shadow-xl transition-all text-center group">
              <span className="text-5xl block mb-4">💬</span>
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600">Community Forum</h3>
              <p className="text-gray-600 text-sm">Connect with other users</p>
            </a>
            <a href="#" className="bg-white p-8 rounded-xl border-2 border-gray-300 hover:border-blue-600 hover:-translate-y-1 hover:shadow-xl transition-all text-center group">
              <span className="text-5xl block mb-4">📧</span>
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600">Contact Support</h3>
              <p className="text-gray-600 text-sm">Email: support@rehabmotion.com</p>
            </a>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white p-12 rounded-xl text-center">
          <h2 className="text-3xl font-bold mb-4">Still Need Help?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Our support team is here to help you Monday-Friday, 9AM-5PM EST
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            <div className="bg-white bg-opacity-15 backdrop-blur-lg p-8 rounded-lg border border-white border-opacity-20">
              <span className="text-5xl block mb-4">📧</span>
              <strong className="block text-lg mb-2">Email</strong>
              <p className="text-blue-100">support@rehabmotion.com</p>
            </div>
            <div className="bg-white bg-opacity-15 backdrop-blur-lg p-8 rounded-lg border border-white border-opacity-20">
              <span className="text-5xl block mb-4">💬</span>
              <strong className="block text-lg mb-2">Live Chat</strong>
              <p className="text-blue-100">Available during business hours</p>
            </div>
            <div className="bg-white bg-opacity-15 backdrop-blur-lg p-8 rounded-lg border border-white border-opacity-20">
              <span className="text-5xl block mb-4">📞</span>
              <strong className="block text-lg mb-2">Phone</strong>
              <p className="text-blue-100">1-800-REHAB-HELP</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
