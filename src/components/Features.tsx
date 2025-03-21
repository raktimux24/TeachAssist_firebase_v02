import React from 'react';
import { BookOpen, Layout, FileText, Presentation, Brain, Target, Award, MessageCircle, Compass, Check } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

interface FeatureItemProps {
  title: string;
  description: string;
}

function FeatureItem({ title, description }: FeatureItemProps) {
  return (
    <div className="flex flex-row gap-6 items-start">
      <Check className="w-4 h-4 mt-2 text-blue-600 dark:text-blue-400" />
      <div className="flex flex-col gap-1">
        <p className="font-semibold text-gray-900 dark:text-gray-100">{title}</p>
        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}

const TeacherFeatures = [
  {
    title: 'Smart Content Generation',
    description: 'Automatically generate curriculum-aligned question sets and lesson plans',
  },
  {
    title: 'Lesson Planning',
    description: 'Create detailed lesson plans customized by class, subject, and difficulty',
  },
  {
    title: 'Resource Integration',
    description: 'Upload and extract content from external documents seamlessly',
  },
  {
    title: 'Teaching Resources',
    description: 'Access interactive flashcards and smart class notes',
  },
];

const StudentFeatures = [
  {
    title: 'Personalized Study Plans',
    description: 'AI-generated learning pathways tailored to your needs',
  },
  {
    title: 'Self-Assessment Tools',
    description: 'Interactive quizzes with instant feedback',
  },
  {
    title: 'Exam Preparation',
    description: 'Realistic exam simulations with performance analysis',
  },
  {
    title: 'Interactive Assistance',
    description: '24/7 AI tutoring support for real-time help',
  },
  {
    title: 'Career Guidance',
    description: 'Personalized academic and career advice',
  },
];

export default function Features() {
  return (
    <section className="w-full py-20 lg:py-40 bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4">
        {/* Teachers Section */}
        <div className="flex gap-6 py-20 flex-col items-start">
          <div>
            <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 font-medium">
              For Teachers
            </Badge>
          </div>
          <div className="flex gap-4 flex-col">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
              Empower Your Teaching
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl leading-relaxed">
              Transform your teaching experience with AI-powered tools and resources designed specifically for educators.
            </p>
          </div>
          <div className="flex gap-12 pt-16 flex-col w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 items-start lg:grid-cols-2 gap-x-12 gap-y-8">
              {TeacherFeatures.map((feature) => (
                <FeatureItem key={feature.title} {...feature} />
              ))}
            </div>
          </div>
        </div>

        {/* Students Section */}
        <div className="flex gap-6 py-20 flex-col items-start">
          <div>
            <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 font-medium">
              For Students
            </Badge>
          </div>
          <div className="flex gap-4 flex-col">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
              Enhance Your Learning
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl leading-relaxed">
              Take control of your educational journey with personalized learning tools and AI-powered assistance.
            </p>
          </div>
          <div className="flex gap-12 pt-16 flex-col w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 items-start lg:grid-cols-3 gap-x-12 gap-y-8">
              {StudentFeatures.map((feature) => (
                <FeatureItem key={feature.title} {...feature} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}