import { motion } from 'framer-motion';
import { BookOpen, Layout, FileText, Presentation, Brain, Target, Award, MessageCircle, Compass, Check, Clock, FileSpreadsheet, Sparkles } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

interface FeatureItemProps {
  title: string;
  description: string;
  bulletPoints?: string[];
  icon?: React.ReactNode;
  index: number;
  gradient: string;
}

function FeatureItem({ title, description, bulletPoints, icon, index, gradient }: FeatureItemProps) {
  return (
    <motion.div 
      className="relative backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 rounded-xl border border-white/20 dark:border-gray-800/50 shadow-md p-6 overflow-hidden h-full"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      {/* Decorative gradient blob */}
      <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full bg-gradient-to-br ${gradient} opacity-10 blur-xl`}></div>
      
      <div className="relative z-10">
        {/* Icon with gradient background */}
        <div className="mb-5">
          <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md`}>
            {icon || <Check className="w-5 h-5 text-white" />}
          </div>
        </div>
        
        {/* Title with gradient text */}
        <h3 className="font-bold text-gray-900 dark:text-gray-100 text-xl mb-3">
          <span className={`bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>{title}</span>
        </h3>
        
        {/* Description */}
        <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-4">
          {description}
        </p>
        
        {/* Bullet points */}
        {bulletPoints && bulletPoints.length > 0 && (
          <ul className="space-y-2">
            {bulletPoints.map((point, idx) => (
              <motion.li 
                key={idx} 
                className="flex items-start gap-2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: (index * 0.1) + (idx * 0.05) + 0.3 }}
                whileHover={{ x: 3 }}
              >
                <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  <Check className="w-3 h-3 text-white" />
                </div>
                <span className="text-gray-700 dark:text-gray-300 text-sm">{point}</span>
              </motion.li>
            ))}
          </ul>
        )}
      </div>
    </motion.div>
  );
}

// Define gradients for each feature
const featureGradients = [
  'from-blue-400 to-indigo-600 dark:from-blue-500 dark:to-indigo-700',
  'from-indigo-400 to-purple-600 dark:from-indigo-500 dark:to-purple-700',
  'from-purple-400 to-pink-600 dark:from-purple-500 dark:to-pink-700',
  'from-pink-400 to-red-600 dark:from-pink-500 dark:to-red-700',
  'from-emerald-400 to-teal-600 dark:from-emerald-500 dark:to-teal-700',
  'from-amber-400 to-orange-600 dark:from-amber-500 dark:to-orange-700'
];

const TeacherFeatures = [
  {
    title: 'AI-Powered Lesson Creation',
    description: 'Generate complete, CBSE-aligned lesson plans in seconds. Customize by class (7-12), subject, and difficulty level to perfectly match your teaching context.',
    bulletPoints: [
      'National Education Policy compliant',
      'Adjustable complexity levels',
      'Structured learning outcomes'
    ],
    icon: <FileText className="w-5 h-5 text-white" />
  },
  {
    title: 'Smart Assessment Creation',
    description: 'Create diverse question sets, quizzes, and tests that perfectly match CBSE curriculum requirements for classes 7-12.',
    bulletPoints: [
      'Multiple question formats',
      'Automatic answer keys',
      'Difficulty level customization'
    ],
    icon: <Target className="w-5 h-5 text-white" />
  },
  {
    title: 'Resource Integration & Enhancement',
    description: 'Upload existing materials and transform them into interactive, engaging content. Extract and enhance content from CBSE textbooks and documents.',
    bulletPoints: [
      'Document parsing and enhancement',
      'Content modernization',
      'Format conversion'
    ],
    icon: <FileSpreadsheet className="w-5 h-5 text-white" />
  },
  {
    title: 'Engaging Classroom Materials',
    description: 'Create interactive flashcards, visual aids, and classroom activities that capture student attention and improve knowledge retention.',
    bulletPoints: [
      'Interactive exercises',
      'Visual learning aids',
      'Engagement-focused activities'
    ],
    icon: <Presentation className="w-5 h-5 text-white" />
  },
  {
    title: 'Time-Saving Teaching Tools',
    description: 'Streamline administrative tasks, create teaching notes, and organize your educational resources efficiently in one place.',
    bulletPoints: [
      'Lecture notes generation',
      'Content organization system',
      'Quick-access resource library'
    ],
    icon: <Clock className="w-5 h-5 text-white" />
  },
  {
    title: 'Curriculum Alignment Assistant',
    description: 'Ensure your teaching materials perfectly match CBSE standards and National Education Policy guidelines with our intelligent alignment tools.',
    bulletPoints: [
      'Standard-specific content',
      'Learning objective mapping',
      'Syllabus coverage tracking'
    ],
    icon: <BookOpen className="w-5 h-5 text-white" />
  },
];



export default function Features() {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };
  
  return (
    <section className="w-full py-20 lg:py-28 relative overflow-hidden" id="features">
      {/* Background with subtle patterns */}
      <div className="absolute inset-0 bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
        <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern opacity-[0.03] dark:opacity-[0.05]"></div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-40 left-20 w-64 h-64 rounded-full bg-blue-400/5 dark:bg-blue-600/5 blur-3xl"></div>
      <div className="absolute bottom-40 right-20 w-80 h-80 rounded-full bg-indigo-400/5 dark:bg-indigo-600/5 blur-3xl"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Teachers Section */}
        <motion.div 
          className="flex flex-col items-center text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-4">
            <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 font-medium">
              For CBSE Teachers
            </Badge>
          </div>
          <motion.div 
            className="flex gap-4 flex-col"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              <span className="bg-gradient-to-r from-gray-900 to-gray-700 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">Empower Your Teaching Journey</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Transform your teaching experience with AI-powered tools designed specifically for CBSE educators teaching classes 7-12, following National Education Policy guidelines.
            </p>
          </motion.div>
          
          {/* Sparkle icon */}
          <motion.div 
            className="mt-8 mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.5 }}
            whileHover={{ rotate: 15 }}
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 dark:from-blue-500 dark:to-indigo-700 flex items-center justify-center shadow-lg mx-auto">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </motion.div>
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {TeacherFeatures.map((feature, index) => (
            <FeatureItem 
              key={feature.title} 
              {...feature} 
              index={index}
              gradient={featureGradients[index % featureGradients.length]}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}