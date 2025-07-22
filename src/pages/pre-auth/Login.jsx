import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { doSignInWithEmailAndPassword } from '../../firebase/auth';

function Login() {


  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [isSigningIn, setIsSigningIn] = useState(false);

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
    console.log("Form submitted"); // ✅ Check 1
    if (validate()) {
      console.log("Validation passed"); // ✅ Check 2
      setLoading(true);

      // setTimeout(() => {
      //   console.log("Navigating to login"); // ✅ Check 3
      //   navigate('/login');
      // }, 1500);
      if (!isSigningIn) {
        setIsSigningIn(true);
        await doSignInWithEmailAndPassword(email, password)
          .then(() => {
            console.log("Login successful"); // ✅ Check 4
            setIsSigningIn(false);
            setLoading(false);

          })
          .catch((error) => {
            console.error("Login failed", error);
          })
          .finally(() => {
            setLoading(false);
            setIsSigningIn(false);
            // navigate('/customer/home'); // Navigate after successful login
          });
      }
    } else {
      console.log("Validation failed", errors); // 🛑 Catch silent fail
    }
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


              <p className="text-sm text-center mt-2 text-white/80">
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
    </>
  );

}

export default Login;
