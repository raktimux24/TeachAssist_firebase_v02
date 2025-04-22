import { motion, useScroll, useSpring } from 'framer-motion';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import { CTASection } from '@/components/CTASection';
import Footer from '@/components/Footer';
import HowItWorks from '@/components/HowItWorks';
import TeacherSuccessStories from '@/components/TeacherSuccessStories';
import Pricing from '@/components/Pricing';
import FAQ from '@/components/FAQ';
import LimitedTimeOffer from '@/components/LimitedTimeOffer';
import TrustIndicators from '@/components/TrustIndicators';
import { Home, LayoutGrid, Info, FileText, Contact, Shield, Cookie, ArrowUp } from 'lucide-react';

export default function LandingPage() {
  // Scroll progress indicator
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Animation variants for sections
  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };
  
  // Default footer props
  const footerProps = {
    brand: {
      name: "TeachAssist Pro",
      description: "Empowering CBSE educators with AI-powered teaching tools designed specifically for classes 7-12."
    },
    socialLinks: [
      { name: "Facebook", href: "#" },
      { name: "Twitter", href: "#" },
      { name: "Instagram", href: "#" },
      { name: "LinkedIn", href: "#" }
    ],
    columns: [
      {
        title: "Quick Links",
        links: [
          { name: "Home", Icon: Home, href: "#hero" },
          { name: "Features", Icon: LayoutGrid, href: "#features" },
          { name: "How It Works", Icon: Info, href: "#how-it-works" },
          { name: "Testimonials", Icon: FileText, href: "#testimonials" },
          { name: "Pricing", Icon: FileText, href: "#pricing" },
          { name: "FAQ", Icon: FileText, href: "#faq" }
        ]
      },
      {
        title: "Resources",
        links: [
          { name: "CBSE Curriculum", Icon: FileText, href: "#" },
          { name: "Teacher Resources", Icon: FileText, href: "#" },
          { name: "Blog", Icon: FileText, href: "#" },
          { name: "Support", Icon: Contact, href: "#contact" }
        ]
      },
      {
        title: "Legal",
        links: [
          { name: "Privacy Policy", Icon: Shield, href: "#" },
          { name: "Terms of Service", Icon: FileText, href: "#" },
          { name: "Cookie Policy", Icon: Cookie, href: "#" }
        ]
      }
    ]
  };

  return (
    <div className="flex flex-col min-h-screen relative">
      {/* Scroll progress indicator */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 z-50"
        style={{ scaleX, transformOrigin: "0%" }}
      />
      
      <main>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={sectionVariants}
        >
          <Hero />
        </motion.div>
        
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={sectionVariants}
        >
          <Features />
        </motion.div>
        
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={sectionVariants}
        >
          <HowItWorks />
        </motion.div>
        
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={sectionVariants}
        >
          <TeacherSuccessStories />
        </motion.div>
        
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={sectionVariants}
        >
          <Pricing />
        </motion.div>
        
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={sectionVariants}
        >
          <FAQ />
        </motion.div>
        
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={sectionVariants}
        >
          <LimitedTimeOffer />
        </motion.div>
        
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={sectionVariants}
        >
          <TrustIndicators />
        </motion.div>
        
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={sectionVariants}
        >
          <CTASection />
        </motion.div>
      </main>
      
      <Footer {...footerProps} />
      
      {/* Scroll to top button */}
      <motion.button
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 p-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg z-40"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <ArrowUp className="w-5 h-5" />
      </motion.button>
    </div>
  );
}
