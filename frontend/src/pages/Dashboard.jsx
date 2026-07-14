import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [myCourses, setMyCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      navigate('/');
      return;
    } 
    
    setUser(JSON.parse(userData));

    const fetchMyCourses = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/courses/my-courses', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMyCourses(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération de mes formations", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyCourses();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-800">
      <div className="max-w-6xl mx-auto">
        
        {/* EN-TÊTE DU DASHBOARD */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 flex justify-between items-start sm:items-center flex-col sm:flex-row gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Tableau de Bord</h1>
            <p className="text-slate-500 mt-2">Bienvenue, <span className="font-bold text-blue-600">{user.name}</span> !</p>
            
            {/* LE BOUTON INSTRUCTEUR EST ICI */}
            {user.role === 'INSTRUCTOR' && (
              <button 
                onClick={() => navigate('/instructor')}
                className="mt-4 px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-lg shadow-sm hover:bg-slate-800 transition-colors"
              >
                ⚙️ Accéder au Portail Instructeur
              </button>
            )}
          </div>
          
          <button 
            onClick={handleLogout}
            className="px-6 py-3 bg-slate-100 hover:bg-red-100 hover:text-red-600 text-slate-700 font-bold rounded-xl transition-colors shrink-0"
          >
            Se déconnecter
          </button>
        </div>

        {/* LISTE DES FORMATIONS DÉBLOQUÉES */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Mes Formations Débloquées</h2>
            <button 
              onClick={() => navigate('/catalog')}
              className="px-5 py-2 bg-blue-600 text-white font-bold rounded-xl shadow-sm hover:bg-blue-700 transition-colors"
            >
              Explorer le catalogue
            </button>
          </div>
          
          {isLoading ? (
            <p className="text-slate-500">Chargement de vos formations...</p>
          ) : myCourses.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 text-center text-slate-500">
              Vous n'avez pas encore débloqué de formation avec une clé.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myCourses.map(course => (
                <div key={course.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col">
                  <div className="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mb-4 font-bold text-xl">
                    ✓
                  </div>
                  <h3 className="text-lg font-bold mb-2">{course.title}</h3>
                  <p className="text-slate-500 text-sm mb-4 line-clamp-2 flex-1">{course.description}</p>
                  
                  <button 
                    onClick={() => navigate(`/courses/${course.id}`)}
                    className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-blue-600 transition-colors mt-auto"
                  >
                    Continuer la lecture
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}