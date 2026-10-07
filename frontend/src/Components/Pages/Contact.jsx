import React, { useState, useEffect } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Youtube,
  Twitter,
  Linkedin,
  Github,
  ExternalLink,
  Send,
  User,
  MessageSquare
} from "lucide-react";

const ContactPage = () => {
  const collegeColors = {
    primary: '#003366',     
    accent: '#FFE24C',      
    background: '#F5F9FF',  
    white: '#FFFFFF',      
    darkGrey: '#1F2937'    
  };
  
  const [contactData, setContactData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [formStatus, setFormStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchContactData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/settings`);
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setContactData(data.data);
          }
        }
      } catch (error) {
        console.error("Error fetching contact data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContactData();
  }, [API_BASE_URL]);

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
    setFormStatus({ type: '', message: '' });

    try {
      const response = await fetch(`${API_BASE_URL}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          adminEmail: contactData?.adminEmail || ''
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setFormStatus({ 
          type: 'success', 
          message: data.message || 'Thank you! Your message has been sent successfully.' 
        });
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setFormStatus({ 
          type: 'error', 
          message: data.message || 'Sorry, there was an error sending your message. Please try again.' 
        });
      }
    } catch (error) {
      setFormStatus({ 
        type: 'error', 
        message: 'Network error. Please check your connection and try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!contactData) {
    return (
      <div className="error-container">
        <h2>Contact information not available</h2>
      </div>
    );
  }

  const socialLinks = [
    { platform: "Facebook", icon: <Facebook />, url: contactData?.socialMedia?.facebook, color: "#1877F2" },
    { platform: "Instagram", icon: <Instagram />, url: contactData?.socialMedia?.instagram, color: "#E4405F" },
    { platform: "YouTube", icon: <Youtube />, url: contactData?.socialMedia?.youtube, color: "#FF0000" },
    { platform: "Twitter", icon: <Twitter />, url: contactData?.socialMedia?.twitter, color: "#1DA1F2" },
    { platform: "LinkedIn", icon: <Linkedin />, url: contactData?.socialMedia?.linkedin, color: "#0A66C2" },
    { platform: "GitHub", icon: <Github />, url: contactData?.socialMedia?.github, color: "#333" }
  ];

  const getMapEmbedUrl = () => {
    const address = [
      contactData.contactInfo?.address,
      contactData.contactInfo?.city,
      contactData.contactInfo?.state,
      contactData.contactInfo?.zipCode,
      contactData.contactInfo?.country
    ].filter(Boolean).join(", ");
    
    if (!address) return null;
    
    const encodedAddress = encodeURIComponent(address);
    return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3329.1234567890123!2d73.0456789!3d33.7201234!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0:0x0!2z${encodedAddress}!5e0!3m2!1sen!2s!4v1616185473025!5m2!1sen!2s`;
  };

  return (
    <div className="contact-container">
      <section
        style={{
          backgroundColor: '#003366',
          padding: '50px 15vw',
          color: '#ECECEC',
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          textAlign: 'left',
          borderRadius: '8px',
          maxWidth: '900px',
          margin: '40px auto',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
        }}
      >
        <h1
          style={{
            fontSize: '3rem',
            fontWeight: '600',
            marginBottom: '12px',
            letterSpacing: '0.02em',
            lineHeight: 1.1,
          }}
        >
          Get In Touch
        </h1>
        <p
          style={{
            fontSize: '1.2rem',
            lineHeight: 1.6,
            color: '#BFC9D9',
            maxWidth: '600px',
          }}
        >
          We welcome your questions and feedback. Reach out anytime, and we'll respond promptly.
        </p>
      </section>
      
      <div className="container">
        <section className="contact-section">
          <div className="contact-grid">
            <div className="form-container">
              <div className="form-header">
                <h2 className="form-title">Send us a Message</h2>
                <p className="form-subtitle">Fill out the form below and we'll get back to you soon</p>
              </div>
              
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-group">
                  <div className="input-wrapper">
                    <User className="input-icon" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Your Name"
                      required
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <div className="input-wrapper">
                    <Mail className="input-icon" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Your Email"
                      required
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <div className="input-wrapper">
                    <MessageSquare className="input-icon" />
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder="Subject"
                      required
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <div className="textarea-wrapper">
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Your Message"
                      required
                      rows="6"
                      className="form-textarea"
                    />
                  </div>
                </div>

                {formStatus.message && (
                  <div className={`form-status ${formStatus.type}`}>
                    {formStatus.message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="submit-button"
                >
                  {isSubmitting ? (
                    <div className="button-loading">
                      <div className="spinner"></div>
                      Sending...
                    </div>
                  ) : (
                    <>
                      <Send className="button-icon" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="contact-info">
              <div className="info-header">
                <h2 className="info-title">Contact Information</h2>
                <p className="info-subtitle">Reach out to us through any of these channels</p>
              </div>
              
              <div className="contact-items">
                {contactData.adminEmail && (
                  <div className="contact-item">
                    <div className="contact-icon">
                      <Mail />
                    </div>
                    <div className="contact-details">
                      <span className="contact-label">Admin Email</span>
                      <a href={`mailto:${contactData.adminEmail}`} className="contact-link">
                        {contactData.adminEmail}
                      </a>
                    </div>
                  </div>
                )}
                
                {contactData.supportEmail && (
                  <div className="contact-item">
                    <div className="contact-icon">
                      <Mail />
                    </div>
                    <div className="contact-details">
                      <span className="contact-label">Support Email</span>
                      <a href={`mailto:${contactData.supportEmail}`} className="contact-link">
                        {contactData.supportEmail}
                      </a>
                    </div>
                  </div>
                )}
                
                {contactData.contactInfo?.phone && (
                  <div className="contact-item">
                    <div className="contact-icon">
                      <Phone />
                    </div>
                    <div className="contact-details">
                      <span className="contact-label">Phone</span>
                      <a href={`tel:${contactData.contactInfo.phone}`} className="contact-link">
                        {contactData.contactInfo.phone}
                      </a>
                    </div>
                  </div>
                )}
                
                {(contactData.contactInfo?.address || contactData.contactInfo?.city) && (
                  <div className="contact-item">
                    <div className="contact-icon">
                      <MapPin />
                    </div>
                    <div className="contact-details">
                      <span className="contact-label">Address</span>
                      <address className="contact-address">
                        {[
                          contactData.contactInfo.address,
                          contactData.contactInfo.city,
                          contactData.contactInfo.state,
                          contactData.contactInfo.zipCode,
                          contactData.contactInfo.country
                        ].filter(Boolean).join(", ")}
                      </address>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {(contactData.contactInfo?.address || contactData.contactInfo?.city) && (
          <section className="map-section">
            <div className="map-header">
              <h2 className="map-title">Find Us Here</h2>
              <p className="map-subtitle">Visit us at our location</p>
            </div>
            <div className="map-container">
              <iframe
                src={getMapEmbedUrl()}
                className="interactive-map"
                frameBorder={0}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Location Map"
                aria-hidden="false"
                tabIndex={0}
              ></iframe>
            </div>
          </section>
        )}

        {socialLinks.some(link => link.url) && (
          <section className="social-section">
            <div className="social-header">
              <h2 className="social-title">Connect With Us</h2>
              <p className="social-subtitle">Follow us on social media for updates</p>
            </div>
            <div className="social-grid">
              {socialLinks
                .filter(link => link.url)
                .map(({ platform, icon, url, color }) => (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-card"
                    style={{ '--social-color': color }}
                  >
                    <div className="social-icon">{icon}</div>
                    <span className="social-name">{platform}</span>
                    <ExternalLink className="social-external" />
                  </a>
                ))}
            </div>
          </section>
        )}
      </div>

      <style >{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .contact-container {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: ${collegeColors.darkGrey};
          min-height: 100vh;
        }

        /* Loading States */
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          gap: 1rem;
        }

        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 4px solid #f3f4f6;
          border-top: 4px solid ${collegeColors.primary};
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error-container {
          text-align: center;
          padding: 4rem;
          color: #ef4444;
        }

        /* Container */
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        /* Contact Section */
        .contact-section {
          padding: 5rem 0;
          background: ${collegeColors.background};
        }

        .contact-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: start;
        }

        /* Contact Form */
        .form-container {
          background: ${collegeColors.white};
          border-radius: 24px;
          padding: 3rem;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);
          position: relative;
          overflow: hidden;
        }

        .form-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, ${collegeColors.primary}, ${collegeColors.accent}, ${collegeColors.primary});
        }

        .form-header {
          margin-bottom: 2rem;
        }

        .form-title {
          font-size: 2rem;
          font-weight: 800;
          color: ${collegeColors.primary};
          margin-bottom: 0.5rem;
        }

        .form-subtitle {
          color: #6b7280;
          font-size: 1rem;
        }

        .contact-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-group {
          position: relative;
        }

        .input-wrapper, .textarea-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 1rem;
          z-index: 2;
          color: #9ca3af;
          width: 20px;
          height: 20px;
          transition: color 0.3s ease;
        }

        .form-input, .form-textarea {
          width: 100%;
          padding: 1rem 1rem 1rem 3rem;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 1rem;
          transition: all 0.3s ease;
          background: #fafafa;
        }

        .form-textarea {
          padding-left: 1rem;
          resize: vertical;
          min-height: 150px;
        }

        .form-input:focus, .form-textarea:focus {
          outline: none;
          border-color: ${collegeColors.primary};
          background: white;
          box-shadow: 0 0 0 3px rgba(0, 51, 102, 0.1);
        }

        .form-input:focus + .input-icon {
          color: ${collegeColors.primary};
        }

        .submit-button {
          background: linear-gradient(135deg, ${collegeColors.primary}, ${collegeColors.accent});
          color: ${collegeColors.white};
          border: none;
          padding: 1rem 2rem;
          border-radius: 12px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          position: relative;
          overflow: hidden;
        }

        .submit-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px -5px rgba(0, 51, 102, 0.4);
        }

        .submit-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .button-icon {
          width: 20px;
          height: 20px;
        }

        .button-loading {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .form-status {
          padding: 1rem;
          border-radius: 12px;
          font-weight: 500;
          text-align: center;
        }

        .form-status.success {
          background: #dcfce7;
          color: #166534;
          border: 1px solid #bbf7d0;
        }

        .form-status.error {
          background: #fef2f2;
          color: #dc2626;
          border: 1px solid #fecaca;
        }

        /* Contact Information */
        .contact-info {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .info-header {
          text-align: center;
        }

        .info-title {
          font-size: 2rem;
          font-weight: 800;
          color: ${collegeColors.primary};
          margin-bottom: 0.5rem;
        }

        .info-subtitle {
          color: #6b7280;
          font-size: 1rem;
        }

        .contact-items {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .contact-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem;
          background: ${collegeColors.white};
          border-radius: 16px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
        }

        .contact-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
        }

        .contact-icon {
          background: linear-gradient(135deg, ${collegeColors.primary}, ${collegeColors.accent});
          color: ${collegeColors.white};
          padding: 12px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 48px;
          min-height: 48px;
        }

        .contact-icon svg {
          width: 24px;
          height: 24px;
        }

        .contact-details {
          flex: 1;
        }

        .contact-label {
          font-weight: 600;
          color: ${collegeColors.primary};
          display: block;
          margin-bottom: 0.25rem;
          font-size: 0.9rem;
        }

        .contact-link {
          color: ${collegeColors.primary};
          text-decoration: none;
          transition: color 0.3s ease;
          font-weight: 500;
        }

        .contact-link:hover {
          color: ${collegeColors.accent};
        }

        .contact-address {
          font-style: normal;
          color: #6b7280;
          line-height: 1.5;
        }

        /* Map Section */
        .map-section {
          padding: 5rem 0;
          background: ${collegeColors.white};
        }

        .map-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .map-title {
          font-size: 2.5rem;
          font-weight: 800;
          color: ${collegeColors.primary};
          margin-bottom: 0.5rem;
        }

        .map-subtitle {
          color: #6b7280;
          font-size: 1.1rem;
        }

        .map-container {
          position: relative;
          height: 500px;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
        }

        .interactive-map {
          width: 100%;
          height: 100%;
          border: none;
          filter: grayscale(10%) contrast(1.05);
        }

        /* Social Section */
        .social-section {
          padding: 5rem 0;
          background: linear-gradient(135deg, ${collegeColors.background} 0%, #e2e8f0 100%);
        }

        .social-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .social-title {
          font-size: 2.5rem;
          font-weight: 800;
          color: ${collegeColors.primary};
          margin-bottom: 0.5rem;
        }

        .social-subtitle {
          color: #6b7280;
          font-size: 1.1rem;
        }

        .social-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
          max-width: 900px;
          margin: 0 auto;
        }

        .social-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 2rem;
          background: ${collegeColors.white};
          border: 2px solid transparent;
          border-radius: 20px;
          text-decoration: none;
          color: ${collegeColors.darkGrey};
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .social-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          transition: left 0.6s ease;
        }

        .social-card:hover {
          border-color: var(--social-color);
          transform: translateY(-5px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.15);
        }

        .social-card:hover::before {
          left: 100%;
        }

        .social-icon {
          color: var(--social-color);
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 51, 102, 0.1);
          padding: 12px;
          border-radius: 12px;
        }

        .social-icon svg {
          width: 28px;
          height: 28px;
        }

        .social-name {
          font-weight: 700;
          flex: 1;
          font-size: 1.1rem;
        }

        .social-external {
          width: 20px;
          height: 20px;
          opacity: 0.5;
          transition: all 0.3s ease;
        }

        .social-card:hover .social-external {
          opacity: 1;
          transform: translateX(3px);
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .contact-grid {
            gap: 3rem;
          }
        }

        @media (max-width: 768px) {
          .contact-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
          }

          .form-container, .contact-info {
            padding: 2rem;
          }

          .container {
            padding: 0 1rem;
          }

          .social-grid {
            grid-template-columns: 1fr;
          }

          .map-container {
            height: 400px;
          }
        }

        @media (max-width: 480px) {
          .form-title, .info-title, .map-title, .social-title {
            font-size: 1.5rem;
          }

          .form-container {
            padding: 1.5rem;
          }

          .contact-item {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ContactPage;