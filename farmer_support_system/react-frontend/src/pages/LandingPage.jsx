import React, { useState, useEffect, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { MapPin, Mic, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// Import Rectangle assets
import Rectangle1 from '../assets/Rectangle 1.svg';
import Rectangle7 from '../assets/Rectangle 7.svg';
import Rectangle8 from '../assets/Rectangle 8.svg';
import Rectangle9 from '../assets/Rectangle 9.svg';
import Rectangle11 from '../assets/Rectangle 11.svg';

const LandingPage = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const cardsRef = useRef(null);
  
  // Rectangle carousel data using your Rectangle files
  const rectangleSlides = [
    {
      id: 1,
      image: Rectangle7,
      title: "Smart Farming",
      subtitle: "AI-Powered Agriculture",
      description: "Transform your farming with intelligent crop monitoring and disease detection technology."
    },
    {
      id: 2,
      image: Rectangle8,
      title: "Crop Health",
      subtitle: "Disease Prevention",
      description: "Early detection and prevention of crop diseases using advanced image recognition."
    },
    {
      id: 3,
      image: Rectangle9,
      title: "Yield Optimization",
      subtitle: "Maximum Harvest",
      description: "Transform your farming with AI-powered insights. Increase crop yields by up to 40% through precision agriculture, smart irrigation, and data-driven farming decisions."
    },
    {
      id: 4,
      image: Rectangle11,
      title: "Expert Support",
      subtitle: "24/7 Assistance",
      description: "Get expert farming advice and support whenever you need it most."
    }
  ];

  // Auto-advance slides
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % rectangleSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [rectangleSlides.length]);

  // Navigation functions
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % rectangleSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + rectangleSlides.length) % rectangleSlides.length);
  };
  const { isAuthenticated } = useAuth();
  
  // React Hook Form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm();

  const onSubmit = (data) => {
    console.log('Form submitted successfully:', data);
    alert('Thank you for your message! We will get back to you soon.');
    reset();
  };

  const handleExploreClick = () => {
    if (isAuthenticated) {
      // Scroll to cards section
      cardsRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    } else {
      navigate('/login');
    }
  };

  const handleCardClick = (route) => {
    if (route === '/disease-prediction' && !isAuthenticated) {
      navigate('/login');
    } else {
      navigate(route);
    }
  };

  // Hero slides data
  const heroSlides = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
      title: "Disease Detection",
      subtitle: "Advanced AI-powered crop disease identification",
      description: "Lorem ipsum dolor sit amet consectetur. Vulputate et neque in mauris. Lorem varius mauris mauris mauris risus eget vestibulum augue. Morbi mauris fermentum mauris mauris dui massa lorem augue. Etiam magna mauris mauris.",
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
      title: "Smart Farming",
      subtitle: "Technology-driven agricultural solutions",
      description: "Leverage cutting-edge technology to optimize your farming practices and increase crop yields with data-driven insights.",
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
      title: "Crop Monitoring",
      subtitle: "Real-time field monitoring and analysis",
      description: "Monitor your crops in real-time with advanced sensors and AI analytics for better decision making.",
    }
  ];

  // Cards data
  const cards = [
    {
      id: 1,
      title: "Location",
      icon: MapPin,
      description: "Find farming locations and weather data",
      color: "bg-green-100 text-green-600",
      hoverColor: "hover:bg-green-200",
      route: "/location"
    },
    {
      id: 2,
      title: "Speak",
      icon: Mic,
      description: "Voice-powered farming assistance",
      color: "bg-blue-100 text-blue-600",
      hoverColor: "hover:bg-blue-200",
      route: "/voice"
    },
    {
      id: 3,
      title: "Image",
      icon: ImageIcon,
      description: "AI-powered crop disease detection",
      color: "bg-purple-100 text-purple-600",
      hoverColor: "hover:bg-purple-200",
      route: "/disease-prediction"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Rectangle 1 Background and Rectangle Carousel */}
      <section className="relative h-screen overflow-hidden">
        {/* Static Rectangle 1 Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000"
          style={{
            backgroundImage: `url(${Rectangle1})`,
          }}
        />
        
        {/* Special overlay for Yield Optimization */}
        {rectangleSlides[currentSlide].title === "Yield Optimization" && (
          <div className="absolute inset-0 bg-gradient-to-br from-green-900/30 via-emerald-800/20 to-lime-900/30 animate-pulse"></div>
        )}
        
        {/* Content */}
        <div className="relative z-10 h-full flex items-center">
          <div className="container mx-auto px-6 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              
              {/* Left Content */}
              <div className="space-y-8">
                <div className="transform transition-all duration-700 ease-out">
                  <h1 className="text-7xl md:text-8xl lg:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-green-100 to-green-200 mb-8 leading-none tracking-tight animate-pulse">
                    {rectangleSlides[currentSlide].title}
                  </h1>
                  <div className="h-2 w-32 bg-gradient-to-r from-green-400 to-blue-400 rounded-full mb-6 animate-pulse"></div>
                </div>
                
                <h2 className="text-2xl md:text-3xl lg:text-4xl text-green-300 font-bold tracking-wide shadow-text">
                  {rectangleSlides[currentSlide].subtitle}
                </h2>
                
                <p className="text-white text-xl md:text-2xl leading-relaxed opacity-95 max-w-2xl font-medium drop-shadow-lg">
                  {rectangleSlides[currentSlide].description}
                </p>
                
                <div className="pt-4">
                  <button
                    onClick={handleExploreClick}
                    className="group relative inline-flex items-center px-12 py-6 bg-gradient-to-r from-green-500 via-green-600 to-emerald-600 hover:from-green-600 hover:via-green-700 hover:to-emerald-700 text-white font-bold text-xl rounded-2xl transition-all duration-500 transform hover:scale-110 hover:rotate-1 shadow-2xl hover:shadow-green-500/50 border-2 border-green-400/30 hover:border-green-300/50"
                  >
                    <span className="relative z-10">Explore Now</span>
                    <svg className="ml-3 w-7 h-7 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                    
                    {/* Animated background effect */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-400 to-emerald-400 opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
                    
                    {/* Shine effect */}
                    <div className="absolute inset-0 rounded-2xl overflow-hidden">
                      <div className="absolute -inset-2 bg-gradient-to-r from-transparent via-white/20 to-transparent rotate-12 translate-x-[-100%] group-hover:translate-x-[300%] transition-transform duration-1000"></div>
                    </div>
                  </button>
                </div>
              </div>
              
              {/* Right Content - Rectangle Images Carousel */}
              <div className="relative flex justify-center items-center">
                
                {/* Navigation Arrows */}
                <button
                  onClick={prevSlide}
                  className="absolute left-0 z-20 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-all duration-300 transform hover:scale-110"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                
                <button
                  onClick={nextSlide}
                  className="absolute right-0 z-20 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-all duration-300 transform hover:scale-110"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>

                {/* Main Carousel Container */}
                <div className="relative w-full max-w-lg">
                  {/* Main Rectangle Images */}
                  <div className="relative h-96 lg:h-[28rem] overflow-hidden rounded-3xl">
                    {rectangleSlides.map((slide, index) => (
                      <div
                        key={slide.id}
                        className={`absolute inset-0 transition-all duration-700 transform ${
                          index === currentSlide
                            ? 'opacity-100 translate-x-0 scale-100'
                            : index < currentSlide
                            ? 'opacity-0 -translate-x-full scale-95'
                            : 'opacity-0 translate-x-full scale-95'
                        }`}
                      >
                        <img
                          src={slide.image}
                          alt={slide.title}
                          className={`w-full h-full object-cover rounded-3xl shadow-2xl border-4 transition-all duration-500 ${
                            slide.title === "Yield Optimization" && index === currentSlide
                              ? 'border-green-400 shadow-green-500/50 scale-105 animate-float'
                              : 'border-white'
                          }`}
                        />
                        
                        {/* Special overlay for Yield Optimization */}
                        {slide.title === "Yield Optimization" && index === currentSlide && (
                          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-green-500/20 via-transparent to-emerald-500/20 animate-pulse"></div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Secondary smaller images */}
                  <div className="absolute -top-10 -right-10 w-28 h-36 opacity-85 transform rotate-6 hover:rotate-12 transition-transform duration-300">
                    <img
                      src={rectangleSlides[(currentSlide + 1) % rectangleSlides.length].image}
                      alt="Next"
                      className="w-full h-full object-cover rounded-2xl shadow-2xl border-3 border-white/80 hover:border-green-300 transition-all duration-300"
                    />
                  </div>
                  
                  <div className="absolute -bottom-10 -right-10 w-24 h-32 opacity-75 transform -rotate-3 hover:-rotate-6 transition-transform duration-300">
                    <img
                      src={rectangleSlides[(currentSlide + 2) % rectangleSlides.length].image}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-xl shadow-xl border-2 border-white/70 hover:border-blue-300 transition-all duration-300"
                    />
                  </div>
                  
                  {/* Floating particles effect for Yield Optimization */}
                  {rectangleSlides[currentSlide].title === "Yield Optimization" && (
                    <>
                      <div className="absolute top-4 left-4 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
                      <div className="absolute bottom-8 left-8 w-2 h-2 bg-emerald-300 rounded-full animate-bounce delay-300"></div>
                      <div className="absolute top-12 right-12 w-2 h-2 bg-lime-400 rounded-full animate-pulse delay-500"></div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Navigation Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
          <div className="flex space-x-3">
            {rectangleSlides.map((_, index) => (
              <button
                key={`indicator-${index}`}
                onClick={() => setCurrentSlide(index)}
                className={`w-4 h-4 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? 'bg-blue-500 scale-125'
                    : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Cards Section */}
      <section ref={cardsRef} className="py-20 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="container mx-auto px-6">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Our Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover powerful tools and features designed to revolutionize your farming experience
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {cards.map((card) => {
              const IconComponent = card.icon;
              return (
                <div
                  key={card.id}
                  onClick={() => handleCardClick(card.route)}
                  className={`group cursor-pointer bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 ${card.hoverColor}`}
                >
                  {/* Icon */}
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-xl mb-6 ${card.color} group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="w-8 h-8" />
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-gray-700">
                    {card.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    {card.description}
                  </p>
                  
                  {/* Arrow */}
                  <div className="flex items-center text-green-600 font-semibold group-hover:text-green-700">
                    <span className="mr-2">Learn More</span>
                    <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Starting your journey with KisanSewa
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Get in touch with our agricultural experts and start your smart farming journey today
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left Side - Contact Form */}
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Contact Us</h3>
                
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Name Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      {...register("name", { 
                        required: "Name is required",
                        minLength: { value: 2, message: "Name must be at least 2 characters" }
                      })}
                      placeholder="Enter your Name"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                    )}
                  </div>

                  {/* Phone Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      {...register("phone", {
                        required: "Phone number is required",
                        pattern: {
                          value: /^[0-9]{10}$/,
                          message: "Please enter a valid 10-digit phone number"
                        }
                      })}
                      placeholder="Enter your Number"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                        errors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                    )}
                  </div>

                  {/* Email Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      {...register("email", {
                        required: "Email is required",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Please enter a valid email address"
                        }
                      })}
                      placeholder="Enter your Email"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                    )}
                  </div>

                  {/* Message Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      rows={4}
                      {...register("message", {
                        required: "Message is required",
                        minLength: { value: 10, message: "Message must be at least 10 characters" }
                      })}
                      placeholder="Enter your message..."
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors resize-none ${
                        errors.message ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.message && (
                      <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
                    )}
                  </div>

                  {/* Privacy Policy Checkbox */}
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      {...register("privacy", {
                        required: "You must accept the privacy policy"
                      })}
                      className="mt-1 w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <label className="ml-2 text-sm text-gray-600">
                      I have read and accept the{' '}
                      <a href="#" className="text-green-600 hover:text-green-700 underline">
                        Privacy Policy
                      </a>
                    </label>
                  </div>
                  {errors.privacy && (
                    <p className="text-sm text-red-600">{errors.privacy.message}</p>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-300 transform hover:scale-105"
                  >
                    Send Message
                  </button>
                </form>
              </div>

              {/* Right Side - Info Card */}
              <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-8 text-white relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 left-0 w-full h-full" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                  }}></div>
                </div>
                
                <div className="relative z-10">
                  <h3 className="text-3xl font-bold mb-6">
                    Give us a call for more information
                  </h3>
                  <p className="text-green-100 mb-8 text-lg leading-relaxed">
                    Reserve and enjoy our fresco lunch menu when you visit KisanSewa, and see the transformation of your farm.
                  </p>
                  
                  {/* Contact Info */}
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center">
                      <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                        </svg>
                      </div>
                      <span className="text-lg">+91 9876543210</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                        </svg>
                      </div>
                      <span className="text-lg">info@kisansewa.com</span>
                    </div>
                  </div>

                  {/* CTA */}
                  <button
                    onClick={() => isAuthenticated ? navigate('/chat') : navigate('/login')}
                    className="w-full bg-white text-green-600 font-semibold py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors duration-300"
                  >
                    {isAuthenticated ? 'Start Chatting Now' : 'Login to Chat'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
