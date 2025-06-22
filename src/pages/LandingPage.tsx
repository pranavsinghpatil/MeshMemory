import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Key, MessageSquare, Database, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from '../components/AuthModal';
import GuestModeButton from '../components/GuestModeButton';

export default function LandingPage() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const navigate = useNavigate();
  const { user, loading, isGuest } = useAuth();

  // Redirect to dashboard if already authenticated
  React.useEffect(() => {
    if ((user || isGuest) && !loading) {
      navigate('/dashboard');
    }
  }, [user, isGuest, loading, navigate]);

  const features = [
    {
      icon: <MessageSquare className="h-6 w-6 text-indigo-600" />,
      title: 'Smart Conversations',
      description: 'Chat with your data through our advanced AI interface.'
    },
    {
      icon: <Database className="h-6 w-6 text-indigo-600" />,
      title: 'Knowledge Integration',
      description: 'Import your documents, websites, and notes to create a personal knowledge base.'
    },
    {
      icon: <Shield className="h-6 w-6 text-indigo-600" />,
      title: 'Private & Secure',
      description: 'Your data stays private with end-to-end encryption and secure storage.'
    },
    {
      icon: <Zap className="h-6 w-6 text-indigo-600" />,
      title: 'Lightning Fast',
      description: 'Get instant answers and insights from your knowledge base.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E7EFC7] to-white dark:from-[#333446] dark:to-[#3B3B1A]">
      {/* Header/Nav */}
      <header className="bg-transparent px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <img src="/logo.svg" alt="MeshMemory logo" className="h-10 w-auto" />
            <h1 className="ml-2 text-2xl font-bold text-[#3B3B1A] dark:text-[#EAEFEF]">MeshMemory<span className="text-[#8A784E] dark:text-[#B8CFCE]">.app</span></h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-4 py-2 text-[#8A784E] hover:text-[#3B3B1A] dark:text-[#B8CFCE] dark:hover:text-[#EAEFEF] font-medium"
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setIsAuthModalOpen(true);
              }}
              className="px-4 py-2 bg-[#AEC8A4] hover:bg-[#8A784E] dark:bg-[#7F8CAA] dark:hover:bg-[#B8CFCE] text-[#3B3B1A] dark:text-[#EAEFEF] rounded-lg shadow-sm font-medium"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-[#3B3B1A] dark:text-[#EAEFEF] mb-6">
            Connect with your information <br className="hidden sm:block" />
            <span className="text-[#8A784E] dark:text-[#B8CFCE]">smarter and faster</span>
          </h2>
          <p className="text-xl text-[#8A784E] dark:text-[#B8CFCE] max-w-3xl mx-auto mb-10">
            MeshMemory helps you organize, search, and chat with your knowledge base using advanced AI technology.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-8 py-4 bg-[#AEC8A4] hover:bg-[#8A784E] dark:bg-[#7F8CAA] dark:hover:bg-[#B8CFCE] text-[#3B3B1A] dark:text-[#EAEFEF] rounded-lg shadow-lg font-medium text-lg transition-all"
            >
              Create Free Account
            </button>
            <div className="w-full sm:w-auto">
              <GuestModeButton />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-16 bg-[#E7EFC7] dark:bg-[#333446]">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl font-bold text-center text-[#3B3B1A] dark:text-[#EAEFEF] mb-12">
            Powerful Features
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white dark:bg-[#3B3B1A] p-6 rounded-xl shadow-md">
                <div className="mb-4 p-3 bg-[#E7EFC7] dark:bg-[#7F8CAA]/30 rounded-lg inline-block">
                  {feature.icon}
                </div>
                <h4 className="text-xl font-semibold text-[#3B3B1A] dark:text-[#EAEFEF] mb-2">
                  {feature.title}
                </h4>
                <p className="text-[#8A784E] dark:text-[#B8CFCE]">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-16">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl font-bold text-center text-[#3B3B1A] dark:text-[#EAEFEF] mb-12">
            How MeshMemory Works
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-[#E7EFC7] dark:bg-[#7F8CAA]/30 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-[#8A784E] dark:text-[#B8CFCE]">1</span>
              </div>
              <h4 className="text-xl font-semibold text-[#3B3B1A] dark:text-[#EAEFEF] mb-2">
                Import Your Data
              </h4>
              <p className="text-[#8A784E] dark:text-[#B8CFCE]">
                Upload documents, connect websites, and import your notes to build your knowledge base.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-[#E7EFC7] dark:bg-[#7F8CAA]/30 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-[#8A784E] dark:text-[#B8CFCE]">2</span>
              </div>
              <h4 className="text-xl font-semibold text-[#3B3B1A] dark:text-[#EAEFEF] mb-2">
                Organize Content
              </h4>
              <p className="text-[#8A784E] dark:text-[#B8CFCE]">
                Create chat groups, tag your content, and organize your information effectively.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-[#E7EFC7] dark:bg-[#7F8CAA]/30 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-[#8A784E] dark:text-[#B8CFCE]">3</span>
              </div>
              <h4 className="text-xl font-semibold text-[#3B3B1A] dark:text-[#EAEFEF] mb-2">
                Chat and Search
              </h4>
              <p className="text-[#8A784E] dark:text-[#B8CFCE]">
                Ask questions, search your content, and get intelligent responses based on your data.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-16 bg-[#AEC8A4] dark:bg-[#7F8CAA]">
        <div className="max-w-3xl mx-auto text-center">
          <h3 className="text-3xl font-bold text-[#3B3B1A] dark:text-[#EAEFEF] mb-6">
            Ready to knit your knowledge together?
          </h3>
          <p className="text-xl text-[#8A784E] dark:text-[#EAEFEF] mb-10">
            Join MeshMemory today and experience a new way to interact with your information.
          </p>
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="px-8 py-4 bg-white hover:bg-[#E7EFC7] text-[#8A784E] dark:text-[#7F8CAA] rounded-lg shadow-lg font-medium text-lg transition-all"
          >
            Get Started for Free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#E7EFC7] dark:bg-[#333446] px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-6 md:mb-0">
              <img src="/logo.svg" alt="MeshMemory logo" className="h-8 w-auto" />
              <h2 className="ml-2 text-xl font-bold text-[#3B3B1A] dark:text-[#EAEFEF]">MeshMemory<span className="text-[#8A784E] dark:text-[#B8CFCE]">.app</span></h2>
            </div>
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-8">
              <a href="#" className="text-[#8A784E] dark:text-[#B8CFCE] hover:text-[#3B3B1A] dark:hover:text-[#EAEFEF]">Help</a>
              <a href="#" className="text-[#8A784E] dark:text-[#B8CFCE] hover:text-[#3B3B1A] dark:hover:text-[#EAEFEF]">Privacy</a>
              <a href="#" className="text-[#8A784E] dark:text-[#B8CFCE] hover:text-[#3B3B1A] dark:hover:text-[#EAEFEF]">Terms</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-[#AEC8A4] dark:border-[#7F8CAA]">
            <p className="text-center text-[#8A784E] dark:text-[#7F8CAA]">
              © {new Date().getFullYear()} MeshMemory. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}

