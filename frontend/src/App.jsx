import { Routes, Route } from 'react-router-dom';
import LandingPage from './views/Landing/LandingPage';
import AcademicProgram from './views/Landing/AcademicProgram';
import GuidelinesAbout from './views/Landing/GuidelinesAbout';
import Login from './views/Auth/Login';
import RegistrationType from './views/Auth/RegistrationType';
import RegisterStudent from './views/Auth/RegisterStudent';
import RegisterInstitution from './views/Auth/RegisterInstitution';
import ForgotPassword from './views/Auth/ForgotPassword';
import VerifyCode from './views/Auth/VerifyCode';
import ResetPassword from './views/Auth/ResetPassword';

import StudentDashboard from './views/Student/Dashborad';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/academic-programs" element={<AcademicProgram />} />
      <Route path="/guidelines-about" element={<GuidelinesAbout />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<RegistrationType />} />
      <Route path="/register-student" element={<RegisterStudent />} />
      <Route path="/register-institution" element={<RegisterInstitution />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/student-dashboard" element={<StudentDashboard />} />
      <Route path="/verify-code" element={<VerifyCode />} />
      <Route path="/reset-password" element={<ResetPassword />} />
    </Routes>
  );
}
