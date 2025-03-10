import React from 'react';
import { BookOpen, Layout, FileText, Presentation, Brain, Target, Award, MessageCircle, Compass } from 'lucide-react';

const TeacherFeatures = [
  {
    icon: BookOpen,
    title: 'Smart Content Generation',
    description: 'Automatically generate curriculum-aligned question sets and lesson plans',
  },
  {
    icon: Layout,
    title: 'Lesson Planning',
    description: 'Create detailed lesson plans customized by class, subject, and difficulty',
  },
  {
    icon: FileText,
    title: 'Resource Integration',
    description: 'Upload and extract content from external documents seamlessly',
  },
  {
    icon: Presentation,
    title: 'Teaching Resources',
    description: 'Access interactive flashcards and smart class notes',
  },
];

const StudentFeatures = [
  {
    icon: Brain,
    title: 'Personalized Study Plans',
    description: 'AI-generated learning pathways tailored to your needs',
  },
  {
    icon: Target,
    title: 'Self-Assessment Tools',
    description: 'Interactive quizzes with instant feedback',
  },
  {
    icon: Award,
    title: 'Exam Preparation',
    description: 'Realistic exam simulations with performance analysis',
  },
  {
    icon: MessageCircle,
    title: 'Interactive Assistance',
    description: '24/7 AI tutoring support for real-time help',
  },
  {
    icon: Compass,
    title: 'Career Guidance',
    description: 'Personalized academic and career advice',
  },
];

function FeatureCard({ icon: Icon, title, description }: { icon: any; title: string; description: string }) {
  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
      <Icon className="w-12 h-12 text-primary-600 dark:text-primary-400 mb-4" />
      <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  );
}

export default function Features() {
  return (
    <section id="features" className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-gray-900 dark:text-white">
            For Teachers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {TeacherFeatures.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-gray-900 dark:text-white">
            For Students
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {StudentFeatures.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}