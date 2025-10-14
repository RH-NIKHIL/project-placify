import { useState } from "react";
import Spline from "@splinetool/react-spline";
import "boxicons/css/boxicons.min.css";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const SignUp = () => {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    role: "user" // default Student
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  const validate = () => {
    let tempErrors = {};
    let isValid = true;

    if (!formData.email) {
      tempErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = "Invalid email format";
      isValid = false;
    }

    if (!formData.username) {
      tempErrors.username = "Username is required";
      isValid = false;
    } else if (formData.username.length < 3) {
      tempErrors.username = "Username must be at least 3 characters";
      isValid = false;
    }

    if (!formData.password) {
      tempErrors.password = "Password is required";
      isValid = false;
    } else if (formData.password.length < 6) {
      tempErrors.password = "Password must be at least 6 characters";
      isValid = false;
    } else if (!/\d/.test(formData.password)) {
      tempErrors.password = "Password must include at least one number";
      isValid = false;
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
      tempErrors.password = "Password must include at least one symbol";
      isValid = false;
    }

    if (!formData.confirmPassword) {
      tempErrors.confirmPassword = "Confirm password is required";
      isValid = false;
    } else if (formData.confirmPassword !== formData.password) {
      tempErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear field-level error for this field when user edits it
    setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
    setServerError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        name: formData.username, // backend expects `name`
        email: formData.email,
        password: formData.password,
        role: formData.role
      };

      const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const res = await axios.post(`${baseUrl}/api/auth/register`, payload, {
        headers: { "Content-Type": "application/json" },
        timeout: 10000
      });

      // On success: store token (if returned) and redirect
      if (res?.data?.token) {
        localStorage.setItem('authToken', res.data.token);
        if (res?.data?.user?.role) localStorage.setItem('userRole', res.data.user.role);
        if (res?.data?.user?.id) localStorage.setItem('userId', res.data.user.id);
      }
      // Optionally show a success toast/modal — here we redirect to signin
      navigate("/signin");
    } catch (err) {
      // err.response may be undefined on network error
      const resp = err.response;
      if (resp && resp.data) {
        // If express-validator returned errors array
        if (Array.isArray(resp.data.errors)) {
          const newErrors = {};
          resp.data.errors.forEach((e) => {
            // map param to field if matches form field names
            // backend validation uses 'name' param for username -> map to username
            const param = e.param === "name" ? "username" : e.param;
            newErrors[param] = e.msg;
          });
          setErrors(newErrors);
        } else if (resp.data.message) {
          setServerError(resp.data.message);
        } else {
          // Fallback: stringify small object
          setServerError(JSON.stringify(resp.data).slice(0, 200));
        }
      } else if (err.code === "ECONNABORTED") {
        setServerError("Request timed out. Please try again.");
      } else {
        setServerError("Network or server error. Please try again.");
      }
      console.error("Registration error (frontend):", err);
    } finally {
      setLoading(false);
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
          className="flex flex-col justify-center p-8 md:p-14 shadow-[0_0_1500px_20px_#e99b63] "
        >
          <span className="mb-3 text-4xl font-bold text-black">Create Account</span>
          <span className="font-light text-black mb-8">Sign up to get started with Placify 🚀</span>

          {/* server-level error */}
          {serverError && <div className="mb-3 text-red-600 text-sm">{serverError}</div>}

          {/* Email */}
          <div className="py-2">
            <span className="mb-2 text-md text-black">Email</span>
            <input
              type="text"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full p-2 border ${errors.email ? "border-red-500" : "border-gray-300"} rounded-md placeholder:font-light placeholder:text-gray-500 text-black`}
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
          </div>

          {/* Username */}
          <div className="py-2">
            <span className="mb-2 text-md text-black">Username</span>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={`w-full p-2 border ${errors.username ? "border-red-500" : "border-gray-300"} rounded-md placeholder:font-light placeholder:text-gray-500 text-black`}
            />
            {errors.username && <p className="text-red-500 text-sm">{errors.username}</p>}
          </div>

          {/* Password */}
          <div className="py-2 relative">
            <span className="mb-2 text-md text-black">Create Password</span>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full p-2 border ${errors.password ? "border-red-500" : "border-gray-300"} rounded-md placeholder:font-light placeholder:text-gray-500 text-black`}
              />
              <button
                type="button"
                className="absolute right-2 top-2 text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                <i className={`bx ${showPassword ? "bx-hide" : "bx-show"} text-xl`}></i>
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div className="py-2 relative">
            <span className="mb-2 text-md text-black">Confirm Password</span>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full p-2 border ${errors.confirmPassword ? "border-red-500" : "border-gray-300"} rounded-md placeholder:font-light placeholder:text-gray-500 text-black`}
              />
              <button
                type="button"
                className="absolute right-2 top-2 text-gray-600"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <i className={`bx ${showConfirmPassword ? "bx-hide" : "bx-show"} text-xl`}></i>
              </button>
            </div>
            {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword}</p>}
          </div>

          {/* Role Selection */}
          <div className="py-2">
            <span className="mb-2 text-md text-black">Account Type</span>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md text-black bg-white"
            >
              <option value="user">Student</option>
              <option value="company">Company</option>
              {/* Admin role intentionally removed from public signup */}
            </select>
            <p className="text-xs text-gray-500 mt-1">Choose Student if you are applying for jobs; Company if you will post jobs.</p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white p-2 mt-4 rounded-lg mb-6 hover:bg-white hover:text-black hover:border hover:border-gray-300 disabled:opacity-50"
          >
            {loading ? "Signing up..." : "Sign Up"}
          </button>

          <div className="text-center text-black">
            Already have an account?{" "}
            <Link to="/signin" className="font-bold text-black cursor-pointer">Sign in</Link>
          </div>
        </form>

        {/* right side (Spline animation) */}
        <div className="relative flex items-center justify-center p-6">
          <div className="w-[350px] h-[400px] md:w-[400px] md:h-[450px]">
            <Spline data-aos="zoom-out" data-aos-duration="2000" scene="https://prod.spline.design/QOfjgaaQWCrmXmzn/scene.splinecode" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
