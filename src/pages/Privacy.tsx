import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Privacy = () => {
  return (
    <div className="relative h-full w-full bg-[#0f291b] min-h-screen">
      {/* Same background as landing page */}
      <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(125%_125%_at_50%_10%,rgba(255,255,255,0)_40%,rgba(216,190,80,1)_100%)]"></div>
      
      <div className="relative z-10 container mx-auto px-4 py-16">
        {/* Header */}
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-white/80 hover:text-white transition-colors mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to home
          </Link>
          
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-[#333446] to-[#7F8CAA] rounded-xl flex items-center justify-center shadow-2xl">
              <span className="text-[#EAEFEF] font-bold text-xl">K</span>
            </div>
            <span className="text-3xl font-bold text-white drop-shadow-lg">
              knitter.app
            </span>
          </div>
          
          <h1 className="text-4xl font-bold text-white text-center">Privacy Policy</h1>
          <p className="text-white/70 text-center mt-4">Last updated: July 1, 2025</p>
        </div>
        
        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/10 backdrop-blur-md rounded-xl p-8 shadow-xl max-w-4xl mx-auto text-white/90"
        >
          <div className="prose prose-invert max-w-none">
            <h2>1. Introduction</h2>
            <p>
              At knitter.app, we respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
            </p>
            
            <h2>2. Information We Collect</h2>
            <p>
              We collect several types of information from and about users of our platform, including:
            </p>
            <ul>
              <li><strong>Personal Data:</strong> First name, last name, email address, and profile information.</li>
              <li><strong>Usage Data:</strong> Information about how you use our platform, including login times, features used, and interactions.</li>
              <li><strong>Communication Data:</strong> Content of messages, attachments, and other communications you share through our platform.</li>
              <li><strong>Technical Data:</strong> IP address, browser type, device information, and cookies.</li>
            </ul>
            
            <h2>3. How We Use Your Information</h2>
            <p>
              We use the information we collect about you for various purposes, including:
            </p>
            <ul>
              <li>Providing, operating, and maintaining our platform</li>
              <li>Improving, personalizing, and expanding our platform</li>
              <li>Understanding and analyzing how you use our platform</li>
              <li>Developing new products, services, features, and functionality</li>
              <li>Communicating with you about updates, security alerts, and support</li>
              <li>Preventing fraud and abuse of our platform</li>
            </ul>
            
            <h2>4. Data Security</h2>
            <p>
              We have implemented appropriate security measures to prevent your personal data from being accidentally lost, used, accessed, altered, or disclosed in an unauthorized way. We limit access to your personal data to employees, agents, contractors, and other third parties who have a business need to know.
            </p>
            
            <h2>5. Data Sharing and Disclosure</h2>
            <p>
              We may share your personal information in the following situations:
            </p>
            <ul>
              <li><strong>With Service Providers:</strong> We may share your information with third-party vendors, service providers, and other partners who work on our behalf.</li>
              <li><strong>For Legal Reasons:</strong> We may disclose your information if required to do so by law or in response to valid requests by public authorities.</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, sale of company assets, financing, or acquisition of all or a portion of our business.</li>
              <li><strong>With Your Consent:</strong> We may disclose your personal information for any other purpose with your consent.</li>
            </ul>
            
            <h2>6. Your Data Protection Rights</h2>
            <p>
              Depending on your location, you may have certain rights regarding your personal information, including:
            </p>
            <ul>
              <li>The right to access the personal information we hold about you</li>
              <li>The right to request correction of your personal information</li>
              <li>The right to request deletion of your personal information</li>
              <li>The right to restrict processing of your personal information</li>
              <li>The right to data portability</li>
              <li>The right to object to processing of your personal information</li>
            </ul>
            
            <h2>7. Cookies and Tracking Technologies</h2>
            <p>
              We use cookies and similar tracking technologies to track activity on our platform and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
            </p>
            
            <h2>8. Children's Privacy</h2>
            <p>
              Our platform does not address anyone under the age of 13. We do not knowingly collect personal identifiable information from children under 13. If you are a parent or guardian and you are aware that your child has provided us with personal information, please contact us.
            </p>
            
            <h2>9. Changes to This Privacy Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date at the top of this policy.
            </p>
            
            <h2>10. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <p>
              <strong>Email:</strong> privacy@knitter.app<br />
              <strong>Website:</strong> <Link to="/" className="text-[#B8CFCE] hover:text-[#EAEFEF]">https://knitter.app</Link>
            </p>
          </div>
        </motion.div>
        
        {/* Footer */}
        <div className="text-center mt-12 text-white/70">
          <p>&copy; 2025 knitter.app. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
