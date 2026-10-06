# Job Board Frontend

A simple job board frontend built with React and TypeScript.

I built this project mainly to practice connecting a React frontend to a custom backend API, so the UI is intentionally simple. The main focus was working with authentication, protected routes, different user roles, API requests, and real application flows.

## Features

- Register and login
- Job seeker and employer accounts
- Browse and search jobs
- Job pagination
- View job details
- Apply for jobs
- View submitted applications
- Create, edit, and delete jobs as an employer
- View applicants for a job
- Accept or reject applications
- Profile management
- Protected routes based on authentication and user role
- Persistent login using localStorage
- Responsive layout

## Tech Stack

- React
- TypeScript
- Vite
- React Router
- CSS
- Vitest
- React Testing Library

## Backend

This frontend connects to a custom backend built separately with Node.js, Express, Prisma, PostgreSQL, and JWT authentication.

The main goal of this project was practicing the full connection between the frontend and backend rather than building a complex UI.

Backend repository:

`https://github.com/ShazaElsayedIsmail11/job-board-api`

## Environment Variables

Create a `.env.local` file:

```env
VITE_API_BASE_URL=http://localhost:3000
```

For production, use the deployed backend URL instead.

## Run Locally

```bash
npm install
npm run dev
```

## Live Demo

`https://job-board-frontend-khaki-eight.vercel.app`
