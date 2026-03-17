import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Mail, MessageSquare, MapPin, Clock, Send, Loader2 } from 'lucide-react';
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
    
    // Simulate form submission
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
    <div className="min-h-screen py-24 md:py-32">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-[#00F0FF] text-sm uppercase tracking-widest font-medium mb-4">Get In Touch</p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">CONTACT US</h1>
          <p className="text-white/50 max-w-xl mx-auto">
            Have questions about your order or need assistance? Our support team is here to help you 24/7.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Info Cards */}
          <div className="space-y-4">
            {contactInfo.map((info, index) => (
              <div 
                key={index}
                className="p-6 bg-[#0a0a0a] border border-white/5 rounded-lg hover:border-[#00F0FF]/30 transition-colors"
              >
                <div className="w-12 h-12 rounded-lg bg-[#00F0FF]/10 text-[#00F0FF] flex items-center justify-center mb-4">
                  {info.icon}
                </div>
                <h3 className="font-bold text-lg mb-1">{info.title}</h3>
                <p className="text-[#00F0FF]">{info.detail}</p>
                <p className="text-white/50 text-sm">{info.subtext}</p>
              </div>
            ))}
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="p-8 bg-[#0a0a0a] border border-white/5 rounded-lg">
              <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Your Name</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="John Doe"
                      className="bg-black/50 border-white/10 h-12"
                      required
                      data-testid="contact-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email Address</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="you@example.com"
                      className="bg-black/50 border-white/10 h-12"
                      required
                      data-testid="contact-email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Input
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="How can we help?"
                    className="bg-black/50 border-white/10 h-12"
                    required
                    data-testid="contact-subject"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Message</Label>
                  <Textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us more about your inquiry..."
                    className="bg-black/50 border-white/10 min-h-[150px]"
                    required
                    data-testid="contact-message"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-skew bg-[#00F0FF] text-black h-14 font-bold uppercase tracking-wider"
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
