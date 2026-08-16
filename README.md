# SkyCuts

SkyCuts is a premium video editing platform designed for independent colorists and video editors to manage their clients, projects, payments, and deliverables seamlessly. It features a modern, responsive UI built with React and a robust backend powered by Node.js and MongoDB.

## 🚀 Features

### For Clients
- **Google Authentication:** Seamless sign-in experience using Google OAuth.
- **Project Requests:** Easily submit new project briefs and requirements.
- **Client Dashboard:** Track the progress of active projects.
- **Workspace & Chat:** Direct real-time chat with the editor and video commenting system for precise feedback.
- **Payments:** Secure integrated payments via Razorpay (INR support).
- **Deliverables:** Stream and download final HLS transcoded video files.

### For Admins (Editors)
- **Admin Dashboard:** Manage all incoming project requests and active workspaces.
- **Video Processing:** Automated HLS transcoding using FFmpeg for smooth playback of deliverables.
- **AWS S3 Integration:** Secure cloud storage for all heavy video assets.
- **Status Management:** Track projects through various stages (Awaiting Assets, In Progress, Review, Paid, Delivered).

## 🛠 Tech Stack

### Frontend (Client & Admin)
- **Framework:** React (Vite)
- **Styling:** Vanilla CSS with modern UI/UX design (glassmorphism, CSS variables, Framer Motion)
- **Routing:** React Router DOM
- **Authentication:** Google Identity Services

### Backend (Server)
- **Runtime:** Node.js (Express.js)
- **Database:** MongoDB (Mongoose)
- **Payments:** Razorpay API
- **Video Processing:** FFmpeg
- **Cloud Storage:** AWS S3 (AWS SDK v3)

## 📦 Project Structure

The repository is structured as a monorepo with three primary directories:

- `/client` - The public-facing portfolio and client application.
- `/admin` - The secure admin portal for managing projects and uploads.
- `/server` - The Node.js REST API serving both frontend applications.

## ⚙️ Local Development

### Prerequisites
- Node.js (v18+)
- MongoDB instance
- FFmpeg installed locally
- Razorpay Account
- AWS Account (S3 bucket)
- Google Cloud Console (OAuth Client ID)

### Environment Setup
Create a `.env` file in the `/server` directory with the following variables:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
ADMIN_URL=http://localhost:5174

# Google Auth
GOOGLE_CLIENT_ID=your_google_client_id

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# AWS S3
AWS_REGION=your_aws_region
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET_NAME=your_bucket_name
```

Create a `.env` file in the `/client` directory:
```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

Create a `.env` file in the `/admin` directory:
```env
VITE_API_URL=http://localhost:5000/api
```

### Running the App
Run the following commands in three separate terminal instances:

```bash
# Terminal 1: Start the Server
cd server
npm install
npm run dev

# Terminal 2: Start the Client App
cd client
npm install
npm run dev

# Terminal 3: Start the Admin App
cd admin
npm install
npm run dev
```

## 📝 License
This project is proprietary and confidential.
