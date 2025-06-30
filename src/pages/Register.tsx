import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, Loader2, Check, ArrowLeft, Link } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { supabase } from '@/services/supabase';
import Mesh from '@/components/mesh';

const Register = () => {
  const [step, setStep] = useState<'email' | 'signin' | 'signup' | 'forgot'>('email');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, login } = useAuth();
  const navigate = useNavigate();

  const passwordRequirements = [
    { label: 'At least 8 characters', met: formData.password.length >= 8 },
    { label: 'Contains uppercase letter', met: /[A-Z]/.test(formData.password) },
    { label: 'Contains lowercase letter', met: /[a-z]/.test(formData.password) },
    { label: 'Contains number', met: /\d/.test(formData.password) },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!passwordRequirements.every(req => req.met)) {
      toast.error('Please meet all password requirements');
      return;
    }

    setIsLoading(true);

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        full_name: formData.name
      });
      toast.success('Account created successfully!');
      navigate('/app/dashboard');
    } catch (error) {
      toast.error('Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative h-full w-full">
      <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(125%_125%_at_50%_10%,rgba(255,255,255,0)_40%,rgba(216,190,80,1)_100%)]"></div>
      <div className="relative z-10 flex h-screen w-screen">
        <div className="hidden md:flex w-1/2 flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex items-center justify-center space-x-3 mb-0"
          >
            <Link to="/" className="inline-flex items-center text-white/80 hover:text-white transition-colors mb-8">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to home
            </Link>
            <span
              onClick={() => navigate('/')}
              className="text-4xl font-bold text-white drop-shadow-lg hover:text-white transition-colors cursor-pointer"
            >
              knitter.app
            </span>

          </motion.div>
          <div className="flex flex-col items-center gap-12">
            <div className="flex gap-2">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className="w-2 bg-primary rounded-full animate-pulse"
                  style={{
                    height: `${20 + Math.random() * 40}px`,
                    animationDelay: `${i * 0.05}s`
                  }}
                ></div>
              ))}
            </div>
            <Mesh />
          </div>
        </div>
        <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-8">
          <Card className="w-full max-w-md glass-effect border-white/20">
            <CardHeader>
              <CardTitle className="text-white text-2xl">Welcome to MeshMemory</CardTitle>
              <CardDescription className="text-white/70">Sign in or register below</CardDescription>
            </CardHeader>
            <CardContent>
              {step === 'email' && (
  <form
    onSubmit={async (e) => {
      e.preventDefault();
      if (!formData.email) return toast.error('Please enter your email');
      setIsLoading(true);
      try {
        // Attempt sign-in with a dummy password to check if user exists
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: 'dummy-password-check',
        });
        if (!error) {
          // This would mean sign-in actually succeeded which is unexpected
          setStep('signin');
        } else if (error.message.toLowerCase().includes('invalid login credentials')) {
          // User exists but wrong password supplied
          setStep('signin');
        } else if (error.message.toLowerCase().includes('user not found')) {
          // Email not registered
          setStep('signup');
        } else {
          toast.error('Error checking email: ' + error.message);
        }
      } catch (err: any) {
        // Supabase returns AuthApiError
        if (err && err.message) {
          if (err.message.toLowerCase().includes('invalid login credentials')) {
            setStep('signin');
          } else if (err.message.toLowerCase().includes('user not found')) {
            setStep('signup');
          } else {
            toast.error('Error checking email: ' + err.message);
          }
        } else {
          toast.error('Error checking email. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    }}
    className="space-y-4"
  >
    <div className="space-y-2">
      <Label htmlFor="email" className="text-white">Email</Label>
      <Input
        id="email"
        name="email"
        type="email"
        placeholder="your@email.com"
        value={formData.email}
        onChange={handleInputChange}
        required
        className="bg-white/10 border-white/20 text-white"
      />
    </div>
    <Button type="submit" className="w-full" disabled={isLoading}>
      {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
      Continue with Email
    </Button>
    <div className="flex items-center my-4">
      <hr className="flex-grow border-white/20" />
      <span className="mx-2 text-white/70 text-sm">OR</span>
      <hr className="flex-grow border-white/20" />
    </div>
    <Button
      type="button"
      onClick={() => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/auth/callback` } })}
      className="w-full bg-white text-gray-900 flex items-center justify-center gap-2"
    >
      <img src="/google-icon.svg" alt="Google" className="w-4 h-4" />
      Continue with Google
    </Button>
    <Button
      type="button"
      onClick={() => supabase.auth.signInWithOAuth({ provider: 'github', options: { redirectTo: `${window.location.origin}/auth/callback` } })}
      className="w-full bg-gray-800 text-white flex items-center justify-center gap-2"
    >
      <img src="/github-icon.svg" alt="GitHub" className="w-4 h-4" />
      Continue with GitHub
    </Button>
  </form>
)}

{step === 'signin' && (
  <form
    onSubmit={async (e) => {
      e.preventDefault();
      setIsLoading(true);
      try {
        await login(formData.email, formData.password);
        toast.success('Signed in successfully!');
        navigate('/app/dashboard');
      } catch (err: any) {
        toast.error(err.message || 'Invalid credentials');
      } finally {
        setIsLoading(false);
      }
    }}
    className="space-y-4"
  >
    <div className="space-y-2">
      <Label htmlFor="password" className="text-white">Password</Label>
      <div className="relative">
        <Input
          id="password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          value={formData.password}
          onChange={handleInputChange}
          required
          className="bg-white/10 border-white/20 text-white pr-10"
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3 text-white/70"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </Button>
      </div>
    </div>
    <Button type="submit" className="w-full" disabled={isLoading}>
      {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
      Sign In
    </Button>
    <div className="flex justify-end">
      <button
        type="button"
        onClick={() => setStep('forgot')}
        className="text-sm text-blue-400 hover:underline"
      >
        Forgot password?
      </button>
    </div>
  </form>
)}

{step === 'forgot' && (
  <form
    onSubmit={async (e) => {
      e.preventDefault();
      setIsLoading(true);
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(formData.email);
        if (error) {
          toast.error(error.message || 'Failed to send reset email');
        } else {
          toast.success('Password reset email sent!');
          setStep('signin');
        }
      } catch (err: any) {
        toast.error(err.message || 'Error sending reset email');
      } finally {
        setIsLoading(false);
      }
    }}
    className="space-y-4"
  >
    <div className="space-y-2">
      <Label htmlFor="reset-email" className="text-white">Email</Label>
      <Input
        id="reset-email"
        name="reset-email"
        type="email"
        value={formData.email}
        disabled
        className="bg-white/10 border-white/20 text-white"
      />
    </div>
    <Button type="submit" className="w-full" disabled={isLoading}>
      {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
      Send Password Reset Email
    </Button>
    <div className="flex justify-end">
      <button
        type="button"
        onClick={() => setStep('signin')}
        className="text-sm text-blue-400 hover:underline"
      >
        Back to sign in
      </button>
    </div>
  </form>
)}

{step === 'signup' && (
  <form onSubmit={handleSubmit} className="space-y-4">
    <div className="space-y-2">
      <Label htmlFor="name" className="text-white">Full Name</Label>
      <Input
        id="name"
        name="name"
        type="text"
        placeholder="Enter your full name"
        value={formData.name}
        onChange={handleInputChange}
        required
        className="bg-white/10 border-white/20 text-white"
      />
    </div>
    <div className="space-y-2">
      <Label htmlFor="password" className="text-white">Password</Label>
      <div className="relative">
        <Input
          id="password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          value={formData.password}
          onChange={handleInputChange}
          required
          className="bg-white/10 border-white/20 text-white pr-10"
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3 text-white/70"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </Button>
      </div>
      {formData.password && passwordRequirements.map((req, idx) => (
        <div key={idx} className="flex items-center space-x-2 text-xs">
          <Check className={`w-3 h-3 ${req.met ? 'text-green-400' : 'text-white/50'}`} />
          <span className={req.met ? 'text-green-400' : 'text-white/50'}>{req.label}</span>
        </div>
      ))}
    </div>
    <div className="space-y-2">
      <Label htmlFor="confirmPassword" className="text-white">Confirm Password</Label>
      <div className="relative">
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type={showConfirmPassword ? 'text' : 'password'}
          value={formData.confirmPassword}
          onChange={handleInputChange}
          required
          className="bg-white/10 border-white/20 text-white pr-10"
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3 text-white/70"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
        >
          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </Button>
      </div>
    </div>
    <div className="mt-4 text-xs text-white/50 text-center mb-4">
      By signing up to knitter.app, you agree to our{' '}
      <Link to="/terms" className="text-primary hover:text-primary/80">
        Terms of Service
      </Link>{' '}
      and{' '}
      <Link to="/privacy" className="text-primary hover:text-primary/80">
        Privacy Policy
      </Link>
    </div>

    <Button type="submit" className="w-full" disabled={isLoading}>
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Creating account...
        </>
      ) : (
        'Create Account'
      )}
    </Button>
  </form>
)}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Register;
