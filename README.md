# Blogly - Production-Ready Blog Application

A full-stack blog application built with React, TypeScript, Express, and MongoDB.

## Features

- **Authentication**: JWT-based auth with Google OAuth2.0 integration.
- **Rich Text Editor**: Create and edit blog posts with ease.
- **Image Uploads**: Powered by Cloudinary.
- **Newsletter**: Integrated newsletter subscription system.
- **Real-time Interaction**: Socket.io for live updates.
- **Responsive Design**: Modern UI built with Tailwind CSS and Framer Motion.
- **Security**: Helmet, CORS, and Express Rate Limit implemented.

## Tech Stack

**Frontend:**
- React 19
- TypeScript
- Vite
- Tailwind CSS
- Zustand (State Management)
- TanStack Query (Data Fetching)
- Framer Motion (Animations)

**Backend:**
- Node.js & Express
- MongoDB with Mongoose
- TypeScript
- Passport.js (Google OAuth)
- Socket.io
- Cloudinary (Media Storage)
- Nodemailer (Emailing)

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB account (Atlas or local)
- Cloudinary account
- Google Cloud Console project (for OAuth)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/heytoshan/blog-app.git
   cd blog-app
   ```

2. **Install dependencies:**
   ```bash
   # Install client dependencies
   cd client
   npm install

   # Install server dependencies
   cd ../server
   npm install
   ```

3. **Environment Setup:**
   Create a `.env` file in the `server` directory and add the following:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   CLIENT_URL=http://localhost:5173
   
   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   
   # Google OAuth
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   
   # Email
   SMTP_HOST=your_smtp_host
   SMTP_PORT=your_smtp_port
   SMTP_USER=your_smtp_user
   SMTP_PASS=your_smtp_pass
   ```

### Running the Application

1. **Start the Server:**
   ```bash
   cd server
   npm run dev
   ```

2. **Start the Client:**
   ```bash
   cd client
   npm run dev
   ```

## Deployment

### Backend (Server)
**Important:** Because this project uses **Socket.io** for real-time features, it is recommended to deploy the backend on a platform that supports long-lived connections, such as **Render**, **Railway**, or **DigitalOcean**. 

1. Create a new Web Service on Render/Railway.
2. Connect this GitHub repository.
3. Set the Root Directory to `server`.
4. Build Command: `npm install && npm run build`.
5. Start Command: `npm start`.
6. Add all environment variables from your `.env` file to the platform's dashboard.

### Frontend (Client)
The frontend can be easily deployed on **Vercel**.

1. Go to [Vercel](https://vercel.com) and create a new project.
2. Connect this GitHub repository.
3. Set the **Root Directory** to `client`.
4. Framework Preset: **Vite**.
5. Build Command: `npm run build`.
6. Output Directory: `dist`.
7. **Environment Variables**: Add `VITE_API_URL` and set it to your deployed backend URL (e.g., `https://blog-app-api.onrender.com/api/v1`).

---

## License
