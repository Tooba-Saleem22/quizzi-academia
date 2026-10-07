import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/test');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f8ff, #d1e7dd)',
      color: '#003366',
      fontFamily: 'Arial, sans-serif',
      textAlign: 'center',
      padding: '30px'
    }}>
      <h1 style={{
        fontSize: '2.5rem',
        fontWeight: 'bold',
        marginBottom: '20px',
        color: '#28a745'
      }}>
        🎉 Payment Successful!
      </h1>

      <p style={{ fontSize: '1.3rem', marginBottom: '10px' }}>
        You’ve unlocked <strong>30 days of unlimited quiz access! 🧠🔥</strong>
      </p>

      <p style={{ fontSize: '1.1rem', color: '#555' }}>
        Redirecting to your test page in <span style={{ fontWeight: 'bold' }}>{countdown}</span> seconds...
      </p>

      <div style={{
        fontSize: '3rem',
        marginTop: '30px',
        animation: 'bounce 1s infinite',
        color: '#FFC72C'
      }}>
        🚀
      </div>

      <style>
        {`
          @keyframes bounce {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-10px);
            }
          }
        `}
      </style>
    </div>
  );
};

export default PaymentSuccess;
