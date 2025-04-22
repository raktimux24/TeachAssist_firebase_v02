import { motion } from 'framer-motion';
import { Badge } from "@/components/ui/badge";
import { Users, BookOpen, Award, CheckCircle } from 'lucide-react';

interface StatisticProps {
  icon: React.ReactNode;
  text: string;
  color: string;
  index: number;
}

function Statistic({ icon, text, color, index }: StatisticProps) {
  return (
    <motion.div 
      className="relative overflow-hidden rounded-xl backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 shadow-md border border-white/20 dark:border-gray-800/50 px-4 py-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      {/* Decorative gradient blob */}
      <div className={`absolute -top-10 -left-10 w-24 h-24 rounded-full bg-gradient-to-br ${color} opacity-10 blur-xl`}></div>
      
      <div className="flex items-center space-x-4 relative z-10">
        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center shadow-md flex-shrink-0`}>
          {icon}
        </div>
        <p className="text-gray-800 dark:text-gray-200 font-medium">{text}</p>
      </div>
    </motion.div>
  );
}

export default function TrustIndicators() {
  const statistics = [
    {
      icon: <Users className="w-6 h-6 text-white" />,
      text: "Serving CBSE Teachers Across India",
      color: "from-blue-400 to-blue-600 dark:from-blue-500 dark:to-blue-700"
    },
    {
      icon: <BookOpen className="w-6 h-6 text-white" />,
      text: "Supporting Classes 7-12 Curriculum",
      color: "from-indigo-400 to-indigo-600 dark:from-indigo-500 dark:to-indigo-700"
    },
    {
      icon: <Award className="w-6 h-6 text-white" />,
      text: "Aligned with National Education Policy",
      color: "from-purple-400 to-purple-600 dark:from-purple-500 dark:to-purple-700"
    },
    {
      icon: <CheckCircle className="w-6 h-6 text-white" />,
      text: "NCERT & CBSE Approved Materials",
      color: "from-emerald-400 to-emerald-600 dark:from-emerald-500 dark:to-emerald-700"
    }
  ];

  return (
    <section className="w-full py-12 relative overflow-hidden" id="trust">
      {/* Background with subtle patterns */}
      <div className="absolute inset-0 bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
        <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern opacity-[0.03] dark:opacity-[0.05]"></div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-40 h-40 rounded-full bg-blue-400/5 dark:bg-blue-600/5 blur-3xl"></div>
      <div className="absolute bottom-10 right-10 w-40 h-40 rounded-full bg-indigo-400/5 dark:bg-indigo-600/5 blur-3xl"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          className="flex flex-col items-center text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 font-medium mb-3">
            Trust
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight mb-2">
            <span className="bg-gradient-to-r from-gray-900 to-gray-700 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">Trusted by CBSE Educators</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto mb-10">
          {statistics.map((stat, index) => (
            <Statistic key={index} {...stat} index={index} />
          ))}
        </div>

        <motion.div 
          className="flex flex-col items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <p className="text-base font-medium text-gray-900 dark:text-white mb-4">
            As Featured In
          </p>
          <div className="flex flex-wrap justify-center items-center gap-6 backdrop-blur-sm bg-white/50 dark:bg-gray-900/50 rounded-xl p-4 border border-white/20 dark:border-gray-800/30">
            {/* Placeholder for logos - replace with actual logos */}
            <motion.div 
              className="h-8 w-24 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-md"
              whileHover={{ scale: 1.05 }}
            ></motion.div>
            <motion.div 
              className="h-8 w-32 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-md"
              whileHover={{ scale: 1.05 }}
            ></motion.div>
            <motion.div 
              className="h-8 w-28 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-md"
              whileHover={{ scale: 1.05 }}
            ></motion.div>
            <motion.div 
              className="h-8 w-24 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-md"
              whileHover={{ scale: 1.05 }}
            ></motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
