import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { MapPin, Mic, Image as ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const LandingPage = () => {
  const navigate = useNavigate();
  
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
      {/* Hero Section with Swiper */}
      <section className="relative h-screen overflow-hidden">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          navigation
          pagination={{ clickable: true }}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          loop={true}
          className="h-full"
        >
          {heroSlides.map((slide) => (
            <SwiperSlide key={slide.id} className="relative">
              {/* Background Image */}
              <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                  backgroundImage: `url(${slide.image})`,
                }}
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-40" />
              
              {/* Content */}
              <div className="relative z-10 h-full flex items-center">
                <div className="container mx-auto px-6 lg:px-12">
                  <div className="max-w-4xl">
                    {/* Main Title */}
                    <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight">
                      {slide.title}
                    </h1>
                    
                    {/* Content Area */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                      {/* Left Content */}
                      <div className="space-y-6">
                        <h2 className="text-xl md:text-2xl text-green-300 font-semibold">
                          {slide.subtitle}
                        </h2>
                        <p className="text-white text-lg leading-relaxed opacity-90">
                          {slide.description}
                        </p>
                        <button
                          onClick={() => navigate('/disease-prediction')}
                          className="inline-flex items-center px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                        >
                          Explore Now
                          <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </button>
                      </div>
                      
                      {/* Right Content - Featured Images */}
                      <div className="hidden lg:flex flex-col space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-4 border border-white border-opacity-30">
                            <img
                              src="https://images.unsplash.com/photo-1595273670150-bd0c3c392e76?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
                              alt="Farmer working"
                              className="w-full h-32 object-cover rounded-lg"
                            />
                          </div>
                          <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-4 border border-white border-opacity-30 mt-8">
                            <img
                              src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
                              alt="Agricultural technology"
                              className="w-full h-32 object-cover rounded-lg"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* Cards Section */}
      <section className="py-20 bg-gradient-to-br from-green-50 to-blue-50">
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
                  onClick={() => navigate(card.route)}
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
                    onClick={() => navigate('/chat')}
                    className="w-full bg-white text-green-600 font-semibold py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors duration-300"
                  >
                    Start Chatting Now
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
