import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jobAPI } from "../../services/api";

export default function CompanyDashboard() {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState("jobs");
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showJobForm, setShowJobForm] = useState(false);
  
  // Check if logged in as company
  const userRole = localStorage.getItem('userRole');
  const isCompany = userRole === 'company' || userRole === 'admin';
  
  // Job form state
  const [newJob, setNewJob] = useState({
    title: "",
    description: "",
    location: "",
    jobType: "Full-time",
    experienceLevel: "Entry Level",
    salaryMin: "",
    salaryMax: "",
    skills: "",
    requirements: "",
    responsibilities: ""
  });

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setIsLoading(true);
      const response = await jobAPI.getAllJobs();
      if (response.success) {
        setJobs(response.data);
      }
    } catch (error) {
      console.error("Error loading jobs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    navigate("/signin");
  };

  const handleInputChange = (field, value) => {
    setNewJob(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    try {
      // Convert comma-separated strings to arrays
      const jobData = {
        ...newJob,
        salaryMin: parseInt(newJob.salaryMin),
        salaryMax: parseInt(newJob.salaryMax),
        skills: newJob.skills.split(',').map(s => s.trim()),
        requirements: newJob.requirements.split(',').map(s => s.trim()),
        responsibilities: newJob.responsibilities.split(',').map(s => s.trim())
      };

      const response = await jobAPI.createJob(jobData);
      if (response.success) {
        alert("Job posted successfully!");
        setShowJobForm(false);
        setNewJob({
          title: "",
          description: "",
          location: "",
          jobType: "Full-time",
          experienceLevel: "Entry Level",
          salaryMin: "",
          salaryMax: "",
          skills: "",
          requirements: "",
          responsibilities: ""
        });
        loadJobs();
      } else {
        alert(response.error || "Failed to create job. Please try again.");
      }
    } catch (error) {
      console.error("Error creating job:", error);
      alert("Failed to create job. Please try again.");
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (window.confirm("Are you sure you want to delete this job?")) {
      try {
        const response = await jobAPI.deleteJob(jobId);
        if (response.success) {
          alert("Job deleted successfully!");
          loadJobs();
        } else {
          alert(response.error || "Failed to delete job. Please try again.");
        }
      } catch (error) {
        console.error("Error deleting job:", error);
        alert("Failed to delete job. Please try again.");
      }
    }
  };

  const renderJobManagement = () => {
    return (
      <div>
        {/* Header with Create Job Button */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Job Management</h2>
          <button
            onClick={() => setShowJobForm(!showJobForm)}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            {showJobForm ? "Cancel" : "Post New Job"}
          </button>
        </div>

        {/* Job Creation Form */}
        {showJobForm && (
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-6">
            <h3 className="text-xl font-bold mb-4">Create New Job Posting</h3>
            <form onSubmit={handleCreateJob} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Job Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={newJob.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    required
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Senior Software Engineer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Location <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={newJob.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    required
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Remote / New York, NY"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Job Type <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={newJob.jobType}
                    onChange={(e) => handleInputChange("jobType", e.target.value)}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option>Full-time</option>
                    <option>Part-time</option>
                    <option>Contract</option>
                    <option>Internship</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Experience Level <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={newJob.experienceLevel}
                    onChange={(e) => handleInputChange("experienceLevel", e.target.value)}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option>Entry Level</option>
                    <option>Mid Level</option>
                    <option>Senior Level</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Minimum Salary ($) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    value={newJob.salaryMin}
                    onChange={(e) => handleInputChange("salaryMin", e.target.value)}
                    required
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 80000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Maximum Salary ($) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    value={newJob.salaryMax}
                    onChange={(e) => handleInputChange("salaryMax", e.target.value)}
                    required
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 120000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Job Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={newJob.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  required
                  rows={4}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe the role and what you're looking for..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Required Skills (comma-separated) <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={newJob.skills}
                  onChange={(e) => handleInputChange("skills", e.target.value)}
                  required
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., JavaScript, React, Node.js, MongoDB"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Requirements (comma-separated) <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={newJob.requirements}
                  onChange={(e) => handleInputChange("requirements", e.target.value)}
                  required
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 3+ years experience, Bachelor's degree, Strong problem-solving skills"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Responsibilities (comma-separated) <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={newJob.responsibilities}
                  onChange={(e) => handleInputChange("responsibilities", e.target.value)}
                  required
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Develop new features, Code review, Mentor junior developers"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg transition font-semibold"
              >
                Post Job
              </button>
            </form>
          </div>
        )}

        {/* Job Listings */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.length === 0 ? (
              <div className="bg-gray-800 p-8 rounded-lg text-center">
                <p className="text-gray-400">No jobs posted yet. Create your first job posting!</p>
              </div>
            ) : (
              jobs.map((job) => (
                <div key={job._id} className="bg-gray-800 p-6 rounded-lg shadow-lg">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold mb-2">{job.title}</h3>
                      <div className="flex gap-4 text-sm text-gray-400">
                        <span>📍 {job.location}</span>
                        <span>💼 {job.jobType}</span>
                        <span>📊 {job.experienceLevel}</span>
                        <span>💰 ${job.salaryMin?.toLocaleString()} - ${job.salaryMax?.toLocaleString()}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteJob(job._id)}
                      className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition flex items-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Delete
                    </button>
                  </div>
                  <p className="text-gray-300 mb-4">{job.description}</p>
                  <div className="mb-3">
                    <h4 className="font-semibold mb-2">Required Skills:</h4>
                    <div className="flex flex-wrap gap-2">
                      {job.skills?.map((skill, idx) => (
                        <span key={idx} className="bg-blue-600 px-3 py-1 rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-sm text-gray-400">
                    <p><strong>Applicants:</strong> {job.applicants?.length || 0} students registered</p>
                    <p><strong>Posted:</strong> {new Date(job.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    );
  };

  const renderRegisteredStudents = () => {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6">Registered Students</h2>
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <p className="text-gray-400 mb-4">View students who have applied to your job postings</p>
          
          {jobs.filter(job => job.applicants && job.applicants.length > 0).length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">No student applications yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {jobs.filter(job => job.applicants && job.applicants.length > 0).map((job) => (
                <div key={job._id} className="border-b border-gray-700 pb-4 last:border-0">
                  <h3 className="text-lg font-bold mb-3">{job.title}</h3>
                  <div className="space-y-2">
                    {job.applicants.map((applicant, idx) => (
                      <div key={idx} className="bg-gray-700 p-4 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <img
                            src={applicant.profilePicture || "https://via.placeholder.com/50"}
                            alt={applicant.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div>
                            <p className="font-semibold">{applicant.name}</p>
                            <p className="text-sm text-gray-400">{applicant.email}</p>
                            <p className="text-sm text-gray-400">{applicant.college} - {applicant.department}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-400">Applied: {new Date(applicant.appliedAt).toLocaleDateString()}</p>
                          <button className="mt-2 bg-blue-600 hover:bg-blue-700 px-4 py-1 rounded text-sm transition">
                            View Profile
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Company Dashboard</h1>
            <p className="text-sm text-gray-400 mt-1">
              Logged in as: {localStorage.getItem('userRole')} | ID: {localStorage.getItem('userId')?.slice(-6)}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="flex gap-4 px-6">
          <button
            onClick={() => setActiveView("jobs")}
            className={`px-6 py-4 font-semibold transition border-b-2 ${
              activeView === "jobs"
                ? "border-blue-500 text-blue-500"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            Job Management
          </button>
          <button
            onClick={() => setActiveView("students")}
            className={`px-6 py-4 font-semibold transition border-b-2 ${
              activeView === "students"
                ? "border-blue-500 text-blue-500"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            Registered Students
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="p-6">
        {!isCompany && (
          <div className="bg-red-600 border border-red-700 text-white px-6 py-4 rounded-lg mb-6 flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="font-bold">Access Restricted</p>
              <p className="text-sm">You are logged in as '{userRole}' but this is the Company Dashboard. You won't be able to post or delete jobs.</p>
              <button 
                onClick={() => {
                  authAPI.logout();
                  navigate('/signin');
                }}
                className="mt-2 bg-white text-red-600 px-4 py-2 rounded font-semibold hover:bg-gray-100"
              >
                Log out and sign in as Company
              </button>
            </div>
          </div>
        )}
        {activeView === "jobs" && renderJobManagement()}
        {activeView === "students" && renderRegisteredStudents()}
      </main>
    </div>
  );
}
