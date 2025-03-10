import React, { useState } from 'react';
import StudentLayout from '../../components/student/StudentLayout';
import QuizSetup from '../../components/student/quiz/QuizSetup';
import QuizInterface from '../../components/student/quiz/QuizInterface';

interface QuizSimulationProps {
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

export default function QuizSimulation({ isDarkMode, onThemeToggle }: QuizSimulationProps) {
  const [isSimulationStarted, setIsSimulationStarted] = useState(false);
  const [quizConfig, setQuizConfig] = useState({
    class: '',
    subject: '',
    chapters: [] as string[],
  });

  const handleStartSimulation = (config: typeof quizConfig) => {
    setQuizConfig(config);
    setIsSimulationStarted(true);
  };

  return (
    <StudentLayout isDarkMode={isDarkMode} onThemeToggle={onThemeToggle}>
      <div className="min-h-[calc(100vh-4rem)]">
        {!isSimulationStarted ? (
          <QuizSetup onStart={handleStartSimulation} />
        ) : (
          <QuizInterface config={quizConfig} />
        )}
      </div>
    </StudentLayout>
  );
}