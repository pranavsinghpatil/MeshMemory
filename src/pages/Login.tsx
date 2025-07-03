import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, Loader2, ArrowLeft, ExternalLink, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { authService } from '@/services/auth';
import { supabase } from '@/services/supabase';
import Mesh from '@/components/mesh';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/app/dashboard');
    } catch (error) {
      toast.error('Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative h-full w-full bg-[#0f291b]">
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
            
            <div className="p-8 rounded-xl glass-card backdrop-blur-md border border-white/10 max-w-md">
              <h2 className="text-2xl font-bold text-white mb-4">Welcome to knitter.app</h2>
              <p className="text-white/80 mb-6">
                The all-in-one platform for managing your digital conversations and knowledge in a secure, organized way.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 p-4 rounded-lg">
                  <div className="text-3xl font-bold text-white mb-2">100%</div>
                  <div className="text-sm text-white/70">Data Ownership</div>
                </div>
                <div className="bg-white/10 p-4 rounded-lg">
                  <div className="text-3xl font-bold text-white mb-2">24/7</div>
                  <div className="text-sm text-white/70">Access Anywhere</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-8">
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            {/* Header */}
            <div className="text-center mb-8">
              <Link to="/" className="inline-flex items-center text-white/80 hover:text-white transition-colors mb-8">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to home
              </Link>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="flex items-center justify-center space-x-3 mb-6"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-2xl">
                  <span className="text-primary-foreground font-bold text-xl">K</span>
                </div>
                <span className="text-3xl font-bold text-white drop-shadow-lg">
                  knitter.app
                </span>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <h1 className="text-2xl font-bold mb-2 text-white">Welcome back</h1>
                <p className="text-white/80">Sign in to your account to continue</p>
              </motion.div>
            </div>

            {/* Login Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="glass-effect border-white/20 backdrop-blur-md shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-white">Sign In</CardTitle>
                  <CardDescription className="text-white/70">
                    Enter your credentials to access your workspace
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-white">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50 transition-all duration-200 focus:scale-[1.02]"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-white">Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="pr-10 bg-white/10 border-white/20 text-white placeholder:text-white/50 transition-all duration-200 focus:scale-[1.02]"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-white/70 hover:text-white"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full btn-primary transition-all duration-200 hover:scale-[1.02]"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        'Sign In'
                      )}
                    </Button>
                  </form>

                  <div className="mt-6 text-center space-y-4">
                    <Link
                      to="/forgot-password"
                      className="text-sm text-primary hover:text-primary/80 transition-colors"
                    >
                      Forgot your password?
                    </Link>

                    <div className="text-sm text-white/70">
                      Don't have an account?{' '}
                      <Link
                        to="/register"
                        className="text-primary hover:text-primary/80 transition-colors font-medium"
                      >
                        Sign up
                      </Link>
                    </div>
                    
                    <div className="mt-4 text-xs text-white/50 text-center">
                      By signing in to knitter.app, you agree to our{' '}
                      <Link to="/terms" className="text-primary hover:text-primary/80">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link to="/privacy" className="text-primary hover:text-primary/80">
                        Privacy Policy
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* OAuth buttons */}
            <div className="mt-6 space-y-3 w-full max-w-md">
              <button
                onClick={() => supabase.auth.signInWithOAuth({
                  provider: 'google',
                  options: {
                    redirectTo: `${window.location.origin}/auth/callback`
                  }
                })}
                className="w-full flex items-center justify-center gap-2 bg-white/90 text-gray-800 py-2 px-4 rounded-md border border-white/20 hover:bg-white transition-all duration-200 hover:scale-[1.02]"
              >
                <img src="/google-icon.svg" alt="Google" className="w-5 h-5" />
                Continue with Google
              </button>

              <button
                onClick={() => supabase.auth.signInWithOAuth({
                  provider: 'github',
                  options: {
                    redirectTo: `${window.location.origin}/auth/callback`
                  }
                })}
                className="w-full flex items-center justify-center gap-2 bg-gray-800/90 text-white py-2 px-4 rounded-md border border-white/10 hover:bg-gray-800 transition-all duration-200 hover:scale-[1.02]"
              >
                <img src="/github-icon.svg" alt="GitHub" className="w-5 h-5" />
                Continue with GitHub
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Login;
