import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import axios from "axios";

const collegeColors = {
  primary: '#003366',
  accent: '#FFC72C',
  background: '#F5F9FF',
  white: '#fff',
  darkGrey: '#444'
};

export default function Navbar() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [websiteName, setWebsiteName] = useState(''); // ✅ Website name state
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // ✅ Fetch website name from settings
  useEffect(() => {
    const fetchWebsiteName = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/settings`);
        if (res.data.success) {
          setWebsiteName(res.data.data?.websiteName || 'Quizzi Academi');
        }
      } catch (err) {
        console.error('Failed to fetch website name:', err);
        setWebsiteName('Quizzi Academi');
      }
    };

    fetchWebsiteName();
  }, []);

  // Check payment approval
  const checkApprovalStatus = async () => {
    if (!user?.email) return;

    try {
      const res = await axios.get(`/api/payments/check-access?email=${user.email}`);
      const updatedUser = { ...user, approved: res.data.hasAccess };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (err) {
      console.error("Error checking approval:", err);
    }
  };

  useEffect(() => {
    checkApprovalStatus();
  }, [user?.email]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate("/");
    window.location.reload();
  };

  const handleJoinNow = () => {
    navigate("/loginPage");
    setMobileMenuOpen(false);
  };

  const handleQuizClick = async () => { console.log("QUIZ CLICK USER:", user);
    if (!user) {
      navigate("/loginPage");
      return;
    }

    try {
      const res = await axios.get(
        `/api/payments/check-access?email=${encodeURIComponent(user.email)}`
      );

      const approved = res.data.hasAccess;

      const updatedUser = {
        ...user,
        approved
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);

      if (approved) {
        navigate("/test");
      } else {
        navigate("/pay");
      }
    } catch (err) {
      console.error("Error checking quiz access:", err);
      navigate("/pay");
    }

    setMobileMenuOpen(false);
  };

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/courses", label: "Courses" },
    { path: "/about", label: "About" },
    { path: "/contact", label: "Contact" }
  ];

  return (
    <>
      <nav style={{
        backgroundColor: collegeColors.white,
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 999,
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
      }}>
        <div style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '0.75rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <Link to="/" style={{
            color: collegeColors.primary,
            fontWeight: '900',
            fontSize: '1.75rem',
            textDecoration: 'none'
          }}
            onClick={() => setMobileMenuOpen(false)}
          >
            <h1 style={{
              fontSize: '20px',
              fontFamily: `'Pacifico', cursive`,
              color: collegeColors.accent,
              margin: 0
            }}>
              {websiteName.split(' ')[0]} <span style={{ color: collegeColors.darkGrey }}>{websiteName.split(' ').slice(1).join(' ')}</span>
            </h1>
          </Link>

          <div style={{
            display: 'flex',
            gap: '1.8rem',
            alignItems: 'center',
            fontWeight: '600',
            fontSize: '1rem'
          }} className="desktop-menu">
            {navLinks.map(({ path, label }) => {
              if (!user && path === "/courses") return null;
              return (
                <NavLink
                  key={path}
                  to={path}
                  end
                  style={({ isActive }) => ({
                    color: isActive ? collegeColors.primary : collegeColors.darkGrey,
                    textDecoration: 'none',
                    paddingBottom: 4,
                    borderBottom: isActive ? `3px solid ${collegeColors.primary}` : '3px solid transparent',
                  })}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {label}
                </NavLink>
              );
            })}

            {user && (
              <span
                onClick={handleQuizClick}
                style={{
                  cursor: 'pointer',
                  color: collegeColors.darkGrey,
                  fontWeight: '600',
                  fontSize: '1rem'
                }}
              >
                Quiz {user.approved ? (
                  <span style={{ fontSize: '0.8em', color: collegeColors.accent }}>✓</span>
                ) : (
                  <span style={{ fontSize: '0.7em', color: '#ff6b6b', marginLeft: '4px' }}>🔒</span>
                )}
              </span>
            )}

            {user ? (
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <Link to="/userProfilePage" style={{
                  fontWeight: 600,
                  color: collegeColors.primary,
                  textDecoration: 'none',
                  fontStyle: 'italic'
                }}>
                  {user.name || "Profile"}
                </Link>
                <button
                  onClick={handleLogout}
                  style={{
                    padding: '8px 18px',
                    fontWeight: '700',
                    fontSize: '1rem',
                    color: collegeColors.white,
                    backgroundColor: collegeColors.primary,
                    border: 'none',
                    borderRadius: 4,
                    cursor: 'pointer',
                  }}
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={handleJoinNow}
                style={{
                  padding: '8px 22px',
                  fontWeight: '700',
                  fontSize: '1rem',
                  color: collegeColors.white,
                  backgroundColor: collegeColors.primary,
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer',
                }}
              >
                Join Now
              </button>
            )}
          </div>
        </div>
      </nav>

      <style>
        {`
          @media (max-width: 900px) {
            .desktop-menu {
              display: none;
            }
          }
        `}
      </style>
    </>
  );
}


