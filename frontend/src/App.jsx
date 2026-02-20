import { Routes, Route } from "react-router-dom";

import LandingPage from "./views/Landing/LandingPage";
import AcademicProgram from "./views/Landing/AcademicProgram";
import GuidelinesAbout from "./views/Landing/GuidelinesAbout";

import Login from "./views/Auth/Login";
import RegistrationType from "./views/Auth/RegistrationType";
import RegisterStudent from "./views/Auth/RegisterStudent";
import RegisterInstitution from "./views/Auth/RegisterInstitution";
import ForgotPassword from "./views/Auth/ForgotPassword";
import VerifyCode from "./views/Auth/VerifyCode";
import ResetPassword from "./views/Auth/ResetPassword";

import StudentLayout from "./Layout/StudentLayout";

import StudentDashboard from "./views/Student/Dashborad";
import BrowseResearch from "./views/Student/BrowseResearch";
import MyResearches from "./views/Student/MyResearches";
import AccessRequests from "./views/Student/AccessRequest";
import Settings from "./views/Student/Settings";


export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/academic-programs" element={<AcademicProgram />} />
      <Route path="/guidelines-about" element={<GuidelinesAbout />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<RegistrationType />} />
      <Route path="/register-student" element={<RegisterStudent />} />
      <Route path="/register-institution" element={<RegisterInstitution />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verify-code" element={<VerifyCode />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route element={<StudentLayout />}>
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/browse-research" element={<BrowseResearch />} />
        <Route path="/my-researches" element={<MyResearches />} />
        <Route path="/access-requests" element={<AccessRequests />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}