import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import MyRequestsDashboard from './pages/StudentDashboard';
import SearchCourse from './pages/CoursePage';
import CoordinatorDashboard from './pages/CoordinatorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminCourses from './pages/AdminCourses';
import AddEditCourse from './pages/AddEditCourse';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/dashboard" element={<MyRequestsDashboard />} />
        <Route path="/courses" element={<SearchCourse />} />
        <Route path="/coordinator" element={<CoordinatorDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/courses" element={<AdminCourses />} />
        <Route path="/admin/courses/:id" element={<AddEditCourse />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}