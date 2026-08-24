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
- **Video Processing:** Automated video delivery and responsive playback across devices.
- **Cloudinary Integration:** Secure cloud media storage and optimized video delivery.
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
- **Cloud Storage & Delivery:** Cloudinary

## 📦 Project Structure

The repository is structured as a monorepo with three primary directories:

- `/client` - The public-facing portfolio and client application.
- `/admin` - The secure admin portal for managing projects and uploads.
- `/server` - The Node.js REST API serving both frontend applications.

## ⚙️ Local Development

### Prerequisites
- Node.js (v18+)
- MongoDB instance
- Razorpay Account
- Cloudinary Account (Cloud name, API key, API secret)
- Google Cloud Console (OAuth Client ID)


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
