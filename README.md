# Quizzi Academia 🎓

### Smart Learning with Quiz-Based Recommendations

Quizzi Academia is a full-stack learning platform designed to make learning more interactive through quizzes, personalized learning recommendations, educational video content, and AI-powered assistance.

## Features

* **Interactive Quizzes**
  Take quizzes to test knowledge and reinforce learning.

* **Quiz-Based Recommendations**
  Provides learning recommendations based on quiz-related results and learning needs.

* **Educational Video Recommendations**
  Fetches relevant educational videos using the YouTube API.

* **AI Learning Assistant**
  An AI-powered chatbot that helps users with learning-related questions.

* **User Authentication**
  Secure user registration and login functionality.

* **Admin Dashboard**
  Provides administrative functionality for managing the platform.

* **Easypaisa Integration**
  Supports payment functionality through Easypaisa.

*  **Responsive Design**
  Designed to provide a consistent experience across different screen sizes.

## Tech Stack

### Frontend

* React.js
* JavaScript
* Bootstrap
* HTML5
* CSS3

### Backend

* Node.js
* Express.js

### Database

* MongoDB

### APIs & Services

* YouTube API
* AI API / Chatbot Integration
* Easypaisa

## Architecture

Quizzi Academia follows a client-server architecture:

```text
┌─────────────────────┐
│    React Frontend   │
└──────────┬──────────┘
           │
           │ REST API
           ▼
┌─────────────────────┐
│ Node.js + Express   │
│      Backend        │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│       MongoDB       │
└─────────────────────┘

External Services:
YouTube API • AI Services • Easypaisa
```

## 📂 Project Structure

```text
quizzi-academia/
│
├── frontend/
│   └── React application
│
├── backend/
│   └── Node.js + Express API
│
├── README.md
└── .gitignore
```

## Getting Started

### Prerequisites

Make sure you have the following installed:

* [Node.js](https://nodejs.org/)
* npm
* MongoDB

### Clone the Repository

```bash
git clone https://github.com/Tooba-Saleem22/quizzi-academia.git
cd quizzi-academia
```

### Install Dependencies

Install the frontend dependencies:

```bash
cd frontend
npm install
```

Install the backend dependencies:

```bash
cd ../backend
npm install
```

### Environment Variables

Create the required `.env` files and add your local configuration and API credentials.

Example:

```env
MONGODB_URI=your_mongodb_connection_string
API_KEY=your_api_key
```

> ⚠️ Never commit `.env` files, API keys, passwords, database credentials, or other sensitive information to GitHub.

### Run the Application

Start the backend and frontend using the npm scripts configured in each project directory.

```bash
npm run dev
```

> The exact commands may vary depending on the current project configuration.

##  Screenshots

Screenshots showcasing the main features and interface will be added here.

### Home
<img width="950" height="410" alt="quizziii" src="https://github.com/user-attachments/assets/065e8049-6c5e-4d5f-bc66-6a852980de75" />


### Quiz

<img width="947" height="407" alt="5" src="https://github.com/user-attachments/assets/56af25e0-b8d2-4aa4-9507-501de294f831" />


### AI Chatbot

<img width="338" height="404" alt="4" src="https://github.com/user-attachments/assets/d4bb69a9-fa50-439b-89c7-1d6d78ebd953" />


### Admin Dashboard

<img width="946" height="412" alt="quizii" src="https://github.com/user-attachments/assets/62553314-49ca-4fa4-ad03-1ab45fc20f38" />


## 🌐 Live Demo
 **Coming Soon**

The application will be deployed and the live demo link will be added here.

##  Future Improvements

* Deploy the application for public access
* Improve recommendation accuracy
* Expand the quiz and learning content
* Add detailed learning analytics
* Improve accessibility and user experience
* Enhance admin management features

## Author

**Tooba Saleem**

Frontend & MERN Stack Developer

* GitHub: [Tooba-Saleem22](https://github.com/Tooba-Saleem22)
* Portfolio: [toobasaleem.vercel.app](https://toobasaleem.vercel.app/)
* LinkedIn: [Tooba Saleem](https://www.linkedin.com/in/tooba-saleem-51491931a/)
