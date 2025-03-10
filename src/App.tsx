import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <Router>
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <Routes>
          <Route 
            path="/" 
            element={
              <LandingPage 
                isDarkMode={isDarkMode} 
                onThemeToggle={() => setIsDarkMode(!isDarkMode)} 
              />
            } 
          />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/admin" element={<AdminDashboard isDarkMode={isDarkMode} onThemeToggle={() => setIsDarkMode(!isDarkMode)} />} />
          <Route path="/admin/users" element={<UserManagement isDarkMode={isDarkMode} onThemeToggle={() => setIsDarkMode(!isDarkMode)} />} />
          <Route path="/admin/users/add" element={<AddUser isDarkMode={isDarkMode} onThemeToggle={() => setIsDarkMode(!isDarkMode)} />} />
          <Route path="/admin/users/bulk-upload" element={<BulkUserUpload isDarkMode={isDarkMode} onThemeToggle={() => setIsDarkMode(!isDarkMode)} />} />
          <Route path="/admin/resources" element={<ResourceLibrary isDarkMode={isDarkMode} onThemeToggle={() => setIsDarkMode(!isDarkMode)} />} />
          <Route path="/admin/logs" element={<ActivityLogs isDarkMode={isDarkMode} onThemeToggle={() => setIsDarkMode(!isDarkMode)} />} />
          <Route path="/admin/settings" element={<AdminSettings isDarkMode={isDarkMode} onThemeToggle={() => setIsDarkMode(!isDarkMode)} />} />
          <Route path="/admin/resources/upload" element={<UploadResources isDarkMode={isDarkMode} onThemeToggle={() => setIsDarkMode(!isDarkMode)} isAdmin={true} />} />
          <Route path="/teacher" element={<TeacherDashboard isDarkMode={isDarkMode} onThemeToggle={() => setIsDarkMode(!isDarkMode)} />} />
          <Route path="/teacher/lessons" element={<LessonPlansList isDarkMode={isDarkMode} onThemeToggle={() => setIsDarkMode(!isDarkMode)} />} />
          <Route path="/teacher/resources" element={<MyResources isDarkMode={isDarkMode} onThemeToggle={() => setIsDarkMode(!isDarkMode)} />} />
          <Route path="/teacher/resources/upload" element={<UploadResources isDarkMode={isDarkMode} onThemeToggle={() => setIsDarkMode(!isDarkMode)} />} />
          <Route path="/teacher/settings" element={<TeacherSettings isDarkMode={isDarkMode} onThemeToggle={() => setIsDarkMode(!isDarkMode)} />} />
          <Route path="/teacher/content" element={<ContentGeneration isDarkMode={isDarkMode} onThemeToggle={() => setIsDarkMode(!isDarkMode)} />} />
          <Route path="/teacher/content/notes" element={<GenerateNotes isDarkMode={isDarkMode} onThemeToggle={() => setIsDarkMode(!isDarkMode)} />} />
          <Route path="/teacher/content/lesson-plans" element={<GenerateLessonPlans isDarkMode={isDarkMode} onThemeToggle={() => setIsDarkMode(!isDarkMode)} />} />
          <Route path="/teacher/content/presentations" element={<GeneratePresentations isDarkMode={isDarkMode} onThemeToggle={() => setIsDarkMode(!isDarkMode)} />} />
          <Route path="/teacher/content/question-sets" element={<GenerateQuestionSets isDarkMode={isDarkMode} onThemeToggle={() => setIsDarkMode(!isDarkMode)} />} />
          <Route path="/teacher/content/flashcards" element={<GenerateFlashcards isDarkMode={isDarkMode} onThemeToggle={() => setIsDarkMode(!isDarkMode)} />} />
          <Route path="/teacher/content/question-sets/results" element={<QuestionSetResults isDarkMode={isDarkMode} onThemeToggle={() => setIsDarkMode(!isDarkMode)} />} />
          <Route path="/teacher/content/flashcards/results" element={<FlashcardsResults isDarkMode={isDarkMode} onThemeToggle={() => setIsDarkMode(!isDarkMode)} />} />
          <Route path="/teacher/content/lesson-plans/results" element={<LessonPlanResults isDarkMode={isDarkMode} onThemeToggle={() => setIsDarkMode(!isDarkMode)} />} />
          <Route path="/teacher/content/notes/results" element={<ClassNotesResults isDarkMode={isDarkMode} onThemeToggle={() => setIsDarkMode(!isDarkMode)} />} />
          <Route path="/teacher/content/presentations/results" element={<PresentationsResults isDarkMode={isDarkMode} onThemeToggle={() => setIsDarkMode(!isDarkMode)} />} />
          <Route path="/student/study-plan" element={<StudyPlan isDarkMode={isDarkMode} onThemeToggle={() => setIsDarkMode(!isDarkMode)} />} />
          <Route path="/student/tutoring" element={<AITutoring isDarkMode={isDarkMode} onThemeToggle={() => setIsDarkMode(!isDarkMode)} />} />
          <Route path="/student/quizzes" element={<QuizSimulation isDarkMode={isDarkMode} onThemeToggle={() => setIsDarkMode(!isDarkMode)} />} />
          <Route path="/student/quiz-results" element={<QuizResults isDarkMode={isDarkMode} onThemeToggle={() => setIsDarkMode(!isDarkMode)} />} />
          <Route path="/student" element={<StudentDashboard isDarkMode={isDarkMode} onThemeToggle={() => setIsDarkMode(!isDarkMode)} />} />
          <Route path="/student/settings" element={<StudentSettings isDarkMode={isDarkMode} onThemeToggle={() => setIsDarkMode(!isDarkMode)} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;