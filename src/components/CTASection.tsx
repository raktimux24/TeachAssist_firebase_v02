import { motion } from "framer-motion";
import { Play, Sparkles, Zap, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function CTASection() {
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

  const buttonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.98 }
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
    <section className="w-full py-20 lg:py-32 relative overflow-hidden" id="cta">
      {/* Background with gradient and pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40">
        <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern opacity-[0.03] dark:opacity-[0.05]"></div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-40 left-20 w-64 h-64 rounded-full bg-blue-400/5 dark:bg-blue-600/5 blur-3xl"></div>
      <div className="absolute bottom-40 right-20 w-80 h-80 rounded-full bg-indigo-400/5 dark:bg-indigo-600/5 blur-3xl"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          className="relative backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 rounded-2xl p-10 lg:p-16 border border-white/20 dark:border-gray-800/50 shadow-xl overflow-hidden"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
        >
          {/* Decorative gradient blobs */}
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-gradient-to-br from-blue-400/20 to-indigo-500/20 dark:from-blue-500/20 dark:to-indigo-600/20 blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-br from-indigo-400/20 to-purple-500/20 dark:from-indigo-500/20 dark:to-purple-600/20 blur-3xl"></div>
          
          {/* Floating sparkles */}
          <motion.div 
            className="absolute top-10 right-10 text-yellow-400 dark:text-yellow-300"
            animate={floatingAnimation}
          >
            <Sparkles className="w-6 h-6" />
          </motion.div>
          
          <motion.div 
            className="absolute bottom-10 left-10 text-blue-400 dark:text-blue-300"
            animate={floatingAnimation}
            transition={{ delay: 1 }}
          >
            <Sparkles className="w-5 h-5" />
          </motion.div>
          
          <div className="flex flex-col text-center items-center relative z-10 gap-8">
            <motion.div variants={itemVariants}>
              <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-transparent px-4 py-1.5 text-sm font-medium">
                Join Today
              </Badge>
            </motion.div>
            
            <motion.div className="flex flex-col gap-4" variants={itemVariants}>
              <h3 className="text-3xl md:text-5xl tracking-tight max-w-2xl font-bold mb-2">
                <span className="bg-gradient-to-r from-gray-900 to-gray-700 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                  Ready to Transform Your CBSE Teaching Experience?
                </span>
              </h3>
              <p className="text-lg leading-relaxed tracking-tight text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Join CBSE teachers across India who are enhancing student engagement with TeachAssistPro's AI-powered tools.
              </p>
            </motion.div>
            
            <motion.div 
              className="flex flex-col md:flex-row gap-4 mt-2"
              variants={itemVariants}
            >
              <motion.div
                whileHover={buttonVariants.hover}
                whileTap={buttonVariants.tap}
              >
                <Button 
                  className="gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-600 dark:hover:from-blue-600 dark:hover:to-indigo-700 text-white border-0 shadow-md hover:shadow-lg py-6 px-8 text-lg font-medium rounded-xl" 
                >
                  <Zap className="w-5 h-5 mr-1" />
                  Start Your Free Trial
                  <ArrowRight className="w-5 h-5 ml-1" />
                </Button>
              </motion.div>
              
              <motion.div
                whileHover={buttonVariants.hover}
                whileTap={buttonVariants.tap}
              >
                <Button 
                  className="gap-2 backdrop-blur-sm bg-white/90 dark:bg-gray-800/90 text-blue-600 dark:text-blue-400 border-white/20 dark:border-gray-700/50 hover:bg-white dark:hover:bg-gray-800 shadow-md py-6 px-8 text-lg font-medium rounded-xl" 
                  variant="outline"
                >
                  <Play className="w-5 h-5 mr-1" />
                  See How It Works
                </Button>
              </motion.div>
            </motion.div>
            
            <motion.div 
              className="mt-4 backdrop-blur-sm bg-blue-50/50 dark:bg-blue-900/20 px-6 py-3 rounded-full border border-blue-100/50 dark:border-blue-800/30"
              variants={itemVariants}
              whileHover={{ scale: 1.03 }}
            >
              <p className="text-blue-700 dark:text-blue-300 font-medium">
                ✓ No credit card required. 7-day free trial with full access to all features.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export { CTASection };