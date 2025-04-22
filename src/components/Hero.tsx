import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MoveRight, PhoneCall, CheckCircle, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Hero() {
  const [titleNumber, setTitleNumber] = useState(0);
  const titles = useMemo(
    () => ["innovative", "engaging", "personalized", "effective", "CBSE-aligned"],
    []
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (titleNumber === titles.length - 1) {
        setTitleNumber(0);
      } else {
        setTitleNumber(titleNumber + 1);
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  // Animation for floating elements
  const floatingAnimation = {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      repeatType: "loop" as const
    }
  };

  return (
    <section className="w-full min-h-screen relative overflow-hidden" id="hero">
      {/* Background with gradient and pattern */}
      <div className="absolute inset-0 bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
        <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern opacity-[0.03] dark:opacity-[0.05]"></div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-40 left-20 w-64 h-64 rounded-full bg-blue-400/5 dark:bg-blue-600/5 blur-3xl"></div>
      <div className="absolute bottom-40 right-20 w-80 h-80 rounded-full bg-indigo-400/5 dark:bg-indigo-600/5 blur-3xl"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          className="flex gap-8 py-20 lg:py-40 items-center justify-center flex-col"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div className="flex gap-4 flex-col max-w-4xl" variants={itemVariants}>
            {/* Floating sparkle */}
            <motion.div 
              className="absolute top-20 right-1/4 text-yellow-400 dark:text-yellow-300"
              animate={floatingAnimation}
            >
              <Sparkles className="w-6 h-6" />
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl tracking-tighter text-center font-regular">
              <span className="bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">Transform teaching with</span>
              <span className="relative flex w-full justify-center overflow-hidden text-center md:pb-4 md:pt-1">
                &nbsp;
                {titles.map((title, index) => (
                  <motion.span
                    key={index}
                    className="absolute font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-400 dark:to-indigo-500 bg-clip-text text-transparent"
                    initial={{ opacity: 0, y: "-100" }}
                    transition={{ type: "spring", stiffness: 50 }}
                    animate={
                      titleNumber === index
                        ? {
                            y: 0,
                            opacity: 1,
                          }
                        : {
                            y: titleNumber > index ? -150 : 150,
                            opacity: 0,
                          }
                    }
                  >
                    {title}
                  </motion.span>
                ))}
              </span>
              <span className="bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent"> content</span>
            </h1>

            <p className="text-lg md:text-xl leading-relaxed tracking-tight text-gray-600 dark:text-gray-300 max-w-3xl mx-auto text-center mt-6 backdrop-blur-sm bg-white/30 dark:bg-gray-900/30 p-4 rounded-xl border border-white/20 dark:border-gray-800/30">
              Streamline your content creation & enhance student learning with AI-powered tools designed specifically for CBSE educators teaching classes 7-12.
            </p>
          </motion.div>
          
          <motion.div 
            className="flex flex-col md:flex-row gap-4 mt-6"
            variants={itemVariants}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                size="lg" 
                className="gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-600 dark:hover:from-blue-600 dark:hover:to-indigo-700 text-white border-0 shadow-md hover:shadow-lg py-6 px-8 text-lg font-medium rounded-xl"
              >
                <Zap className="w-5 h-5 mr-1" />
                Start Free Trial <MoveRight className="w-4 h-4 ml-1" />
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                size="lg" 
                variant="outline"
                className="gap-2 backdrop-blur-sm bg-white/90 dark:bg-gray-800/90 text-blue-600 dark:text-blue-400 border-white/20 dark:border-gray-700/50 hover:bg-white dark:hover:bg-gray-800 shadow-md py-6 px-8 text-lg font-medium rounded-xl"
              >
                Schedule a Demo <PhoneCall className="w-4 h-4 ml-1" />
              </Button>
            </motion.div>
          </motion.div>
          
          <motion.div 
            className="mt-12 flex flex-wrap justify-center max-w-3xl"
            variants={itemVariants}
          >
            <motion.div 
              className="m-2 backdrop-blur-md bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-blue-600/20 dark:to-indigo-600/20 p-4 rounded-2xl border-l-4 border-blue-500 dark:border-blue-400 shadow-lg overflow-hidden relative group"
              whileHover={{ scale: 1.03, y: -5 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <div className="absolute -right-2 -top-2 w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full opacity-20 group-hover:opacity-30 transition-opacity"></div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <span className="text-gray-800 dark:text-gray-200 font-medium">CBSE curriculum aligned for classes 7-12</span>
              </div>
            </motion.div>
            
            <motion.div 
              className="m-2 backdrop-blur-md bg-gradient-to-br from-purple-500/10 to-pink-500/10 dark:from-purple-600/20 dark:to-pink-600/20 p-4 rounded-2xl border-l-4 border-purple-500 dark:border-purple-400 shadow-lg overflow-hidden relative group"
              whileHover={{ scale: 1.03, y: -5 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <div className="absolute -right-2 -top-2 w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full opacity-20 group-hover:opacity-30 transition-opacity"></div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg shadow-md">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <span className="text-gray-800 dark:text-gray-200 font-medium">Create lesson plans in seconds</span>
              </div>
            </motion.div>
            
            <motion.div 
              className="m-2 backdrop-blur-md bg-gradient-to-br from-emerald-500/10 to-teal-500/10 dark:from-emerald-600/20 dark:to-teal-600/20 p-4 rounded-2xl border-l-4 border-emerald-500 dark:border-emerald-400 shadow-lg overflow-hidden relative group"
              whileHover={{ scale: 1.03, y: -5 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <div className="absolute -right-2 -top-2 w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full opacity-20 group-hover:opacity-30 transition-opacity"></div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg shadow-md">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <span className="text-gray-800 dark:text-gray-200 font-medium">Generate assessments & activities</span>
              </div>
            </motion.div>
            
            <motion.div 
              className="m-2 backdrop-blur-md bg-gradient-to-br from-amber-500/10 to-orange-500/10 dark:from-amber-600/20 dark:to-orange-600/20 p-4 rounded-2xl border-l-4 border-amber-500 dark:border-amber-400 shadow-lg overflow-hidden relative group"
              whileHover={{ scale: 1.03, y: -5 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <div className="absolute -right-2 -top-2 w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full opacity-20 group-hover:opacity-30 transition-opacity"></div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg shadow-md">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <span className="text-gray-800 dark:text-gray-200 font-medium">National Education Policy compliant</span>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}