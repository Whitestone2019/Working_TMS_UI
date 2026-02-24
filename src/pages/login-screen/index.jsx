import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import Checkbox from '../../components/ui/Checkbox';
import { Eye, EyeOff, Shield, AlertCircle, Lock, User, Mail } from 'lucide-react';
import { login, storeUserDetails } from '../../api_service';

const LoginScreen = () => {
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({

    trngId: '',
    password: '',
    rememberMe: false
  });

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTimeRemaining, setLockTimeRemaining] = useState(0);

  useEffect(() => {
    const initUsers = async () => {
      try {
        await storeUserDetails();
        console.log("Users synced successfully");
      } catch (error) {
        console.error("User sync failed", error);
      }
    };

    initUsers();
  }, []);

  // Account lockout timer
  useEffect(() => {
    let timer;
    if (isLocked && lockTimeRemaining > 0) {
      timer = setInterval(() => {
        setLockTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsLocked(false);
            setFailedAttempts(0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isLocked, lockTimeRemaining]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear field-specific error when user starts typing
    if (errors?.[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};


    // Trainee ID validation for trainee role
    if (!formData?.trngId) {
      newErrors.trngId = 'Trainee ID is required';
    }

    // Password validation
    if (!formData?.password) {
      newErrors.password = 'Password is required';
    } else if (formData?.password?.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleLogin = async (e) => {
    e?.preventDefault();


    if (isLocked) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {

      console.log('Creating account with data:', formData);

      const response = await login(formData);
      console.log('Login response:', response);

      console.log("Response Status:", response?.status);

      const isValidCredentials = response?.status === 200;


      if (isValidCredentials) {
        // Successful login
        console.log('Login successful', response?.data);

        setFailedAttempts(0);

        if (formData?.rememberMe) {
          localStorage.setItem('userSession', JSON.stringify({
            trngId: formData?.trngId,
            timestamp: Date.now()
          }));
        }

        const empId = sessionStorage.setItem("empid", `${formData?.trngId}`);
        const userId = sessionStorage.setItem("userId", response?.data?.user?.userid);

        const userRole = response?.data?.user?.role?.manager ? "MANAGER" : "TRAINEE";
        sessionStorage.setItem("userRole", userRole);
const roleName = response?.data?.user?.role?.roleName;
sessionStorage.setItem("roleName", roleName);

        const userName = sessionStorage.setItem("userName", `${response?.data?.user?.firstname} ${response?.data?.user?.lastname}`);
        navigate(response?.data?.redirect || '/');

      } else {
        if (response?.status === 401) {
          setErrors({
            general: response?.message || 'Invalid credentials. Please try again.'
          });
          return;
        }

        const newFailedAttempts = failedAttempts + 1;
        setFailedAttempts(newFailedAttempts);

        if (newFailedAttempts >= 3) {
          setIsLocked(true);
          setLockTimeRemaining(300);
          setErrors({
            general: 'Account locked due to multiple failed attempts. Please try again in 5 minutes.'
          });
        } else {
          setErrors({
            general: `Invalid credentials. ${3 - newFailedAttempts} attempts remaining.`
          });
        }
      }


    } catch (error) {
      console.error('Login error:', error);
      setErrors({
        general: 'An error occurred during login. Please try again later.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    // In real app, trigger password reset flow
    alert('Password reset instructions would be sent to your email.');
    navigate('/reset-password');
  };

  const formatLockTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs?.toString()?.padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(30, 58, 138, 0.3) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="relative w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4 elevation-2">
            <Shield className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Trainee Management System
          </h1>
          <p className="text-muted-foreground">
            Secure access to your training portal
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-card rounded-xl shadow-lg border border-border overflow-hidden">
          <div className="p-8">
            <h2 className="text-xl font-semibold text-card-foreground mb-6 text-center">
              Sign In to Your Account
            </h2>

            <form onSubmit={handleLogin} className="space-y-6">
              {/* General Error */}
              {errors?.general && (
                <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                  <div>
                    <p className="text-sm text-destructive font-medium">
                      {errors?.general}
                    </p>
                    {isLocked && (
                      <p className="text-xs text-destructive/80 mt-1">
                        Time remaining: {formatLockTime(lockTimeRemaining)}
                      </p>
                    )}
                  </div>
                </div>
              )}



              <div className="relative">
                <Input
                  label="Trainee/Manager ID"
                  type="text"
                  required
                  value={formData?.trngId}
                  onChange={(e) => handleInputChange('trngId', e?.target?.value)}
                  error={errors?.trngId}
                  placeholder="Enter your trainee ID"
                  className="pl-10"
                  autoComplete="username"
                />
                <User className="absolute left-3 top-9 w-4 h-4 text-muted-foreground" />
              </div>




              {/* Password Field */}
              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData?.password}
                  onChange={(e) => handleInputChange('password', e?.target?.value)}
                  error={errors?.password}
                  placeholder="Enter your password"
                  className="pl-10 pr-10"

                  autoComplete="current-password"
                />
                <Lock className="absolute left-3 top-9 w-4 h-4 text-muted-foreground" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-9 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <Checkbox
                    checked={formData?.rememberMe}
                    onChange={(e) => handleInputChange('rememberMe', e?.target?.checked)}
                  />
                  <span className="text-sm text-muted-foreground">Remember me</span>
                </label>

                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                loading={isLoading}
                // disabled={isLocked}
                className="w-full"
                size="lg"
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>


          </div>

          {/* Security Footer */}
          <div className="bg-muted/30 px-8 py-4">
            <div className="flex items-center justify-center text-xs text-muted-foreground">
              <Shield className="w-3 h-3 mr-1" />
              Secured with enterprise-grade encryption
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-muted-foreground">
          <p>© 2025 Trainee Management System. All rights reserved.</p>
          <p className="mt-1">Session timeout: 30 minutes | Max login attempts: 5</p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;