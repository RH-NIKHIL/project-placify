import { useState } from "react";
import Spline from "@splinetool/react-spline";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Quick login function for demo credentials
  const quickLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    // Basic validation
    if (!email || !password) {
      setErrorMessage("Please enter both email and password");
      return;
    }

    setIsLoading(true);

    try {
      console.log("🔑 Logging in with:", email);
      
      // Call login API
  const result = await authAPI.login(email, password);

      if (result.success) {
        const { user, token } = result.data;
        
        console.log("✅ Login successful:", user);
        setSuccessMessage(`Welcome ${user.name}! Redirecting to ${user.role} dashboard...`);
        
        // Store user info in localStorage
        localStorage.setItem('authToken', token);
        localStorage.setItem('userRole', user.role);
        localStorage.setItem('userId', user.id);
        localStorage.setItem('userName', user.name);
        localStorage.setItem('userEmail', user.email);
        
        // Redirect based on role after a short delay
        setTimeout(() => {
          if (user.role === "admin") {
            navigate("/admin-dashboard");
          } else if (user.role === "company") {
            navigate("/company-dashboard");
          } else {
            navigate("/user-dashboard");
          }
        }, 1000);
      } else {
        console.error("❌ Login failed:", result.error);
        setErrorMessage(result.error || "Invalid email or password. Please try again.");
      }
    } catch (error) {
      console.error("❌ Login error:", error);
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="relative flex flex-col m-6 space-y-8 bg-orange shadow-2xl rounded-2xl md:flex-row md:space-y-0">
        {/* left side */}
        <form 
          data-aos="zoom-in" 
          data-aos-duration="1800" 
          onSubmit={handleSubmit} 
          className="flex flex-col justify-center p-8 md:p-14 shadow-[0_0_1500px_20px_#e99b63]"
        >
          <span className="mb-3 text-4xl font-bold text-black">
            Welcome back
          </span>
          <span className="font-light text-black mb-6">
            Please enter your details to sign in
          </span>

          {/* Success Message */}
          {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              <p className="font-bold">✅ Success!</p>
              <p className="text-sm">{successMessage}</p>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p className="font-bold">⚠️ Login Failed</p>
              <p className="text-sm">{errorMessage}</p>
            </div>
          )}

          {/* Demo Credentials - Quick Login Buttons */}
          <div className="bg-blue-50 border border-blue-300 rounded-lg p-4 mb-4">
            <p className="font-bold text-blue-900 mb-3 text-sm">🎯 Quick Login (Demo Accounts):</p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => quickLogin("admin@admin.com", "admin123")}
                className="w-full bg-purple-600 text-white text-sm py-2 px-4 rounded hover:bg-purple-700 transition"
              >
                👑 Admin Login
              </button>
              <button
                type="button"
                onClick={() => quickLogin("company@company.com", "company123")}
                className="w-full bg-blue-600 text-white text-sm py-2 px-4 rounded hover:bg-blue-700 transition"
              >
                🏢 Company Login
              </button>
              <button
                type="button"
                onClick={() => quickLogin("user@user.com", "user123")}
                className="w-full bg-green-600 text-white text-sm py-2 px-4 rounded hover:bg-green-700 transition"
              >
                👤 User Login
              </button>
            </div>
          </div>

          {/* Email Input */}
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-black">
              Email Address
            </label>
            <input
              type="email"
              className="w-full p-3 border border-gray-300 rounded-lg placeholder:text-gray-400 text-black focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password Input */}
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-black">
              Password
            </label>
            <input
              type="password"
              className="w-full p-3 border border-gray-300 rounded-lg placeholder:text-gray-400 text-black focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>


          {/* Remember Me & Forgot Password */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <input 
                type="checkbox" 
                id="remember" 
                className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
              />
              <label htmlFor="remember" className="ml-2 text-sm text-black">
                Remember me
              </label>
            </div>
            <span className="text-sm font-medium text-black hover:underline cursor-pointer">
              Forgot password?
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </span>
            ) : (
              "Sign In"
            )}
          </button>

          {/* Sign Up Link */}
          <div className="text-center text-black mt-6">
            Don't have an account?{" "}
            <Link to="/signup" className="font-bold text-black hover:underline">
              Sign up for free
            </Link>
          </div>
        </form>

        {/* right side */}
        <div className="relative flex items-center justify-center p-6">
          <div className="w-[350px] h-[400px] md:w-[400px] md:h-[450px]">
            <Spline 
              data-aos="zoom-out" 
              data-aos-duration="1500" 
              scene="https://prod.spline.design/QOfjgaaQWCrmXmzn/scene.splinecode" 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
