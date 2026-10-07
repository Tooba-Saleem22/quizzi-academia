import "./App.css";
import BotpressChatbot from "./Components/Ebook/BotpressChatbot";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import AdminDashboard from "./Components/Pages/Admin/AdminDashboard";
import Home from "./Components/Pages/Home";
import About1 from "./Components/Routes/About1";
import Courses1 from "./Components/Routes/Courses1";
import Contact1 from "./Components/Routes/Contact1";
import UserModules from "./Components/Pages/UserModules";
import UserProfilePage from "./Components/Pages/UserProfilePage";
import ErrorPage from "./Components/Pages/ErrorPage";
import Payment from "./Components/Pages/Payment";
import PaymentSuccess from "./Components/Pages/PaymentSuccess";
import LoginPage from "./Components/Pages/LoginPage";
import Test from "./Components/Pages/Test";

import ProfilePage from "./Components/Pages/Admin/ProfilePage";
import QuizPage from "./Components/Pages/Admin/QuizPage";
import CoursesPage from "./Components/Pages/Admin/CoursesPage";
import SettingsPage from "./Components/Pages/Admin/SettingsPage";
import UsersPage from "./Components/Pages/Admin/UsersPage";
import Layout from "./Components/Pages/Admin/Layout";
import ModulesPage from "./Components/Pages/Admin/ModulesPage";
import PaymentVerificationsPage from "./Components/Pages/Admin/PaymentVerificationPage";

function App() {
  return (
    <>
      <BrowserRouter>
          <BotpressChatbot />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/test" element={<Test />} />
          <Route path="/pay" element={<Payment />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/about" element={<About1 />} />
          <Route path="/courses" element={<Courses1 />} />
          <Route path="/contact" element={<Contact1 />} />
          <Route path="/courses/:courseId/modulesP" element={<UserModules />} />
          <Route path="/error" element={<ErrorPage />} />
          <Route path="/loginPage" element={<LoginPage />} />
          <Route path="/profilePage" element={<ProfilePage />} />
          <Route path="/payment-ver" element={<PaymentVerificationsPage />} />
          <Route path="/userProfilePage" element={<UserProfilePage />} />
          <Route path="/coursesPage" element={<CoursesPage />} />
          <Route path="/courses/:courseId/modules" element={<ModulesPage />} />
          <Route path="/layout" element={<Layout />} />
          <Route path="/quizPage" element={<QuizPage />} />
          <Route path="/settingsPage" element={<SettingsPage />} />
          <Route path="/usersPage" element={<UsersPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="*" element={<ErrorPage />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;

