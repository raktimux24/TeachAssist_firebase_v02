import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from "@/components/ui/badge";
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  toggleOpen: () => void;
  index: number;
}

function FAQItem({ question, answer, isOpen, toggleOpen, index }: FAQItemProps) {
  return (
    <motion.div 
      className="mb-4 overflow-hidden relative backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 rounded-xl border border-white/20 dark:border-gray-800/50 shadow-md"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      {/* Decorative gradient blob */}
      <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-gradient-to-br from-blue-400/10 to-indigo-500/10 dark:from-blue-500/10 dark:to-indigo-600/10 blur-xl"></div>
      
      <motion.button
        className="flex justify-between items-center w-full text-left p-5 relative z-10"
        onClick={toggleOpen}
        whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
        whileTap={{ scale: 0.99 }}
      >
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-600 dark:from-blue-500 dark:to-indigo-700 flex items-center justify-center shadow-md mr-4 flex-shrink-0">
            <HelpCircle className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">{question}</h3>
        </div>
        <div className="text-blue-600 dark:text-blue-400 ml-2 flex-shrink-0">
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </div>
      </motion.button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="px-5 pb-5 text-gray-600 dark:text-gray-400 text-base leading-relaxed relative z-10"
            initial={{ height: 0, opacity: 0, marginTop: 0 }}
            animate={{ height: 'auto', opacity: 1, marginTop: 8 }}
            exit={{ height: 0, opacity: 0, marginTop: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="pl-12">{answer}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQ() {
  const faqs = [
    {
      question: "How does TeachAssistPro align with CBSE curriculum?",
      answer: "TeachAssistPro is specifically designed for CBSE educators teaching classes 7-12, with built-in alignment to the latest curriculum guidelines and National Education Policy framework. Our AI tools create content that precisely matches the CBSE syllabus, ensuring complete compliance with educational standards."
    },
    {
      question: "Do I need to be tech-savvy to use TeachAssistPro?",
      answer: "Not at all! TeachAssistPro is designed with simplicity in mind. Our intuitive interface requires no technical expertise, and we provide step-by-step tutorials to help you get started. If you can use a smartphone or basic computer, you can use TeachAssistPro effectively."
    },
    {
      question: "Can I use TeachAssistPro on my mobile device?",
      answer: "Yes! TeachAssistPro works seamlessly on smartphones and tablets, allowing you to create content on-the-go. Our mobile-responsive design ensures a smooth experience regardless of device, though some advanced customization features work best on larger screens."
    },
    {
      question: "How much time can I actually save using TeachAssistPro?",
      answer: "Most teachers report saving 40-60% of their preparation time with TeachAssistPro. This typically translates to 5-10 hours per week that can be redirected to student interaction, personalized teaching, or achieving better work-life balance."
    },
    {
      question: "How do I create a lesson plan using TeachAssistPro?",
      answer: "Creating a lesson plan is simple: Select the class (7-12), subject, and specific topic from the CBSE curriculum. Our AI generates a complete lesson plan with objectives, teaching methodologies, activities, assessments, and resources. You can then customize any section to match your teaching style and student needs before downloading or saving to your library."
    },
    {
      question: "What types of questions can TeachAssistPro generate?",
      answer: "TeachAssistPro generates a wide variety of questions aligned with CBSE assessment patterns, including multiple-choice, short answer, long answer, fill-in-the-blanks, true/false, match the following, case studies, and application-based questions. You can specify the difficulty level, cognitive domains, and even include diagrams or visual elements."
    }
  ];

  const [openIndex, setOpenIndex] = useState(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <section className="w-full py-20 lg:py-28 relative overflow-hidden" id="faq">
      {/* Background with subtle patterns */}
      <div className="absolute inset-0 bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
        <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern opacity-[0.03] dark:opacity-[0.05]"></div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-40 left-20 w-64 h-64 rounded-full bg-blue-400/5 dark:bg-blue-600/5 blur-3xl"></div>
      <div className="absolute bottom-40 right-20 w-80 h-80 rounded-full bg-indigo-400/5 dark:bg-indigo-600/5 blur-3xl"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          className="flex flex-col items-center text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 font-medium mb-4">
            Support
          </Badge>
          <motion.h2 
            className="text-4xl md:text-5xl font-bold tracking-tight mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <span className="bg-gradient-to-r from-gray-900 to-gray-700 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">Frequently Asked Questions</span>
          </motion.h2>
          <motion.p 
            className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Get answers to common questions about TeachAssistPro for CBSE educators
          </motion.p>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              toggleOpen={() => toggleFAQ(index)}
              index={index}
            />
          ))}
        </div>
        
        <motion.div 
          className="mt-10 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <motion.a
            href="/contact"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            Have more questions? Contact us
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
