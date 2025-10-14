# 🎯 Resume-Matcher Integration

## Overview

This project integrates resume building and job matching functionality inspired by the open-source [Resume-Matcher](https://github.com/srbhr/Resume-Matcher) project.

## Features Implemented

### ✅ Resume Builder
- Create and manage multiple resumes
- Structured resume format with:
  - Personal Information
  - Professional Summary
  - Skills (Technical, Tools, Soft Skills)
  - Experience
  - Education
  - Projects
  - Certifications
- Set primary resume
- Version control for resume updates

### ✅ Job Matching Algorithm
- Keyword-based matching between resume and job descriptions
- Match score calculation (percentage)
- Identified matched keywords
- Identified missing keywords
- AI-powered suggestions for resume improvement

### ✅ ATS Optimization Tips
- Best practices for ATS-friendly resumes
- Formatting guidelines
- Keyword optimization strategies

## Architecture

### Backend

#### Models
- **Resume Model** (`backend/models/Resume.js`)
  - Stores resume content in structured format
  - Tracks matches with jobs
  - Supports multiple resumes per user
  - Version tracking

#### API Routes
- **Resume Routes** (`backend/routes/resumes.js`)
  - `GET /api/resumes` - Get all user's resumes
  - `POST /api/resumes` - Create new resume
  - `GET /api/resumes/:id` - Get specific resume
  - `PUT /api/resumes/:id` - Update resume
  - `DELETE /api/resumes/:id` - Soft delete resume
  - `POST /api/resumes/:id/match-job/:jobId` - Match resume with job
  - `GET /api/resumes/:id/matches` - Get all matched jobs

### Frontend

#### Components
- **ResumeBuilder** (`src/components/ResumeBuilder.jsx`)
  - Resume creation and editing interface
  - Job matching interface
  - ATS tips display
  - Match results visualization

#### API Integration
- **Resume API** (`src/services/api.js`)
  - Complete CRUD operations for resumes
  - Job matching functionality
  - TypeScript-ready interface

## Usage

### For Users

1. **Create a Resume**
   - Navigate to User Dashboard
   - Click "📄 Resume Generation"
   - Click "Create Resume"
   - Fill in your information
   - Save

2. **Match with Jobs**
   - Go to "Match with Jobs" tab
   - Select a job posting
   - Choose your resume
   - View match score and suggestions

3. **Optimize Your Resume**
   - Review ATS tips
   - Add missing keywords
   - Update skills based on suggestions

### For Developers

#### Add Resume Matching to Existing Job
```javascript
import { resumeAPI } from './services/api';

const matchResult = await resumeAPI.matchResumeWithJob(resumeId, jobId);
console.log(`Match Score: ${matchResult.data.matchScore}%`);
console.log('Suggestions:', matchResult.data.suggestions);
```

#### Create Resume Programmatically
```javascript
const resumeData = {
  fileName: "Software Engineer Resume",
  fileType: "pdf",
  fileSize: 0,
  fileUrl: "",
  content: {
    personalInfo: {
      name: "John Doe",
      email: "john@example.com",
      phone: "+1234567890"
    },
    summary: "Experienced software engineer...",
    skills: {
      technical: ["JavaScript", "React", "Node.js"],
      tools: ["Git", "Docker", "AWS"]
    }
  },
  isPrimary: true
};

const result = await resumeAPI.createResume(resumeData);
```

## Matching Algorithm

The current implementation uses a basic keyword matching algorithm:

1. **Extract Skills**: Get all technical skills and tools from resume
2. **Compare with Job**: Match against required skills in job posting
3. **Calculate Score**: (Matched Keywords / Total Required Keywords) × 100
4. **Generate Suggestions**:
   - Score < 50%: Major improvements needed
   - Score 50-75%: Good match, minor improvements
   - Score > 75%: Excellent match, optimize

### Future Enhancement: Full Resume-Matcher Integration

To integrate the full Resume-Matcher AI capabilities:

```bash
# Clone Resume-Matcher
git clone https://github.com/srbhr/Resume-Matcher.git

# Install dependencies
cd Resume-Matcher
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Start Resume-Matcher API
python -m apps.backend.main

# Update API endpoint in your code
const RESUME_MATCHER_API = 'http://localhost:8000';
```

Then modify `backend/routes/resumes.js` to call the Resume-Matcher API instead of the basic algorithm.

## Database Schema

```javascript
Resume {
  _id: ObjectId,
  userId: ObjectId (ref: User),
  fileName: String,
  fileUrl: String,
  fileType: String (pdf/doc/docx),
  fileSize: Number,
  content: {
    personalInfo: {
      name, email, phone, location,
      linkedin, github, website
    },
    summary: String,
    experience: [{ company, position, dates, description }],
    education: [{ institution, degree, field, dates }],
    skills: {
      technical: [String],
      soft: [String],
      languages: [String],
      tools: [String]
    },
    projects: [{ name, description, technologies }],
    certifications: [{ name, issuer, date }]
  },
  atsScore: Number,
  matchedJobs: [{
    jobId: ObjectId,
    matchScore: Number,
    matchedKeywords: [String],
    missingKeywords: [String],
    suggestions: [String],
    matchedAt: Date
  }],
  isPrimary: Boolean,
  isActive: Boolean,
  version: Number,
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints

### Resume Management

#### Create Resume
```http
POST /api/resumes
Authorization: Bearer <token>
Content-Type: application/json

{
  "fileName": "My Resume 2025",
  "content": {
    "personalInfo": { ... },
    "summary": "...",
    "skills": { ... }
  },
  "isPrimary": true
}
```

#### Get All Resumes
```http
GET /api/resumes
Authorization: Bearer <token>
```

#### Match Resume with Job
```http
POST /api/resumes/:resumeId/match-job/:jobId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "matchScore": 75,
  "matchedKeywords": ["JavaScript", "React", "Node.js"],
  "missingKeywords": ["TypeScript", "GraphQL"],
  "suggestions": [
    "Consider adding: TypeScript, GraphQL",
    "Highlight achievements that align with job description"
  ],
  "job": {
    "title": "Senior Developer",
    "company": "Tech Corp",
    "location": "Remote"
  }
}
```

## Environment Variables

No additional environment variables needed. Uses existing MongoDB and JWT configuration.

## Testing

### Test Resume Creation
```bash
curl -X POST http://localhost:5000/api/resumes \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fileName": "Test Resume",
    "content": {
      "personalInfo": {"name": "Test User", "email": "test@test.com"},
      "skills": {"technical": ["Python", "JavaScript"]}
    }
  }'
```

### Test Job Matching
```bash
curl -X POST http://localhost:5000/api/resumes/RESUME_ID/match-job/JOB_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Roadmap

### Phase 1: ✅ Basic Resume Builder (Current)
- Create/Edit/Delete resumes
- Structured data format
- Basic keyword matching

### Phase 2: 🚧 Enhanced Matching (In Progress)
- Integrate full Resume-Matcher AI
- Advanced NLP for semantic matching
- Industry-specific optimizations

### Phase 3: 📅 Planned
- PDF upload and parsing
- Resume templates
- Visual editor (WYSIWYG)
- Export to multiple formats
- Cover letter generation
- Interview preparation suggestions

## Contributing

To contribute to the Resume-Matcher integration:

1. Check the [Resume-Matcher repository](https://github.com/srbhr/Resume-Matcher)
2. Review their API documentation
3. Update the matching algorithm in `backend/routes/resumes.js`
4. Add tests for new features
5. Submit pull request

## Credits

- Resume matching algorithms inspired by [Resume-Matcher](https://github.com/srbhr/Resume-Matcher) by [@srbhr](https://github.com/srbhr)
- ATS optimization tips from industry best practices
- Open source community contributions

## License

This integration follows the Apache-2.0 license of the Resume-Matcher project.

## Support

For issues related to:
- **Resume Builder UI**: Open issue in this repository
- **Matching Algorithm**: Check [Resume-Matcher repo](https://github.com/srbhr/Resume-Matcher)
- **Backend API**: Contact project maintainers

## Links

- 🌐 [Resume-Matcher Website](https://resumematcher.fyi/)
- 💬 [Resume-Matcher Discord](https://dsc.gg/resume-matcher)
- 📖 [Resume-Matcher Setup Guide](https://github.com/srbhr/Resume-Matcher/blob/main/SETUP.md)
- 🐙 [Resume-Matcher GitHub](https://github.com/srbhr/Resume-Matcher)

---

**Last Updated:** October 14, 2025
**Version:** 1.0.0
**Status:** ✅ Basic Implementation Complete
