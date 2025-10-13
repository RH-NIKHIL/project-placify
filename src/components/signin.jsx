import { useState } from "react";
import Spline from "@splinetool/react-spline";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    let tempErrors = {};
    let isValid = true;

    if (!email) {
      tempErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      tempErrors.email = "Email is invalid";
      isValid = false;
    }

    if (!password) {
      tempErrors.password = "Password is required";
      isValid = false;
    } else if (password.length < 6) {
      tempErrors.password = "Password must be at least 6 characters";
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      setIsLoading(true);
      setErrors({});

      // Call login API
      const result = await authAPI.login(email, password);

      setIsLoading(false);

      if (result.success) {
        const { user } = result.data;
        
        // Show success message with role
        alert(`✅ Successfully logged in as ${user.role.toUpperCase()}\n\nEmail: ${user.email}\nName: ${user.name}`);
        
        // Redirect based on role from database
        if (user.role === "admin") {
          navigate("/admin-dashboard");
        } else if (user.role === "company") {
          navigate("/company-dashboard");
        } else {
          navigate("/user-dashboard");
        }
      } else {
        setErrors({ login: result.error || "Invalid email or password" });
      }
    }
  };

  return (

    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="relative flex flex-col m-6 space-y-8 bg-orange shadow-2xl rounded-2xl md:flex-row md:space-y-0">
        {/* left side */}
        <form data-aos="zoom-in" data-aos-duration="1800" onSubmit={handleSubmit} className="flex flex-col justify-center p-8 md:p-14 shadow-[0_0_1500px_20px_#e99b63] ">
          <span className="mb-3 text-4xl font-bold text-black">
            Welcome back
          </span>
          <span className="font-light text-black mb-8">
            Welcome back! Please enter your details
          </span>

          {/* Login Error */}
          {errors.login && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {errors.login}
            </div>
          )}

          {/* Demo Credentials Info */}
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4 text-sm">
            <p className="font-bold mb-2">Demo Credentials:</p>
            <p><strong>Admin:</strong> admin@admin.com / admin123</p>
            <p><strong>Company:</strong> company@company.com / company123</p>
            <p><strong>User:</strong> user@user.com / user123</p>
          </div>

          {/* Email */}
          <div className="py-4">
            <span className="mb-2 text-md text-black">Email</span>
            <input
              type="text"
              className={`w-full p-2 border ${
                errors.email ? "border-red-500" : "border-gray-300"
              } rounded-md placeholder:font-light placeholder:text-gray-500 text-black`}
              name="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="py-4">
            <span className="mb-2 text-md text-black">Password</span>
            <input
              type="password"
              name="pass"
              id="pass"
              className={`w-full p-2 border ${
                errors.password ? "border-red-500" : "border-gray-300"
              } rounded-md placeholder:font-light placeholder:text-gray-500 text-black`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          <div className="flex justify-between w-full py-4">
            <div className="mr-24">
              <input type="checkbox" name="ch" id="ch" className="mr-2" />
              <span className="text-md text-black">Remember for 30 days</span>
            </div>
            <span className="font-bold text-md cursor-pointer text-black">
              Forgot password
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-black text-white p-2 rounded-lg mb-6 hover:bg-white hover:text-black hover:border hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>

          <div className="text-center text-black">
            Don't have an account?{" "}
            <Link to="/signup" className="font-bold text-black cursor-pointer">
              Sign up for free
            </Link>
          </div>
        </form>

        {/* right side */}
        <div className="relative flex items-center justify-center p-6">
          <div className="w-[350px] h-[400px] md:w-[400px] md:h-[450px] ">
            <Spline data-aos="zoom-out" data-aos-duration="1500" scene="https://prod.spline.design/QOfjgaaQWCrmXmzn/scene.splinecode" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
