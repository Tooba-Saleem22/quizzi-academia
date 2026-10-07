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
  Navigation
} from "lucide-react";
import { motion } from "framer-motion";

const collegeColors = {
  primary: '#003366',
  accent: '#FFC72C',
  background: '#F5F9FF',
  white: '#fff',
  darkGrey: '#444'
};

const AboutUs = () => {
  const [aboutData, setAboutData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('hero');

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/settings`);
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setAboutData(data.data);
          }
        }
      } catch (error) {
        console.error("Error fetching about data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAboutData();
  }, [API_BASE_URL]);

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['hero', 'about', 'mission', 'contact'];
      const scrollPosition = window.scrollY + 100;
      
      sections.forEach(section => {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!aboutData) {
    return (
      <div className="error-container">
        <h2>About Us information not available</h2>
      </div>
    );
  }

  const socialLinks = [
    { platform: "Facebook", icon: <Facebook />, url: aboutData?.socialMedia?.facebook, color: "#1877F2" },
    { platform: "Instagram", icon: <Instagram />, url: aboutData?.socialMedia?.instagram, color: "#E4405F" },
    { platform: "YouTube", icon: <Youtube />, url: aboutData?.socialMedia?.youtube, color: "#FF0000" },
    { platform: "Twitter", icon: <Twitter />, url: aboutData?.socialMedia?.twitter, color: "#1DA1F2" },
    { platform: "LinkedIn", icon: <Linkedin />, url: aboutData?.socialMedia?.linkedin, color: "#0A66C2" },
    { platform: "GitHub", icon: <Github />, url: aboutData?.socialMedia?.github, color: "#333" }
  ];

  const getMapEmbedUrl = () => {
    const address = [
      aboutData.contactInfo?.address,
      aboutData.contactInfo?.city,
      aboutData.contactInfo?.state,
      aboutData.contactInfo?.zipCode,
      aboutData.contactInfo?.country
    ].filter(Boolean).join(", ");
    
    if (!address) return null;
    
    const encodedAddress = encodeURIComponent(address);
    return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3329.1234567890123!2d73.0456789!3d33.7201234!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0:0x0!2z${encodedAddress}!5e0!3m2!1sen!2s!4v1616185473025!5m2!1sen!2s`;
  };

  return (
    <div className="about-container">

      <nav className="nav-dots">
        {['hero', 'about', 'mission', 'contact'].map(section => (
          <button
            key={section}
            onClick={() => document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' })}
            className={`nav-dot ${activeSection === section ? 'active' : ''}`}
            aria-label={`Go to ${section} section`}
          />
        ))}
      </nav>

      <section id="hero" className="hero-section">
        <div className="hero-background" style={{ backgroundImage: `url(${aboutData.aboutUs?.imageUrl})` }}>
          <div className="hero-overlay"></div>
        </div>
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">{aboutData.aboutUs?.title || "About Us"}</h1>
            <p className="hero-tagline">{aboutData.websiteTagline}</p>
          </div>
        </div>
      </section>

      {aboutData.aboutUs?.description && (
        <section id="about" className="about-section">
          <div className="container">
            <div className="content-card">
              <div className="text-content">
                <p className="description-text">{aboutData.aboutUs.description}</p>
                {aboutData.websiteDescription && (
                  <p className="secondary-description">{aboutData.websiteDescription}</p>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

{aboutData.aboutUs?.missionStatement && (
    <motion.div
      initial={{ opacity: 0, rotateY: -180 }}
      whileInView={{ opacity: 1, rotateY: 0 }}
      transition={{ duration: 1.4, ease: "easeOut" }}
      viewport={{ once: true }}
      style={{
        perspective: 1000,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <motion.div
        whileHover={{
          scale: 1.05,
          rotateY: 360,
          backgroundColor: collegeColors.accent,
          color: collegeColors.primary,
        }}
        transition={{ duration: 0.8 }}
        style={{
          textAlign: "center",
          maxWidth: "800px",
          background: collegeColors.primary,
          color: collegeColors.white,
          padding: "3rem",
          borderRadius: "20px",
          boxShadow: "0 12px 32px rgba(0,0,0,0.2)",
          transformStyle: "preserve-3d",
        }}
      >
        <h2
          style={{
            fontSize: "3rem",
            fontWeight: "800",
            marginBottom: "1rem",
            background: `linear-gradient(135deg, ${collegeColors.accent}, ${collegeColors.white})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Our Mission
        </h2>
        <div
          style={{
            width: "100px",
            height: "4px",
            background: `linear-gradient(135deg, ${collegeColors.accent}, ${collegeColors.white})`,
            margin: "0 auto 2rem",
            borderRadius: "2px",
          }}
        />
        <p style={{ fontSize: "1.3rem", lineHeight: 1.8 }}>
          {aboutData.aboutUs.missionStatement}
        </p>
      </motion.div>
    </motion.div>
)}

      <section id="contact" className="contact-section">
        <div className="container">

          {socialLinks.some(link => link.url) && (
            <div className="social-section">
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
            </div>
          )}
        </div>
      </section>

      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .about-container {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: ${collegeColors.darkGrey};
          overflow-x: hidden;
        }

        /* Loading */
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
          border: 4px solid #f3f3f3;
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
        }

        /* Navigation Dots */
        .nav-dots {
          position: fixed;
          right: 2rem;
          top: 50%;
          transform: translateY(-50%);
          z-index: 1000;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .nav-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 2px solid #cbd5e1;
          background: transparent;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .nav-dot:hover,
        .nav-dot.active {
          background: ${collegeColors.primary};
          border-color: ${collegeColors.primary};
          transform: scale(1.2);
        }

        /* Hero Section */
        .hero-section {
          position: relative;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .hero-background {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-size: cover;
          background-position: center;
          background-attachment: fixed;
        }

        .hero-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(0, 51, 102, 0.8), rgba(255, 199, 44, 0.6));
        }

        .hero-content {
          position: relative;
          z-index: 2;
          text-align: center;
          color: ${collegeColors.white};
          max-width: 800px;
          padding: 0 2rem;
        }

        .hero-title {
          font-size: 4rem;
          font-weight: 900;
          margin-bottom: 1rem;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
          animation: fadeInUp 1s ease;
        }

        .hero-tagline {
          font-size: 1.5rem;
          font-weight: 300;
          opacity: 0.95;
          animation: fadeInUp 1s ease 0.3s both;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Container */
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        /* About Section */
        .about-section {
          padding: 5rem 0;
          background: ${collegeColors.background};
        }

        .content-card {
          background: ${collegeColors.white};
          border-radius: 20px;
          padding: 3rem;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          transform: translateY(0);
          transition: transform 0.3s ease;
        }

        .content-card:hover {
          transform: translateY(-5px);
        }

        .description-text {
          font-size: 1.25rem;
          line-height: 1.8;
          color: ${collegeColors.darkGrey};
          margin-bottom: 1.5rem;
        }

        .secondary-description {
          font-size: 1.1rem;
          color: ${collegeColors.darkGrey};
          font-style: italic;
        }

        /* Mission Section */
        .mission-section {
          padding: 5rem 0;
          background: ${collegeColors.primary};
          color: ${collegeColors.white};
        }

        .mission-card {
          text-align: center;
          max-width: 800px;
          margin: 0 auto;
        }

        .mission-title {
          font-size: 3rem;
          font-weight: 800;
          margin-bottom: 1rem;
          background: linear-gradient(135deg, ${collegeColors.accent}, ${collegeColors.white});
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .mission-underline {
          width: 100px;
          height: 4px;
          background: linear-gradient(135deg, ${collegeColors.accent}, ${collegeColors.white});
          margin: 0 auto 2rem;
          border-radius: 2px;
        }

        .mission-text {
          font-size: 1.3rem;
          line-height: 1.8;
          opacity: 0.9;
        }

        /* Contact Section */
        .contact-section {
          padding: 5rem 0;
          background: ${collegeColors.white};
        }

        .contact-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          margin-bottom: 4rem;
        }

        .contact-title {
          font-size: 2rem;
          font-weight: 700;
          color: ${collegeColors.primary};
          margin-bottom: 2rem;
          position: relative;
        }

        .contact-title::after {
          content: '';
          position: absolute;
          bottom: -10px;
          left: 0;
          width: 50px;
          height: 3px;
          background: linear-gradient(135deg, ${collegeColors.primary}, ${collegeColors.accent});
          border-radius: 2px;
        }

        .contact-items {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .contact-item {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1.5rem;
          background: ${collegeColors.background};
          border-radius: 12px;
          transition: all 0.3s ease;
        }

        .contact-item:hover {
          background: #e2e8f0;
          transform: translateX(5px);
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
          color: ${collegeColors.darkGrey};
          display: block;
          margin-bottom: 0.25rem;
        }

        .contact-link {
          color: ${collegeColors.primary};
          text-decoration: none;
          transition: color 0.3s ease;
        }

        .contact-link:hover {
          color: ${collegeColors.accent};
        }

        .contact-address {
          font-style: normal;
          color: ${collegeColors.darkGrey};
          line-height: 1.5;
        }

        /* Map */
        .map-container {
          position: relative;
        }

        .map-wrapper {
          position: relative;
          height: 400px;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }

        .interactive-map {
          width: 100%;
          height: 100%;
          border: none;
          filter: grayscale(20%) contrast(1.1);
        }

        /* Social Section */
        .social-section {
          text-align: center;
          padding-top: 3rem;
          border-top: 1px solid #e5e7eb;
        }

        .social-title {
          font-size: 2rem;
          font-weight: 700;
          color: ${collegeColors.primary};
          margin-bottom: 2rem;
        }

        .social-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          max-width: 800px;
          margin: 0 auto;
        }

        .social-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem;
          background: ${collegeColors.white};
          border: 2px solid #e5e7eb;
          border-radius: 16px;
          text-decoration: none;
          color: ${collegeColors.darkGrey};
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .social-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.5s ease;
        }

        .social-card:hover {
          border-color: var(--social-color);
          transform: translateY(-3px);
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
        }

        .social-card:hover::before {
          left: 100%;
        }

        .social-icon {
          color: var(--social-color);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .social-icon svg {
          width: 24px;
          height: 24px;
        }

        .social-name {
          font-weight: 600;
          flex: 1;
        }

        .social-external {
          width: 16px;
          height: 16px;
          opacity: 0.5;
          transition: opacity 0.3s ease;
        }

        .social-card:hover .social-external {
          opacity: 1;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .nav-dots {
            right: 1rem;
          }

          .hero-title {
            font-size: 2.5rem;
          }

          .hero-tagline {
            font-size: 1.2rem;
          }

          .contact-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
          }

          .content-card {
            padding: 2rem;
          }

          .container {
            padding: 0 1rem;
          }

          .mission-title {
            font-size: 2rem;
          }

          .social-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 480px) {
          .hero-title {
            font-size: 2rem;
          }

          .hero-tagline {
            font-size: 1rem;
          }

          .mission-title {
            font-size: 1.5rem;
          }

          .contact-title {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default AboutUs;
