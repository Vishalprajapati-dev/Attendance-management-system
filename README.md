# Attendance Management System

A full-stack Attendance Management System built using React.js, Node.js, Express.js and MongoDB.

## Features

- User Registration and Login
- JWT Authentication
- Role-based Access Control
- Employee Check-in and Check-out
- Selfie-based Attendance
- Admin/Manager Attendance Verification
- Overtime Request Management
- Admin/Manager Overtime Approval
- Daily Attendance Report
- Secure Password Hashing with bcrypt
- MongoDB Database

## Tech Stack

### Frontend
- React.js
- Vite
- JavaScript
- CSS

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs

## User Roles

### Employee
- Login/Register
- Check-in
- Check-out
- Attendance management
- Submit overtime requests

### Admin
- Verify employee attendance
- View attendance records
- Manage overtime requests
- Approve/Reject overtime requests

### Manager
- Verify employee attendance
- Manage overtime requests
- Approve/Reject overtime requests

## Project Structure

```text
attendance-management-system/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── server.js
│
├── frontend/
│   └── src/
│       ├── components/
│       ├── services/
│       ├── App.jsx
│       └── main.jsx
│
├── .gitignore
└── README.md