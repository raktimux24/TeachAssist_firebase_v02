import { useState, useEffect } from 'react';
import { Clock, Gift, Sparkles, Zap, Award, Crown } from 'lucide-react';

export default function LimitedTimeOffer() {
  // Set the countdown to 14 days from now
  const [timeLeft, setTimeLeft] = useState({
    days: 14,
    hours: 23,
    minutes: 59,
    seconds: 59
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        } else {
          clearInterval(timer);
          return prev;
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="w-full py-20 relative overflow-hidden" id="limited-offer">
      {/* Background with gradient and animated elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 dark:from-blue-800 dark:via-indigo-800 dark:to-purple-900">
        {/* Animated sparkle elements */}
        <div className="absolute top-20 left-20 w-20 h-20 opacity-20 animate-pulse">
          <Sparkles className="w-full h-full text-yellow-300" />
        </div>
        <div className="absolute bottom-40 right-40 w-16 h-16 opacity-20 animate-pulse" style={{ animationDelay: '1s' }}>
          <Sparkles className="w-full h-full text-yellow-300" />
        </div>
        <div className="absolute top-1/3 right-1/4 w-24 h-24 opacity-20 animate-pulse" style={{ animationDelay: '2s' }}>
          <Sparkles className="w-full h-full text-yellow-300" />
        </div>
        
        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 opacity-20"></div>
        <div className="absolute -bottom-40 -left-20 w-96 h-96 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 opacity-20"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto bg-white/10 dark:bg-gray-900/20 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden border border-white/20 dark:border-white/10">
          {/* Ribbon */}
          <div className="absolute -right-12 top-8 bg-gradient-to-r from-yellow-500 to-amber-500 text-white py-1 px-12 text-sm font-bold transform rotate-45 shadow-lg">
            EXCLUSIVE
          </div>
          
          <div className="flex flex-col md:flex-row">
            <div className="md:w-3/5 p-8 md:p-12">
              <div className="flex items-center mb-6">
                <Crown className="w-6 h-6 text-yellow-400 mr-2" />
                <div className="text-lg font-bold text-white bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">
                  Limited Time Launch Offer
                </div>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 flex items-center">
                <span className="mr-2">Founding Member</span>
                <span className="text-yellow-400 animate-pulse">Special</span>
              </h2>
              
              <p className="text-white/90 text-lg mb-8">
                Be among our first CBSE teachers to join and receive these exclusive benefits:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white/10 dark:bg-gray-800/20 rounded-xl p-4 backdrop-blur-sm border border-white/10 transform transition-transform hover:scale-105">
                  <div className="flex items-center mb-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mr-3">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-bold text-white">50% Discount</h3>
                  </div>
                  <p className="text-white/80 text-sm">Half off your first 3 months on any paid plan</p>
                </div>
                
                <div className="bg-white/10 dark:bg-gray-800/20 rounded-xl p-4 backdrop-blur-sm border border-white/10 transform transition-transform hover:scale-105">
                  <div className="flex items-center mb-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center mr-3">
                      <Crown className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-bold text-white">Premium Access</h3>
                  </div>
                  <p className="text-white/80 text-sm">Free upgrade to Premium features for 30 days</p>
                </div>
                
                <div className="bg-white/10 dark:bg-gray-800/20 rounded-xl p-4 backdrop-blur-sm border border-white/10 transform transition-transform hover:scale-105">
                  <div className="flex items-center mb-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mr-3">
                      <Award className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-bold text-white">Priority Access</h3>
                  </div>
                  <p className="text-white/80 text-sm">Be first to access new features as they launch</p>
                </div>
                
                <div className="bg-white/10 dark:bg-gray-800/20 rounded-xl p-4 backdrop-blur-sm border border-white/10 transform transition-transform hover:scale-105">
                  <div className="flex items-center mb-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center mr-3">
                      <Gift className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-bold text-white">Personalized Onboarding</h3>
                  </div>
                  <p className="text-white/80 text-sm">Custom session for CBSE curriculum implementation</p>
                </div>
              </div>
              
              <a
                href="/signup"
                className="inline-block px-8 py-4 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50"
              >
                Claim Your Discount Now
              </a>
            </div>
            
            <div className="md:w-2/5 bg-gradient-to-br from-indigo-900/40 to-purple-900/40 p-8 md:p-12 flex flex-col justify-center items-center backdrop-blur-md">
              <div className="flex items-center justify-center mb-6">
                <Clock className="w-8 h-8 text-yellow-400 mr-2" />
                <span className="text-white font-bold text-xl">Offer Ends In:</span>
              </div>
              
              <div className="grid grid-cols-4 gap-4 w-full max-w-sm">
                <div className="flex flex-col">
                  <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 rounded-xl py-4 px-2 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent"></div>
                    <span className="relative text-3xl md:text-4xl font-bold text-white">{timeLeft.days}</span>
                  </div>
                  <span className="text-sm mt-2 text-center text-white/80 font-medium">DAYS</span>
                </div>
                
                <div className="flex flex-col">
                  <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 rounded-xl py-4 px-2 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent"></div>
                    <span className="relative text-3xl md:text-4xl font-bold text-white">{timeLeft.hours}</span>
                  </div>
                  <span className="text-sm mt-2 text-center text-white/80 font-medium">HOURS</span>
                </div>
                
                <div className="flex flex-col">
                  <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 rounded-xl py-4 px-2 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent"></div>
                    <span className="relative text-3xl md:text-4xl font-bold text-white">{timeLeft.minutes}</span>
                  </div>
                  <span className="text-sm mt-2 text-center text-white/80 font-medium">MINS</span>
                </div>
                
                <div className="flex flex-col">
                  <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 rounded-xl py-4 px-2 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent"></div>
                    <span className="relative text-3xl md:text-4xl font-bold text-white animate-pulse">{timeLeft.seconds}</span>
                  </div>
                  <span className="text-sm mt-2 text-center text-white/80 font-medium">SECS</span>
                </div>
              </div>
              
              <div className="mt-8 bg-white/10 dark:bg-gray-800/20 rounded-xl p-4 backdrop-blur-sm border border-white/10 text-center">
                <p className="text-white/90 text-sm">
                  Don't miss out! This exclusive offer is only available for a limited time during our launch period.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
