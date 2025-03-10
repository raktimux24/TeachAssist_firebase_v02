import React from 'react';
import { Link } from 'react-router-dom';

interface CTAProps {
  title: string;
  description: string;
  buttonText: string;
  imageSrc: string;
}

function CTABlock({ title, description, buttonText, imageSrc }: CTAProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${imageSrc})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gray-900/70"></div>
      </div>
      
      <div className="relative z-10 p-8 md:p-12">
        <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">{title}</h3>
        <p className="text-gray-200 mb-6 max-w-lg">{description}</p>
        <Link
          to="/signup"
          className="inline-block px-6 py-3 bg-white text-primary-600 hover:bg-gray-100 rounded-full font-semibold transition-colors"
        >
          {buttonText}
        </Link>
      </div>
    </div>
  );
}

export default function CTASection() {
  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 space-y-8">
        <CTABlock
          title="Empower Your Classroom"
          description="Unlock smart content generation, resource management, and AI-driven teaching tools designed just for educators."
          buttonText="Start Teaching"
          imageSrc="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80"
        />
        
        <CTABlock
          title="Enhance Your Learning"
          description="Discover personalized study plans, interactive quizzes, and AI tutoring support to boost your academic performance."
          buttonText="Join as Student"
          imageSrc="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80"
        />
      </div>
    </section>
  );
}