import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Mail, MessageSquare, Clock, Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export const Contact = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success('Message sent successfully! We\'ll get back to you soon.');
    setFormData({ name: '', email: '', subject: '', message: '' });
    setLoading(false);
  };

  const contactInfo = [
    {
      icon: <Mail className="w-5 h-5" />,
      title: 'Email Us',
      detail: 'support@trustvault.com',
      subtext: 'We reply within 24 hours'
    },
    {
      icon: <MessageSquare className="w-5 h-5" />,
      title: 'Live Chat',
      detail: 'Available 24/7',
      subtext: 'Instant support'
    },
    {
      icon: <Clock className="w-5 h-5" />,
      title: 'Business Hours',
      detail: 'Mon - Sun',
      subtext: '24/7 Support Available'
    }
  ];

  return (
    <div className="min-h-screen py-24 md:py-32 bg-gray-50">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-purple-600 text-sm uppercase tracking-widest font-medium mb-4">Get In Touch</p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-gray-900">CONTACT US</h1>
          <p className="text-gray-500 max-w-xl mx-auto">
            Have questions about your order or need assistance? Our support team is here to help you 24/7.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Info Cards */}
          <div className="space-y-4">
            {contactInfo.map((info, index) => (
              <div 
                key={index}
                className="p-6 bg-white border border-gray-200 rounded-xl hover:border-purple-300 hover:shadow-md transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
                  {info.icon}
                </div>
                <h3 className="font-bold text-lg mb-1 text-gray-900">{info.title}</h3>
                <p className="text-purple-600">{info.detail}</p>
                <p className="text-gray-500 text-sm">{info.subtext}</p>
              </div>
            ))}
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="p-8 bg-white border border-gray-200 rounded-xl shadow-sm">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">Send us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-700">Your Name</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="John Doe"
                      className="bg-white border-gray-300 h-12 text-gray-900 placeholder:text-gray-400"
                      required
                      data-testid="contact-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-700">Email Address</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="you@example.com"
                      className="bg-white border-gray-300 h-12 text-gray-900 placeholder:text-gray-400"
                      required
                      data-testid="contact-email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700">Subject</Label>
                  <Input
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="How can we help?"
                    className="bg-white border-gray-300 h-12 text-gray-900 placeholder:text-gray-400"
                    required
                    data-testid="contact-subject"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700">Message</Label>
                  <Textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us more about your inquiry..."
                    className="bg-white border-gray-300 min-h-[150px] text-gray-900 placeholder:text-gray-400"
                    required
                    data-testid="contact-message"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white h-14 font-bold uppercase tracking-wider rounded-full"
                  data-testid="contact-submit"
                >
                  <span className="flex items-center justify-center gap-2">
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Send Message
                      </>
                    )}
                  </span>
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
