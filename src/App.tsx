import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AdminRoute, TeacherRoute, StudentRoute, PublicRoute } from './components/ProtectedRoutes';
import { useAuth } from './contexts/AuthContext';
import { FlashcardsProvider } from './context/FlashcardsContext';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import CTASection from './components/CTASection';
import Footer from './components/Footer';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import AdminDashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import AddUser from './pages/admin/AddUser';
import BulkUserUpload from './pages/admin/BulkUserUpload';
import ResourceLibrary from './pages/admin/ResourceLibrary';
import ActivityLogs from './pages/admin/ActivityLogs';
import AdminSettings from './pages/admin/Settings';
import GeneratePresentations from './pages/teacher/content/GeneratePresentations';
import GenerateNotes from './pages/teacher/content/GenerateNotes';
import GenerateLessonPlans from './pages/teacher/content/GenerateLessonPlans';
import GenerateQuestionSets from './pages/teacher/content/GenerateQuestionSets';
import QuestionSetResults from './pages/teacher/content/QuestionSetResults';
import QuestionSetResultsPage from './pages/teacher/content/QuestionSetResultsPage';
import GenerateFlashcards from './pages/teacher/content/GenerateFlashcards';
import UploadResources from './pages/shared/resources/UploadResources';
import FlashcardsResults from './pages/teacher/content/flashcards/FlashcardsResults';
import PresentationsResults from './pages/teacher/content/presentations/PresentationsResults';
import ClassNotesResults from './pages/teacher/content/notes/ClassNotesResults';
import LessonPlanResults from './pages/teacher/content/LessonPlanResults';
import ContentGeneration from './pages/teacher/content/ContentGeneration';
import TeacherSettings from './pages/teacher/Settings';
import LessonPlansList from './pages/teacher/LessonPlansList';
import MyResources from './pages/teacher/MyResources';
import QuizResults from './pages/student/QuizResults';
import AITutoring from './pages/student/AITutoring';
import QuizSimulation from './pages/student/QuizSimulation';
import StudyPlan from './pages/student/StudyPlan';
import TeacherDashboard from './pages/teacher/Dashboard';
import StudentDashboard from './pages/student/Dashboard';
import StudentSettings from './pages/student/Settings';

// Component to redirect users based on their role
const RoleBasedRedirect = () => {
  const { userInfo } = useAuth();
  
  if (userInfo?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  } else if (userInfo?.role === 'teacher') {
    return <Navigate to="/teacher" replace />;
  } else if (userInfo?.role === 'student') {
    return <Navigate to="/student" replace />;
  }
  
  // Default fallback
  return <Navigate to="/" replace />;
};

const LandingPage = ({ isDarkMode, onThemeToggle }: { isDarkMode: boolean; onThemeToggle: () => void }) => (
  <>
    <Header isDarkMode={isDarkMode} onThemeToggle={onThemeToggle} />
    <Hero />
    <Features />
    <CTASection />
    <Footer />
  </>
);

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { userInfo } = useAuth();

  // Load theme preference from Firestore if user is authenticated, otherwise from localStorage
  useEffect(() => {
    // If user is authenticated, check for their theme preference in Firestore
    if (userInfo?.uid) {
      console.log('[App] User authenticated, checking for theme preference in Firestore');
      const userDarkMode = userInfo.darkMode;
      
      if (userDarkMode !== undefined) {
        console.log('[App] Loading dark mode from Firestore:', userDarkMode);
        setIsDarkMode(userDarkMode);
        return;
      }
    }
    
    // Fallback to localStorage if no user is authenticated or no preference in Firestore
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme) {
      const darkModeValue = savedTheme === 'true';
      console.log('[App] Loading dark mode from localStorage:', darkModeValue);
      setIsDarkMode(darkModeValue);
    }
  }, [userInfo]);

  useEffect(() => {
    console.log('[App] Dark mode changed:', isDarkMode);
    
    // Apply dark mode class to document
    if (isDarkMode) {
      console.log('[App] Adding dark class to document');
      document.documentElement.classList.add('dark');
    } else {
      console.log('[App] Removing dark class from document');
      document.documentElement.classList.remove('dark');
    }
    
    // Save theme preference to localStorage
    localStorage.setItem('darkMode', isDarkMode.toString());
    console.log('[App] Saved dark mode to localStorage:', isDarkMode);
  }, [isDarkMode]);
  
  // Function to toggle theme with proper state management
  const handleThemeToggle = () => {
    console.log('[App] Toggle theme called, current state:', isDarkMode);
    setIsDarkMode(prevMode => {
      console.log('[App] Setting dark mode to:', !prevMode);
      return !prevMode;
    });
  };

  return (
    <Router>
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <Routes>
          {/* Public Routes - accessible without authentication */}
          <Route element={<PublicRoute />}>
            <Route 
              path="/" 
              element={
                <LandingPage 
                  isDarkMode={isDarkMode} 
                  onThemeToggle={handleThemeToggle} 
                />
              } 
            />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
          </Route>

          {/* Admin Routes - only accessible by admin users */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminDashboard isDarkMode={isDarkMode} onThemeToggle={handleThemeToggle} />} />
            <Route path="/admin/users" element={<UserManagement isDarkMode={isDarkMode} onThemeToggle={handleThemeToggle} />} />
            <Route path="/admin/users/add" element={<AddUser isDarkMode={isDarkMode} onThemeToggle={handleThemeToggle} />} />
            <Route path="/admin/users/bulk-upload" element={<BulkUserUpload isDarkMode={isDarkMode} onThemeToggle={handleThemeToggle} />} />
            <Route path="/admin/resources" element={<ResourceLibrary isDarkMode={isDarkMode} onThemeToggle={handleThemeToggle} />} />
            <Route path="/admin/logs" element={<ActivityLogs isDarkMode={isDarkMode} onThemeToggle={handleThemeToggle} />} />
            <Route path="/admin/settings" element={<AdminSettings isDarkMode={isDarkMode} onThemeToggle={handleThemeToggle} />} />
            <Route path="/admin/resources/upload" element={<UploadResources isDarkMode={isDarkMode} onThemeToggle={handleThemeToggle} isAdmin={true} />} />
          </Route>

          {/* Teacher Routes - only accessible by teacher users */}
          <Route element={<TeacherRoute />}>
            <Route path="/teacher" element={<TeacherDashboard isDarkMode={isDarkMode} onThemeToggle={handleThemeToggle} />} />
            <Route path="/teacher/lessons" element={<LessonPlansList isDarkMode={isDarkMode} onThemeToggle={handleThemeToggle} />} />
            <Route path="/teacher/resources" element={<MyResources isDarkMode={isDarkMode} onThemeToggle={handleThemeToggle} />} />
            <Route path="/teacher/resources/upload" element={<UploadResources isDarkMode={isDarkMode} onThemeToggle={handleThemeToggle} />} />
            <Route path="/teacher/settings" element={<TeacherSettings isDarkMode={isDarkMode} onThemeToggle={handleThemeToggle} />} />
            <Route path="/teacher/content" element={<ContentGeneration isDarkMode={isDarkMode} onThemeToggle={handleThemeToggle} />} />
            <Route path="/teacher/content/notes" element={<GenerateNotes isDarkMode={isDarkMode} onThemeToggle={handleThemeToggle} />} />
            <Route path="/teacher/content/lesson-plans" element={<GenerateLessonPlans isDarkMode={isDarkMode} onThemeToggle={handleThemeToggle} />} />
            <Route path="/teacher/content/presentations" element={<GeneratePresentations isDarkMode={isDarkMode} onThemeToggle={handleThemeToggle} />} />
            <Route path="/teacher/content/question-sets" element={<GenerateQuestionSets isDarkMode={isDarkMode} onThemeToggle={handleThemeToggle} />} />
            <Route path="/teacher/content/flashcards" element={<GenerateFlashcards isDarkMode={isDarkMode} onThemeToggle={handleThemeToggle} />} />
            <Route path="/teacher/content/question-sets/results" element={<QuestionSetResults isDarkMode={isDarkMode} onThemeToggle={handleThemeToggle} />} />
            <Route path="/teacher/content/question-sets/results/:questionSetId" element={<QuestionSetResultsPage isDarkMode={isDarkMode} onThemeToggle={handleThemeToggle} />} />
            <Route path="/teacher/content/flashcards/results" element={<FlashcardsResults isDarkMode={isDarkMode} onThemeToggle={handleThemeToggle} />} />
            <Route path="/teacher/content/lesson-plans/results" element={<LessonPlanResults isDarkMode={isDarkMode} onThemeToggle={handleThemeToggle} />} />
            <Route path="/teacher/content/notes/results" element={<ClassNotesResults isDarkMode={isDarkMode} onThemeToggle={handleThemeToggle} />} />
            <Route path="/teacher/content/presentations/results" element={<PresentationsResults isDarkMode={isDarkMode} onThemeToggle={handleThemeToggle} />} />
          </Route>

          {/* Student Routes - only accessible by student users */}
          <Route element={<StudentRoute />}>
            <Route path="/student" element={<StudentDashboard isDarkMode={isDarkMode} onThemeToggle={handleThemeToggle} />} />
            <Route path="/student/study-plan" element={<StudyPlan isDarkMode={isDarkMode} onThemeToggle={handleThemeToggle} />} />
            <Route path="/student/tutoring" element={<AITutoring isDarkMode={isDarkMode} onThemeToggle={handleThemeToggle} />} />
            <Route path="/student/quizzes" element={<QuizSimulation isDarkMode={isDarkMode} onThemeToggle={handleThemeToggle} />} />
            <Route path="/student/quiz-results" element={<QuizResults isDarkMode={isDarkMode} onThemeToggle={handleThemeToggle} />} />
            <Route path="/student/settings" element={<StudentSettings isDarkMode={isDarkMode} onThemeToggle={handleThemeToggle} />} />
          </Route>
          
          {/* Error route - display a 404 page */}
          <Route path="/404" element={
            <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-gray-900 px-4 text-center">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">404 - Page Not Found</h1>
              <p className="text-gray-600 dark:text-gray-400 mb-8">The page you are looking for doesn't exist or has been moved.</p>
              <button 
                onClick={() => window.history.back()} 
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
              >
                Go Back
              </button>
            </div>
          } />
          
          {/* Role-based redirect - will send users to their appropriate dashboard */}
          <Route path="/dashboard" element={<RoleBasedRedirect />} />
          
          {/* Catch all route - redirect to 404 page */}
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default function AppWithProviders() {
  return (
    <FlashcardsProvider>
      <App />
    </FlashcardsProvider>
  );
}