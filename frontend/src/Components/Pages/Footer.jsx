import React, { useEffect, useState } from "react";

const collegeColors = {
  primary: '#003366',
  accent: '#FFC72C',
  background: '#F5F9FF',
  white: '#fff',
  darkGrey: '#444'
};

const Footer = () => {
  const [settings, setSettings] = useState(null);
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/settings`);
        const data = await response.json();
        if (data.success) {
          setSettings(data.data);
        } else {
          console.error("Failed to fetch settings");
        }
      } catch (error) {
        console.error("Error fetching footer settings:", error);
      }
    };

    fetchSettings();
  }, []);

  if (!settings) return null;

  const contact = settings.contactInfo;
  const social = settings.socialMedia;

  const socialItems = [
    { href: social.youtube, icon: "fab fa-youtube" },
    { href: social.facebook, icon: "fab fa-facebook-f" },
    { href: social.github, icon: "fab fa-github" },
    { href: social.linkedin, icon: "fab fa-linkedin-in" },
    { href: social.instagram, icon: "fab fa-instagram" },
    { href: social.twitter, icon: "fab fa-twitter" },
  ].filter(({ href }) => href);

  return (
    <footer
      style={{
        backgroundColor: collegeColors.primary,
        color: collegeColors.white,
        padding: "2rem 1rem 1rem",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "2rem",
          alignItems: "flex-start",
        }}
      >
        <div style={{ flex: "1 1 500px", minWidth: "280px" }}>
          {contact.address && (
            <p style={{ fontSize: "0.95rem", margin: "0.4rem 0" }}>
              <i className="fa fa-map-marker-alt" style={{ marginRight: "10px", color: collegeColors.accent }} />
              <a
                href={`https://www.google.com/maps/search/?q=${encodeURIComponent(contact.address)}`}
                target="_blank"
                rel="noreferrer"
                style={{ color: collegeColors.white, textDecoration: "none" }}
              >
                {contact.address}, {contact.city}, {contact.country}
              </a>
            </p>
          )}
          {contact.phone && (
            <p style={{ fontSize: "0.95rem", margin: "0.4rem 0" }}>
              <i className="fa fa-phone-alt" style={{ marginRight: "10px", color: collegeColors.accent }} />
              <a
                href={`tel:${contact.phone}`}
                style={{ color: collegeColors.white, textDecoration: "none" }}
              >
                {contact.phone}
              </a>
            </p>
          )}
          {settings.supportEmail && (
            <p style={{ fontSize: "0.95rem", margin: "0.4rem 0" }}>
              <i className="fa fa-envelope" style={{ marginRight: "10px", color: collegeColors.accent }} />
              <a
                href={`mailto:${settings.supportEmail}`}
                style={{ color: collegeColors.white, textDecoration: "none" }}
              >
                {settings.supportEmail}
              </a>
            </p>
          )}
        </div>

        <div
          style={{
            flex: "1 1 300px",
            display: "flex",
            flexDirection: "column",
            gap: "0.8rem",
            alignItems: "flex-end",
            minWidth: "250px",
          }}
        >
          {[0, 3].map(startIndex => (
            <div key={startIndex} style={{ display: "flex", gap: "1rem" }}>
              {socialItems.slice(startIndex, startIndex + 3).map(({ href, icon }, index) => (
                <a
                  key={index}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    width: "2.5rem",
                    height: "2.5rem",
                    backgroundColor: "#ffffff20",
                    borderRadius: "50%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    color: collegeColors.white,
                    fontSize: "1.3rem",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = collegeColors.accent)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = collegeColors.white)}
                >
                  <i className={icon} />
                </a>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.2)",
          marginTop: "2rem",
          paddingTop: "1rem",
          fontSize: "0.85rem",
          textAlign: "center",
        }}
      >
        ©{" "}
        <a
          href="/"
          style={{
            color: collegeColors.accent,
            textDecoration: "underline",
            cursor: "pointer",
          }}
        >
          {settings.websiteName || "Quizzi Academi"}
        </a>{" "}
        — All Rights Reserved. Designed by{" "}
        <a
          href="https://www.linkedin.com/in/"
          target="_blank"
          rel="noreferrer"
          style={{
            color: collegeColors.accent,
            textDecoration: "underline",
            cursor: "pointer",
          }}
        >
          BSCS Final Year Student
        </a>
      </div>
    </footer>
  );
};

export default Footer;
