import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Eye, EyeOff, Mail, X, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { doSignInWithEmailAndPassword, doPasswordReset } from '../../firebase/auth';
import { getUserById } from '../../services/userService';
import { toast } from 'sonner';

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Password reset modal states
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetEmailError, setResetEmailError] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const validate = () => {
    const newErrors = { email: '', password: '' };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      newErrors.email = 'Email is required.';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Enter a valid email.';
    }

    if (!password) {
      newErrors.password = 'Password is required.';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    setErrors(newErrors);
    return Object.values(newErrors).every((msg) => msg === '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submitted");
    if (validate()) {
      console.log("Validation passed");
      setLoading(true);

      if (!isSigningIn) {
        setIsSigningIn(true);
        await doSignInWithEmailAndPassword(email, password)
          .then(async (userCredential) => {

            // Get user from userCredential
            const user = userCredential.user;

            try {
              const userRecord = await getUserById(user.uid);
              const role = userRecord.role || 'customer';
              console.log('Role:', role);
              // Redirect based on role
              if (role === 'admin' || role === 'staff') {
                navigate('/admin/inventory');
              } else {
                navigate('/customer/home');
              }
            } catch (err) {
              console.error('Failed to fetch user role:', err);
              // Fallback: go to customer home
              navigate('/customer/home');
            }

            setIsSigningIn(false);
            setLoading(false);
          })
          .catch((error) => {
            console.error("Login failed", error);
            toast.error("Login failed. Please check your credentials.");
          })
          .finally(() => {
            setLoading(false);
            setIsSigningIn(false);
          });
      }
    } else {
      console.log("Validation failed", errors);
    }
  };

  const handlePasswordReset = () => {
    setShowResetModal(true);
    // Pre-fill the reset email if the user has already entered an email in the login form
    if (email) {
      setResetEmail(email);
    }
  };

  const validateResetEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!resetEmail) {
      setResetEmailError('Email is required');
      return false;
    } else if (!emailRegex.test(resetEmail)) {
      setResetEmailError('Enter a valid email');
      return false;
    }
    setResetEmailError('');
    return true;
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();

    if (!validateResetEmail()) {
      return;
    }

    setResetLoading(true);

    try {
      await doPasswordReset(resetEmail);
      toast.success("Password reset email sent successfully!");
      closeResetModal();
    } catch (error) {
      let errorMessage = 'Failed to send reset email. Please try again later';

      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account exists with this email address';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email format';
      }

      toast.error(errorMessage);
      console.error('Password reset error:', error);
    } finally {
      setResetLoading(false);
    }
  };

  const closeResetModal = () => {
    setShowResetModal(false);
    setResetEmail('');
    setResetEmailError('');
    setResetLoading(false);
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-stone-900 to-orange-500 flex items-center justify-center px-4">
        <div className="flex flex-col lg:flex-row items-center justify-between w-full max-w-7xl gap-8 py-12">
          {/* Left Side */}
          <div className="lg:w-1/2 text-center lg:text-left text-white flex flex-col items-center lg:items-start">
            <h1 className="text-lg sm:text-xl font-light uppercase mb-2 tracking-wide">
              Welcome back to
            </h1>
            <div className="flex flex-row gap-3 mb-3">
              <label className='text-amber-500'>
                <h2 className="text-4xl sm:text-5xl font-extrabold mb-6 drop-shadow-lg">
                  ELMO's
                </h2>
              </label>
              <h2>Bicycle Shop</h2>
            </div>
            <img
              src="/images/logos/login-bike.png"
              alt="Elmo Bicycle Shop"
              className="max-h-[500px] w-auto"
            />
          </div>

          {/* Right Side */}
          <div className="bg-white/20 backdrop-blur-md border border-white/30 shadow-2xl rounded-2xl p-10 w-full max-w-md text-white">
            <div className="flex justify-center mb-6">
              <img
                src="/images/logos/elmo.png"
                alt="Elmo Logo"
                className="h-12 w-auto"
              />
            </div>
            <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-semibold mb-1">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter Email"
                  className={`w-full px-4 py-2 bg-white/80 text-black rounded-lg border ${errors.email ? 'border-red-500' : 'border-transparent'
                    } focus:ring-2 focus:ring-orange-500 focus:outline-none`}
                />
                {errors.email && (
                  <p className="text-sm text-red-300 mt-[2px]">{errors.email}</p>
                )}
              </div>

              <div className="relative">
                <label className="block text-sm font-semibold mb-1">Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full px-4 py-2 bg-white/80 text-black rounded-lg border ${errors.password ? 'border-red-500' : 'border-transparent'
                    } focus:ring-2 focus:ring-orange-500 focus:outline-none pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute top-[38px] right-3 text-gray-600 hover:text-orange-500 focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <Eye className="w-5 h-5" />
                  ) : (
                    <EyeOff className="w-5 h-5" />
                  )}
                </button>
                {errors.password && (
                  <p className="text-sm text-red-300 mt-1">{errors.password}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full ${loading ? 'bg-orange-400' : 'bg-orange-500 hover:bg-orange-600'
                  } text-white py-2 rounded-lg font-semibold transition-all duration-300 shadow-md flex items-center justify-center`}
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
                ) : (
                  'LOGIN'
                )}
              </button>

              <p className="text-sm text-center text-white/80">
                <span
                  className="text-orange-300 hover:underline cursor-pointer"
                  onClick={handlePasswordReset}
                >
                  Forgot Password
                </span>
              </p>
              <p className="text-sm text-center text-white/80">
                Don't have an account?{' '}
                <span
                  className="text-orange-300 hover:underline cursor-pointer"
                  onClick={() => navigate('/signup')}
                >
                  Sign up
                </span>
              </p>
            </form>
          </div>
        </div>
      </div>

      {/* Password Reset Modal - Bootstrap with Tailwind styling */}
      {showResetModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-lg overflow-hidden">
              {/* Modal Header */}
              <div className="modal-header bg-stone-900 text-white border-0">
                <h5 className="modal-title font-semibold">Reset Password</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={closeResetModal}
                  aria-label="Close"
                >
                  {/* <X className="w-5 h-5" /> */}
                </button>
              </div>

              {/* Modal Body */}
              <div className="modal-body p-4">
                <p className="text-gray-600 mb-4">
                  Enter your email address and we'll send you a link to reset your password.
                </p>


                <form onSubmit={handleResetSubmit}>
                  <div className="mb-3">
                    <label htmlFor="resetEmail" className="form-label fw-medium">Email Address</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light">
                        <Mail className="w-5 h-5 text-gray-500" />
                      </span>
                      <input
                        type="email"
                        className={`form-control ${resetEmailError ? 'is-invalid' : ''}`}
                        id="resetEmail"
                        placeholder="Enter your email"
                        value={resetEmail}
                        onChange={(e) => {
                          setResetEmail(e.target.value);
                          if (resetEmailError) validateResetEmail();
                        }}
                      />
                      {resetEmailError && (
                        <div className="invalid-feedback">{resetEmailError}</div>
                      )}
                    </div>

                  </div>

                  <p className='text-sm text-gray-500 mb-4 border-t border-gray-100 pt-2'>
                    <span className="font-medium">Note:</span> Please check your spam folder if you don't see the email in your inbox.
                  </p>

                  <div className="d-flex justify-content-end gap-2 mt-2">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={closeResetModal}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className={`btn ${resetLoading ? 'btn-secondary' : 'btn-success text-white'} flex items-center`}
                      disabled={resetLoading}
                    >
                      {resetLoading ? (
                        <div className='flex items-center'>
                          <Loader className="w-4 h-4 me-2 animate-spin" />
                          Sending...
                        </div>
                      ) : (
                        'Send Reset Link'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Login;