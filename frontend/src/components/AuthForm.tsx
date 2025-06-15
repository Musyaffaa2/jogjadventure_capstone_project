import { useState, useEffect } from "react";
import { FaEnvelope, FaLock, FaGoogle, FaFacebookF, FaEye, FaEyeSlash } from "react-icons/fa";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "./Navbar";
import "../index.css";

// API Base URL
const API_BASE_URL = import.meta.env.VITE_BACKEND_BASEURL;

// Props type for InputField component
type InputFieldProps = {
  type: string;
  placeholder: string;
  Icon: React.ElementType;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showPassword?: boolean;
  onTogglePassword?: () => void;
};

// Reusable input field component
const InputField = ({
  type,
  placeholder,
  Icon,
  value,
  onChange,
  showPassword,
  onTogglePassword,
}: InputFieldProps) => (
  <div className="relative w-full focus-within:ring-2 focus-within:ring-secondary rounded-[10px] transition duration-300">
    <input
      type={type === "password" && showPassword ? "text" : type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="h-11 w-full bg-zinc-300 rounded-[10px] px-4 pr-10 outline-none"
    />
    {type === "password" ? (
      <button
        type="button"
        onClick={onTogglePassword}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800 focus:outline-none"
      >
        {showPassword ? <FaEyeSlash /> : <FaEye />}
      </button>
    ) : (
      <Icon className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-600" />
    )}
  </div>
);

const AuthForm = () => {
  const [isActive, setIsActive] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Input state types
  type AuthData = {
    email: string;
    password: string;
  };

  const [signInData, setSignInData] = useState<AuthData>({
    email: "",
    password: "",
  });

  const [signUpData, setSignUpData] = useState<AuthData>({
    email: "",
    password: "",
  });

  // Strong password validation
  const validatePasswordStrength = (password: string): string => {
    if (password.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/[0-9]/.test(password)) {
      return 'Password must contain at least one number';
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      return 'Password must contain at least one special character';
    }
    return '';
  };

  const getPasswordStrengthColor = (password: string) => {
    const score = [
      password.length >= 6,
      /[A-Z]/.test(password),
      /[a-z]/.test(password),
      /[0-9]/.test(password),
      /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    ].filter(Boolean).length;

    if (score <= 2) return 'text-red-500';
    if (score <= 3) return 'text-yellow-500';
    if (score <= 4) return 'text-blue-500';
    return 'text-green-500';
  };

  const getPasswordStrengthText = (password: string) => {
    const score = [
      password.length >= 6,
      /[A-Z]/.test(password),
      /[a-z]/.test(password),
      /[0-9]/.test(password),
      /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    ].filter(Boolean).length;

    if (score <= 2) return 'Weak';
    if (score <= 3) return 'Fair';
    if (score <= 4) return 'Good';
    return 'Strong';
  };

  // Read mode from query string
  useEffect(() => {
    const mode = searchParams.get("mode");
    if (mode === "signin") {
      setIsActive(true);
    } else if (mode === "signup") {
      setIsActive(false);
    } else {
      // Default to signup if no mode specified
      setIsActive(false);
      setSearchParams({ mode: "signup" }, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Clear messages after some time
  useEffect(() => {
    if (errorMessage || successMessage) {
      const timer = setTimeout(() => {
        setErrorMessage("");
        setSuccessMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage, successMessage]);

  // Sign In Handler
  const handleSignInSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Prevent double submission
    if (isLoading) return;
    
    const { email, password } = signInData;
    
    if (!email || !password) {
      setErrorMessage("Email dan password harus diisi");
      setHasError(true);
      setTimeout(() => setHasError(false), 500);
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      console.log("Attempting login with:", { email });
      
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password
      });

      console.log("Login response:", response.data);

      // Handle different response structures
      let token, user;
      
      if (response.data.token) {
        token = response.data.token;
        user = response.data.user;
      } else if (response.data.accessToken) {
        token = response.data.accessToken;
        user = response.data.user;
      } else {
        throw new Error("Token not found in response");
      }
      
      if (token && user) {
        // Store auth data
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        
        setSuccessMessage("Login berhasil!");
        setSignInData({ email: "", password: "" });
        
        // Trigger a storage event to notify other components
        window.dispatchEvent(new Event('storage'));
        
        // Navigate after a short delay
        setTimeout(() => {
          navigate("/", { replace: true });
        }, 1000);
      } else {
        throw new Error("Invalid response structure from server");
      }
      
    } catch (error: any) {
      console.error("Login error:", error);
      
      let errorMsg = "Terjadi kesalahan saat login";
      
      if (error.code === 'ERR_NETWORK') {
        errorMsg = "Tidak dapat terhubung ke server. Pastikan server berjalan di http://localhost:5000";
      } else if (error.response?.status === 400) {
        errorMsg = error.response?.data?.message || error.response?.data?.msg || "Email atau password salah";
      } else if (error.response?.data?.msg) {
        errorMsg = error.response.data.msg;
      } else if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.response?.data?.errors) {
        errorMsg = error.response.data.errors[0].msg;
      }
      
      setErrorMessage(errorMsg);
      setHasError(true);
      setTimeout(() => setHasError(false), 500);
    } finally {
      setIsLoading(false);
    }
  };

  // Sign Up Handler
  const handleSignUpSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Prevent double submission
    if (isLoading) return;
    
    const { email, password } = signUpData;
    
    if (!email || !password) {
      setErrorMessage("Email dan password harus diisi");
      setHasError(true);
      setTimeout(() => setHasError(false), 500);
      return;
    }

    // Validate password strength
    const passwordError = validatePasswordStrength(password);
    if (passwordError) {
      setErrorMessage(passwordError);
      setHasError(true);
      setTimeout(() => setHasError(false), 500);
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      console.log("Attempting registration with:", { email });
      
      const response = await axios.post(`${API_BASE_URL}/auth/register`, {
        email,
        password
      });

      console.log("Registration response:", response.data);

      // Handle different response structures from server
      let token, user;
      
      // Check for different token field names
      if (response.data.token) {
        token = response.data.token;
        user = response.data.user;
      } else if (response.data.accessToken) {
        token = response.data.accessToken;
        user = response.data.user;
      } else {
        throw new Error("Token not found in response");
      }
      
      // Verify we have the required data
      if (token && user && response.data.success) {
        // Store auth data
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        
        setSuccessMessage("Registrasi berhasil!");
        setSignUpData({ email: "", password: "" });
        
        // Trigger a storage event to notify other components
        window.dispatchEvent(new Event('storage'));
        
        // Navigate after a short delay
        setTimeout(() => {
          navigate("/", { replace: true });
        }, 1000);
      } else {
        // Handle case where registration was successful but structure is different
        if (response.data.success && response.data.message === "Registrasi berhasil") {
          // If the first request succeeded, don't make another request
          if (response.data.accessToken) {
            localStorage.setItem("token", response.data.accessToken);
            localStorage.setItem("user", JSON.stringify(response.data.user));
            
            setSuccessMessage("Registrasi berhasil!");
            setSignUpData({ email: "", password: "" });
            
            window.dispatchEvent(new Event('storage'));
            
            setTimeout(() => {
              navigate("/", { replace: true });
            }, 1000);
          } else {
            throw new Error("Registration successful but token missing");
          }
        } else {
          throw new Error("Invalid response structure from server");
        }
      }
      
    } catch (error: any) {
      console.error("Registration error:", error);
      
      let errorMsg = "Terjadi kesalahan saat registrasi";
      
      if (error.code === 'ERR_NETWORK') {
        errorMsg = "Tidak dapat terhubung ke server. Pastikan server berjalan di http://localhost:5000";
      } else if (error.response?.status === 400) {
        errorMsg = error.response?.data?.message || error.response?.data?.msg || "Email sudah terdaftar atau data tidak valid";
      } else if (error.response?.data?.msg) {
        errorMsg = error.response.data.msg;
      } else if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.response?.data?.errors) {
        errorMsg = error.response.data.errors[0].msg;
      }
      
      setErrorMessage(errorMsg);
      setHasError(true);
      setTimeout(() => setHasError(false), 500);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen font-['Poppins']">
      {/* Navbar */}
      <Navbar />

      {/* Main Content with Background */}
      <div
        className="min-h-screen flex justify-center items-center relative"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('/parangtritis1.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        {/* Error/Success Messages */}
        {(errorMessage || successMessage) && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
            <div
              className={`px-6 py-3 rounded-lg shadow-lg ${
                errorMessage
                  ? "bg-red-500 text-white"
                  : "bg-green-500 text-white"
              }`}
            >
              {errorMessage || successMessage}
            </div>
          </div>
        )}

        <div className="relative w-[834px] h-[530px] bg-white/95 backdrop-blur-sm rounded-[30px] shadow-xl m-2.5 overflow-hidden max-sm:h-[calc(100vh-120px)]">
          {/* Sign Up Form */}
          <div
            className={`absolute top-0 left-0 w-1/2 h-full flex items-center justify-center transition-all duration-700 ease-in-out 
            ${
              isActive
                ? "translate-x-full opacity-0 z-10 scale-75 blur-sm max-sm:translate-y-full"
                : "z-20 opacity-100 scale-100 blur-0"
            } max-sm:w-full max-sm:h-[75%]`}
          >
            <div className="w-full px-8 text-center">
              <h2 className="text-3xl font-semibold text-black mb-6">
                Sign Up
              </h2>
              <form
                onSubmit={handleSignUpSubmit}
                className={`flex flex-col gap-4 items-center ${
                  hasError ? "animate-shake" : ""
                }`}
              >
                <InputField
                  type="email"
                  placeholder="Email"
                  Icon={FaEnvelope}
                  value={signUpData.email}
                  onChange={(e) =>
                    setSignUpData({ ...signUpData, email: e.target.value })
                  }
                />
                <div className="w-full">
                  <InputField
                    type="password"
                    placeholder="Password"
                    Icon={FaLock}
                    value={signUpData.password}
                    onChange={(e) =>
                      setSignUpData({ ...signUpData, password: e.target.value })
                    }
                    showPassword={showSignUpPassword}
                    onTogglePassword={() => setShowSignUpPassword(!showSignUpPassword)}
                  />
                  {signUpData.password && (
                    <div className="mt-1 text-left text-xs">
                      <span className={`font-medium ${getPasswordStrengthColor(signUpData.password)}`}>
                        Strength: {getPasswordStrengthText(signUpData.password)}
                      </span>
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`bg-secondary text-white py-2.5 rounded-[10px] mt-2 w-full cursor-pointer hover:opacity-90 transition ${
                    isLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {isLoading ? "Loading..." : "Sign Up"}
                </button>
              </form>
              <div className="mt-4 text-sm text-gray-500">or register with</div>
              <div className="flex justify-center gap-4 mt-2">
                <button className="bg-red-500 text-white p-3 rounded-full hover:opacity-60 transition cursor-pointer">
                  <FaGoogle />
                </button>
                <button className="bg-blue-600 text-white p-3 rounded-full hover:opacity-60 transition cursor-pointer">
                  <FaFacebookF />
                </button>
              </div>
            </div>
          </div>

          {/* Sign In Form */}
          <div
            className={`absolute left-0 w-1/2 h-full right-0 flex items-center justify-center transition-all duration-700 ease-in-out 
            ${
              isActive
                ? "z-10 opacity-100 translate-x-full scale-100 blur-0 max-sm:translate-x-0 max-sm:translate-y-14"
                : "translate-x-0 opacity-0 z-10 scale-75 blur-sm"
            } max-sm:w-full`}
          >
            <div className="w-full px-8 text-center">
              <h2 className="text-3xl font-semibold text-black mb-6">
                Sign In
              </h2>
              <form
                onSubmit={handleSignInSubmit}
                className={`flex flex-col gap-4 items-center ${
                  hasError ? "animate-shake" : ""
                }`}
              >
                <InputField
                  type="email"
                  placeholder="Email"
                  Icon={FaEnvelope}
                  value={signInData.email}
                  onChange={(e) =>
                    setSignInData({ ...signInData, email: e.target.value })
                  }
                />
                <InputField
                  type="password"
                  placeholder="Password"
                  Icon={FaLock}
                  value={signInData.password}
                  onChange={(e) =>
                    setSignInData({ ...signInData, password: e.target.value })
                  }
                  showPassword={showSignInPassword}
                  onTogglePassword={() => setShowSignInPassword(!showSignInPassword)}
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`bg-secondary text-white py-2.5 rounded-[10px] mt-2 w-full cursor-pointer hover:opacity-90 transition ${
                    isLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {isLoading ? "Loading..." : "Sign In"}
                </button>
              </form>
              <div className="mt-4 text-sm text-gray-500">or sign in with</div>
              <div className="flex justify-center gap-4 mt-2">
                <button className="bg-red-500 text-white p-3 rounded-full hover:opacity-60 transition cursor-pointer">
                  <FaGoogle />
                </button>
                <button className="bg-blue-600 text-white p-3 rounded-full hover:opacity-60 transition cursor-pointer">
                  <FaFacebookF />
                </button>
              </div>
            </div>
          </div> 

          {/* Toggle Panel */}
          <div
            className={`absolute right-0 w-1/2 h-full bg-secondary text-white flex flex-col justify-center items-center text-center transition-all duration-700 ease-in-out z-30 
            ${
              isActive
                ? "-translate-x-0 max-sm:-translate-y-4 max-sm:rounded-b-[100px] max-sm:rounded-r-none max-sm:top-0 rounded-r-[100px]"
                : "translate-x-full max-sm:translate-y-0 max-sm:translate-x-0 max-sm:rounded-t-[100px] max-sm:rounded-b-none rounded-l-[100px]"
            } max-sm:h-[30%] max-sm:bottom-0 max-sm:w-full left-0`}
          >
            <div>
              <h2 className="text-3xl font-semibold">
                {isActive ? "Welcome Back!" : "Hello, Friend!"}
              </h2>
              <p className="text-sm mt-2">
                {isActive
                  ? "To keep connected with us please login with your info"
                  : "Enter your details and start your journey with"}
              </p>
              <button
                onClick={() => {
                  const newMode = isActive ? "signup" : "signin";
                  setSearchParams({ mode: newMode });
                  setIsActive(!isActive);
                  // Clear messages when switching
                  setErrorMessage("");
                  setSuccessMessage("");
                }}
                className="mt-6 border border-white px-5 py-2.5 rounded-[10px] cursor-pointer hover:bg-white hover:text-secondary transition"
              >
                {isActive ? "Sign Up" : "Sign In"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;