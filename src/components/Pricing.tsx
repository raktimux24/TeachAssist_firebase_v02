import { useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Shield, Zap, Clock, BookOpen } from 'lucide-react';

interface PricingToggleProps {
  isAnnual: boolean;
  setIsAnnual: (value: boolean) => void;
}

function PricingToggle({ isAnnual, setIsAnnual }: PricingToggleProps) {
  return (
    <motion.div 
      className="flex items-center justify-center mb-10 relative z-10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="bg-white/10 dark:bg-gray-800/30 backdrop-blur-md p-1.5 rounded-full shadow-lg border border-white/20 dark:border-gray-700/30">
        <motion.button
          onClick={() => setIsAnnual(false)}
          className={`relative px-6 py-2.5 rounded-full transition-all duration-300 ${!isAnnual ? "text-gray-900 dark:text-white font-medium" : "text-gray-600 dark:text-gray-400"}`}
          whileHover={{ scale: !isAnnual ? 1 : 1.05 }}
          whileTap={{ scale: 0.98 }}
        >
          {!isAnnual && (
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 dark:from-blue-500 dark:to-indigo-600 rounded-full shadow-md"
              layoutId="toggleBackground"
              transition={{ type: "spring", bounce: 0.25, duration: 0.4 }}
            />
          )}
          <span className="relative z-10">Monthly</span>
        </motion.button>
        <motion.button
          onClick={() => setIsAnnual(true)}
          className={`relative px-6 py-2.5 rounded-full transition-all duration-300 ${isAnnual ? "text-gray-900 dark:text-white font-medium" : "text-gray-600 dark:text-gray-400"}`}
          whileHover={{ scale: isAnnual ? 1 : 1.05 }}
          whileTap={{ scale: 0.98 }}
        >
          {isAnnual && (
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 dark:from-blue-500 dark:to-indigo-600 rounded-full shadow-md"
              layoutId="toggleBackground"
              transition={{ type: "spring", bounce: 0.25, duration: 0.4 }}
            />
          )}
          <span className="relative z-10 flex items-center">
            Annual <span className="ml-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-400 text-xs px-2 py-0.5 rounded-full font-medium">Save 16%</span>
          </span>
        </motion.button>
      </div>
    </motion.div>
  );
}

interface PricingFeatureProps {
  text: string;
}

function PricingFeature({ text }: PricingFeatureProps) {
  return (
    <motion.div 
      className="flex items-center space-x-3"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ x: 5 }}
    >
      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center flex-shrink-0">
        <Check className="w-3 h-3 text-white" />
      </div>
      <span className="text-gray-700 dark:text-gray-300 text-sm">{text}</span>
    </motion.div>
  );
}

interface PricingCardProps {
  title: string;
  price: string;
  annualPrice?: string;
  isAnnual: boolean;
  features: string[];
  buttonText: string;
  buttonLink: string;
  isFeatured?: boolean;
  subtext?: string;
}

function getIconForPlan(title: string) {
  switch(title) {
    case 'Free':
      return <BookOpen className="w-5 h-5 text-white" />;
    case 'Basic':
      return <Zap className="w-5 h-5 text-white" />;
    case 'Premium':
      return <Shield className="w-5 h-5 text-white" />;
    default:
      return <Sparkles className="w-5 h-5 text-white" />;
  }
}

function getGradientForPlan(title: string, isFeatured: boolean) {
  if (isFeatured) {
    return 'from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700';
  }
  
  switch(title) {
    case 'Free':
      return 'from-gray-400 to-gray-500 dark:from-gray-600 dark:to-gray-700';
    case 'Basic':
      return 'from-blue-400 to-indigo-500 dark:from-blue-500 dark:to-indigo-600';
    case 'Premium':
      return 'from-purple-500 to-indigo-600 dark:from-purple-600 dark:to-indigo-700';
    default:
      return 'from-blue-400 to-indigo-500 dark:from-blue-500 dark:to-indigo-600';
  }
}

function PricingCard({
  title,
  price,
  annualPrice,
  isAnnual,
  features,
  buttonText,
  buttonLink,
  isFeatured = false,
  subtext
}: PricingCardProps) {
  const displayPrice = isAnnual && annualPrice ? annualPrice : price;
  const gradient = getGradientForPlan(title, isFeatured);
  const icon = getIconForPlan(title);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: title === 'Basic' ? 0.2 : title === 'Premium' ? 0.3 : 0.1 }}
      whileHover={{ y: -10, transition: { duration: 0.2 } }}
      className={`relative rounded-2xl overflow-hidden ${isFeatured ? 'z-10 md:scale-110' : ''}`}
    >
      {/* Card background with gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-[0.03] dark:opacity-[0.07]`}></div>
      
      {/* Glass card */}
      <div className={`relative backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 rounded-2xl p-8 h-full border ${isFeatured ? 'border-blue-400 dark:border-blue-500 shadow-xl' : 'border-gray-200 dark:border-gray-800 shadow-lg'}`}>
        {/* Decorative elements */}
        <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-gradient-to-br from-blue-400/10 to-indigo-500/10 dark:from-blue-500/10 dark:to-indigo-600/10"></div>
        <div className="absolute -bottom-8 -left-8 w-16 h-16 rounded-full bg-gradient-to-br from-blue-400/10 to-indigo-500/10 dark:from-blue-500/10 dark:to-indigo-600/10"></div>
        
        {/* Popular badge */}
        {isFeatured && (
          <div className="absolute -right-12 top-7 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-1 px-12 text-sm font-bold transform rotate-45 shadow-lg">
            POPULAR
          </div>
        )}
        
        {/* Plan icon */}
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 shadow-md`}>
          {icon}
        </div>
        
        {/* Plan title */}
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
        
        {/* Price */}
        <div className="mb-1">
          <span className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            {displayPrice}
          </span>
          <span className="text-gray-600 dark:text-gray-400">/month</span>
        </div>
        
        {/* Annual billing info */}
        {isAnnual && annualPrice && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Billed annually (₹{parseInt(annualPrice.replace(/[^0-9]/g, '')) * 12}/year)
          </p>
        )}
        
        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent my-6"></div>
        
        {/* Features */}
        <div className="space-y-4 mb-8">
          {features.map((feature, index) => (
            <PricingFeature key={index} text={feature} />
          ))}
        </div>
        
        {/* CTA Button */}
        <motion.a
          href={buttonLink}
          className={`block w-full py-3 px-4 rounded-xl text-center font-medium transition-all duration-300 ${isFeatured ? `bg-gradient-to-r ${gradient} text-white shadow-md hover:shadow-lg` : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white'}`}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
        >
          {buttonText}
        </motion.a>
        
        {/* Subtext */}
        {subtext && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
            {subtext}
          </p>
        )}
      </div>
    </motion.div>
  );
}

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false);

  const plans = [
    {
      title: "Free",
      price: "₹0",
      features: [
        "5 AI-generated content items per month",
        "Basic lesson plan templates for CBSE",
        "Limited resource library access",
        "Single subject support"
      ],
      buttonText: "Get Started",
      buttonLink: "/signup",
      isFeatured: false
    },
    {
      title: "Basic",
      price: "₹299",
      annualPrice: "₹208",
      features: [
        "Unlimited AI-generated content",
        "Full template library access",
        "Assessment creation tools",
        "Resource integration",
        "Multi-subject support for CBSE classes 7-12"
      ],
      buttonText: "Start Free Trial",
      buttonLink: "/signup",
      isFeatured: true,
      subtext: "7-day free trial, no credit card required"
    },
    {
      title: "Premium",
      price: "₹499",
      annualPrice: "₹333",
      features: [
        "All Basic features",
        "Priority AI generation",
        "Advanced customization options",
        "Enhanced CBSE curriculum alignment",
        "Resource organization system",
        "Priority support"
      ],
      buttonText: "Start Free Trial",
      buttonLink: "/signup",
      isFeatured: false,
      subtext: "7-day free trial, no credit card required"
    }
  ];

  return (
    <section className="w-full py-20 lg:py-32 relative overflow-hidden" id="pricing">
      {/* Background with subtle patterns */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
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
            Pricing
          </Badge>
          <motion.h2 
            className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <span className="bg-gradient-to-r from-gray-900 to-gray-700 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">Simple, Affordable Plans</span> for Every CBSE Teacher
          </motion.h2>
          <motion.p 
            className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Start with our free plan and upgrade as your needs grow.
          </motion.p>
        </motion.div>

        <PricingToggle isAnnual={isAnnual} setIsAnnual={setIsAnnual} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <PricingCard
              key={index}
              {...plan}
              isAnnual={isAnnual}
            />
          ))}
        </div>

        <motion.div 
          className="mt-16 text-center max-w-2xl mx-auto p-8 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 rounded-2xl shadow-lg border border-white/20 dark:border-gray-800/50 relative overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          whileHover={{ scale: 1.02 }}
        >
          {/* Decorative elements */}
          <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-gradient-to-br from-blue-400/10 to-indigo-500/10 dark:from-blue-500/10 dark:to-indigo-600/10"></div>
          <div className="absolute -bottom-8 -left-8 w-16 h-16 rounded-full bg-gradient-to-br from-blue-400/10 to-indigo-500/10 dark:from-blue-500/10 dark:to-indigo-600/10"></div>
          
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 dark:from-blue-500 dark:to-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-md">
            <Clock className="w-8 h-8 text-white" />
          </div>
          
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            School Plans Available
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-5">
            Special pricing for CBSE schools with multiple teachers. Save up to 40% with school-wide deployment.
          </p>
          <motion.a
            href="/contact"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
            whileHover={{ scale: 1.05, x: 5 }}
            whileTap={{ scale: 0.98 }}
          >
            Contact us for school pricing <span className="ml-2">→</span>
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
