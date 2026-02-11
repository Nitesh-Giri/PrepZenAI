# PrepZen AI

[Here](https://prepzenai.vercel.app/) you go! 

An AI-powered interview preparation platform that generates role-specific questions, provides detailed explanations, and helps candidates master technical interview concepts with personalized learning sessions.

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Environment Setup](#environment-setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Usage Guide](#usage-guide)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## 🎯 Overview

**PrepZen AI** is a full-stack web application designed to help software engineers prepare for technical interviews. It leverages **Google's Gemini API** to generate AI-powered interview questions tailored to specific roles, experience levels, and topics. Users can explore questions, view detailed explanations, organize their learning with pinned questions and notes, and track their progress across multiple interview preparation sessions.

## ✨ Key Features

### 🤖 AI-Powered Question Generation
- Generate role-specific interview questions (Frontend Developer, Backend Engineer, Full Stack, etc.)
- Customize based on years of experience and focus topics
- Get 10 questions per session, expandable with "Load More"
- Fallback questions when API quota is exceeded

### 📚 Detailed Concept Explanations
- Click "Expand Concept" on any question to get a comprehensive explanation
- Includes definition, approach, trade-offs, and language-specific code examples
- Responsive drawer panel for focused learning
- Fallback explanations generated when Gemini quota is exhausted

### 📌 Personal Organization
- Pin/unpin important questions for quick access
- Add custom notes to questions
- Sort questions by pinned status and creation date
- Persistent storage in MongoDB

### 💾 Session Management
- Create multiple interview preparation sessions
- Each session stores role, experience, focus topics, and generated questions
- View session details with last updated timestamp
- Delete entire sessions with confirmation

### 🎨 Modern UI/UX
- Clean, gradient-based design with Tailwind CSS
- Smooth animations using Framer Motion
- Toast notifications for user feedback
- Responsive design for desktop and mobile
- Profile management with image upload

### 🔐 Authentication
- Secure JWT-based authentication
- User registration with profile pictures
- Login/Logout functionality
- Protected API routes with middleware

## 🛠 Tech Stack

### Backend
- **Framework**: Express.js (v5.1.0)
- **Runtime**: Node.js
- **Database**: MongoDB with Mongoose (v8.18.1)
- **AI API**: Google Gemini API (`@google/genai` v1.20.0)
- **Authentication**: JWT (jsonwebtoken v9.0.2)
- **Password Hashing**: Bcrypt/BcryptJS
- **File Upload**: Multer (v2.0.2)
- **CORS**: Enabled for cross-origin requests

### Frontend
- **Framework**: React (v19.1.1) with Vite (v7.1.6)
- **Routing**: React Router (v7.9.1)
- **State Management**: React Context API
- **HTTP Client**: Axios (v1.12.2)
- **Animations**: Framer Motion (v12.23.16)
- **Styling**: Tailwind CSS (v3.4.17)
- **Notifications**: React Hot Toast (v2.6.0)
- **UI Components**: React Icons (v5.5.0)
- **Markdown**: React Markdown (v10.1.0) with Syntax Highlighter (v15.6.6)
- **Date Formatting**: Moment.js (v2.30.1)

## 📁 Project Structure

```
PrepZenAI/
├── backend/                          # Backend server
│   ├── config/
│   │   └── db.js                     # MongoDB connection
│   ├── controllers/
│   │   ├── aiController.js           # Gemini API integration & fallback logic
│   │   ├── authController.js         # User registration, login, profile
│   │   ├── questionController.js     # Question operations (pin, note)
│   │   └── sessionController.js      # Session CRUD operations
│   ├── middlewares/
│   │   ├── authMiddleware.js         # JWT verification
│   │   └── uploadMiddleware.js       # Multer file upload config
│   ├── models/
│   │   ├── userModel.js              # User schema
│   │   ├── sessionModel.js           # Session schema
│   │   └── questionModel.js          # Question schema
│   ├── routes/
│   │   ├── authRoute.js              # Auth endpoints
│   │   ├── sessionRoute.js           # Session endpoints
│   │   └── questionRoute.js          # Question endpoints
│   ├── utils/
│   │   └── prompts.js                # Gemini API prompts
│   ├── uploads/                      # Uploaded profile images
│   ├── index.js                      # Server entry point
│   ├── package.json
│   ├── vercel.json                   # Vercel deployment config
│   └── .env                          # Environment variables (not in repo)
│
├── frontend/                         # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Cards/                # Question, Summary, Profile cards
│   │   │   ├── Inputs/               # Input fields, File upload
│   │   │   ├── Layouts/              # Dashboard layout, Navbar
│   │   │   ├── Loader/               # Skeleton & Spinner loaders
│   │   │   ├── Modal.jsx             # Reusable modal component
│   │   │   ├── Drawer.jsx            # Side drawer for explanations
│   │   │   └── DeleteAlertContent.jsx# Delete confirmation
│   │   ├── context/
│   │   │   └── userContext.jsx       # Global user state (auth, profile)
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx       # Homepage with features
│   │   │   ├── Auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   └── Signup.jsx
│   │   │   ├── Home/
│   │   │   │   ├── Dashboard.jsx     # Sessions overview
│   │   │   │   └── CreateSessionForm.jsx
│   │   │   └── PrepZen/
│   │   │       ├── PrepZen.jsx       # Main interview interface
│   │   │       └── components/
│   │   │           ├── RoleInfoHeader.jsx
│   │   │           └── AIResponsePreview.jsx
│   │   ├── utils/
│   │   │   ├── apiPaths.js           # API endpoint constants
│   │   │   ├── axiosInstance.js      # Axios with auth interceptor
│   │   │   ├── helper.js             # Email validation
│   │   │   ├── data.js               # Feature data
│   │   │   └── uploadImage.js        # Image upload utility
│   │   ├── assets/                   # Images & icons
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── postcss.config.js
│
└── README.md                         # This file
```

## 🚀 Installation

### Prerequisites
- Node.js (v14+)
- npm or yarn
- MongoDB Atlas account (or local MongoDB)
- Google Gemini API key

### Clone the Repository
```bash
git clone https://github.com/yourusername/PrepZenAI.git
cd PrepZenAI
```

### Backend Setup
```bash
cd backend
npm install
```

### Frontend Setup
```bash
cd frontend
npm install
```

## 🔑 Environment Setup

### Backend (.env)
Create a `.env` file in the `backend/` directory:

```env
# Server
PORT=5005

# Database
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/PrepZenAI?retryWrites=true&w=majority

# JWT
JWT_SECRET=your_jwt_secret_key_here

# Gemini API
GEMINI_API_KEY=your_gemini_api_key_here
```

### Frontend (optional .env)
Create a `.env` file in the `frontend/` directory:

```env
# API Base URL (defaults to http://localhost:5005 if not set)
VITE_API_URL=http://localhost:5005
```

## ▶️ Running the Application

### Start Backend Server
```bash
cd backend
npm run dev
```
The backend will run at `http://localhost:5005`

### Start Frontend Development Server
```bash
cd frontend
npm run dev
```
The frontend will run at `http://localhost:5173`

### Build Frontend for Production
```bash
cd frontend
npm run build
```

## 📡 API Documentation

### Authentication Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login user and get JWT |
| GET | `/api/auth/profile` | Get logged-in user profile |
| POST | `/api/auth/upload-image` | Upload profile picture |

### Session Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/sessions/create` | Create a new session with AI questions |
| GET | `/api/sessions/my-sessions` | Get all user sessions |
| GET | `/api/sessions/:id` | Get session details with questions |
| DELETE | `/api/sessions/:id` | Delete a session |

### Question Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/questions/add` | Add more questions to session |
| POST | `/api/questions/:id/pin` | Toggle pin status on question |
| DELETE | `/api/questions/:id/note` | Update question note |

### AI Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/generate-questions` | Generate interview questions |
| POST | `/api/ai/generate-explanation` | Generate concept explanation |

**Note**: All AI endpoints require JWT authentication and may return fallback content if Gemini API quota is exceeded.

## 💡 Usage Guide

### For Users

#### 1. Sign Up / Login
- Click "Login/Signup" on the landing page
- Register with email, password, and optional profile picture
- Or login with existing credentials

#### 2. Create a Session
- Click "Add New" button on Dashboard
- Fill in:
  - **Target Role**: e.g., "Frontend Developer", "Software Engineer"
  - **Years of Experience**: e.g., "2", "5+", "1"
  - **Topics to Focus On**: e.g., "React, JavaScript, CSS"
  - **Brief Description**: e.g., "Preparing for Google interviews"
- Click "Create Session" — AI will generate 10 tailored questions

#### 3. Explore Questions
- View all generated questions in the main area
- Click "Expand Concept" to see a detailed explanation in the side panel
- Questions auto-scroll with explanations visible on the right

#### 4. Organize Your Learning
- **Pin Important Questions**: Click the pin icon to mark favorites
- **Add Notes**: Each question can have personal notes
- **Load More**: Generate 10 additional questions by clicking "Load More" at the bottom

#### 5. Manage Sessions
- View all sessions on Dashboard with role, topics, and question count
- Delete a session with the delete button (confirmation required)

### For Developers

#### Understanding the AI Flow
1. **Question Generation**:
   - User submits role, experience, topics
   - Frontend calls `/api/ai/generate-questions` with Gemini prompt
   - Backend parses Gemini's JSON response into question array
   - If Gemini quota is exceeded (429 error), fallback generator creates varied questions

2. **Explanation Generation**:
   - User clicks "Expand Concept" on a question
   - Frontend calls `/api/ai/generate-explanation` with the question text
   - Backend parses JSON response with title and explanation
   - Explanation is rendered in a side drawer with syntax highlighting for code blocks

3. **Fallback Mechanism**:
   - When Gemini API quota is exhausted, a heuristic-based fallback generator activates
   - Fallback creates unique questions/explanations using templates and language detection
   - Seamless user experience without service interruption

#### Extending the App
- **Add New Topics**: Modify prompt templates in `backend/utils/prompts.js`
- **Customize Models**: Edit schemas in `backend/models/`
- **Add Features**: Create new routes in `backend/routes/` and controllers in `backend/controllers/`
- **Styling**: Update Tailwind classes or create new component styles in `frontend/src/`

## 🐛 Troubleshooting

### Common Issues

#### 1. "GEMINI_API_KEY is not configured"
- **Problem**: Backend returns 500 error with this message
- **Solution**: Ensure `GEMINI_API_KEY` is set in `backend/.env`
- Get a free key at: https://ai.google.dev/

#### 2. "Cannot GET /api/sessions/my-sessions"
- **Problem**: 404 error when fetching sessions
- **Solution**: 
  - Check backend is running on port 5005
  - Verify `VITE_API_URL` in frontend is set to `http://localhost:8008`
  - Ensure JWT token is valid and sent in Authorization header

#### 3. "MongoDB Connection Error"
- **Problem**: Backend fails to start
- **Solution**: 
  - Verify `MONGO_URI` in `backend/.env` is correct
  - Ensure MongoDB Atlas cluster is active and IP whitelist includes your machine
  - Test URI in MongoDB Compass

#### 4. Quota Exceeded on Gemini
- **Problem**: "You exceeded your current quota" error
- **Solution**: 
  - Free tier has limited daily/monthly requests
  - Upgrade your Google Cloud billing account for higher limits
  - App will use fallback questions automatically during quota periods

#### 5. CORS Errors
- **Problem**: Frontend cannot reach backend API
- **Solution**: 
  - Backend has CORS enabled for all origins
  - Verify both frontend and backend are running
  - Check browser console for exact error message
  - Clear browser cache/cookies

#### 6. Images Not Uploading
- **Problem**: Profile picture upload fails
- **Solution**: 
  - Ensure file is < 5MB and is a valid image format (jpg, png, gif)
  - Check `backend/uploads/` directory has write permissions
  - Verify multer middleware is properly configured in `backend/middlewares/uploadMiddleware.js`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m "Add your feature"`
4. Push to branch: `git push origin feature/your-feature`
5. Open a Pull Request


## 👨‍💻 Author

Created by **Nitesh Giri** — Check out more projects on GitHub!

## 🔗 Resources

- **Google Gemini API**: https://ai.google.dev/
- **React Documentation**: https://react.dev/
- **Express.js**: https://expressjs.com/
- **MongoDB**: https://docs.mongodb.com/
- **Tailwind CSS**: https://tailwindcss.com/

## 📞 Support

For issues, feature requests, or questions:
- Open an issue on GitHub
- Check existing documentation
- Review error messages in browser/server console

---

**Happy Coding! 🚀 Ace your interviews with PrepZen AI!**
