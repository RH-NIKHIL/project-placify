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

  const handleUpdateApplicationStatus = async (jobId, applicationId, newStatus) => {
    try {
      // For now, update locally - you can add API call later
      const updatedJobs = jobs.map(job => {
        if (job._id === jobId) {
          return {
            ...job,
            applications: job.applications.map(app => 
              app._id === applicationId ? { ...app, status: newStatus } : app
            )
          };
        }
        return job;
      });
      setJobs(updatedJobs);
      
      // Optional: Show success message
      console.log(`Application ${applicationId} status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating application status:", error);
      alert("Failed to update application status.");
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
                  <div className="flex items-center justify-between text-sm text-gray-400 pt-3 border-t border-gray-700">
                    <div className="flex gap-4">
                      <p>
                        <strong>Applications:</strong> {job.applications?.length || 0} 
                        {job.applications && job.applications.length > 0 && (
                          <span className="ml-2">
                            ({job.applications.filter(app => app.status === 'pending').length} pending)
                          </span>
                        )}
                      </p>
                      <p><strong>Posted:</strong> {new Date(job.createdAt).toLocaleDateString()}</p>
                    </div>
                    {job.applications && job.applications.length > 0 && (
                      <button
                        onClick={() => setActiveView('students')}
                        className="text-blue-400 hover:text-blue-300 text-sm font-semibold"
                      >
                        View Applications →
                      </button>
                    )}
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
    // Get all jobs with applications
    const jobsWithApplications = jobs.filter(job => job.applications && job.applications.length > 0);
    
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6">Job Applications</h2>
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <p className="text-gray-400 mb-4">Review applications from candidates</p>
          
          {jobsWithApplications.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">No applications received yet.</p>
              <p className="text-gray-500 text-sm mt-2">Applications will appear here once candidates apply to your job postings.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {jobsWithApplications.map((job) => (
                <div key={job._id} className="border border-gray-700 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-blue-400">{job.title}</h3>
                      <p className="text-gray-400 text-sm">
                        {job.applications.length} {job.applications.length === 1 ? 'Application' : 'Applications'}
                      </p>
                    </div>
                    <span className="bg-green-600 px-3 py-1 rounded-full text-xs font-semibold">
                      {job.jobType}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {job.applications.map((application) => (
                      <div key={application._id} className="bg-gray-700 p-4 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4 flex-1">
                            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-xl font-bold">
                              {application.user?.name ? application.user.name.charAt(0).toUpperCase() : '?'}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-semibold text-lg">
                                  {application.user?.name || 'Anonymous'}
                                </p>
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                  application.status === 'pending' ? 'bg-yellow-600' :
                                  application.status === 'reviewed' ? 'bg-blue-600' :
                                  application.status === 'shortlisted' ? 'bg-green-600' :
                                  application.status === 'rejected' ? 'bg-red-600' :
                                  'bg-purple-600'
                                }`}>
                                  {application.status.toUpperCase()}
                                </span>
                              </div>
                              <p className="text-sm text-gray-400 mb-2">
                                {application.user?.email || 'No email'}
                              </p>
                              <p className="text-xs text-gray-500">
                                Applied: {new Date(application.appliedAt).toLocaleString()}
                              </p>

                              {application.resume && (
                                <div className="mt-3 bg-gray-600 p-3 rounded">
                                  <p className="text-xs text-gray-400 mb-1">Resume/Qualifications:</p>
                                  <p className="text-sm whitespace-pre-wrap">{application.resume}</p>
                                </div>
                              )}

                              {application.coverLetter && (
                                <div className="mt-2 bg-gray-600 p-3 rounded">
                                  <p className="text-xs text-gray-400 mb-1">Cover Letter:</p>
                                  <p className="text-sm whitespace-pre-wrap">{application.coverLetter}</p>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col gap-2">
                            <select
                              value={application.status}
                              onChange={(e) => handleUpdateApplicationStatus(job._id, application._id, e.target.value)}
                              className="bg-gray-600 px-3 py-2 rounded text-sm"
                            >
                              <option value="pending">Pending</option>
                              <option value="reviewed">Reviewed</option>
                              <option value="shortlisted">Shortlisted</option>
                              <option value="rejected">Rejected</option>
                              <option value="accepted">Accepted</option>
                            </select>
                          </div>
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
