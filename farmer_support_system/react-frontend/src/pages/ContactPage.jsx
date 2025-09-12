import React, { useState } from 'react';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  MessageSquare, 
  Wheat, 
  Users, 
  Send,
  CheckCircle
} from 'lucide-react';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    cropType: '',
    subject: '',
    message: '',
    urgency: 'medium'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 2000);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                Message Sent Successfully!
              </h2>
              <p className="text-gray-600 mb-6">
                Thank you for contacting KisanSewa. Our agricultural experts will review your query and respond within 24 hours. For urgent matters, please call our helpline.
              </p>
              <Button 
                onClick={() => {
                  setIsSubmitted(false);
                  setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    location: '',
                    cropType: '',
                    subject: '',
                    message: '',
                    urgency: 'medium'
                  });
                }}
                variant="primary"
              >
                Send Another Message
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Connect with Your Digital Krishi Officer
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-green-100">
              Get expert agricultural advice instantly. We're here to support farmers across Kerala with AI-powered solutions.
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <div className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                24/7 Available
              </div>
              <div className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Expert Support
              </div>
              <div className="flex items-center">
                <Wheat className="w-5 h-5 mr-2" />
                All Crops Covered
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="py-12">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <div>
                <Card className="p-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                    <MessageSquare className="w-6 h-6 mr-3 text-green-600" />
                    Send us your query
                  </h2>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <Input
                        label="Full Name *"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter your name"
                      />
                      <Input
                        label="Phone Number *"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        placeholder="+91 XXXXX XXXXX"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <Input
                        label="Email Address"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="your@email.com"
                      />
                      <Input
                        label="Location (District/Village)"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        placeholder="e.g., Thiruvananthapuram"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">
                          Crop Type
                        </label>
                        <select
                          name="cropType"
                          value={formData.cropType}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                          <option value="">Select crop type</option>
                          <option value="rice">Rice (നെൽ)</option>
                          <option value="coconut">Coconut (തെങ്ങ്)</option>
                          <option value="banana">Banana (വാഴ)</option>
                          <option value="rubber">Rubber (റബ്ബർ)</option>
                          <option value="spices">Spices (മസാല)</option>
                          <option value="vegetables">Vegetables (പച്ചക്കറി)</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      
                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">
                          Query Priority
                        </label>
                        <select
                          name="urgency"
                          value={formData.urgency}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                          <option value="low">Low - General inquiry</option>
                          <option value="medium">Medium - Routine issue</option>
                          <option value="high">High - Urgent problem</option>
                          <option value="emergency">Emergency - Crop disease/pest</option>
                        </select>
                      </div>
                    </div>

                    <Input
                      label="Subject *"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      placeholder="Brief description of your query"
                    />

                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Detailed Message *
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        rows={6}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Describe your agricultural query in detail. You can write in English or Malayalam..."
                      />
                    </div>

                    <Button
                      type="submit"
                      loading={isSubmitting}
                      className="w-full"
                      size="lg"
                    >
                      <Send className="w-5 h-5 mr-2" />
                      Send Message
                    </Button>
                  </form>
                </Card>
              </div>

              {/* Contact Information */}
              <div className="space-y-6">
                {/* Contact Details */}
                <Card className="p-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">
                    Get in Touch
                  </h2>
                  
                  <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Phone className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">24/7 Farmer Helpline</h3>
                        <p className="text-gray-600">+91 1800 XXX XXXX</p>
                        <p className="text-sm text-gray-500">Toll-free across Kerala</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Mail className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">Email Support</h3>
                        <p className="text-gray-600">support@kisansewa.gov.in</p>
                        <p className="text-sm text-gray-500">Response within 24 hours</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">Office Address</h3>
                        <p className="text-gray-600">
                          Department of Agriculture<br />
                          Krishi Bhavan, Thiruvananthapuram<br />
                          Kerala - 695033
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Clock className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">Office Hours</h3>
                        <p className="text-gray-600">
                          Monday - Friday: 9:00 AM - 6:00 PM<br />
                          Saturday: 9:00 AM - 1:00 PM<br />
                          <span className="text-green-600 font-medium">Emergency support: 24/7</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Quick Support */}
                <Card className="p-8 bg-gradient-to-r from-green-50 to-blue-50">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">
                    Need Immediate Help?
                  </h3>
                  <p className="text-gray-600 mb-6">
                    For urgent agricultural issues like pest attacks, disease outbreaks, or weather-related damage, use our emergency channels:
                  </p>
                  
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <MessageSquare className="w-5 h-5 mr-3" />
                      Chat with AI Assistant
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Phone className="w-5 h-5 mr-3" />
                      Emergency Helpline
                    </Button>
                  </div>
                </Card>

                {/* Service Areas */}
                <Card className="p-8">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">
                    Our Services
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <p className="font-medium text-gray-700">• Crop Advisory</p>
                      <p className="font-medium text-gray-700">• Pest Management</p>
                      <p className="font-medium text-gray-700">• Weather Alerts</p>
                      <p className="font-medium text-gray-700">• Soil Testing</p>
                    </div>
                    <div className="space-y-2">
                      <p className="font-medium text-gray-700">• Market Prices</p>
                      <p className="font-medium text-gray-700">• Subsidy Info</p>
                      <p className="font-medium text-gray-700">• Scheme Updates</p>
                      <p className="font-medium text-gray-700">• Training Programs</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
