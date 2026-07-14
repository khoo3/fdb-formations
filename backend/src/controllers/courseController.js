const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

// Initialisation de Prisma (comme pour l'auth)
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// --- CRÉER UNE FORMATION ---
exports.createCourse = async (req, res) => {
  try {
    const { title, description, accessKey } = req.body; // on récupère accessKey, on enlève price (c'est gratuit)
    const instructorId = req.user.userId; 

    const newCourse = await prisma.course.create({
      data: {
        title,
        description,
        price: 0, // Toujours gratuit
        accessKey: accessKey || "SECRET123", // Clé par défaut si non fournie
        instructorId
      }
    });

    res.status(201).json({ message: "Formation créée avec succès !", course: newCourse });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la création.", error: error.message });
  }
};

// --- RÉCUPÉRER TOUTES LES FORMATIONS ---
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      include: {
        // On inclut juste le nom du professeur associé à la formation
        instructor: {
          select: { name: true } 
        }
      }
    });
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération.", error: error.message });
  }
};

// --- DÉBLOQUER UNE FORMATION (AVEC LA CLÉ) ---
exports.unlockCourse = async (req, res) => {
    console.log(req.body);
  try {
    const { courseId } = req.params;
    const { key } = req.body; // La clé envoyée par l'étudiant
    const userId = req.user.userId;

    // 1. Chercher la formation
    const course = await prisma.course.findUnique({ where: { id: parseInt(courseId) } });
    if (!course) {
      return res.status(404).json({ message: "Formation introuvable." });
    }

    // 2. Vérifier la clé
    console.log("========== DEBUG ==========");
    console.log("Clé envoyée :", key);
    console.log("Clé enregistrée :", course.accessKey);
    console.log("Objet course :", course);
    console.log("===========================");
    if (course.accessKey !== key) {
      return res.status(403).json({ message: "Clé d'accès incorrecte !" });
    }

    // 3. Vérifier si l'étudiant n'est pas déjà inscrit
    const alreadyEnrolled = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: { userId, courseId: course.id }
      }
    });

    if (alreadyEnrolled) {
      return res.status(400).json({ message: "Vous avez déjà débloqué cette formation." });
    }

    // 4. Inscrire l'étudiant (Créer l'Enrollment)
    await prisma.enrollment.create({
      data: {
        userId,
        courseId: course.id
      }
    });

    res.status(200).json({ message: "Succès ! Formation débloquée." });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

// --- RÉCUPÉRER LES FORMATIONS DÉBLOQUÉES PAR L'ÉTUDIANT ---
exports.getMyCourses = async (req, res) => {
  try {
    const userId = req.user.userId;

    // On cherche toutes les inscriptions de cet utilisateur
    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: {
        // On inclut les données de la formation liée
        course: {
          include: {
            instructor: { select: { name: true } } // On prend aussi le nom du prof
          }
        }
      }
    });

    // On extrait juste les "courses" du résultat
    const myCourses = enrollments.map(enrollment => enrollment.course);

    res.status(200).json(myCourses);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

// --- RÉCUPÉRER UN COURS COMPLET AVEC SES LEÇONS (SÉCURISÉ) ---
exports.getCourseById = async (req, res) => {
  try {
    const courseId = parseInt(req.params.courseId);
    const userId = req.user.userId;

    // 1. SÉCURITÉ : L'utilisateur a-t-il le droit de voir ce cours ?
    const isEnrolled = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } }
    });

    if (!isEnrolled && req.user.role !== 'INSTRUCTOR') {
      return res.status(403).json({ message: "Accès refusé. Vous devez débloquer ce cours." });
    }

    // 2. On récupère le cours ET ses leçons (triées par ordre)
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        lessons: {
          orderBy: { order: 'asc' } // Trie les chapitres du 1 au dernier
        },
        instructor: { select: { name: true } }
      }
    });

    if (!course) {
      return res.status(404).json({ message: "Formation introuvable." });
    }

    res.status(200).json(course);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

// --- RÉCUPÉRER LES COURS CRÉÉS PAR L'INSTRUCTEUR ---
exports.getInstructorCourses = async (req, res) => {
  try {
    const instructorId = req.user.userId;

    const courses = await prisma.course.findMany({
      where: { instructorId },
      include: {
        _count: {
          select: { enrollments: true, lessons: true } // On compte les élèves et les leçons
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};