import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const collegeColors = {
  primary: '#003366',
  accent: '#FFC72C',
  backgroundStart: '#F5F9FF',
  backgroundEnd: '#D6E4FF',
  white: '#fff',
  darkGrey: '#444',
};

const fadeSlideDuration = 400;

const LoginPage = () => {
  const [currState, setCurrState] = useState('Login');
  const [animating, setAnimating] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (message) {
      setShowAlert(true);
      const timer = setTimeout(() => setShowAlert(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const switchState = (nextState) => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => {
      setCurrState(nextState);
      setMessage(null);
      setName('');
      setEmail('');
      setPassword('');
      setIsAdmin(false);
      setAnimating(false);
    }, fadeSlideDuration);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    try {
      const url = currState === 'Login' ? '/api/user/login' : '/api/user/register';
      const payload = currState === 'Login' ? { email, password, isAdmin } : { name, email, password };

      const response = await axios.post(url, payload, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      });

      localStorage.setItem('token', response.data.accesstoken);

      if (currState === 'Login') {
        const user = {
          name: response.data.name,
          email: response.data.email,
          isAdmin: isAdmin,
          approved: response.data.approved || false  // ✅ Save approval/payment status
        };
        localStorage.setItem('user', JSON.stringify(user));
      }

      setMessage(response.data.msg || 'Success!');
      setMessageType('success');

      if (currState === 'Login') {
        if (isAdmin) {
          navigate('/admin/dashboard');
        } else {
          navigate('/');
          window.location.reload();
        }
      } else {
        switchState('Login'); 
      }

    } catch (error) {
      setMessage(error.response?.data?.msg || 'Something went wrong');
      setMessageType('error');
    }
  };

  return (
    <>
      <style>{`
        @keyframes gradientBG {
          0% {background-position: 0% 50%;}
          50% {background-position: 100% 50%;}
          100% {background-position: 0% 50%;}
        }
        @keyframes fadeSlideDown {
          0% {opacity: 0; transform: translateY(-20px);}
          100% {opacity: 1; transform: translateY(0);}
        }
        input:focus {
          box-shadow: 0 0 8px ${collegeColors.accent}88;
          transform: scale(1.02);
          border-color: ${collegeColors.accent} !important;
        }
        input, label {
          transition: all 0.3s ease;
        }
      `}</style>

      <div style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        background: `linear-gradient(270deg, ${collegeColors.backgroundStart}, ${collegeColors.backgroundEnd}, ${collegeColors.backgroundStart})`,
        backgroundSize: '600% 600%',
        animation: 'gradientBG 16s ease infinite',
        padding: 20,
        position: 'relative',
      }}>
        <button
          onClick={() => navigate('/')}
          style={{
            position: 'absolute',
            top: 20,
            left: 20,
            fontSize: 30,
            backgroundColor: 'transparent',
            border: 'none',
            color: collegeColors.primary,
            cursor: 'pointer',
            userSelect: 'none',
            transition: 'color 0.3s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = collegeColors.accent)}
          onMouseLeave={(e) => (e.currentTarget.style.color = collegeColors.primary)}
        >
          ←
        </button>

        <div style={{
          backgroundColor: collegeColors.white,
          padding: '45px 60px',
          borderRadius: 14,
          width: '100%',
          maxWidth: 460,
          boxShadow: '0 12px 30px rgba(0, 0, 0, 0.15)',
          textAlign: 'center',
          transform: animating ? 'translateX(-40px)' : 'translateX(0)',
          opacity: animating ? 0 : 1,
          transition: `opacity ${fadeSlideDuration}ms ease, transform ${fadeSlideDuration}ms ease`,
        }}>
          <h2 style={{
            color: collegeColors.primary,
            marginBottom: 36,
            fontWeight: '700',
            fontSize: 32,
          }}>{currState}</h2>

          {showAlert && (
            <div style={{
              marginBottom: 28,
              padding: 14,
              borderRadius: 8,
              color: messageType === 'success' ? '#155724' : '#721c24',
              backgroundColor: messageType === 'success' ? '#d4edda' : '#f8d7da',
              border: `1.5px solid ${messageType === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
              fontWeight: 600,
              fontSize: 15,
              animation: 'fadeSlideDown 0.5s ease forwards',
              boxShadow: `0 2px 12px ${messageType === 'success' ? '#a7d7a6cc' : '#f5a3a3cc'}`,
            }}>{message}</div>
          )}

          <form onSubmit={handleSubmit} noValidate style={{ textAlign: 'left' }}>
            {currState === 'Sign up' && (
              <div style={{ marginBottom: 24 }}>
                <label htmlFor="nameInput" style={{
                  display: 'block', marginBottom: 8, fontWeight: '600', color: collegeColors.darkGrey
                }}>Name</label>
                <input id="nameInput" type="text" value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  required
                  style={{
                    width: '100%', padding: '14px 16px', fontSize: 17,
                    borderRadius: 8, border: `1.8px solid ${collegeColors.darkGrey}`,
                    outline: 'none', fontWeight: 500
                  }} />
              </div>
            )}

            <div style={{ marginBottom: 24 }}>
              <label htmlFor="emailInput" style={{
                display: 'block', marginBottom: 8, fontWeight: '600', color: collegeColors.darkGrey
              }}>Email</label>
              <input id="emailInput" type="email" value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                style={{
                  width: '100%', padding: '14px 16px', fontSize: 17,
                  borderRadius: 8, border: `1.8px solid ${collegeColors.darkGrey}`,
                  outline: 'none', fontWeight: 500
                }} />
            </div>

            <div style={{ marginBottom: 30 }}>
              <label htmlFor="passwordInput" style={{
                display: 'block', marginBottom: 8, fontWeight: '600', color: collegeColors.darkGrey
              }}>Password</label>
              <input id="passwordInput" type="password" value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                style={{
                  width: '100%', padding: '14px 16px', fontSize: 17,
                  borderRadius: 8, border: `1.8px solid ${collegeColors.darkGrey}`,
                  outline: 'none', fontWeight: 500
                }} />
            </div>

            {currState === 'Login' && (
              <div style={{
                marginBottom: 36, display: 'flex', alignItems: 'center'
              }}>
                <input type="checkbox" id="adminCheck" checked={isAdmin}
                  onChange={(e) => setIsAdmin(e.target.checked)}
                  style={{
                    width: 22, height: 22, marginRight: 12, cursor: 'pointer',
                    accentColor: collegeColors.accent
                  }} />
                <label htmlFor="adminCheck" style={{
                  fontWeight: '600', color: collegeColors.darkGrey, cursor: 'pointer'
                }}>Admin Login</label>
              </div>
            )}

            <button type="submit"
              style={{
                width: '100%',
                padding: '16px 0',
                fontSize: 20,
                fontWeight: '700',
                backgroundColor: collegeColors.primary,
                color: collegeColors.white,
                borderRadius: 12,
                border: 'none',
                cursor: 'pointer',
                boxShadow: `0 0 12px ${collegeColors.primary}aa`,
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = collegeColors.accent;
                e.currentTarget.style.color = collegeColors.primary;
                e.currentTarget.style.boxShadow = `0 0 18px ${collegeColors.accent}cc`;
                e.currentTarget.style.transform = 'scale(1.03)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = collegeColors.primary;
                e.currentTarget.style.color = collegeColors.white;
                e.currentTarget.style.boxShadow = `0 0 12px ${collegeColors.primary}aa`;
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              {currState}
            </button>
          </form>

          <p style={{
            marginTop: 36,
            color: collegeColors.darkGrey,
            fontWeight: '600',
            fontSize: 15,
          }}>
            {currState === 'Login'
              ? "Don't have an account? "
              : 'Already have an account? '}
            <span onClick={() => switchState(currState === 'Login' ? 'Sign up' : 'Login')}
              style={{
                color: collegeColors.accent,
                cursor: 'pointer',
                fontWeight: '700',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = collegeColors.primary;
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = collegeColors.accent;
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              {currState === 'Login' ? 'Sign up' : 'Login'}
            </span>
          </p>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
