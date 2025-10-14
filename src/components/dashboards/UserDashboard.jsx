import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { userAPI, authAPI, jobAPI, aiAPI } from "../../services/api";
import ResumeBuilder from "../ResumeBuilder";

export default function UserDashboard() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Profile state
  const [profile, setProfile] = useState({
    _id: null,
    name: "",
    college: "",
    department: "",
    email: "",
    phone: "",
    profilePicture: "https://via.placeholder.com/150",
    skills: [],
    score: 0,
    tasksCompleted: 0
  });

  const [editProfile, setEditProfile] = useState({ ...profile });
  const [jobs, setJobs] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);

  // AI Chat state
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hello! I'm your AI assistant. How can I help you today?" }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Job Application state
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applicationData, setApplicationData] = useState({
    resume: "",
    coverLetter: ""
  });
  const [isApplying, setIsApplying] = useState(false);

  // Load user profile on component mount
  useEffect(() => {
    loadUserProfile();
    loadJobs();
    loadLeaderboard();
  }, []);

  const loadUserProfile = async () => {
    setIsLoading(true);
    const result = await authAPI.getProfile();
    
    if (result && result.success) {
      const userData = result.data;
      setProfile({
        _id: userData._id || userData.id || null,
        name: userData.name || "",
        college: userData.college || "",
        department: userData.department || "",
        email: userData.email || "",
        phone: userData.phone || "",
        profilePicture: userData.profilePicture || "https://via.placeholder.com/150",
        skills: userData.skills || [],
        score: userData.score || 0,
        tasksCompleted: userData.tasksCompleted || 0
      });
      setEditProfile({
        name: userData.name || "",
        college: userData.college || "",
        department: userData.department || "",
        email: userData.email || "",
        phone: userData.phone || "",
        profilePicture: userData.profilePicture || "https://via.placeholder.com/150",
        skills: userData.skills || [],
        score: userData.score || 0,
        tasksCompleted: userData.tasksCompleted || 0
      });

      // optional: keep userId for legacy code (not required)
      if (userData._id) localStorage.setItem('userId', userData._id);
    } else {
      console.error("Failed to load profile:", result?.error || result?.message);
      // If unauthorized, redirect to login
      if (result?.error === "No token provided" || result?.error === "Invalid token") {
        authAPI.logout();
        navigate("/signin");
      }
    }
    setIsLoading(false);
  };

  const loadJobs = async () => {
    const result = await jobAPI.getAllJobs();
    if (result && result.success) {
      // Sort by newest first and show all jobs
      const sortedJobs = result.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setJobs(sortedJobs);
    }
  };

  const loadLeaderboard = async () => {
    const result = await userAPI.getLeaderboard();
    if (result && result.success) {
      setLeaderboard(result.data);
    }
  };

  const handleLogout = () => {
    authAPI.logout();
    navigate("/signin");
  };

  const hasChanges = () => {
    // Compare relevant fields only
    const base = {
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      college: profile.college,
      department: profile.department,
      profilePicture: profile.profilePicture,
      skills: profile.skills || []
    };
    const edited = {
      name: editProfile.name,
      email: editProfile.email,
      phone: editProfile.phone,
      college: editProfile.college,
      department: editProfile.department,
      profilePicture: editProfile.profilePicture,
      skills: editProfile.skills || []
    };
    return JSON.stringify(base) !== JSON.stringify(edited);
  };

  const handleEditToggle = async () => {
    if (isEditing) {
      // Save the profile to database
      if (!hasChanges()) {
        // nothing changed
        setIsEditing(false);
        return;
      }

      setIsSaving(true);
      const userId = profile._id || localStorage.getItem('userId');
      if (!userId) {
        alert('User id not found. Please login again.');
        setIsSaving(false);
        return;
      }

      const result = await userAPI.updateProfile(userId, {
        name: editProfile.name,
        email: editProfile.email,
        phone: editProfile.phone,
        college: editProfile.college,
        department: editProfile.department,
        profilePicture: editProfile.profilePicture,
        skills: editProfile.skills
      });

      setIsSaving(false);

      if (result && result.success) {
        // use server-canonical data when available
        const serverUser = result.data || {
          name: editProfile.name,
          email: editProfile.email,
          phone: editProfile.phone,
          college: editProfile.college,
          department: editProfile.department,
          profilePicture: editProfile.profilePicture,
          skills: editProfile.skills
        };
        setProfile(prev => ({ ...prev, ...serverUser }));
        setEditProfile(prev => ({ ...prev, ...serverUser }));
        setIsEditing(false);
        alert("Profile updated successfully!");
      } else {
        alert("Failed to update profile: " + (result?.error || result?.message || 'Unknown error'));
      }
    } else {
      // Enter edit mode
      setEditProfile({ ...profile });
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    setEditProfile({ ...profile });
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setEditProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditProfile(prev => ({ ...prev, profilePicture: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // AI Chat functions
  const handleSendMessage = async () => {
    if (inputMessage.trim() === "") return;
    const userMsg = { role: "user", content: inputMessage };
    const pendingInput = inputMessage;
    setMessages(prev => [...prev, userMsg]);
    setInputMessage("");
    setIsTyping(true);
    try {
      const token = localStorage.getItem('authToken');
      const history = [...messages, userMsg];
      const result = await aiAPI.chat(history, token);
      const replyContent = result?.content || result?.error || 'No response';
      setMessages(prev => [...prev, { role: 'assistant', content: replyContent }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${err.message}` }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Job Application functions
  const handleOpenApplicationModal = (job) => {
    setSelectedJob(job);
    setShowApplicationModal(true);
    setApplicationData({
      resume: "",
      coverLetter: ""
    });
  };

  const handleCloseApplicationModal = () => {
    setShowApplicationModal(false);
    setSelectedJob(null);
    setApplicationData({
      resume: "",
      coverLetter: ""
    });
  };

  const handleApplicationSubmit = async (e) => {
    e.preventDefault();
    setIsApplying(true);

    try {
      const result = await jobAPI.applyForJob(selectedJob._id, applicationData);
      
      if (result.success) {
        alert(`✅ Successfully applied for ${selectedJob.title}!\n\nYour application has been submitted and is pending review.`);
        handleCloseApplicationModal();
        // Reload jobs to update application status
        loadJobs();
      } else {
        alert(`❌ Application failed: ${result.error}`);
      }
    } catch (error) {
      alert(`❌ Error: ${error.message}`);
    } finally {
      setIsApplying(false);
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case "profile":
        return (
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">My Profile</h2>
              <div className="flex gap-2">
                {isEditing && (
                  <button
                    onClick={handleCancelEdit}
                    className="px-4 py-2 rounded-lg transition bg-gray-600 hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={handleEditToggle}
                  disabled={isSaving || (isEditing && !hasChanges())}
                  className={`px-4 py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed ${
                    isEditing
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {isSaving ? "Saving..." : (isEditing ? "Save Profile" : "Edit Profile")}
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Profile Picture */}
                <div className="flex flex-col items-center">
                <div className="relative">
                  <img
                    src={isEditing ? editProfile.profilePicture : profile.profilePicture}
                    alt="Profile"
                    className="w-40 h-40 rounded-full object-cover border-4 border-gray-700"
                  />
                  {isEditing && (
                    <label className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full cursor-pointer hover:bg-blue-700 transition">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </label>
                  )}
                </div>
                <p className="mt-4 text-gray-400 text-sm">
                  {isEditing ? "Click icon to change photo" : "Profile Picture"}
                </p>
              </div>

              {/* Profile Details */}
              <div className="md:col-span-2 space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Name {isEditing && <span className="text-blue-400">*</span>}
                  </label>
                  <input
                    type="text"
                    value={isEditing ? editProfile.name : profile.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    disabled={!isEditing}
                    className={`w-full p-3 bg-gray-700 border rounded-lg text-white transition ${
                      isEditing 
                        ? "border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                        : "border-gray-600 disabled:opacity-60"
                    }`}
                  />
                </div>

                {/* College */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    College {isEditing && <span className="text-blue-400">*</span>}
                  </label>
                  <input
                    type="text"
                    value={isEditing ? editProfile.college : profile.college}
                    onChange={(e) => handleInputChange("college", e.target.value)}
                    disabled={!isEditing}
                    className={`w-full p-3 bg-gray-700 border rounded-lg text-white transition ${
                      isEditing 
                        ? "border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                        : "border-gray-600 disabled:opacity-60"
                    }`}
                  />
                </div>

                {/* Department */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Department {isEditing && <span className="text-blue-400">*</span>}
                  </label>
                  <input
                    type="text"
                    value={isEditing ? editProfile.department : profile.department}
                    onChange={(e) => handleInputChange("department", e.target.value)}
                    disabled={!isEditing}
                    className={`w-full p-3 bg-gray-700 border rounded-lg text-white transition ${
                      isEditing 
                        ? "border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                        : "border-gray-600 disabled:opacity-60"
                    }`}
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Email {isEditing && <span className="text-blue-400">*</span>}
                  </label>
                  <input
                    type="email"
                    value={isEditing ? editProfile.email : profile.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    disabled={!isEditing}
                    className={`w-full p-3 bg-gray-700 border rounded-lg text-white transition ${
                      isEditing 
                        ? "border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                        : "border-gray-600 disabled:opacity-60"
                    }`}
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Phone Number {isEditing && <span className="text-blue-400">*</span>}
                  </label>
                  <input
                    type="tel"
                    value={isEditing ? editProfile.phone : profile.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    disabled={!isEditing}
                    className={`w-full p-3 bg-gray-700 border rounded-lg text-white transition ${
                      isEditing 
                        ? "border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                        : "border-gray-600 disabled:opacity-60"
                    }`}
                  />
                </div>
              </div>
            </div>
            )}
          </div>
        );

      case "ai-assistant":
        return (
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg h-full flex flex-col">
            <h2 className="text-2xl font-bold mb-4">AI Assistant</h2>
            <p className="text-gray-400 mb-6">Get help with your queries using our AI-powered assistant.</p>
            
            {/* Chat Messages */}
            <div className="bg-gray-700 p-4 rounded-lg flex-1 overflow-y-auto mb-4 space-y-4">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-lg ${
                      msg.role === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-600 text-white"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
              
              {/* Typing indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-600 text-white p-3 rounded-lg">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Input Area */}
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                className="flex-1 p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleSendMessage}
                disabled={inputMessage.trim() === ""}
                className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send
              </button>
            </div>
            
            {/* Quick Suggestions */}
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => setInputMessage("Tell me about resume generation")}
                className="text-sm bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded-full transition"
              >
                Resume Help
              </button>
              <button
                onClick={() => setInputMessage("Show me available jobs")}
                className="text-sm bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded-full transition"
              >
                Job Search
              </button>
              <button
                onClick={() => setInputMessage("How do I edit my profile?")}
                className="text-sm bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded-full transition"
              >
                Profile Help
              </button>
            </div>
          </div>
        );

      case "image-generation":
        return (
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Image Generation</h2>
            <p className="text-gray-400 mb-6">Generate images using AI based on your descriptions.</p>
            <div className="space-y-4">
              <textarea
                placeholder="Describe the image you want to generate..."
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white h-32"
              />
              <button className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg transition">
                Generate Image
              </button>
              <div className="bg-gray-700 p-8 rounded-lg text-center min-h-64 flex items-center justify-center">
                <p className="text-gray-400">Your generated image will appear here</p>
              </div>
            </div>
          </div>
        );

      case "resume-generation":
        // Use the unified, fully-featured ResumeBuilder component
        return <ResumeBuilder />;

      case "job-placement":
        return (
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-2xl font-bold">Job Placement</h2>
                <p className="text-gray-400 mt-1">Find and apply for jobs that match your profile.</p>
              </div>
              <button
                onClick={loadJobs}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                Refresh
              </button>
            </div>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="space-y-4">
              {jobs.length > 0 ? (
                jobs.map((job) => (
                  <div key={job._id} className="bg-gray-700 p-6 rounded-lg hover:bg-gray-600 transition">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold">{job.title}</h3>
                          <span className="bg-green-600 px-3 py-1 rounded-full text-xs font-semibold">
                            {job.jobType}
                          </span>
                        </div>
                        <p className="text-blue-400 font-semibold mb-2">{job.companyName}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-300 mb-3">
                          <span className="flex items-center gap-1">
                            📍 {job.location}
                          </span>
                          <span className="flex items-center gap-1">
                            💰 ${job.salaryMin?.toLocaleString()} - ${job.salaryMax?.toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1">
                            📊 {job.experienceLevel}
                          </span>
                          <span className="flex items-center gap-1">
                            📅 Posted {new Date(job.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleOpenApplicationModal(job)}
                        className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg transition font-semibold whitespace-nowrap"
                      >
                        Apply Now
                      </button>
                    </div>
                    
                    <p className="text-gray-300 mb-4">{job.description}</p>
                    
                    {job.requirements && job.requirements.length > 0 && (
                      <div className="mb-3">
                        <h4 className="font-semibold text-sm mb-2">Requirements:</h4>
                        <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                          {job.requirements.slice(0, 3).map((req, idx) => (
                            <li key={idx}>{req}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Required Skills:</h4>
                      <div className="flex flex-wrap gap-2">
                        {job.skills && job.skills.map((skill, idx) => (
                          <span key={idx} className="bg-blue-600 px-3 py-1 rounded-full text-sm">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-400 text-lg">No jobs available at the moment.</p>
                  <p className="text-gray-500 text-sm mt-2">Check back later for new opportunities!</p>
                </div>
              )}
            </div>
            )}
          </div>
        );

      case "leaderboard":
        return (
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Leadership Board</h2>
            <p className="text-gray-400 mb-6">Top performers and rankings.</p>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="space-y-3">
              {leaderboard.length > 0 ? (
                leaderboard.map((user, index) => {
                  const rank = index + 1;
                  let badge = "";
                  if (rank === 1) badge = "🥇";
                  else if (rank === 2) badge = "🥈";
                  else if (rank === 3) badge = "🥉";

                  return (
                    <div
                      key={user._id}
                      className="bg-gray-700 p-4 rounded-lg flex justify-between items-center hover:bg-gray-600 transition"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-2xl font-bold text-gray-500 w-8">{rank}</span>
                        <span className="text-xl">{badge}</span>
                        <div className="flex items-center gap-3">
                          <img 
                            src={user.profilePicture || "https://via.placeholder.com/40"} 
                            alt={user.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <span className="font-medium">{user.name}</span>
                        </div>
                      </div>
                      <span className="text-blue-400 font-semibold">{user.score} pts</span>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-400 text-center py-8">No users in leaderboard yet.</p>
              )}
            </div>
            )}
          </div>
        );

      case "resume-generation":
        return <ResumeBuilder />;

      case "image-generation":
        return (
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">🎨 Image Generation</h2>
            <p className="text-gray-400 mb-6">Generate AI-powered images for your projects.</p>
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">Coming Soon!</p>
              <p className="text-gray-500 text-sm mt-2">AI image generation feature will be available soon.</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 border-r border-gray-700 p-6">
        <h1 className="text-2xl font-bold mb-8">User Dashboard</h1>
        <nav className="space-y-2">
          <button
            onClick={() => setActiveSection("profile")}
            className={`w-full text-left px-4 py-3 rounded-lg transition ${
              activeSection === "profile"
                ? "bg-blue-600 text-white"
                : "bg-gray-700 hover:bg-gray-600"
            }`}
          >
            👤 Profile
          </button>
          <button
            onClick={() => setActiveSection("ai-assistant")}
            className={`w-full text-left px-4 py-3 rounded-lg transition ${
              activeSection === "ai-assistant"
                ? "bg-blue-600 text-white"
                : "bg_GRAY-700 hover:bg-gray-600"
            }`}
          >
            🤖 AI Assistant
          </button>
          <button
            onClick={() => setActiveSection("image-generation")}
            className={`w-full text-left px-4 py-3 rounded-lg transition ${
              activeSection === "image-generation"
                ? "bg-blue-600 text-white"
                : "bg-gray-700 hover:bg-gray-600"
            }`}
          >
            🎨 Image Generation
          </button>
          <button
            onClick={() => setActiveSection("resume-generation")}
            className={`w-full text-left px-4 py-3 rounded-lg transition ${
              activeSection === "resume-generation"
                ? "bg-blue-600 text-white"
                : "bg-gray-700 hover:bg-gray-600"
            }`}
          >
            📄 Resume Generation
          </button>
          <button
            onClick={() => setActiveSection("job-placement")}
            className={`w-full text-left px-4 py-3 rounded-lg transition ${
              activeSection === "job-placement"
                ? "bg-blue-600 text-white"
                : "bg-gray-700 hover:bg-gray-600"
            }`}
          >
            💼 Job Placement
          </button>
          <button
            onClick={() => setActiveSection("leaderboard")}
            className={`w-full text-left px-4 py-3 rounded-lg transition ${
              activeSection === "leaderboard"
                ? "bg-blue-600 text-white"
                : "bg-gray-700 hover:bg-gray-600"
            }`}
          >
            🏆 Leadership Board
          </button>
        </nav>
        <button
          onClick={handleLogout}
          className="w-full mt-8 bg-red-600 hover:bg-red-700 px-4 py-3 rounded-lg transition"
        >
          🚪 Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        {renderContent()}
      </main>

      {/* Job Application Modal */}
      {showApplicationModal && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Apply for Position</h3>
                  <p className="text-xl text-blue-400">{selectedJob.title}</p>
                  <p className="text-gray-400">{selectedJob.companyName}</p>
                </div>
                <button
                  onClick={handleCloseApplicationModal}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ✕
                </button>
              </div>

              {/* Job Summary */}
              <div className="bg-gray-700 p-4 rounded-lg mb-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Location</p>
                    <p className="font-semibold">{selectedJob.location}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Type</p>
                    <p className="font-semibold">{selectedJob.jobType}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Experience</p>
                    <p className="font-semibold">{selectedJob.experienceLevel}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Salary Range</p>
                    <p className="font-semibold">
                      ${selectedJob.salaryMin?.toLocaleString()} - ${selectedJob.salaryMax?.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Application Form */}
              <form onSubmit={handleApplicationSubmit} className="space-y-4">
                {/* Resume URL/Text */}
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Resume/CV Link or Text <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={applicationData.resume}
                    onChange={(e) => setApplicationData(prev => ({
                      ...prev,
                      resume: e.target.value
                    }))}
                    className="w-full bg-gray-700 px-4 py-3 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="4"
                    placeholder="Paste your resume link (Google Drive, Dropbox) or enter a brief summary of your qualifications..."
                    required
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Tip: Upload your resume to Google Drive and share the link, or paste key highlights
                  </p>
                </div>

                {/* Cover Letter */}
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Cover Letter (Optional)
                  </label>
                  <textarea
                    value={applicationData.coverLetter}
                    onChange={(e) => setApplicationData(prev => ({
                      ...prev,
                      coverLetter: e.target.value
                    }))}
                    className="w-full bg-gray-700 px-4 py-3 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="6"
                    placeholder="Why are you interested in this position? What makes you a great fit?"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    A well-written cover letter increases your chances!
                  </p>
                </div>

                {/* Required Skills Display */}
                {selectedJob.skills && selectedJob.skills.length > 0 && (
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <p className="text-sm font-semibold mb-2">Required Skills:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedJob.skills.map((skill, idx) => (
                        <span key={idx} className="bg-blue-600 px-3 py-1 rounded-full text-xs">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={isApplying || !applicationData.resume}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {isApplying ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting...
                      </span>
                    ) : (
                      "Submit Application"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseApplicationModal}
                    className="px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg font-semibold transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
