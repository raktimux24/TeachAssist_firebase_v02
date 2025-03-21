import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MoveRight, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Hero() {
  const [titleNumber, setTitleNumber] = useState(0);
  const titles = useMemo(
    () => ["innovative", "engaging", "personalized", "effective", "smart"],
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

  return (
    <div className="w-full min-h-screen bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="flex gap-8 py-20 lg:py-40 items-center justify-center flex-col">
          <div>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-4 bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 border-primary-200 dark:border-primary-800 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Discover TeachAssist <MoveRight className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex gap-4 flex-col">
            <h1 className="text-5xl md:text-7xl max-w-2xl tracking-tighter text-center font-regular">
              <span className="text-gray-900 dark:text-white">Transform teaching with</span>
              <span className="relative flex w-full justify-center overflow-hidden text-center md:pb-4 md:pt-1">
                &nbsp;
                {titles.map((title, index) => (
                  <motion.span
                    key={index}
                    className="absolute font-semibold text-primary-600 dark:text-primary-400"
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
              <span className="text-gray-900 dark:text-white">content</span>
            </h1>

            <p className="text-lg md:text-xl leading-relaxed tracking-tight text-gray-600 dark:text-gray-300 max-w-2xl text-center">
              Streamline your content creation & enhance student learning with AI-powered tools designed to make teaching more effective and engaging.
            </p>
          </div>
          <div className="flex flex-row gap-4">
            <Button 
              size="lg" 
              variant="outline"
              className="gap-2 bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 border-primary-200 dark:border-primary-800 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Schedule a demo <PhoneCall className="w-4 h-4" />
            </Button>
            <Button 
              size="lg" 
              className="gap-2 bg-primary-600 hover:bg-primary-700 dark:bg-primary-600 dark:hover:bg-primary-700 text-white"
            >
              Get Started <MoveRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}