import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { doCreateUserWithEmailAndPassword } from '../../firebase/auth';

function Signup() {
  const navigate = useNavigate();

  // Input states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);


  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validation state
  const [errors, setErrors] = useState({});

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validate()) {
      setLoading(true);


      const additionalUserData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
      }

      await doCreateUserWithEmailAndPassword(email, password, additionalUserData)
        .then(() => {
          setLoading(false);
          navigate('/login');
        })
        .catch((error) => {
          console.error("Signup failed", error);
          setLoading(false);
        });
    } else {
      console.log("Validation failed", errors); // 🛑 Catch silent fail
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-900 to-orange-500 flex items-center justify-center px-4">
      <div className="flex flex-col lg:flex-row items-center justify-between w-full max-w-7xl gap-8 py-12">
        {/* Center top */}
        <div className="hidden lg:flex w-full text-center text-white flex-col items-center justify-center">
          <h1 className="text-lg sm:text-xl font-light uppercase mb-2 tracking-wide">Welcome back to</h1>
          <div className="flex flex-row gap-3 mb-3">
            <label className="text-amber-500">
              <h2 className="text-4xl sm:text-5xl font-extrabold mb-6 drop-shadow-lg">ELMO's</h2>
            </label>
            <h2>Bicycle Shop</h2>
          </div>
          <img src="/images/logos/login-bike.png" alt="Elmo Bicycle Shop" className="max-h-[500px] w-auto" />
        </div>
    
        {/* Right Side */}
        <div className="bg-white/20 backdrop-blur-md border border-white/30 shadow-2xl rounded-2xl p-10 w-full max-w-md text-white">
          <div className="flex justify-center mb-6">
            <img src="/images/logos/elmo.png" alt="Elmo Logo" className="h-12 w-auto" />
          </div>
          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-semibold mb-1">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter First Name"
                className={`w-full px-4 py-2 bg-white/80 text-black rounded-lg border ${errors.firstName ? 'border-red-500' : 'border-transparent'
                  } focus:ring-2 focus:ring-orange-500`}
              />
              <p className="text-sm text-red-300 mt-1 mb-0">{errors.firstName}</p>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Enter Last Name"
                className={`w-full px-4 py-2 bg-white/80 text-black rounded-lg border ${errors.lastName ? 'border-red-500' : 'border-transparent'
                  } focus:ring-2 focus:ring-orange-500`}
              />
              <p className="text-sm text-red-300 mt-1 mb-0">{errors.lastName}</p>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter Email"
                className={`w-full px-4 py-2 bg-white/80 text-black rounded-lg border ${errors.email ? 'border-red-500' : 'border-transparent'
                  } focus:ring-2 focus:ring-orange-500`}
              />
              <p className="text-sm text-red-300 mt-1 mb-0">{errors.email}</p>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Phone Number</label>
             <input
  type="tel"
  name="phone"
  value={newAccount.phone}
  onChange={(e) => {
    const onlyDigits = e.target.value.replace(/\D/g, ''); // strip non-digits
    if (onlyDigits.length <= 11) {
      setNewAccount(prev => ({
        ...prev,
        phoneNumber: onlyDigits
      }));
    }
  }}
  className="w-full p-2 border rounded"
  required
  placeholder="+63"
  maxLength={11} // prevents user from typing beyond 11
/>
              <p className="text-sm text-red-300 mt-1 mb-0">{errors.phone}</p>
            </div>


            <div className="relative">
              <label className="block text-sm font-semibold mb-1">Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full px-4 py-2 bg-white/80 text-black rounded-lg border ${errors.password ? 'border-red-500' : 'border-transparent'
                  } focus:ring-2 focus:ring-orange-500 pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute top-[38px] right-3 text-gray-600 hover:text-orange-500 focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
              {errors.password && <p className="text-sm text-red-300 mt-1">{errors.password}</p>}
            </div>

            <div className="relative">
              <label className="block text-sm font-semibold mb-1">Confirm Password</label>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full px-4 py-2 bg-white/80 text-black rounded-lg border ${errors.confirmPassword ? 'border-red-500' : 'border-transparent'
                  } focus:ring-2 focus:ring-orange-500 pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute top-[38px] right-3 text-gray-600 hover:text-orange-500 focus:outline-none"
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
              {errors.confirmPassword && (
                <p className="text-sm text-red-300 mt-1">{errors.confirmPassword}</p>
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
                'SIGN UP'
              )}
            </button>
            <p className="text-sm text-center mt-2 text-white/80">
              Already have an account?{' '}
              <span
                className="text-orange-300 hover:underline cursor-pointer"
                onClick={() => navigate('/login')}
              >
                Sign in
              </span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Signup;
