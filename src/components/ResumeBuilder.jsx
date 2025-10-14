import { useState, useEffect } from "react";
import { resumeAPI } from "../services/api";

export default function ResumeBuilder() {
  const [activeTab, setActiveTab] = useState("my-resumes");
  const [resumes, setResumes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResumeForm, setShowResumeForm] = useState(false);
  const [selectedResume, setSelectedResume] = useState(null);
  
  // Preview modal state
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewResume, setPreviewResume] = useState(null);


  const [formData, setFormData] = useState({
    fileName: "",
    fileUrl: "",
    fileType: "json",
    fileSize: 0,
    content: {
      personalInfo: {
        name: "",
        email: "",
        phone: "",
        location: "",
        linkedin: "",
        github: "",
        website: ""
      },
      summary: "",
      skills: {
        technical: [],
        soft: [],
        languages: [],
        tools: []
      }
    },
    isPrimary: false
  });

  // Normalize URL by ensuring it has a scheme; leave empty values as-is
  const normalizeUrl = (value) => {
    if (!value) return "";
    const v = String(value).trim();
    if (!v) return "";
    if (/^https?:\/\//i.test(v)) return v;
    return `https://${v}`;
  };

  useEffect(() => {
    console.log('🔄 ResumeBuilder mounted, loading data...');
    loadResumes();
  }, []);

  const loadResumes = async () => {
    setIsLoading(true);
    console.log('📄 Loading resumes...');
    const result = await resumeAPI.getAllResumes();
    console.log('📄 Resumes result:', result);
    if (result.success) {
      setResumes(result.data);
      console.log('✅ Loaded', result.data?.length || 0, 'resumes');
    } else {
      console.error('❌ Failed to load resumes:', result.error);
    }
    setIsLoading(false);
  };

  // Job matching feature removed

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePersonalInfoChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        personalInfo: {
          ...prev.content.personalInfo,
          [name]: value
        }
      }
    }));
  };

  const handleSkillsChange = (category, value) => {
    const skillsArray = value.split(',').map(s => s.trim()).filter(s => s);
    setFormData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        skills: {
          ...prev.content.skills,
          [category]: skillsArray
        }
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Sanitize URLs to avoid HTML5 URL validation issues
    const sanitized = {
      ...formData,
      content: {
        ...formData.content,
        personalInfo: {
          ...formData.content.personalInfo,
          linkedin: normalizeUrl(formData.content.personalInfo.linkedin || ""),
          github: normalizeUrl(formData.content.personalInfo.github || ""),
          website: normalizeUrl(formData.content.personalInfo.website || ""),
        },
      },
    };

    const result = selectedResume
      ? await resumeAPI.updateResume(selectedResume._id, sanitized)
      : await resumeAPI.createResume(sanitized);

    if (result.success) {
      alert(selectedResume ? 'Resume updated!' : 'Resume created!');
      setShowResumeForm(false);
      setSelectedResume(null);
      resetForm();
      loadResumes();
    } else {
      const details = result.details ? `\nDetails: ${JSON.stringify(result.details, null, 2)}` : '';
      alert('Error: ' + result.error + details);
    }
    setIsLoading(false);
  };

  // handleMatchWithJob removed

  const handleDeleteResume = async (resumeId) => {
    if (!confirm('Are you sure you want to delete this resume?')) return;

    const result = await resumeAPI.deleteResume(resumeId);
    if (result.success) {
      alert('Resume deleted!');
      loadResumes();
    } else {
      alert('Error: ' + result.error);
    }
  };

  // ===== Preview & Download (Print to PDF) =====
  const openPreview = (resume) => {
    setPreviewResume(resume);
    setShowPreviewModal(true);
  };

  const closePreview = () => {
    setShowPreviewModal(false);
    setPreviewResume(null);
  };

  const buildPrintableHTML = (resume) => {
    const info = resume.content?.personalInfo || {};
    const skills = resume.content?.skills || {};
    const summary = resume.content?.summary || '';
    const section = (title, body) => body ? `
      <div class="section">
        <div class="section-title">${title}</div>
        ${body}
      </div>` : '';
    const listChips = (arr) => Array.isArray(arr) && arr.length ?
      `<div class="chips">${arr.map(s => `<span class="chip">${s}</span>`).join('')}</div>` : '';

    const contactParts = [info.email, info.phone, info.location, info.linkedin, info.github, info.website]
      .filter(Boolean)
      .map(v => `<span>${v}</span>`)
      .join('<span class="sep">|</span>');

    const doc = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${resume.fileName || 'Resume'}</title>
  <style>
    @page { size: A4; margin: 18mm; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, 'Apple Color Emoji','Segoe UI Emoji'; color: #111827; }
    .container { max-width: 800px; margin: 0 auto; }
    .header { border-bottom: 3px solid #2563eb; padding-bottom: 8px; margin-bottom: 18px; }
    .name { font-size: 28px; font-weight: 800; color: #111827; }
    .contacts { color: #374151; font-size: 12px; margin-top: 6px; display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
    .contacts .sep { margin: 0 6px; color: #9ca3af; }
    .section { margin-bottom: 16px; }
    .section-title { font-weight: 700; color: #2563eb; text-transform: uppercase; letter-spacing: .06em; font-size: 12px; margin-bottom: 8px; }
    .summary { line-height: 1.5; color: #1f2937; font-size: 13px; }
    .chips { display: flex; flex-wrap: wrap; gap: 8px; }
    .chip { background: #e5e7eb; color: #111827; padding: 4px 10px; border-radius: 9999px; font-size: 12px; }
    .footer-note { color: #6b7280; font-size: 10px; text-align: right; margin-top: 10px; }
    @media print {
      .no-print { display: none !important; }
    }
  </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div class="name">${info.name || 'Your Name'}</div>
        <div class="contacts">${contactParts || ''}</div>
      </div>
      ${section('Professional Summary', summary ? `<div class="summary">${summary}</div>` : '')}
      ${section('Technical Skills', listChips(skills.technical))}
      ${section('Tools', listChips(skills.tools))}
      ${section('Soft Skills', listChips(skills.soft))}
      <div class="footer-note">Generated from Placify • ${new Date().toLocaleDateString()}</div>
    </div>
    <script>window.onload = () => { setTimeout(() => { window.print(); }, 150); };</script>
  </body>
</html>`;
    return doc;
  };

  const downloadPDF = (resume) => {
    try {
      const html = buildPrintableHTML(resume);
      const w = window.open('', '_blank');
      if (!w) {
        alert('Pop-up blocked. Please allow pop-ups to download PDF.');
        return;
      }
      w.document.open();
      w.document.write(html);
      w.document.close();
    } catch (e) {
      alert('Failed to open print dialog: ' + e.message);
    }
  };

  const resetForm = () => {
    setFormData({
      fileName: "",
      fileUrl: "",
      fileType: "json",
      fileSize: 0,
      content: {
        personalInfo: {
          name: "",
          email: "",
          phone: "",
          location: "",
          linkedin: "",
          github: "",
          website: ""
        },
        summary: "",
        skills: {
          technical: [],
          soft: [],
          languages: [],
          tools: []
        }
      },
      isPrimary: false
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Resume Builder</h2>
          <p className="text-gray-400 text-sm">Powered by Resume-Matcher AI</p>
        </div>
        <button
          onClick={() => {
            setShowResumeForm(true);
            setSelectedResume(null);
            resetForm();
          }}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Create Resume
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-700">
        <button
          onClick={() => {
            console.log('🔵 Switching to My Resumes tab');
            setActiveTab("my-resumes");
          }}
          className={`px-4 py-2 font-semibold transition border-b-2 ${
            activeTab === "my-resumes"
              ? "border-blue-500 text-blue-500"
              : "border-transparent text-gray-400 hover:text-white"
          }`}
        >
          My Resumes
        </button>
        {/* Match with Jobs tab removed */}
        <button
          onClick={() => {
            console.log('🔵 Switching to ATS Tips tab');
            setActiveTab("tips");
          }}
          className={`px-4 py-2 font-semibold transition border-b-2 ${
            activeTab === "tips"
              ? "border-blue-500 text-blue-500"
              : "border-transparent text-gray-400 hover:text-white"
          }`}
        >
          ATS Tips
        </button>
      </div>

      {/* Resume Form Modal */}
      {showResumeForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-gray-800 p-6 rounded-lg max-w-2xl w-full mx-4 my-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">
                {selectedResume ? 'Edit Resume' : 'Create New Resume'}
              </h3>
              <button
                onClick={() => {
                  setShowResumeForm(false);
                  setSelectedResume(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              {/* Basic Info */}
              <div>
                <label className="block text-sm font-semibold mb-2">Resume Name</label>
                <input
                  type="text"
                  name="fileName"
                  value={formData.fileName}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 px-4 py-2 rounded-lg"
                  placeholder="e.g., Software Engineer Resume 2025"
                  required
                />
              </div>

              {/* Personal Information */}
              <div className="bg-gray-700 p-4 rounded-lg space-y-3">
                <h4 className="font-semibold">Personal Information</h4>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    name="name"
                    value={formData.content.personalInfo.name}
                    onChange={handlePersonalInfoChange}
                    className="bg-gray-600 px-3 py-2 rounded"
                    placeholder="Full Name"
                  />
                  <input
                    type="email"
                    name="email"
                    value={formData.content.personalInfo.email}
                    onChange={handlePersonalInfoChange}
                    className="bg-gray-600 px-3 py-2 rounded"
                    placeholder="Email"
                  />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.content.personalInfo.phone}
                    onChange={handlePersonalInfoChange}
                    className="bg-gray-600 px-3 py-2 rounded"
                    placeholder="Phone"
                  />
                  <input
                    type="text"
                    name="location"
                    value={formData.content.personalInfo.location}
                    onChange={handlePersonalInfoChange}
                    className="bg-gray-600 px-3 py-2 rounded"
                    placeholder="Location"
                  />
                  <input
                    type="text"
                    inputMode="url"
                    name="linkedin"
                    value={formData.content.personalInfo.linkedin}
                    onChange={handlePersonalInfoChange}
                    onBlur={(e) => setFormData(prev => ({
                      ...prev,
                      content: {
                        ...prev.content,
                        personalInfo: {
                          ...prev.content.personalInfo,
                          linkedin: normalizeUrl(e.target.value)
                        }
                      }
                    }))}
                    className="bg-gray-600 px-3 py-2 rounded"
                    placeholder="LinkedIn URL (e.g., linkedin.com/in/username)"
                  />
                  <input
                    type="text"
                    inputMode="url"
                    name="github"
                    value={formData.content.personalInfo.github}
                    onChange={handlePersonalInfoChange}
                    onBlur={(e) => setFormData(prev => ({
                      ...prev,
                      content: {
                        ...prev.content,
                        personalInfo: {
                          ...prev.content.personalInfo,
                          github: normalizeUrl(e.target.value)
                        }
                      }
                    }))}
                    className="bg-gray-600 px-3 py-2 rounded"
                    placeholder="GitHub URL (e.g., github.com/username)"
                  />
                  <input
                    type="text"
                    inputMode="url"
                    name="website"
                    value={formData.content.personalInfo.website}
                    onChange={handlePersonalInfoChange}
                    onBlur={(e) => setFormData(prev => ({
                      ...prev,
                      content: {
                        ...prev.content,
                        personalInfo: {
                          ...prev.content.personalInfo,
                          website: normalizeUrl(e.target.value)
                        }
                      }
                    }))}
                    className="bg-gray-600 px-3 py-2 rounded"
                    placeholder="Personal Website (e.g., yoursite.com)"
                  />
                </div>
              </div>

              {/* Professional Summary */}
              <div>
                <label className="block text-sm font-semibold mb-2">Professional Summary</label>
                <textarea
                  name="summary"
                  value={formData.content.summary}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    content: { ...prev.content, summary: e.target.value }
                  }))}
                  className="w-full bg-gray-700 px-4 py-2 rounded-lg"
                  rows="4"
                  placeholder="Brief professional summary..."
                />
              </div>

              {/* Skills */}
              <div className="bg-gray-700 p-4 rounded-lg space-y-3">
                <h4 className="font-semibold">Skills (comma-separated)</h4>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={formData.content.skills.technical.join(', ')}
                    onChange={(e) => handleSkillsChange('technical', e.target.value)}
                    className="w-full bg-gray-600 px-3 py-2 rounded"
                    placeholder="Technical Skills: Python, JavaScript, React..."
                  />
                  <input
                    type="text"
                    value={formData.content.skills.tools.join(', ')}
                    onChange={(e) => handleSkillsChange('tools', e.target.value)}
                    className="w-full bg-gray-600 px-3 py-2 rounded"
                    placeholder="Tools: Git, Docker, AWS..."
                  />
                  <input
                    type="text"
                    value={formData.content.skills.soft.join(', ')}
                    onChange={(e) => handleSkillsChange('soft', e.target.value)}
                    className="w-full bg-gray-600 px-3 py-2 rounded"
                    placeholder="Soft Skills: Leadership, Communication..."
                  />
                </div>
              </div>

              {/* Set as Primary */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPrimary"
                  checked={formData.isPrimary}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    isPrimary: e.target.checked
                  }))}
                  className="w-4 h-4"
                />
                <label htmlFor="isPrimary" className="text-sm">
                  Set as primary resume
                </label>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg disabled:opacity-50"
                >
                  {isLoading ? 'Saving...' : selectedResume ? 'Update Resume' : 'Create Resume'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowResumeForm(false);
                    setSelectedResume(null);
                    resetForm();
                  }}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* My Resumes Tab */}
      {activeTab === "my-resumes" && (
        <div>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : resumes.length > 0 ? (
            <div className="grid gap-4">
              {resumes.map((resume) => (
                <div key={resume._id} className="bg-gray-800 p-6 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold">{resume.fileName}</h3>
                        {resume.isPrimary && (
                          <span className="bg-green-600 px-2 py-1 rounded text-xs">PRIMARY</span>
                        )}
                        <span className="text-gray-400 text-sm">v{resume.version}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                        <div>
                          <p className="text-gray-400">Skills</p>
                          <p>{resume.content.skills?.technical.length || 0} technical skills</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Last Updated</p>
                          <p>{new Date(resume.updatedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openPreview(resume)}
                        className="px-3 py-1 bg-gray-600 hover:bg-gray-500 rounded text-sm"
                      >
                        Preview
                      </button>
                      <button
                        onClick={() => downloadPDF(resume)}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm"
                      >
                        Download PDF
                      </button>
                      <button
                        onClick={() => {
                          setSelectedResume(resume);
                          setFormData(resume);
                          setShowResumeForm(true);
                        }}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteResume(resume._id)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-800 rounded-lg">
              <p className="text-gray-400 mb-4">No resumes yet</p>
              <button
                onClick={() => setShowResumeForm(true)}
                className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg"
              >
                Create Your First Resume
              </button>
            </div>
          )}
        </div>
      )}

      {/* Match with Jobs section removed */}

      {/* ATS Tips Tab */}
      {activeTab === "tips" && (
        <div className="space-y-6">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-4">🎯 ATS Optimization Tips</h3>
            <div className="space-y-4 text-sm">
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold mb-2">1. Use Standard Section Headings</h4>
                <p className="text-gray-300">
                  Use common headings like "Experience", "Education", "Skills" instead of creative alternatives.
                </p>
              </div>
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold mb-2">2. Include Relevant Keywords</h4>
                <p className="text-gray-300">
                  Mirror the language used in the job description. Use exact terms from the posting.
                </p>
              </div>
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold mb-2">3. Use Simple Formatting</h4>
                <p className="text-gray-300">
                  Avoid tables, text boxes, headers/footers. Stick to clean, simple layouts.
                </p>
              </div>
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold mb-2">4. Spell Out Acronyms</h4>
                <p className="text-gray-300">
                  Include both the acronym and full term (e.g., "Artificial Intelligence (AI)").
                </p>
              </div>
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold mb-2">5. Use Standard File Formats</h4>
                <p className="text-gray-300">
                  PDF or Word (.docx) are safest. Avoid images or scanned documents.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-900 bg-opacity-30 p-4 rounded-lg border border-blue-700">
            <h4 className="font-bold mb-2">🔗 Powered by Resume-Matcher</h4>
            <p className="text-sm text-gray-300">
              This feature uses algorithms inspired by the open-source{' '}
              <a
                href="https://github.com/srbhr/Resume-Matcher"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
              >
                Resume-Matcher project
              </a>
              {' '}to help optimize your resume for ATS systems.
            </p>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && previewResume && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 w-[90vw] h-[85vh] rounded-lg overflow-hidden border border-gray-700">
            <div className="flex items-center justify-between p-3 border-b border-gray-700 bg-gray-800">
              <div className="font-semibold">Preview: {previewResume.fileName}</div>
              <div className="flex gap-2">
                <button
                  onClick={() => downloadPDF(previewResume)}
                  className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm"
                >
                  Download PDF
                </button>
                <button
                  onClick={closePreview}
                  className="px-3 py-1 bg-gray-600 hover:bg-gray-500 rounded text-sm"
                >
                  Close
                </button>
              </div>
            </div>
            <iframe
              title="Resume Preview"
              className="w-full h-full bg-white"
              srcDoc={buildPrintableHTML(previewResume)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
