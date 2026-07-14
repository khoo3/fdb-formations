import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function CoursePlayer() {
  const { courseId } = useParams(); // Récupère l'ID du cours dans l'URL
  const navigate = useNavigate();
  
  const [course, setCourse] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return navigate('/');

        const response = await axios.get(`http://localhost:5000/api/courses/${courseId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setCourse(response.data);
        // On sélectionne la première leçon par défaut s'il y en a
        if (response.data.lessons && response.data.lessons.length > 0) {
          setCurrentLesson(response.data.lessons[0]);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Erreur de chargement");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId, navigate]);

  if (isLoading) return <div className="min-h-screen flex justify-center items-center">Chargement...</div>;
  if (error) return <div className="min-h-screen flex justify-center items-center text-red-500">{error}</div>;
  if (!course) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      {/* NAVBAR */}
      <header className="bg-white border-b border-slate-200 px-6 h-16 flex items-center justify-between shrink-0 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="w-10 h-10 flex items-center justify-center bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
            <span className="text-xl font-bold">←</span>
          </Link>
          <h1 className="font-bold text-lg line-clamp-1">{course.title}</h1>
        </div>
        <div className="text-sm text-slate-500 font-medium">
          Instructeur : {course.instructor.name}
        </div>
      </header>

      {/* CONTENU PRINCIPAL */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LECTEUR VIDÉO (À gauche) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="aspect-video bg-black rounded-3xl overflow-hidden shadow-lg relative flex items-center justify-center group">
            {currentLesson?.videoUrl ? (
              // Si on a une URL, on affichera la vidéo ici (Pour l'instant un placeholder)
              <div className="text-white text-center">
                <span className="text-5xl mb-4 block">▶</span>
                <p>Vidéo : {currentLesson.videoUrl}</p>
              </div>
            ) : (
              <div className="text-slate-400 text-center">
                <span className="text-5xl mb-4 block opacity-50">⏸</span>
                <p>Aucune vidéo disponible pour cette leçon.</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
            <h2 className="text-2xl font-bold mb-4">
              {currentLesson ? currentLesson.title : "Bienvenue dans la formation"}
            </h2>
            <p className="text-slate-600 leading-relaxed">
              {currentLesson ? currentLesson.content : course.description}
            </p>
          </div>
        </div>

        {/* SOMMAIRE DES LEÇONS (À droite) */}
        <aside className="lg:col-span-4 bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden sticky top-24">
          <div className="p-6 border-b border-slate-100 bg-slate-50">
            <h3 className="font-bold text-lg">Contenu du cours</h3>
            <p className="text-sm text-slate-500">{course.lessons.length} leçons disponibles</p>
          </div>
          
          <div className="max-h-[600px] overflow-y-auto">
            {course.lessons.length === 0 ? (
              <p className="p-6 text-slate-500 text-center text-sm">L'instructeur n'a pas encore ajouté de leçons.</p>
            ) : (
              course.lessons.map((lesson, index) => {
                const isActive = currentLesson?.id === lesson.id;
                return (
                  <button
                    key={lesson.id}
                    onClick={() => setCurrentLesson(lesson)}
                    className={`w-full text-left p-4 flex gap-4 transition-colors border-b border-slate-50 last:border-0
                      ${isActive ? 'bg-blue-50 border-l-4 border-l-blue-600' : 'hover:bg-slate-50 border-l-4 border-l-transparent'}`}
                  >
                    <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-sm font-bold
                      ${isActive ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                      {index + 1}
                    </div>
                    <div>
                      <h4 className={`font-medium text-sm ${isActive ? 'text-blue-700 font-bold' : 'text-slate-700'}`}>
                        {lesson.title}
                      </h4>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

      </main>
    </div>
  );
}