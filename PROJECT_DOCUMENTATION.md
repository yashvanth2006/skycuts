# SkyCuts - Video Delivery Platform

## Project Overview

SkyCuts is a premium video editing and delivery platform that connects video editors with clients. The platform allows editors to manage projects, receive raw assets, deliver edited videos via HLS streaming, and collaborate with clients through real-time chat and timestamped comments.

**Key Features:**
- Project management with status tracking
- HLS video streaming for deliverable review
- Real-time chat via Socket.io
- Timestamped video comments
- Bulk client creation via CSV
- Bulk project operations (status updates, archiving)
- Email notifications
- Stripe payment integration
- PWA support with offline capabilities
- Custom cursor (opt-in)
- Dark/Light theme
- Rate limiting for API protection
- Error boundary for graceful error handling

---

## Tech Stack

### Backend (Server)
- **Runtime:** Node.js with ES Modules
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (JSON Web Tokens)
- **Real-time:** Socket.io
- **Video Processing:** FFmpeg (via fluent-ffmpeg)
- **Cloud Storage:** AWS S3
- **Email:** Nodemailer
- **File Upload:** Multer
- **Password Hashing:** bcryptjs
- **Rate Limiting:** Custom in-memory implementation

### Frontend (Client)
- **Framework:** React 19
- **Build Tool:** Vite
- **Routing:** React Router DOM v7
- **State Management:** React Context API
- **UI Library:** Framer Motion (animations)
- **Icons:** Lucide React
- **Video Player:** HLS.js
- **HTTP Client:** Axios
- **Real-time:** Socket.io Client
- **3D Graphics:** React Three Fiber, Drei
- **Styling:** TailwindCSS v4
- **Form Validation:** Zod
- **PWA:** Service Worker with offline support

---

## Project Structure

```
skycuts/
├── server/                          # Backend API
│   ├── config/
│   │   └── db.js                   # MongoDB connection
│   ├── controllers/                # Route handlers
│   │   ├── authController.js       # Login, register, password reset, bulk clients
│   │   ├── projectController.js   # CRUD, bulk operations, analytics
│   │   ├── messageController.js    # Chat messages
│   │   ├── commentController.js    # Video comments
│   │   ├── deliverableController.js # Video upload, HLS transcoding
│   │   ├── notificationController.js # Notifications
│   │   └── stripeController.js     # Payment processing
│   ├── middleware/
│   │   ├── auth.js                 # JWT authentication, role-based access
│   │   └── rateLimiter.js          # Rate limiting middleware
│   ├── models/                     # Mongoose schemas
│   │   ├── User.js                 # User model with password hashing
│   │   ├── Project.js              # Project model with archive support
│   │   ├── Message.js              # Chat messages
│   │   ├── Comment.js              # Video comments
│   │   ├── Notification.js         # User notifications
│   │   └── VideoDeliverable.js     # Video deliverables with S3 keys
│   ├── routes/                     # API routes
│   │   ├── authRoutes.js           # Authentication endpoints
│   │   ├── projectRoutes.js        # Project management endpoints
│   │   ├── messageRoutes.js        # Chat endpoints
│   │   ├── commentRoutes.js        # Comment endpoints
│   │   ├── deliverableRoutes.js    # Video upload endpoints
│   │   ├── notificationRoutes.js   # Notification endpoints
│   │   └── stripeRoutes.js         # Payment endpoints
│   ├── utils/                      # Utility functions
│   │   ├── generateToken.js        # JWT token generation
│   │   ├── csvParser.js            # CSV parsing for bulk client creation
│   │   ├── emailHelper.js          # Email sending functions
│   │   ├── s3Helper.js             # AWS S3 operations
│   │   └── ffmpegHelper.js         # Video transcoding to HLS
│   ├── uploads/                    # Temporary file storage
│   │   ├── raw/                    # Uploaded raw videos
│   │   └── hls/                    # Transcoded HLS segments
│   ├── index.js                    # Server entry point with Socket.io
│   └── package.json
├── client/                         # Frontend React App
│   ├── public/
│   │   ├── manifest.json           # PWA manifest
│   │   ├── sw.js                   # Service worker for offline support
│   │   └── index.html
│   ├── src/
│   │   ├── api/
│   │   │   └── axiosInstance.js    # Axios instance with auth interceptor
│   │   ├── components/             # Reusable components
│   │   │   ├── BulkClientUpload.jsx # CSV client upload modal
│   │   │   ├── ChatPanel.jsx       # Real-time chat panel
│   │   │   ├── CommentSidebar.jsx  # Video comments sidebar
│   │   │   ├── CustomCursor.jsx    # Custom cursor component
│   │   │   ├── ErrorBoundary.jsx   # Error boundary component
│   │   │   ├── Modal.jsx           # Reusable modal
│   │   │   ├── Navbar.jsx          # Navigation bar
│   │   │   ├── NotificationCenter.jsx # Notification bell
│   │   │   ├── OnboardingTour.jsx  # Onboarding tutorial
│   │   │   ├── ProjectCard.jsx     # Project card component
│   │   │   ├── SkeletonCard.jsx    # Loading skeleton
│   │   │   ├── StatusBadge.jsx     # Status badge component
│   │   │   ├── ThemeToggle.jsx     # Theme switcher with cursor toggle
│   │   │   ├── VideoPlayer.jsx     # HLS video player
│   │   │   └── three/              # 3D components
│   │   │       ├── AmbientBackground.jsx
│   │   │       ├── DaVinciNodeTree.jsx
│   │   │       └── Processing3DPlaceholder.jsx
│   │   |   context/                # React Context providers
│   │   │   ├── AuthContext.jsx     # Authentication state
│   │   │   └── ThemeContext.jsx    # Theme & custom cursor state
│   │   ├── pages/                  # Page components
│   │   │   ├── LoginPage.jsx       # Login page
│   │   │   ├── ResetPasswordPage.jsx # Password reset page
│   │   │   ├── admin/              # Admin/Editor pages
│   │   │   │   ├── AdminDashboard.jsx # Admin dashboard
│   │   │   │   └── AdminProjectPage.jsx # Project detail page
│   │   │   ├── client/             # Client pages
│   │   │   │   ├── ClientDashboard.jsx # Client dashboard
│   │   │   │   └── ClientProjectPage.jsx # Client project view
│   │   │   └── public/             # Public pages
│   │   │       └── EditorProfile.jsx # Public editor profile
│   │   ├── utils/
│   │   │   └── validation.js       # Zod validation schemas
│   │   ├── App.jsx                 # Main app with routes
│   │   ├── main.jsx                # Entry point
│   │   └── index.css               # Global styles
│   ├── vite.config.js
│   └── package.json
└── .env files (not in git)
```

---

## Database Models

### User Model (`server/models/User.js`)

```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed with bcrypt),
  role: Enum ['admin', 'client'] (default: 'client'),
  onboardingCompleted: Boolean (default: false),
  resetPasswordToken: String,
  resetPasswordExpiry: Date,
  timestamps: true
}
```

**Methods:**
- `matchPassword(enteredPassword)` - Compares entered password with hashed password

**Pre-save hook:** Automatically hashes password before saving

### Project Model (`server/models/Project.js`)

```javascript
{
  title: String (required),
  description: String (default: ''),
  client: ObjectId (ref: 'User'),
  status: Enum ['pending', 'awaiting_assets', 'in_progress', 'in_review', 'paid', 'declined'] (default: 'pending'),
  requesterName: String (for pending requests),
  requesterEmail: String (for pending requests),
  assetLink: String,
  rawAssets: [{
    url: String (required),
    label: String (default: 'Raw Footage'),
    submittedAt: Date (default: Date.now)
  }],
  price: Number (required, default: 0),
  stripeSessionId: String,
  isArchived: Boolean (default: false),
  archivedAt: Date,
  timestamps: true
}
```

### Message Model (`server/models/Message.js`)

```javascript
{
  project: ObjectId (ref: 'Project', required),
  sender: ObjectId (ref: 'User', required),
  text: String (required),
  timestamps: true
}
```

**Index:** `{ project: 1, createdAt: 1 }`

### Comment Model (`server/models/Comment.js`)

```javascript
{
  project: ObjectId (ref: 'Project', required),
  author: ObjectId (ref: 'User', required),
  timestamp: Number (required, seconds into video),
  text: String (required),
  timestamps: true
}
```

**Index:** `{ project: 1, timestamp: 1 }`

### Notification Model (`server/models/Notification.js`)

```javascript
{
  recipient: ObjectId (ref: 'User', required),
  type: Enum ['project_status', 'new_deliverable', 'new_comment', 'payment_received', 'project_accepted'],
  title: String (required),
  message: String (required),
  project: ObjectId (ref: 'Project'),
  link: String,
  read: Boolean (default: false),
  emailSent: Boolean (default: false),
  timestamps: true
}
```

**Index:** `{ recipient: 1, read: 1, createdAt: -1 }`

### VideoDeliverable Model (`server/models/VideoDeliverable.js`)

```javascript
{
  project: ObjectId (ref: 'Project', required, unique),
  s3OriginalKey: String (required),
  hlsPlaylistKey: String (required),
  hlsPlaylistUrl: String (required),
  durationSeconds: Number (default: 0),
  timestamps: true
}
```

---

## API Routes

### Authentication Routes (`/api/auth`)

- `POST /login` - User login (rate limited: 5 per 15 min)
- `POST /register` - User registration (rate limited: 10 per hour)
- `POST /seed-editor` - Create admin editor account
- `POST /forgot-password` - Request password reset (rate limited: 5 per 15 min)
- `POST /reset-password/:token` - Reset password with token (rate limited: 5 per 15 min)
- `POST /complete-onboarding` - Mark onboarding complete (protected)
- `POST /bulk-create-clients` - Bulk create clients from CSV (protected, rate limited: 3 per hour)

### Project Routes (`/api/projects`)

- `POST /request` - Create public project request (rate limited: 10 per hour)
- `GET /` - Get all projects (protected, scoped by role)
- `POST /` - Create new project (protected, admin only)
- `GET /:id` - Get single project (protected, scoped)
- `POST /:id/assets` - Submit raw asset URLs (protected, client only)
- `PATCH /:id/status` - Update project status (protected, admin only)
- `PATCH /:id/archive` - Archive project (protected, admin only)
- `PATCH /:id/restore` - Restore archived project (protected, admin only)
- `GET /clients` - Get all client users (protected, admin only)
- `GET /archived` - Get archived projects (protected, admin only)
- `GET /analytics` - Get project analytics (protected, admin only)
- `PATCH /bulk/status` - Bulk update project status (protected, admin only)
- `PATCH /bulk/archive` - Bulk archive projects (protected, admin only)

### Message Routes (`/api/messages`)

- `GET /:projectId` - Get messages for project (protected, scoped)

### Comment Routes (`/api/comments`)

- `GET /:projectId` - Get comments for project (protected, scoped)
- `POST /:projectId` - Add comment to project (protected, scoped)
- `DELETE /:commentId` - Delete comment (protected, author or admin)

### Deliverable Routes (`/api/deliverables`)

- `POST /:projectId` - Upload deliverable video (protected, admin only, multipart/form-data)
- `GET /:projectId` - Get deliverable for project (protected, scoped)
- `GET /:projectId/download` - Get download URL (protected, payment gate)

### Notification Routes (`/api/notifications`)

- `GET /` - Get user notifications (protected)
- `GET /unread-count` - Get unread count (protected)
- `PATCH /:id/read` - Mark notification as read (protected)
- `PATCH /read-all` - Mark all as read (protected)

---

## Middleware

### Authentication Middleware (`server/middleware/auth.js`)

**`protect(req, res, next)`**
- Verifies JWT token from Authorization header
- Attaches user to `req.user` (without password)
- Returns 401 if token missing or invalid

**`adminOnly(req, res, next)`**
- Checks if `req.user.role === 'admin'`
- Returns 403 if not admin

### Rate Limiting Middleware (`server/middleware/rateLimiter.js`)

**Pre-configured limiters:**
- `strictLimiter` - 5 requests per 15 minutes (login, password reset)
- `moderateLimiter` - 10 requests per hour (registrations, project requests)
- `bulkLimiter` - 3 requests per hour (bulk operations)
- `generalLimiter` - 100 requests per 15 minutes

**Features:**
- In-memory IP-based tracking
- Automatic cleanup every 5 minutes
- Returns 429 with retry time when limit exceeded

---

## Utility Functions

### Token Generation (`server/utils/generateToken.js`)

```javascript
generateToken(userId) // Returns JWT signed with 30d expiration
```

### CSV Parser (`server/utils/csvParser.js`)

```javascript
parseCSV(csvString) // Parses CSV string to array of objects
validateClientData(clients) // Validates client data, returns { valid, invalid, errors }
```

**Expected CSV format:**
```csv
name,email,password
John Doe,john@example.com,password123
Jane Smith,jane@example.com,password456
```

### Email Helper (`server/utils/emailHelper.js`)

```javascript
sendWelcomeEmail(email, name, tempPassword) // Welcome email for new clients
sendPasswordResetEmail(email, name, resetUrl) // Password reset email
sendNotificationEmail(email, name, title, message, link) // General notification
```

### S3 Helper (`server/utils/s3Helper.js`)

```javascript
uploadFileToS3(filePath, s3Key, contentType) // Upload file to S3
generatePresignedUrl(s3Key, expiresIn) // Generate temporary download URL (default 2 hours)
getHlsPublicUrl(s3Key) // Get public HLS URL
```

---

## Frontend Components

### Context Providers

**AuthContext (`src/context/AuthContext.jsx`)**
- Manages user authentication state
- Stores user data and token in localStorage
- Provides `login`, `logout`, `user`, `token`, `loading`

**ThemeContext (`src/context/ThemeContext.jsx`)**
- Manages theme (dark/light) with localStorage persistence
- Manages custom cursor preference (opt-in)
- Provides `theme`, `toggleTheme`, `customCursor`, `toggleCustomCursor`

### Key Components

**Navbar (`src/components/Navbar.jsx`)**
- Navigation bar with logo, theme toggle, notifications, user info
- Logout functionality
- Back button support

**VideoPlayer (`src/components/VideoPlayer.jsx`)**
- HLS video player with custom controls
- Play/pause, volume, seek, fullscreen
- Progress bar with buffered indicator
- Loading and error states
- External seek support (for comment clicks)

**ChatPanel (`src/components/ChatPanel.jsx`)**
- Real-time chat via Socket.io
- Message history fetch
- Unread message counter
- Auto-scroll to bottom
- FAB trigger with slide-out panel

**CommentSidebar (`src/components/CommentSidebar.jsx`)**
- Timestamped video comments
- Click to seek video to timestamp
- Add/delete comments
- Real-time updates

**NotificationCenter (`src/components/NotificationCenter.jsx`)**
- Notification bell with unread count
- Dropdown with notification list
- Mark as read functionality

**BulkClientUpload (`src/components/BulkClientUpload.jsx`)**
- CSV file upload with drag-and-drop
- Validation and error display
- Bulk client creation API integration

**ErrorBoundary (`src/components/ErrorBoundary.jsx`)**
- Catches React component errors
- Displays user-friendly error UI
- "Try Again" and "Go Home" buttons
- Shows error details in development

**CustomCursor (`src/components/CustomCursor.jsx`)**
- Custom cursor with animation
- Outer ring and inner dot
- Hover state detection
- Only renders when enabled in preferences

### Validation Schemas (`src/utils/validation.js`)

**Zod schemas for:**
- Login (`loginSchema`)
- Register (`registerSchema`)
- Forgot password (`forgotPasswordSchema`)
- Reset password (`resetPasswordSchema`)
- Create project (`createProjectSchema`)
- Project request (`projectRequestSchema`)
- Update status (`updateStatusSchema`)
- Bulk operations (`bulkUpdateStatusSchema`, `bulkArchiveSchema`)
- Bulk client creation (`bulkClientSchema`)
- Client row (`clientRowSchema`)
- Onboarding (`onboardingSchema`)

**Helper function:**
```javascript
validateForm(schema, data) // Returns { success, data } or { success, errors }
```

---

## Pages

### LoginPage
- Login form with email/password
- Redirects to appropriate dashboard based on role
- Error handling

### ResetPasswordPage
- Password reset form with token
- Validation and API integration

### AdminDashboard (`src/pages/admin/AdminDashboard.jsx`)
- Project list with search and filters
- Bulk selection and operations
- Create project modal
- Bulk client import
- Archive/restore toggle
- Project analytics display

### AdminProjectPage (`src/pages/admin/AdminProjectPage.jsx`)
- Project detail view for admin
- Status management
- Asset submission tracking
- Deliverable upload
- Chat and comments integration

### ClientDashboard (`src/pages/client/ClientDashboard.jsx`)
- Client's project list
- Onboarding tour integration
- Project request form
- Asset submission

### ClientProjectPage (`src/pages/client/ClientProjectPage.jsx`)
- Client's project detail view
- Video player for deliverables
- Chat and comments
- Payment integration

### EditorProfile (`src/pages/public/EditorProfile.jsx`)
- Public editor portfolio
- Project showcase
- Project request form (public)
- Custom cursor support (when enabled)

---

## Environment Variables

### Server (.env)
```
MONGO_URI=mongodb://localhost:27017/skycuts
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=http://localhost:5173

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=noreply@skycuts.io

# AWS S3 Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_BUCKET_NAME=skycuts-videos

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

### Client (.env)
```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

---

## Setup Instructions

### Server Setup

1. Navigate to server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file with environment variables (see above)

4. Start development server:
```bash
npm run dev
```

5. For production:
```bash
npm start
```

### Client Setup

1. Navigate to client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file with environment variables (see above)

4. Start development server:
```bash
npm run dev
```

5. Build for production:
```bash
npm run build
```

6. Preview production build:
```bash
npm run preview
```

---

## Key Features Implementation Details

### Rate Limiting
- In-memory IP-based tracking using Maps
- Configurable time windows and request limits
- Automatic cleanup every 5 minutes
- Applied to sensitive endpoints (login, password reset, bulk operations)

### Bulk Operations
- **Bulk Client Creation:** CSV parsing with validation, duplicate email checking
- **Bulk Status Update:** MongoDB `updateMany` for efficient updates
- **Bulk Archive:** Soft delete with timestamp tracking

### Video Processing Pipeline
1. Client uploads MP4 via multipart/form-data (max 5GB)
2. Server transcodes to HLS using FFmpeg
3. Original MP4 uploaded to S3
4. HLS segments uploaded to S3
5. Public HLS URL generated for streaming
6. Local temporary files cleaned up

### Real-time Chat
- Socket.io for WebSocket connections
- Project-scoped rooms
- Message persistence in MongoDB
- Real-time message broadcasting
- Unread message counter

### Timestamped Comments
- Comments linked to video timestamps
- Click comment to seek video
- Real-time notifications on new comments
- Multi-user collaboration support

### PWA Support
- Web app manifest for installability
- Service worker for offline caching
- Cache-first strategy for static assets
- Network fallback for dynamic content
- Automatic cache cleanup on updates

### Custom Cursor
- Opt-in via user preference (localStorage)
- React state for position and hover detection
- Framer Motion for smooth animation
- Hover state changes for interactive elements
- Disabled by default to avoid UX issues

### Error Handling
- React Error Boundary wraps entire app
- Catches component errors gracefully
- User-friendly error UI with recovery options
- Error details shown in development mode

---

## Security Considerations

### Current Implementation
- JWT authentication with 30-day expiration
- Password hashing with bcrypt (salt rounds: 10)
- Role-based access control (admin/client)
- Rate limiting on sensitive endpoints
- Multi-tenancy (clients can only access their data)
- Payment gate for video downloads

### Known Limitations
- In-memory rate limiting (resets on server restart)
- No input validation middleware (manual validation)
- Email tokens stored in DB without auto-cleanup
- No security headers (helmet.js not implemented)
- No CSRF protection
- File upload validation is basic
- No input sanitization against XSS

### Recommended Improvements
- Implement Redis for distributed rate limiting
- Add helmet.js for security headers
- Implement input validation middleware (Joi/Zod)
- Add CSRF protection
- Enhance file upload validation
- Add input sanitization
- Implement refresh token rotation
- Add API versioning
- Implement structured logging
- Add monitoring and error tracking (Sentry)

---

## API Response Formats

### Success Response
```json
{
  "data": { ... },
  "message": "Success message"
}
```

### Error Response
```json
{
  "message": "Error message"
}
```

### Validation Error Response
```json
{
  "message": "Validation failed",
  "errors": {
    "field": "Error message"
  }
}
```

### Rate Limit Error Response
```json
{
  "message": "Too many requests, please try again later",
  "retryAfter": "300 seconds"
}
```

---

## Project Status Flow

```
pending → awaiting_assets → in_progress → in_review → paid
                                            ↓
                                        declined
```

**Status Descriptions:**
- `pending`: Project request submitted (not yet accepted)
- `awaiting_assets`: Project accepted, waiting for client to submit raw assets
- `in_progress`: Editor is working on the project
- `in_review`: Deliverable uploaded, client reviewing
- `paid`: Payment received, project complete
- `declined`: Project declined by editor

---

## Notification Types

- `project_status` - Project status changed
- `new_deliverable` - New video deliverable available
- `new_comment` - New comment added
- `payment_received` - Payment received
- `project_accepted` - Project request accepted

---

## Browser Compatibility

**Supported Browsers:**
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

**Required Features:**
- ES6+ support
- WebSocket support (Socket.io)
- HLS support (native or via hls.js)
- Service Worker support (for PWA)

---

## Deployment Notes

### Server Deployment
- Use PM2 for process management
- Configure MongoDB Atlas for production database
- Set up AWS S3 with proper CORS configuration
- Configure SSL/TLS for HTTPS
- Set environment variables in production

### Client Deployment
- Build with `npm run build`
- Serve static files with Nginx or similar
- Configure HTTPS
- Ensure service worker is properly registered
- Set up proper caching headers

---

## Troubleshooting

### Common Issues

**Video upload fails:**
- Check FFmpeg is installed on server
- Verify AWS S3 credentials
- Check file size limit (5GB max)
- Ensure sufficient disk space for temporary files

**Socket.io connection fails:**
- Verify SOCKET_URL environment variable
- Check CORS configuration in server
- Ensure WebSocket transport is enabled

**Email not sending:**
- Verify email credentials
- Check SMTP server configuration
- Ensure email provider allows app passwords
- Check firewall settings

**PWA not installing:**
- Verify manifest.json is accessible
- Check HTTPS is enabled (required for PWA)
- Ensure service worker is registered
- Check browser console for errors

---

## Future Enhancements

### Planned Features
- [ ] TypeScript migration
- [ ] Comprehensive testing suite
- [ ] Redis for rate limiting
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Audit logging
- [ ] Email verification
- [ ] Two-factor authentication
- [ ] Advanced analytics dashboard
- [ ] Video preview thumbnails
- [ ] Multiple video versions (1080p, 720p, 480p)
- [ ] Client feedback forms
- [ ] Invoice generation
- [ ] Subscription plans

### Performance Improvements
- [ ] Implement caching strategy (Redis)
- [ ] Add pagination to list endpoints
- [ ] Optimize database queries with proper indexing
- [ ] Implement CDN for static assets
- [ ] Add image optimization
- [ ] Implement code splitting (partially done)

---

## License

This project is proprietary software. All rights reserved.

---

## Contact

For questions or support, contact: yashvanth@skycuts.io

---

## Version History

- **v1.0.0** - Initial release with core features
  - Project management
  - Video delivery with HLS
  - Real-time chat
  - Timestamped comments
  - Bulk operations
  - PWA support
  - Rate limiting
  - Error boundary
