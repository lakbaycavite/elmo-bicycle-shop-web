import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { doCreateUserWithEmailAndPassword } from '../../firebase/auth';
import emailjs from '@emailjs/browser';
import ReCAPTCHA from "react-google-recaptcha";

function handleSignup(userName, userEmail) {
  const now = new Date();
  const timeString = now.toLocaleString();

  const templateParams = {
    name: userName,
    shopName: "Elmo Bicycle Shop",
    time: timeString,
    email: userEmail
  };

  emailjs.send(
    'service_qm2hw0u',
    'template_9myo6pg',
    templateParams,
    'Yebq7cqZ1qQCTWxhx'
  )
    .then(response => console.log('Welcome email sent!', response.status, response.text))
    .catch(error => console.error('Failed to send welcome email:', error));
}

function Signup() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [captchaToken, setCaptchaToken] = useState(null);

  const handleCaptchaChange = (token) => {
    setCaptchaToken(token);
  };

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{11,}$/;

    if (!firstName.trim()) newErrors.firstName = 'First name is required.';
    if (!lastName.trim()) newErrors.lastName = 'Last name is required.';
    if (!email) newErrors.email = 'Email is required.';
    else if (!emailRegex.test(email)) newErrors.email = 'Enter a valid email.';
    if (!phone) newErrors.phone = 'Phone number is required.';
    else if (!phoneRegex.test(phone)) newErrors.phone = 'Enter a valid phone number.';
    if (!password) newErrors.password = 'Password is required.';
    else if (password.length < 8) newErrors.password = 'Password must be at least 8 characters.';
    if (confirmPassword !== password) newErrors.confirmPassword = 'Passwords do not match.';
    if (!captchaToken) newErrors.captcha = 'Please verify the reCAPTCHA.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    const userName = `${firstName.trim()} ${lastName.trim()}`;
    const additionalUserData = { firstName, lastName, phone };

    try {
      await doCreateUserWithEmailAndPassword(email, password, additionalUserData);
      toast.success('Account created! check your email before logging in.', {
        position: 'bottom-right',
        duration: 3000
      });

      // Send welcome email
      handleSignup(userName, email);

      // Sign out the user so they can log in
      const { getAuth, signOut } = await import('firebase/auth');
      const auth = getAuth();
      await signOut(auth);

      navigate('/login');
    } catch (error) {
      console.error("Signup failed", error);
      if (error.code === 'auth/email-already-in-use') {
        toast.error('Email is already taken.');
      } else {
        toast.error('Signup failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-900 to-orange-500 flex items-center justify-center px-4">
      <div className="flex flex-col lg:flex-row items-center justify-between w-full max-w-7xl gap-8 py-12">
        {/* Left Side */}
        <div className="hidden lg:flex w-full text-center text-white flex-col items-center justify-center">
          <h1 className="text-lg sm:text-xl font-light uppercase mb-2 tracking-wide">Welcome to</h1>
          <div className="flex flex-row gap-3 mb-3">
            <label className="text-amber-500">
              <h2 className="text-4xl sm:text-5xl font-extrabold mb-6 drop-shadow-lg">ELMO</h2>
            </label>
            <h2>Bike Shop</h2>
          </div>
          <img src="/images/logos/login-bike.png" alt="Elmo Bicycle Shop" className="max-h-[500px] w-auto" />
        </div>

        {/* Right Side - Form */}
        <div className="bg-white/20 backdrop-blur-md border border-white/30 shadow-2xl rounded-2xl p-10 w-full max-w-md text-white">
          <div className="flex justify-center mb-6">
            <img src="/images/logos/elmo.png" alt="Elmo Logo" className="h-12 w-auto" />
          </div>
          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            {/* First & Last Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value.replace(/[^a-zA-Z\s]/g, ''))}
                  className={`w-full px-4 py-2 bg-white/80 text-black rounded-lg border ${errors.firstName ? 'border-red-500' : 'border-transparent'} focus:ring-2 focus:ring-orange-500`}
                  placeholder="First Name"
                />
                {errors.firstName && <p className="text-sm text-red-300 mt-1">{errors.firstName}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value.replace(/[^a-zA-Z\s]/g, ''))}
                  className={`w-full px-4 py-2 bg-white/80 text-black rounded-lg border ${errors.lastName ? 'border-red-500' : 'border-transparent'} focus:ring-2 focus:ring-orange-500`}
                  placeholder="Last Name"
                />
                {errors.lastName && <p className="text-sm text-red-300 mt-1">{errors.lastName}</p>}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-4 py-2 bg-white/80 text-black rounded-lg border ${errors.email ? 'border-red-500' : 'border-transparent'} focus:ring-2 focus:ring-orange-500`}
                placeholder="Email"
              />
              {errors.email && <p className="text-sm text-red-300 mt-1">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold mb-1">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                className={`w-full px-4 py-2 bg-white/80 text-black rounded-lg border ${errors.phone ? 'border-red-500' : 'border-transparent'} focus:ring-2 focus:ring-orange-500`}
                placeholder="+63XXXXXXXXXX"
              />
              {errors.phone && <p className="text-sm text-red-300 mt-1">{errors.phone}</p>}
            </div>

            {/* Password */}
            <div className="relative">
              <label className="block text-sm font-semibold mb-1">Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-4 py-2 bg-white/80 text-black rounded-lg border ${errors.password ? 'border-red-500' : 'border-transparent'} focus:ring-2 focus:ring-orange-500 pr-10`}
                placeholder="••••••••"
              />
              <button type="button" onClick={() => setShowPassword(prev => !prev)} className="absolute top-[38px] right-3">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
              {errors.password && <p className="text-sm text-red-300 mt-1">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <label className="block text-sm font-semibold mb-1">Confirm Password</label>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full px-4 py-2 bg-white/80 text-black rounded-lg border ${errors.confirmPassword ? 'border-red-500' : 'border-transparent'} focus:ring-2 focus:ring-orange-500 pr-10`}
                placeholder="••••••••"
              />
              <button type="button" onClick={() => setShowConfirmPassword(prev => !prev)} className="absolute top-[38px] right-3">
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
              {errors.confirmPassword && <p className="text-sm text-red-300 mt-1">{errors.confirmPassword}</p>}
            </div>

            {/* reCAPTCHA */}
            <div className="flex justify-center">
              <ReCAPTCHA
                sitekey="6Lc64acrAAAAAMiOKD4SyJOnnMZqty9uH0UMekPL"
                onChange={handleCaptchaChange}
              />
            </div>
            {errors.captcha && <p className="text-sm text-red-300 text-center">{errors.captcha}</p>}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full ${loading ? 'bg-orange-400' : 'bg-orange-500 hover:bg-orange-600'} text-white py-2 rounded-lg font-semibold flex items-center justify-center`}
            >
              {loading ? <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div> : 'SIGN UP'}
            </button>

            {/* Sign in link */}
            <p className="text-sm text-center mt-2 text-white/80">
              Already have an account?{' '}
              <span className="text-orange-300 hover:underline cursor-pointer" onClick={() => navigate('/login')}>Sign in</span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Signup;
