import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { Loader2, Phone, Mail, ArrowLeft, Shield, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '@/assets/logo.svg';

type AuthMethod = 'phone' | 'email';
type AuthStep = 'input' | 'otp';

const RESEND_COOLDOWN = 30; // seconds

const Auth = () => {
  const [authMethod, setAuthMethod] = useState<AuthMethod>('phone');
  const [step, setStep] = useState<AuthStep>('input');
  const [identifier, setIdentifier] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  
  const { sendOtp, verifyOtp, signInWithGoogle, user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const getFullPhoneNumber = useCallback(() => {
    return `${countryCode}${identifier.replace(/\D/g, '')}`;
  }, [countryCode, identifier]);

  const validateInput = useCallback(() => {
    if (authMethod === 'phone') {
      const phoneDigits = identifier.replace(/\D/g, '');
      if (phoneDigits.length < 10) {
        toast({
          title: t('auth.invalidPhone'),
          description: t('auth.enterValidPhone'),
          variant: "destructive",
        });
        return false;
      }
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(identifier)) {
        toast({
          title: t('auth.invalidEmail'),
          description: t('auth.enterValidEmail'),
          variant: "destructive",
        });
        return false;
      }
    }
    return true;
  }, [authMethod, identifier, toast, t]);

  const handleSendOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!validateInput()) return;

    setIsLoading(true);
    
    const channel = authMethod === 'phone' ? 'sms' : 'email';
    const target = authMethod === 'phone' ? getFullPhoneNumber() : identifier;
    
    const { error } = await sendOtp(target, channel);

    if (error) {
      toast({
        title: t('auth.otpFailed'),
        description: error.message,
        variant: "destructive",
      });
    } else {
      setStep('otp');
      setResendTimer(RESEND_COOLDOWN);
      toast({
        title: t('auth.otpSent'),
        description: authMethod === 'phone' 
          ? t('auth.otpSentPhone') 
          : t('auth.otpSentEmail'),
      });
    }
    setIsLoading(false);
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      toast({
        title: t('auth.invalidOtp'),
        description: t('auth.enter6Digit'),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    const channel = authMethod === 'phone' ? 'sms' : 'email';
    const target = authMethod === 'phone' ? getFullPhoneNumber() : identifier;
    
    const { error } = await verifyOtp(target, otp, channel);

    if (error) {
      toast({
        title: t('auth.verificationFailed'),
        description: error.message,
        variant: "destructive",
      });
      setOtp('');
    } else {
      toast({
        title: t('auth.welcomeBack'),
        description: t('auth.loginSuccess'),
      });
      navigate('/');
    }
    setIsLoading(false);
  };

  const handleResendOtp = () => {
    if (resendTimer === 0) {
      handleSendOtp();
    }
  };

  const handleBack = () => {
    setStep('input');
    setOtp('');
  };

  const handleMethodSwitch = (method: AuthMethod) => {
    setAuthMethod(method);
    setIdentifier('');
    setOtp('');
    setStep('input');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <img src={logo} alt="Arunachala Vibe" className="h-16 w-16 mx-auto mb-4 rounded-full shadow-lg" />
          <h1 className="font-playfair text-3xl font-bold mb-2 text-foreground">{t('auth.sacredJourney')}</h1>
          <p className="text-muted-foreground">{t('auth.joinGirivalam')}</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {step === 'input' ? (
            <motion.div
              key="input"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-primary/20 shadow-xl backdrop-blur-sm">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto p-3 bg-primary/10 rounded-full w-fit mb-3">
                    <Shield className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{t('auth.loginSignup')}</CardTitle>
                  <CardDescription>{t('auth.noPasswordNeeded')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Method Toggle */}
                  <div className="flex gap-2 p-1 bg-muted rounded-lg">
                    {/* <Button
                      type="button"
                      variant={authMethod === 'phone' ? 'default' : 'ghost'}
                      className="flex-1 gap-2"
                      onClick={() => handleMethodSwitch('phone')}
                    >
                      <Phone className="h-4 w-4" />
                      {t('auth.mobile')}
                    </Button> */}
                    <Button
                      type="button"
                      variant={authMethod === 'email' ? 'default' : 'ghost'}
                      className="flex-1 gap-2"
                      onClick={() => handleMethodSwitch('email')}
                    >
                      <Mail className="h-4 w-4" />
                      {t('auth.email')}
                    </Button>
                  </div>

                  <form onSubmit={handleSendOtp} className="space-y-4">
                    {/* {authMethod === 'phone' ? (
                      <div className="space-y-2">
                        <Label htmlFor="phone">{t('auth.mobileNumber')}</Label>
                        <div className="flex gap-2">
                          <select
                            value={countryCode}
                            onChange={(e) => setCountryCode(e.target.value)}
                            className="w-24 h-12 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                          >
                            <option value="+91">🇮🇳 +91</option>
                            <option value="+1">🇺🇸 +1</option>
                            <option value="+44">🇬🇧 +44</option>
                            <option value="+61">🇦🇺 +61</option>
                            <option value="+65">🇸🇬 +65</option>
                            <option value="+971">🇦🇪 +971</option>
                          </select>
                          <Input
                            id="phone"
                            type="tel"
                            inputMode="numeric"
                            placeholder="9876543210"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value.replace(/\D/g, '').slice(0, 10))}
                            className="flex-1 h-12 text-lg"
                            required
                          />
                        </div>
                      </div>
                    ) : ( */}
                      <div className="space-y-2">
                        <Label htmlFor="email">{t('auth.emailAddress')}</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          value={identifier}
                          onChange={(e) => setIdentifier(e.target.value)}
                          className="h-12 text-lg"
                          required
                        />
                      </div>
                    {/* )} */}

                    <Button 
                      type="submit" 
                      className="w-full h-12 text-lg font-medium" 
                      disabled={isLoading || !identifier}
                    >
                      {isLoading ? (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      ) : null}
                      {t('auth.verifyLogin')}
                    </Button>
                  </form>

                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">{t('auth.or')}</span>
                    </div>
                  </div>

                  {/* Google Sign-in (Future) */}
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12"
                    onClick={() => signInWithGoogle()}
                  >
                    <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    {t('auth.continueGoogle')}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    By continuing, you agree to our{' '}
                    <Link to="/terms" className="text-primary hover:underline">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="text-primary hover:underline">
                      Privacy Policy
                    </Link>
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="otp"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-primary/20 shadow-xl backdrop-blur-sm">
                <CardHeader className="text-center pb-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBack}
                    className="absolute left-4 top-4"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    {t('auth.back')}
                  </Button>
                  <div className="mx-auto p-3 bg-primary/10 rounded-full w-fit mb-3 mt-4">
                    <Shield className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{t('auth.verifyOtp')}</CardTitle>
                  <CardDescription>
                    {authMethod === 'phone' 
                      ? `${t('auth.otpSentTo')} ${countryCode} ${identifier}`
                      : `${t('auth.otpSentTo')} ${identifier}`
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* OTP Input */}
                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={6}
                      value={otp}
                      onChange={setOtp}
                      className="gap-2"
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} className="h-14 w-12 text-xl font-semibold" />
                        <InputOTPSlot index={1} className="h-14 w-12 text-xl font-semibold" />
                        <InputOTPSlot index={2} className="h-14 w-12 text-xl font-semibold" />
                        <InputOTPSlot index={3} className="h-14 w-12 text-xl font-semibold" />
                        <InputOTPSlot index={4} className="h-14 w-12 text-xl font-semibold" />
                        <InputOTPSlot index={5} className="h-14 w-12 text-xl font-semibold" />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>

                  <Button 
                    onClick={handleVerifyOtp}
                    className="w-full h-12 text-lg font-medium" 
                    disabled={isLoading || otp.length !== 6}
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : null}
                    {t('auth.verifyLogin')}
                  </Button>

                  {/* Resend OTP */}
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">{t('auth.didntReceive')}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleResendOtp}
                      disabled={resendTimer > 0 || isLoading}
                      className="gap-2"
                    >
                      <RefreshCw className={`h-4 w-4 ${resendTimer > 0 ? '' : 'animate-none'}`} />
                      {resendTimer > 0 
                        ? `${t('auth.resendIn')} ${resendTimer}s` 
                        : t('auth.resendOtp')
                      }
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-xs text-muted-foreground mt-6"
        >
          {t('auth.secureLogin')}
        </motion.p>
      </div>
    </div>
  );
};

export default Auth;
