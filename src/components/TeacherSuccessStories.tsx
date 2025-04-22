import { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Quote, ChevronLeft, ChevronRight, Star } from 'lucide-react';

interface TestimonialProps {
  quote: string;
  name: string;
  role: string;
  avatar: string;
  rating: number;
  isActive: boolean;
  index: number;
  onClick: (index: number) => void;
}

function Testimonial({ quote, name, role, avatar, rating, isActive, index, onClick }: TestimonialProps) {
  return (
    <div 
      className={`transition-all duration-500 ${isActive ? 'scale-100 opacity-100' : 'scale-95 opacity-50'}`}
      onClick={() => onClick(index)}
    >
      <div className={`bg-gradient-to-br from-white via-white to-blue-50 dark:from-gray-800 dark:via-gray-800 dark:to-blue-900/10 p-8 rounded-xl shadow-lg flex flex-col h-full border-2 ${isActive ? 'border-blue-500 dark:border-blue-400' : 'border-transparent'} cursor-pointer transition-all duration-300 hover:shadow-xl relative overflow-hidden`}>
        {/* Decorative elements */}
        <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-blue-100/50 dark:bg-blue-900/20"></div>
        <div className="absolute -bottom-8 -left-8 w-16 h-16 rounded-full bg-blue-100/30 dark:bg-blue-900/10"></div>
        <div className="flex items-center mb-6">
          <div className="mr-4">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-blue-200 dark:border-blue-800">
              <img src={avatar} alt={name} className="w-full h-full object-cover" />
            </div>
          </div>
          <div>
            <p className="font-bold text-gray-900 dark:text-white text-lg">{name}</p>
            <p className="text-gray-600 dark:text-gray-400 text-sm">{role}</p>
            <div className="flex mt-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} />
              ))}
            </div>
          </div>
        </div>
        <div className="mb-4 text-blue-600 dark:text-blue-400">
          <Quote className="w-8 h-8 opacity-50" />
        </div>
        <p className="text-gray-700 dark:text-gray-300 mb-6 flex-grow italic text-lg leading-relaxed">
          "{quote}"
        </p>
      </div>
    </div>
  );
}

export default function TeacherSuccessStories() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(true);

  const testimonials = [
    {
      quote: "TeachAssistPro has cut my lesson planning time in half. I now create engaging materials for my Class 9 students in minutes that used to take hours. My students are more engaged, and I have more time to focus on actual teaching rather than preparation.",
      name: "Priya Sharma",
      role: "Science Teacher, Delhi Public School",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      rating: 5
    },
    {
      quote: "As a mathematics teacher handling Class 10 and 12, creating different assessments was always challenging. With TeachAssistPro, I can generate varied question sets with different difficulty levels in just a few clicks. It's been a game-changer for my teaching efficiency.",
      name: "Rajesh Iyer",
      role: "Mathematics Teacher, National Public School, Bangalore",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      rating: 5
    },
    {
      quote: "The CBSE curriculum alignment feature is what impressed me most. Every resource I create is perfectly matched to the curriculum guidelines, which gives me confidence that I'm covering all required material. The time I save goes directly into providing better support to my students.",
      name: "Anjali Mehta",
      role: "Social Studies Teacher, Army Public School, Pune",
      avatar: "https://randomuser.me/api/portraits/women/68.jpg",
      rating: 4
    },
    {
      quote: "I've been using TeachAssistPro for the past 3 months and it has transformed how I prepare for my classes. The AI-generated content is remarkably aligned with CBSE requirements, and the customization options allow me to tailor everything to my teaching style.",
      name: "Vikram Singh",
      role: "Physics Teacher, Kendriya Vidyalaya, Chennai",
      avatar: "https://randomuser.me/api/portraits/men/46.jpg",
      rating: 5
    },
    {
      quote: "What I love most about TeachAssistPro is how it helps me create differentiated content for students of varying abilities. I can quickly generate basic, intermediate, and advanced materials on the same topic, which has been invaluable for my mixed-ability classroom.",
      name: "Meera Patel",
      role: "English Teacher, Ryan International School, Mumbai",
      avatar: "https://randomuser.me/api/portraits/women/65.jpg",
      rating: 4
    }
  ];

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (autoplay) {
      interval = setInterval(() => {
        setActiveIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
      }, 5000);
    }
    
    return () => clearInterval(interval);
  }, [autoplay, testimonials.length]);

  const handlePrev = () => {
    setAutoplay(false);
    setActiveIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length);
  };

  const handleNext = () => {
    setAutoplay(false);
    setActiveIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  };

  const handleDotClick = (index: number) => {
    setAutoplay(false);
    setActiveIndex(index);
  };

  const handleTestimonialClick = (index: number) => {
    setAutoplay(false);
    setActiveIndex(index);
  };

  return (
    <section className="w-full py-20 lg:py-32 bg-gradient-to-b from-white to-blue-50 dark:from-gray-950 dark:to-gray-900" id="testimonials">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center text-center mb-16">
          <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 font-medium mb-4">
            Success Stories
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
            Transforming Teaching Across India
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
            Join CBSE teachers who are improving classroom engagement with TeachAssistPro.
          </p>
        </div>

        <div className="relative max-w-5xl mx-auto">
          {/* Carousel Navigation */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-5 md:-translate-x-10 z-10">
            <button 
              onClick={handlePrev}
              className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          </div>
          
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-5 md:translate-x-10 z-10">
            <button 
              onClick={handleNext}
              className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Testimonials */}
          <div className="overflow-hidden px-4">
            <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${activeIndex * 100}%)` }}>
              {testimonials.map((testimonial, index) => (
                <div key={index} className="min-w-full px-4">
                  <Testimonial 
                    {...testimonial} 
                    isActive={index === activeIndex}
                    index={index}
                    onClick={handleTestimonialClick}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Dots Navigation */}
          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${index === activeIndex ? 'bg-blue-600 dark:bg-blue-400 w-6' : 'bg-gray-300 dark:bg-gray-700'}`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))
            }
          </div>

          {/* Autoplay Toggle */}
          <div className="flex justify-center mt-6">
            <button 
              onClick={() => setAutoplay(!autoplay)}
              className={`text-sm px-4 py-2 rounded-full transition-colors ${autoplay ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'}`}
            >
              {autoplay ? 'Autoplay: On' : 'Autoplay: Off'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
