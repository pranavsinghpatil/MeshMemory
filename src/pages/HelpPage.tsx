
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  Search, 
  MessageCircle, 
  Mail, 
  Phone, 
  Book, 
  Video, 
  HelpCircle,
  ChevronRight,
  Star
} from 'lucide-react';

const HelpPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const faqItems = [
    {
      question: 'How do I create a new chat group?',
      answer: 'To create a new chat group, navigate to the Chat Groups page and click the "Create Group" button. Fill in the group name, description, and add members to get started.'
    },
    {
      question: 'Can I customize notification settings?',
      answer: 'Yes! Go to Settings > Notifications to customize when and how you receive notifications. You can control email notifications, push notifications, and sound alerts.'
    },
    {
      question: 'How do I switch between light and dark mode?',
      answer: 'You can toggle between light and dark mode using the theme button in the top navigation bar, or go to Settings > Appearance for more detailed theme options.'
    },
    {
      question: 'What is the difference between Chat Groups and Thread Groups?',
      answer: 'Chat Groups are for ongoing conversations with team members, while Thread Groups are organized discussions around specific topics or projects with threaded conversations.'
    },
    {
      question: 'How do I invite new team members?',
      answer: 'Team owners and admins can invite new members through the Team Workspace page. Click "Invite Members" and enter their email addresses to send invitations.'
    },
    {
      question: 'Can I see analytics for my team\'s communication?',
      answer: 'Yes, the Analytics page provides insights into message activity, response times, team engagement, and sentiment analysis to help you understand communication patterns.'
    }
  ];

  const helpCategories = [
    {
      title: 'Getting Started',
      description: 'Learn the basics of MeshMemory',
      icon: Book,
      articles: 8,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Chat & Messaging',
      description: 'Master communication features',
      icon: MessageCircle,
      articles: 12,
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Analytics & Insights',
      description: 'Understand your data',
      icon: Star,
      articles: 6,
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Team Management',
      description: 'Organize and manage your team',
      icon: Video,
      articles: 10,
      color: 'from-orange-500 to-red-500'
    }
  ];

  const filteredFAQ = faqItems.filter(item =>
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Contact form submitted:', contactForm);
    // Reset form
    setContactForm({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="relative h-full w-full bg-[#0f291b]">
      <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(125%_125%_at_50%_10%,rgba(255,255,255,0)_40%,rgba(216,190,80,1)_100%)]"></div>
      
      <div className="relative z-10 p-6 max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold mb-4 text-white">Help Center</h1>
          <p className="text-xl text-white/80 mb-8">
            Find answers, learn features, and get support
          </p>
          
          {/* Search */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
            <Input
              placeholder="Search for help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 py-3 text-lg bg-white/10 border-white/20 text-white placeholder:text-white/50"
            />
          </div>
        </motion.div>

        {/* Help Categories */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h2 className="text-2xl font-semibold mb-6 text-white">Browse by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {helpCategories.map((category, index) => (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card className="h-full cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50 glass-effect border-white/20">
                  <CardContent className="p-6 text-center">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${category.color} mb-4 flex items-center justify-center mx-auto`}>
                      <category.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-semibold mb-2 text-white">{category.title}</h3>
                    <p className="text-sm text-white/70 mb-3">{category.description}</p>
                    <div className="flex items-center justify-center text-sm text-primary">
                      {category.articles} articles
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* FAQ Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-white">Frequently Asked Questions</h2>
            <Badge variant="secondary" className="bg-white/20 text-white">{filteredFAQ.length} questions</Badge>
          </div>
          
          <Card className="glass-effect border-white/20">
            <CardContent className="p-6">
              <Accordion type="single" collapsible className="space-y-2">
                {filteredFAQ.map((item, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left text-white">
                      <div className="flex items-center gap-3">
                        <HelpCircle className="w-5 h-5 text-primary" />
                        {item.question}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-white/70 pl-8">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              
              {filteredFAQ.length === 0 && (
                <div className="text-center py-8">
                  <HelpCircle className="w-12 h-12 text-white/50 mx-auto mb-4" />
                  <p className="text-white/50">No questions found matching your search.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.section>

        {/* Contact Support */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 className="text-2xl font-semibold mb-6 text-white">Contact Support</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Contact Options */}
            <Card className="glass-effect border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Get in Touch</CardTitle>
                <CardDescription className="text-white/70">
                  Choose the best way to reach our support team
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <motion.div whileHover={{ scale: 1.02 }} className="flex items-center gap-4 p-4 border border-white/20 rounded-lg cursor-pointer hover:bg-white/5 transition-colors">
                  <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white">Live Chat</h3>
                    <p className="text-sm text-white/70">Available 24/7</p>
                  </div>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }} className="flex items-center gap-4 p-4 border border-white/20 rounded-lg cursor-pointer hover:bg-white/5 transition-colors">
                  <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white">Email Support</h3>
                    <p className="text-sm text-white/70">support@meshmemory.com</p>
                  </div>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }} className="flex items-center gap-4 p-4 border border-white/20 rounded-lg cursor-pointer hover:bg-white/5 transition-colors">
                  <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white">Phone Support</h3>
                    <p className="text-sm text-white/70">+1 (555) 123-4567</p>
                  </div>
                </motion.div>
              </CardContent>
            </Card>

            {/* Contact Form */}
            <Card className="glass-effect border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Send us a Message</CardTitle>
                <CardDescription className="text-white/70">
                  Fill out the form and we'll get back to you shortly
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-white">Name</Label>
                      <Input
                        id="name"
                        value={contactForm.name}
                        onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                        required
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-white">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={contactForm.email}
                        onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                        required
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-white">Subject</Label>
                    <Input
                      id="subject"
                      value={contactForm.subject}
                      onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                      required
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-white">Message</Label>
                    <Textarea
                      id="message"
                      rows={4}
                      value={contactForm.message}
                      onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                      required
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    />
                  </div>
                  
                  <Button type="submit" className="w-full btn-primary">
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default HelpPage;
