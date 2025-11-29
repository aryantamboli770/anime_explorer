# 🎌 Anime Explorer - Full Stack MERN Application

A modern full-stack web application for searching and exploring anime using the Jikan API. Features secure user authentication with JWT, encrypted user profiles using AES-256-GCM encryption, and personalized search history tracking.

## ✨ Features

- **🔐 Secure Authentication** - User registration and login with JWT stored in httpOnly cookies for enhanced security
- **🔍 Anime Search** - Real-time anime search powered by Jikan API (MyAnimeList) with beautiful card-based results
- **📝 Search History** - Automatically saves last 5 searches per user with quick access dropdown
- **🔒 Encrypted Profiles** - User profile data encrypted with AES-256-GCM encryption on the server and decrypted on the client
- **📱 Responsive Design** - Clean, modern UI that works seamlessly on desktop, tablet, and mobile devices
- **⚡ Real-time Updates** - Instant feedback with loading states and error handling

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript for type safety
- **Vite** for fast development and optimized builds
- **Axios** for HTTP requests with credentials support
- **Web Crypto API** for client-side AES-256-GCM decryption
- **Pure CSS** with gradient backgrounds and modern styling

### Backend
- **Node.js** with Express.js framework
- **MongoDB Atlas** for cloud database storage
- **Mongoose** ODM for elegant MongoDB object modeling
- **JWT (jsonwebtoken)** for stateless authentication
- **bcryptjs** for secure password hashing (10 salt rounds)
- **cookie-parser** for httpOnly cookie management
- **crypto (built-in)** for AES-256-GCM encryption

## 📋 Prerequisites

Before running this project, make sure you have:
- Node.js v18 or higher installed
- npm (comes with Node.js)
- MongoDB Atlas account (free tier works perfectly)
- Modern web browser with JavaScript enabled

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/aryantamboli770/anime_explorer.git
cd anime_explorer
```

### 2. Backend Setup

Navigate to backend directory:
```bash
cd backend
```

Install dependencies:
```bash
npm install
```

Create a `.env` file in the backend directory with the following variables:
```env
PORT=5000
MONGODB_URI=mongodb+srv://your_username:your_password@cluster0.xxxxx.mongodb.net/anime-explorer?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_make_it_long_and_random_12345678
ENCRYPT_KEY=32bytekeyhere1234567890abcd12
NODE_ENV=development
```

**Important Notes:**
- Replace `your_username` and `your_password` with your MongoDB Atlas credentials
- Replace `cluster0.xxxxx.mongodb.net` with your actual MongoDB cluster URL
- The `ENCRYPT_KEY` must be exactly 32 characters for AES-256 encryption
- Generate a strong random string for `JWT_SECRET`

Start the backend server:
```bash
npm run dev
```

You should see:
```
Server running on port 5000
MongoDB Atlas Connected Successfully
```

### 3. Frontend Setup

Open a new terminal and navigate to frontend directory:
```bash
cd frontend
```

Install dependencies:
```bash
npm install
```

Start the development server:
```bash
npm run dev
```

The application will open at `http://localhost:5173`

## 🎯 Usage Guide

### Registration
1. Open the application in your browser
2. Click on "Register" if you're a new user
3. Enter a valid email address
4. Create a password (minimum 6 characters)
5. Click "Register" button

### Login
1. Enter your registered email
2. Enter your password
3. Click "Login" button

### Search Anime
1. After logging in, use the search bar at the top
2. Type any anime name (e.g., "Naruto", "One Piece", "Attack on Titan")
3. Press Enter or click "Search" button
4. Browse through the grid of anime cards showing title, image, and rating

### View Anime Details
1. Click on any anime card from search results
2. A modal will appear showing:
   - Full title
   - Score/Rating
   - Number of episodes
   - Synopsis/Description
3. Click "Close" or outside the modal to dismiss

### Access Search History
1. Click on the search input field
2. Your last 5 searches will appear in a dropdown
3. Click any previous search to quickly re-run it

### View Encrypted Profile
1. Click the "Profile" button in the top right
2. Your profile modal will show:
   - Email address
   - Account creation date
   - Encryption security notice
3. This data is encrypted on the server and decrypted in your browser

### Logout
1. Click the "Logout" button in the top right
2. You'll be redirected to the login page
3. Your session will be cleared

## 📡 API Endpoints

### Authentication Routes
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user with email and password | ❌ |
| POST | `/api/auth/login` | Login user and receive JWT cookie | ❌ |
| POST | `/api/auth/logout` | Logout user and clear JWT cookie | ❌ |

### User Routes
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/user/profile` | Get encrypted user profile data | ✅ |

### Search History Routes
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/search/history` | Save a search query with timestamp | ✅ |
| GET | `/api/search/history` | Get last 5 searches for logged-in user | ✅ |

### External API
The application uses the Jikan API v4 for anime data:
- Endpoint: `https://api.jikan.moe/v4/anime?q={query}&limit=12`
- No authentication required
- Rate limit: Reasonable usage allowed

## 🔐 Security Features

### Password Security
- Passwords are hashed using **bcrypt** with 10 salt rounds before storage
- Plain text passwords are never stored in the database
- Password comparison is done securely using bcrypt's compare function

### JWT Authentication
- JWT tokens are stored in **httpOnly cookies** (not accessible via JavaScript)
- Tokens expire after 7 days
- CORS configured to only allow requests from the frontend domain
- Secure flag enabled in production environment

### Profile Encryption (AES-256-GCM)
The application implements end-to-end encryption for user profile data:

**Server-side Encryption:**
1. User profile data is fetched from MongoDB
2. Data is serialized to JSON
3. A random 12-byte Initialization Vector (IV) is generated
4. Data is encrypted using AES-256-GCM with the secret key from environment
5. Authentication tag is extracted for integrity verification
6. Encrypted data is sent as `iv:tag:ciphertext` format

**Client-side Decryption:**
1. Frontend receives encrypted string from server
2. String is split into IV, tag, and ciphertext components
3. Web Crypto API imports the encryption key
4. Data is decrypted using AES-GCM algorithm
5. Decrypted JSON is parsed and displayed to user

**Why This Matters:**
Even if someone intercepts the network traffic, they cannot read the profile data without the encryption key. The key is only shared after successful authentication.

### Additional Security Measures
- MongoDB connection uses SSL/TLS encryption
- Environment variables used for all sensitive data
- CORS restricts API access to authorized origins
- Input validation on all user inputs
- Error messages don't leak sensitive information

## 📁 Project Structure
```
anime_explorer/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection configuration
│   ├── middleware/
│   │   └── auth.js               # JWT authentication middleware
│   ├── models/
│   │   ├── User.js               # User schema with password hashing
│   │   └── SearchHistory.js      # Search history schema
│   ├── routes/
│   │   ├── auth.js               # Authentication routes (register/login/logout)
│   │   ├── user.js               # User profile routes with encryption
│   │   └── search.js             # Search history routes
│   ├── .env                      # Environment variables (not in git)
│   ├── .gitignore               # Git ignore file
│   ├── package.json             # Backend dependencies
│   └── server.js                # Express server entry point
├── frontend/
│   ├── src/
│   │   ├── App.tsx              # Main React component (single-page app)
│   │   ├── main.tsx             # React entry point
│   │   └── index.css            # Global styles
│   ├── package.json             # Frontend dependencies
│   └── vite.config.ts           # Vite configuration
├── .gitignore                   # Root git ignore
└── README.md                    # This file
```

## 🎨 Key Components

### Backend Components

**db.js** - Handles MongoDB Atlas connection with error handling and connection pooling.

**auth.js (middleware)** - Validates JWT tokens from cookies, extracts user ID, and protects routes.

**User.js (model)** - Mongoose schema with pre-save hook for automatic password hashing and comparePassword method.

**SearchHistory.js (model)** - Stores user search queries with timestamps and user references.

**auth.js (routes)** - Handles user registration, login, and logout with JWT cookie management.

**user.js (routes)** - Fetches user profile and encrypts it before sending to client.

**search.js (routes)** - Saves and retrieves user search history with sorting and limiting.

**server.js** - Express app setup with CORS, middleware, routes, and server initialization.

### Frontend Components

**App.tsx** - Single-page React application containing:
- Authentication forms (login/register)
- Anime search interface with Jikan API integration
- Search history dropdown with click handlers
- Anime results grid with hover effects
- Anime detail modal with synopsis
- Encrypted profile modal with decryption logic
- Logout functionality

## 🐛 Troubleshooting

### Backend won't start
- **Issue:** `MongoDB Connection Error`
  - **Solution:** Check your `MONGODB_URI` in `.env` file. Ensure password has no special characters that need URL encoding.
  
- **Issue:** `Port 5000 already in use`
  - **Solution:** Change `PORT` in `.env` to another port like 5001, and update frontend API baseURL.

- **Issue:** `Cannot find module`
  - **Solution:** Run `npm install` in the backend directory to install all dependencies.

### Frontend won't start
- **Issue:** `Failed to fetch`
  - **Solution:** Make sure backend server is running on port 5000 before starting frontend.

- **Issue:** Vite errors during build
  - **Solution:** Delete `node_modules` folder and `package-lock.json`, then run `npm install` again.

### Authentication issues
- **Issue:** Login/Register returns 400 error
  - **Solution:** Check backend terminal for specific error. Ensure MongoDB is connected and User model is loaded correctly.

- **Issue:** "Invalid credentials" on correct password
  - **Solution:** Password might have been saved before bcrypt middleware was fixed. Delete user from MongoDB and re-register.

### Encryption errors
- **Issue:** Profile shows "Failed to load profile"
  - **Solution:** Verify `ENCRYPT_KEY` in `.env` is exactly 32 characters. Check browser console for specific decryption errors.

### Database issues
- **Issue:** Mongoose validation errors
  - **Solution:** Check that email format is valid and password is at least 6 characters.

- **Issue:** Duplicate key error
  - **Solution:** Email already exists in database. Try logging in instead or use a different email.

## 🔧 Development Tips

### Hot Reload
- Backend: nodemon watches for file changes and auto-restarts
- Frontend: Vite provides instant Hot Module Replacement (HMR)

### Debugging
- Backend: Add `console.log()` statements and check terminal output
- Frontend: Use browser DevTools Console and Network tabs
- MongoDB: Use MongoDB Compass to view database contents

### Testing Authentication
Use tools like Postman or Thunder Client to test API endpoints:
```json
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

### Clear Cookies
If authentication seems stuck, clear cookies:
- Chrome: DevTools > Application > Cookies > localhost > Delete all
- Firefox: DevTools > Storage > Cookies > localhost > Delete all

## 📝 Environment Variables Reference

### Backend (.env)
```env
PORT=5000                          # Server port number
MONGODB_URI=mongodb+srv://...      # MongoDB Atlas connection string
JWT_SECRET=random_secret_key       # Secret for JWT signing (make it long and random)
ENCRYPT_KEY=32characterkey12345    # Must be exactly 32 characters for AES-256
NODE_ENV=development               # Environment (development/production)
```

## 🚢 Deployment

### Backend Deployment (Render/Railway/Heroku)
1. Push code to GitHub
2. Connect repository to hosting platform
3. Set environment variables in platform dashboard
4. Deploy from main branch

### Frontend Deployment (Vercel/Netlify)
1. Update API baseURL in App.tsx to your backend URL
2. Build the project: `npm run build`
3. Deploy the `dist` folder
4. Configure CORS on backend to allow your frontend domain

### MongoDB Atlas
Already cloud-hosted, no additional deployment needed. Just ensure IP whitelist includes `0.0.0.0/0` for production or add your deployment server IP.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License. You are free to use, modify, and distribute this software. See LICENSE file for details.

## 👨‍💻 Author

**Aryan Tamboli**
- GitHub: [@aryantamboli770](https://github.com/aryantamboli770)
- Project Repository: [anime_explorer](https://github.com/aryantamboli770/anime_explorer)

## 🙏 Acknowledgments

- **Jikan API** - Free RESTful API for MyAnimeList data
- **MyAnimeList** - Source of all anime information and images
- **MongoDB Atlas** - Cloud database platform
- **Vite** - Next generation frontend tooling
- **React** - JavaScript library for building user interfaces
- **Express.js** - Fast, minimalist web framework for Node.js

## 📸 Screenshots

### Login Screen
Clean and modern authentication interface with gradient background.

### Anime Search Results
Grid layout displaying anime cards with images, titles, and ratings.

### Anime Details Modal
Detailed view showing synopsis, episodes, and score information.

### Encrypted Profile
Secure profile display with encryption notice and user information.

### Search History Dropdown
Quick access to recent searches for better user experience.

## 🔮 Future Enhancements

Potential features for future versions:
- Add favorites/watchlist functionality
- Implement pagination for search results
- Add anime recommendations based on user preferences
- Include user reviews and ratings
- Add social features (follow users, share lists)
- Implement advanced search filters (genre, year, studio)
- Add dark mode toggle
- Include anime streaming links
- Add email verification for registration
- Implement password reset functionality

## 💡 Learn More

- [React Documentation](https://react.dev/)
- [Express.js Guide](https://expressjs.com/)
- [MongoDB Atlas Tutorial](https://www.mongodb.com/docs/atlas/)
- [Jikan API Documentation](https://docs.api.jikan.moe/)
- [JWT Introduction](https://jwt.io/introduction)
- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)

---

**Built with ❤️ for anime lovers everywhere**
