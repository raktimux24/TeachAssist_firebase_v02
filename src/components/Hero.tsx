import React from 'react';
import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center py-20 px-4">
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gray-900/60"></div>
      </div>
      
      <div className="relative z-10 max-w-4xl mx-auto text-center text-white">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
          Empower Your Teaching with AI-Powered Innovation
        </h1>
        <p className="text-xl md:text-2xl mb-8 text-gray-200">
          Streamline your content creation & enhance student learning with TeachAssist
        </p>
        <Link 
          to="/signup"
          className="inline-block px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-full text-lg font-semibold transition-colors"
        >
          Get Started
        </Link>
      </div>
    </section>
  );
}