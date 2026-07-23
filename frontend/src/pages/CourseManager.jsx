import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function CourseManager() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState(null);
  const [newLesson, setNewLesson] = useState({ title: '', content: '', videoUrl: '', order: 1 });
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Nouvel état pour savoir si on est en train de modifier une leçon existante
  const [editingLessonId, setEditingLessonId] = useState(null);

  // États pour la modification du cours entier
  const [isEditingCourse, setIsEditingCourse] = useState(false);
  const [editCourseData, setEditCourseData] = useState({ title: '', description: '', accessKey: '', imageUrl: '' });

  const fetchCourse = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`https://fdb-formations-production.up.railway.app/api/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCourse(response.data);
      if (!editingLessonId) {
        setNewLesson(prev => ({ ...prev, order: response.data.lessons.length + 1 }));
      }
    } catch (error) {
      console.error("Erreur de chargement", error);
      navigate('/instructor');
    }
  };

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  // --- GÉRER LE FORMULAIRE (AJOUT OU MODIFICATION) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const token = localStorage.getItem('token');
      
      if (editingLessonId) {
        // SI MODE MODIFICATION (PUT)
        await axios.put(`https://fdb-formations-production.up.railway.app/api/courses/${courseId}/lessons/${editingLessonId}`, newLesson, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert("Leçon modifiée avec succès !");
      } else {
        // SI MODE AJOUT (POST)
        await axios.post(`https://fdb-formations-production.up.railway.app/api/courses/${courseId}/lessons`, newLesson, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert("Leçon ajoutée avec succès !");
      }

      // On réinitialise le formulaire
      setEditingLessonId(null);
      setNewLesson({ title: '', content: '', videoUrl: '', order: course.lessons.length + 2 });
      fetchCourse();
    } catch (error) {
      alert("Une erreur est survenue.");
    } finally {
      setIsProcessing(false);
    }
  };

  // --- PRÉPARER LA MODIFICATION ---
  const handleEditClick = (lesson) => {
    setEditingLessonId(lesson.id);
    setNewLesson({
      title: lesson.title,
      content: lesson.content || '',
      videoUrl: lesson.videoUrl || '',
      order: lesson.order
    });
    // Fait défiler la page vers le haut pour voir le formulaire
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- SUPPRIMER UNE LEÇON ---
  const handleDeleteClick = async (lessonId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette leçon ? Cette action est irréversible.")) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`https://fdb-formations-production.up.railway.app/api/courses/${courseId}/lessons/${lessonId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCourse();
    } catch (error) {
      alert("Erreur lors de la suppression.");
    }
  };

  // --- MODIFIER LE COURS ---
  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(`https://fdb-formations-production.up.railway.app/api/courses/${courseId}`, editCourseData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Formation mise à jour !");
      setIsEditingCourse(false);
      fetchCourse(); // Rafraîchit les données affichées
    } catch (error) {
      alert("Erreur lors de la modification.");
    }
  };

  // --- SUPPRIMER LE COURS ---
  const handleDeleteCourse = async () => {
    if (!window.confirm("⚠️ DANGER : Êtes-vous sûr de vouloir supprimer TOUTE la formation, ses vidéos et ses étudiants ?")) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`https://fdb-formations-production.up.railway.app/api/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Formation supprimée.");
      navigate('/instructor'); // On le renvoie à l'accueil instructeur
    } catch (error) {
      alert("Erreur lors de la suppression.");
    }
  };

  if (!course) return <div className="p-8 text-center">Chargement...</div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 p-8">
      <div className="max-w-5xl mx-auto">
        
        {/* En-tête avec boutons CRUD pour le cours */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link to="/instructor" className="text-blue-600 font-bold hover:underline mb-2 inline-block">
              ← Retour au portail
            </Link>
            <h1 className="text-3xl font-bold text-slate-900">Gestion : {course.title}</h1>
            <p className="text-slate-500">Ajoutez des chapitres ou modifiez les infos globales.</p>
          </div>
          
          <div className="flex gap-2 shrink-0">
            <button 
              onClick={() => {
                setEditCourseData({ 
                  title: course.title, 
                  description: course.description, 
                  accessKey: course.accessKey, 
                  imageUrl: course.imageUrl || '' 
                });
                setIsEditingCourse(true);
              }}
              className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200 transition-colors"
            >
              ⚙️ Paramètres
            </button>
            <button 
              onClick={handleDeleteCourse}
              className="px-4 py-2 bg-red-100 text-red-600 font-bold rounded-lg hover:bg-red-200 transition-colors"
            >
              🗑️ Supprimer
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* COLONNE GAUCHE : Formulaire */}
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl shadow-sm border border-slate-200 h-fit sticky top-8">
            <h2 className={`text-xl font-bold mb-6 flex items-center gap-2 ${editingLessonId ? 'text-amber-600' : 'text-blue-600'}`}>
              <span className={`w-8 h-8 flex items-center justify-center rounded-lg text-white ${editingLessonId ? 'bg-amber-500' : 'bg-blue-600'}`}>
                {editingLessonId ? '✎' : '+'}
              </span>
              {editingLessonId ? "Modifier la leçon" : "Nouvelle Leçon"}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Titre de la leçon</label>
                <input 
                  type="text" value={newLesson.title} onChange={e => setNewLesson({...newLesson, title: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none" required
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">URL de la vidéo</label>
                <input 
                  type="url" value={newLesson.videoUrl} onChange={e => setNewLesson({...newLesson, videoUrl: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none" required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
                <textarea 
                  value={newLesson.content} onChange={e => setNewLesson({...newLesson, content: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none h-24"
                />
              </div>

              <div className="flex gap-4">
                <div className="w-1/3">
                  <label className="block text-sm font-bold text-slate-700 mb-1">Ordre</label>
                  <input 
                    type="number" min="1" value={newLesson.order} onChange={e => setNewLesson({...newLesson, order: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none" required
                  />
                </div>
                <div className="w-2/3 flex items-end">
                  <button type="submit" disabled={isProcessing} className={`w-full py-2 text-white font-bold rounded-xl disabled:opacity-70 ${editingLessonId ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
                    {isProcessing ? "En cours..." : (editingLessonId ? "Mettre à jour" : "Enregistrer")}
                  </button>
                </div>
              </div>

              {editingLessonId && (
                <button 
                  type="button" 
                  onClick={() => {
                    setEditingLessonId(null);
                    setNewLesson({ title: '', content: '', videoUrl: '', order: course.lessons.length + 1 });
                  }}
                  className="w-full py-2 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 mt-2"
                >
                  Annuler la modification
                </button>
              )}
            </form>
          </div>

          {/* COLONNE DROITE : Liste */}
          <div className="lg:col-span-7 bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold mb-6">Contenu actuel ({course.lessons.length})</h2>
            
            <div className="space-y-3">
              {course.lessons.length === 0 ? (
                <p className="text-slate-500 italic">Aucune leçon pour le moment.</p>
              ) : (
                course.lessons.map(lesson => (
                  <div key={lesson.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3 group hover:border-blue-300 transition-colors">
                    
                    {/* Infos leçon */}
                    <div className="flex items-start gap-3 overflow-hidden">
                      <div className="w-8 h-8 bg-slate-200 text-slate-600 rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                        {lesson.order}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 line-clamp-1">{lesson.title}</h4>
                        <p className="text-xs text-blue-600 line-clamp-1 mt-1">{lesson.videoUrl}</p>
                      </div>
                    </div>

                    {/* Boutons d'actions */}
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button 
                        onClick={() => handleEditClick(lesson)}
                        className="p-2 bg-amber-100 text-amber-600 rounded-lg hover:bg-amber-200 font-bold text-xs"
                      >
                        Modifier
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(lesson.id)}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 font-bold text-xs"
                      >
                        Supprimer
                      </button>
                    </div>

                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
      {/* MODALE DE PARAMÈTRES DU COURS */}
      {isEditingCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-2xl animate-in zoom-in duration-200">
            <h3 className="text-2xl font-bold mb-6">Paramètres de la formation</h3>
            <form onSubmit={handleUpdateCourse} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Titre</label>
                <input type="text" value={editCourseData.title} onChange={e => setEditCourseData({...editCourseData, title: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
                <textarea value={editCourseData.description} onChange={e => setEditCourseData({...editCourseData, description: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none h-24" required />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Clé Secrète</label>
                <input type="text" value={editCourseData.accessKey} onChange={e => setEditCourseData({...editCourseData, accessKey: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none font-mono uppercase" required />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Lien de l'image (URL)</label>
                <input type="url" value={editCourseData.imageUrl} onChange={e => setEditCourseData({...editCourseData, imageUrl: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none" />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsEditingCourse(false)} className="w-1/2 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200">Annuler</button>
                <button type="submit" className="w-1/2 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700">Sauvegarder</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}