import { motion } from 'framer-motion';
import { Badge } from "@/components/ui/badge";
import { FileText, Settings, Share2 } from 'lucide-react';

interface StepProps {
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  delay: number;
}

function Step({ number, title, description, icon, gradient, delay }: StepProps) {
  return (
    <div className="flex flex-col items-center relative">
      <motion.div 
        className="relative w-full backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 rounded-2xl p-6 border border-white/20 dark:border-gray-800/50 shadow-lg overflow-hidden"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
        whileHover={{ y: -5, transition: { duration: 0.2 } }}
      >
        {/* Decorative gradient blob */}
        <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full bg-gradient-to-br ${gradient} opacity-10 blur-xl`}></div>
        
        <div className="flex flex-col items-center text-center relative z-10">
          <div className="relative mb-5">
            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg transform -rotate-3`}>
              <div className="w-full h-full rounded-2xl bg-white/10 dark:bg-black/10 flex items-center justify-center backdrop-blur-sm">
                {icon}
              </div>
            </div>
            <div className="absolute -top-3 -right-3 w-9 h-9 rounded-full bg-white dark:bg-gray-900 shadow-md flex items-center justify-center text-sm font-bold border-2 border-gray-100 dark:border-gray-800">
              <span className={`bg-gradient-to-br ${gradient} bg-clip-text text-transparent font-bold text-lg`}>{number}</span>
            </div>
          </div>
          
          <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{title}</h3>
          <p className="text-gray-600 dark:text-gray-400">{description}</p>
        </div>
      </motion.div>
    </div>
  );
}

export default function HowItWorks() {
  const steps = [
    {
      number: 1,
      title: "Specify Your Requirements",
      description: "Select your class (7-12), subject, and specific CBSE topic. Choose the type of content you need - lesson plan, notes, assessments, or activities.",
      icon: <Settings className="w-8 h-8 text-white" />,
      gradient: "from-blue-400 to-indigo-600 dark:from-blue-500 dark:to-indigo-700",
      delay: 0.1
    },
    {
      number: 2,
      title: "Review & Customize AI-Generated Content",
      description: "Our AI instantly creates CBSE-aligned materials following National Education Policy guidelines that you can edit and customize to your preferences.",
      icon: <FileText className="w-8 h-8 text-white" />,
      gradient: "from-indigo-400 to-purple-600 dark:from-indigo-500 dark:to-purple-700",
      delay: 0.2
    },
    {
      number: 3,
      title: "Use, Save & Share",
      description: "Download your materials in various formats, save them to your library, or share directly with colleagues.",
      icon: <Share2 className="w-8 h-8 text-white" />,
      gradient: "from-purple-400 to-pink-600 dark:from-purple-500 dark:to-pink-700",
      delay: 0.3
    }
  ];

  return (
    <section className="w-full py-20 lg:py-28 relative overflow-hidden" id="how-it-works">
      {/* Background with subtle patterns */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern opacity-[0.03] dark:opacity-[0.05]"></div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-40 right-20 w-64 h-64 rounded-full bg-blue-400/5 dark:bg-blue-600/5 blur-3xl"></div>
      <div className="absolute bottom-40 left-20 w-80 h-80 rounded-full bg-indigo-400/5 dark:bg-indigo-600/5 blur-3xl"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          className="flex flex-col items-center text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 font-medium mb-4">
            Simple Process
          </Badge>
          <motion.h2 
            className="text-4xl md:text-5xl font-bold tracking-tight mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <span className="bg-gradient-to-r from-gray-900 to-gray-700 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">How TeachAssistPro Works</span>
          </motion.h2>
          <motion.p 
            className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Experience the simplicity of AI-powered teaching assistance for CBSE curriculum in three easy steps.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {steps.map((step) => (
            <Step 
              key={step.number} 
              {...step}
            />
          ))}
        </div>
        
        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <motion.a
            href="/signup"
            className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            Try It Now <span className="ml-2">→</span>
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
