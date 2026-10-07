import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../Pages/Navbar';
import Footer from '../Pages/Footer';
const PaymentPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formData, setFormData] = useState({
    userName: '',
    userEmail: '',
    userPhone: '',
    transactionId: '',
    receipt: null,
  });
  const [errors, setErrors] = useState({});

  const easypaisaNumber = '03001234567';
  const paymentAmount = 500;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/user/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });

        setFormData(prev => ({
          ...prev,
          userName: res.data.fullName || '',
          userEmail: res.data.email || ''
        }));
      } catch (err) {
        console.error('Failed to fetch user info:', err);
      }
    };

    fetchUser();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev, receipt: 'Please upload a valid image file (JPG, PNG, GIF)' }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, receipt: 'File size should be less than 5MB' }));
      return;
    }

    setFormData(prev => ({ ...prev, receipt: file }));
    if (errors.receipt) setErrors(prev => ({ ...prev, receipt: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.userPhone.trim()) {
      newErrors.userPhone = 'Phone number is required';
    } else if (!/^03\d{9}$/.test(formData.userPhone.trim())) {
      newErrors.userPhone = 'Enter a valid Pakistani phone number';
    }
    if (!formData.transactionId.trim()) {
      newErrors.transactionId = 'Transaction ID is required';
    } else if (formData.transactionId.trim().length < 6) {
      newErrors.transactionId = 'Transaction ID must be at least 6 characters';
    }
    if (!formData.receipt) {
      newErrors.receipt = 'Receipt image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      const data = new FormData();
      data.append('userName', formData.userName.trim());
      data.append('userEmail', formData.userEmail.trim());
      data.append('userPhone', formData.userPhone.trim());
      data.append('transactionId', formData.transactionId.trim());
      data.append('paymentAmount', paymentAmount);
      data.append('easypaisaNumber', easypaisaNumber);
      data.append('receipt', formData.receipt);

      const response = await axios.post('/api/payments/submit-verification', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        setSubmitSuccess(true);
        setFormData({ userName: '', userEmail: '', userPhone: '', transactionId: '', receipt: null });
        document.getElementById('receipt-input').value = '';
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to submit payment.');
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: { minHeight: '100vh', backgroundColor: '#f8f9fa', padding: '2rem 1rem' },
    card: {
      maxWidth: '600px', margin: '0 auto', backgroundColor: 'white',
      borderRadius: '10px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', overflow: 'hidden',
      animation: 'fadeIn 0.8s ease-out'
    },
    header: {
      backgroundColor: '#003366', color: 'white',
      padding: '2rem', textAlign: 'center',
      animation: 'glow 2s infinite ease-in-out'
    },
    body: { padding: '2rem' },
    instructionBox: {
      backgroundColor: '#e3f2fd', border: '1px solid #2196f3',
      borderRadius: '8px', padding: '1.5rem', marginBottom: '2rem'
    },
    formGroup: { marginBottom: '1.5rem' },
    label: { display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#333' },
    input: {
      width: '100%', padding: '0.75rem', border: '2px solid #ddd',
      borderRadius: '6px', fontSize: '1rem', transition: '0.3s ease'
    },
    inputError: { borderColor: '#dc3545' },
    fileInput: {
      width: '100%', padding: '0.5rem', border: '2px dashed #ddd',
      borderRadius: '6px', backgroundColor: '#f8f9fa', cursor: 'pointer',
      transition: 'all 0.3s ease-in-out'
    },
    errorText: { color: '#dc3545', fontSize: '0.875rem', marginTop: '0.25rem' },
    button: {
      width: '100%', padding: '1rem', backgroundColor: '#003366', color: 'white',
      border: 'none', borderRadius: '6px', fontSize: '1.1rem', fontWeight: '600',
      cursor: 'pointer', transition: 'all 0.3s ease'
    },
    buttonDisabled: { backgroundColor: '#6c757d', cursor: 'not-allowed' },
    successBox: {
      backgroundColor: '#d4edda', border: '1px solid #c3e6cb',
      color: '#155724', borderRadius: '8px', padding: '1rem',
      marginBottom: '1rem', textAlign: 'center',
      animation: 'pulse 1.5s infinite'
    }
  };

  if (submitSuccess) {
    return (
      <div style={styles.container}>
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }

          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.03); }
            100% { transform: scale(1); }
          }

          @keyframes glow {
            0% { text-shadow: 0 0 5px #fff, 0 0 10px #2196f3; }
            50% { text-shadow: 0 0 20px #2196f3, 0 0 30px #21cbf3; }
            100% { text-shadow: 0 0 5px #fff, 0 0 10px #2196f3; }
          }
        `}</style>

        <div style={styles.card}>
          <div style={styles.header}><h1>Payment Submitted!</h1></div>
          <div style={styles.body}>
            <div style={styles.successBox}>
              <h4>✅ Success!</h4>
              <p>Your payment is submitted and will be verified within 24 hours.</p>
            </div>
            <button onClick={() => navigate('/')} style={styles.button}>Back to Home</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <Navbar/>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.03); }
          100% { transform: scale(1); }
        }

        @keyframes glow {
          0% { text-shadow: 0 0 5px #fff, 0 0 10px #2196f3; }
          50% { text-shadow: 0 0 20px #2196f3, 0 0 30px #21cbf3; }
          100% { text-shadow: 0 0 5px #fff, 0 0 10px #2196f3; }
        }
      `}</style>

      <div style={styles.card}>
        <div style={styles.header}>
          <h1>Payment Verification</h1>
          <p>Complete payment to unlock quiz access</p>
        </div>
        <div style={styles.body}>
          <div style={styles.instructionBox}>
            <h4 style={{ color: '#1976d2', marginBottom: '1rem' }}>🔷 Instructions</h4>
            <ol style={{ margin: 0, paddingLeft: '1.2rem' }}>
              <li>Send <strong>PKR {paymentAmount}</strong> to <strong>{easypaisaNumber}</strong></li>
              <li>Take screenshot of receipt</li>
              <li>Fill out this form and upload receipt</li>
              <li>Admin will verify within 24 hours</li>
            </ol>
          </div>

          <form onSubmit={handleSubmit}>
            {[
              { label: "Your Name *", name: "userName", type: "text", placeholder: "Your full name", readOnly: true },
              { label: "Your Email *", name: "userEmail", type: "email", placeholder: "you@example.com", readOnly: true },
              { label: "Phone Number *", name: "userPhone", type: "tel", placeholder: "03001234567", readOnly: false },
              { label: "Transaction ID *", name: "transactionId", type: "text", placeholder: "Transaction ID from receipt", readOnly: false }
            ].map(({ label, name, type, placeholder, readOnly }) => (
              <div style={styles.formGroup} key={name}>
                <label style={styles.label}>{label}</label>
                <input
                  type={type}
                  name={name}
                  value={formData[name]}
                  onChange={handleInputChange}
                  placeholder={placeholder}
                  readOnly={readOnly}
                  style={{
                    ...styles.input,
                    ...(errors[name] ? styles.inputError : {}),
                    ...(readOnly ? { backgroundColor: '#e9ecef', cursor: 'not-allowed' } : {})
                  }}
                  disabled={loading}
                />
                {errors[name] && <div style={styles.errorText}>{errors[name]}</div>}
              </div>
            ))}

            <div style={styles.formGroup}>
              <label style={styles.label}>Upload Receipt *</label>
              <input
                id="receipt-input"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{
                  ...styles.fileInput,
                  ...(errors.receipt ? styles.inputError : {})
                }}
                disabled={loading}
              />
              <small style={{ color: '#666', fontSize: '0.875rem' }}>
                Upload JPG, PNG, or GIF (Max 5MB)
              </small>
              {errors.receipt && <div style={styles.errorText}>{errors.receipt}</div>}
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.button,
                ...(loading ? styles.buttonDisabled : {})
              }}
            >
              {loading ? '⏳ Submitting...' : '🚀 Submit for Verification'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <button onClick={() => navigate('/')} style={{
              background: 'none', border: 'none', color: '#007bff',
              textDecoration: 'underline', cursor: 'pointer'
            }}>
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
};

export default PaymentPage;
