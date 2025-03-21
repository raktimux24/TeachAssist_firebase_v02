import React from 'react';
import { MoveRight, PhoneCall } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function CTASection() {
  return (
    <div className="w-full py-20 lg:py-40 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="flex flex-col text-center bg-gray-50 dark:bg-gray-800 rounded-xl p-4 lg:p-14 gap-8 items-center shadow-lg">
          <div>
            <Badge className="bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 border-transparent">
              Get Started Today
            </Badge>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-3xl md:text-5xl tracking-tighter max-w-xl font-bold text-gray-900 dark:text-white">
              Transform Your Teaching Experience
            </h3>
            <p className="text-lg leading-relaxed tracking-tight text-gray-600 dark:text-gray-300 max-w-xl">
              Teaching in today's dynamic environment requires modern solutions. 
              Unlock the power of AI-driven tools and smart content generation 
              to enhance your classroom experience and student engagement.
            </p>
          </div>
          <div className="flex flex-row gap-4">
            <Button 
              className="gap-2 bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 border-primary-200 dark:border-primary-800 hover:bg-gray-50 dark:hover:bg-gray-700" 
              variant="outline"
            >
              Schedule Demo <PhoneCall className="w-4 h-4" />
            </Button>
            <Button 
              className="gap-2 bg-primary-600 hover:bg-primary-700 dark:bg-primary-600 dark:hover:bg-primary-700 text-white"
            >
              Start Teaching <MoveRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export { CTASection };