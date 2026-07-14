import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Catalog from './pages/Catalog';
import CoursePlayer from './pages/CoursePlayer';
import InstructorPortal from './pages/InstructorPortal'; // <-- IMPORT
import CourseManager from './pages/CourseManager';



function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* La route par défaut (la page de connexion) */}
        <Route path="/" element={<Login />} />
        
        {/* La route du tableau de bord (protégée) */}
        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/catalog" element={<Catalog />} />

        <Route path="/courses/:courseId" element={<CoursePlayer />} />

        <Route path="/instructor" element={<InstructorPortal />} />

        <Route path="/instructor/courses/:courseId" element={<CourseManager />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;