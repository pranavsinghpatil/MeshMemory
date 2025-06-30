import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Terms = () => {
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
          
          <h1 className="text-4xl font-bold text-white text-center">Terms of Service</h1>
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
              Welcome to knitter.app. These Terms of Service ("Terms") govern your access to and use of knitter.app's website, services, and applications (the "Services"). By using our Services, you agree to be bound by these Terms. If you do not agree to these Terms, please do not use our Services.
            </p>

            <h2>2. Using Our Services</h2>
            <p>
              You must follow any policies made available to you within the Services. You may use our Services only as permitted by law. We may suspend or stop providing our Services to you if you do not comply with our terms or policies or if we are investigating suspected misconduct.
            </p>

            <h2>3. Your knitter.app Account</h2>
            <p>
              You may need a knitter.app account to use some of our Services. You are responsible for maintaining the security of your account and password. knitter.app cannot and will not be liable for any loss or damage from your failure to comply with this security obligation.
            </p>

            <h2>4. Privacy and Copyright Protection</h2>
            <p>
              Our <Link to="/privacy" className="text-[#B8CFCE] hover:text-[#EAEFEF]">Privacy Policy</Link> explains how we treat your personal data and protect your privacy when using our Services. By using our Services, you agree that knitter.app can use such data in accordance with our privacy policies.
            </p>

            <h2>5. Content in the Services</h2>
            <p>
              When you upload, submit, store, send or receive content to or through our Services, you give knitter.app (and those we work with) a worldwide license to use, host, store, reproduce, modify, create derivative works, communicate, publish, publicly perform, publicly display and distribute such content. The rights you grant in this license are for the limited purpose of operating, promoting, and improving our Services, and to develop new ones.
            </p>

            <h2>6. Modifying and Terminating our Services</h2>
            <p>
              We are constantly changing and improving our Services. We may add or remove functionalities or features, and we may suspend or stop a Service altogether.
            </p>
            <p>
              You can stop using our Services at any time, although we'll be sorry to see you go. knitter.app may also stop providing Services to you, or add or create new limits to our Services at any time.
            </p>

            <h2>7. Liability for our Services</h2>
            <p>
              To the extent permitted by law, we exclude all warranties, and knitter.app's liability for damages will be limited to the maximum extent permitted by applicable law. knitter.app will not be responsible for lost profits, revenues, or data, financial losses or indirect, special, consequential, exemplary, or punitive damages.
            </p>

            <h2>8. Business Uses of our Services</h2>
            <p>
              If you are using our Services on behalf of a business, that business accepts these terms. It will hold harmless and indemnify knitter.app and its affiliates, officers, agents, and employees from any claim, suit or action arising from or related to the use of the Services or violation of these terms, including any liability or expense arising from claims, losses, damages, suits, judgments, litigation costs and attorneys' fees.
            </p>

            <h2>9. About these Terms</h2>
            <p>
              We may modify these terms or any additional terms that apply to a Service. You should look at the terms regularly. Changes will not apply retroactively and will become effective no sooner than fourteen days after they are posted. However, changes addressing new functions for a Service or changes made for legal reasons will be effective immediately.
            </p>
            <p>
              If there is a conflict between these terms and the additional terms, the additional terms will control for that conflict. These terms control the relationship between knitter.app and you. They do not create any third party beneficiary rights.
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

export default Terms;
