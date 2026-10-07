import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BsFillArchiveFill, BsFillGrid3X3GapFill, BsPeopleFill, BsCreditCard2Front } from 'react-icons/bs';
import axios from 'axios';
import Layout from './Layout';
const collegeColors = {
  primary: '#003366',
  accent: '#FFC72C',
  background: '#F5F9FF',
  white: '#fff',
  darkGrey: '#444'
};

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentVerifications, setPaymentVerifications] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [adminForm, setAdminForm] = useState({ name: '', email: '', password: '' });
  const [formMsg, setFormMsg] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data } = await axios.get('/api/analytics/dashboard');
        setDashboardData(data);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchPaymentVerifications = async () => {
      try {
        const res = await axios.get('/api/payments/admin/verifications?limit=10');
        setPaymentVerifications(res.data.data || []);
      } catch (err) {
        console.error('Error fetching payment verifications:', err);
      }
    };

    fetchDashboardData();
    fetchPaymentVerifications();
  }, []);

  const handleFormChange = (e) => {
    setAdminForm({ ...adminForm, [e.target.name]: e.target.value });
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/user/create-admin', adminForm, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setFormMsg(res.data.msg);
      setAdminForm({ name: '', email: '', password: '' });
    } catch (err) {
      setFormMsg(err.response?.data?.msg || 'Error creating admin');
    }
  };

  const metrics = [
    {
      title: 'Total Courses',
      value: dashboardData?.metrics.totalCourse || 0,
      icon: <BsFillArchiveFill style={{ fontSize: '2rem', opacity: '0.7' }} />,
      color: '#4e73df'
    },
    {
      title: 'Total Quizzes',
      value: dashboardData?.metrics.totalQuiz || 0,
      icon: <BsFillGrid3X3GapFill style={{ fontSize: '2rem', opacity: '0.7' }} />,
      color: '#1cc88a'
    },
    {
      title: 'Users',
      value: dashboardData?.metrics.totalUsers || 0,
      icon: <BsPeopleFill style={{ fontSize: '2rem', opacity: '0.7' }} />,
      color: '#36b9cc'
    },
    {
      title: 'Pending Payments',
      value: paymentVerifications.filter(p => p.status === 'pending').length,
      icon: <BsCreditCard2Front style={{ fontSize: '2rem', opacity: '0.7' }} />,
      color: '#f6c23e'
    }
  ];

  return (
    <Layout>
      <main className="p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="fs-4 fw-bold">Dashboard Overview</h1>
          <button
  style={{
    backgroundColor: collegeColors.primary,
    color: collegeColors.accent,
    padding: '10px 20px',
    border: `2px solid ${collegeColors.accent}`,
    borderRadius: '8px',
    fontWeight: 'bold',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  }}
  onMouseOver={(e) => {
    e.target.style.backgroundColor = collegeColors.accent;
    e.target.style.color = collegeColors.primary;
  }}
  onMouseOut={(e) => {
    e.target.style.backgroundColor = collegeColors.primary;
    e.target.style.color = collegeColors.accent;
  }}
  onClick={() => setShowModal(true)}
>
  Create Admin
</button>
        </div>

        <div style={styles.metricsContainer}>
          {metrics.map((metric, index) => (
            <div key={index} style={{ ...styles.metricCard, backgroundColor: metric.color }}>
              <div style={styles.metricIcon}>{metric.icon}</div>
              <div style={styles.metricInfo}>
                <p style={styles.metricTitle}>{metric.title}</p>
                <p style={styles.metricValue}>{metric.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="row mt-4">
          <div className="col-lg-8">
            <div className="card mb-4">
              <div className="card-header bg-white">
                <h5 className="m-0">Monthly Activity</h5>
              </div>
              <div className="card-body">
                {dashboardData?.monthlySales ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dashboardData.monthlySales}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="total" fill="#4e73df" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-muted text-center">No monthly sales data available</p>
                )}
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card mb-4">
              <div className="card-header bg-white">
                <h5 className="m-0">Recent Payment Activity</h5>
              </div>
              <div className="card-body">
                <div className="list-group list-group-flush">
                  {paymentVerifications.slice(0, 5).map((verification, index) => (
                    <div key={index} className="list-group-item d-flex align-items-center border-0 px-0">
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center me-3"
                        style={{
                          width: 35,
                          height: 35,
                          backgroundColor:
                            verification.status === 'pending' ? '#ffc107' :
                            verification.status === 'approved' ? '#28a745' : '#dc3545',
                          color: 'white',
                          fontSize: '0.8rem'
                        }}
                      >
                        {verification.status === 'pending' ? '⏱️' : verification.status === 'approved' ? '✅' : '❌'}
                      </div>
                      <div className="flex-grow-1">
                        <div className="fw-bold" style={{ fontSize: '0.9rem' }}>
                          {verification.userName}
                        </div>
                        <small className="text-muted">
                          PKR {verification.paymentAmount} • {verification.status}
                        </small>
                      </div>
                    </div>
                  ))}
                  {paymentVerifications.length === 0 && (
                    <div className="text-center py-3">
                      <small className="text-muted">No recent activity</small>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {showModal && (
  <div style={styles.modalBackdrop}>
    <div style={styles.modalContent}>
      <h4 style={{ 
        color: collegeColors.primary, 
        marginBottom: '15px',
        fontWeight: '600'
      }}>
        Create New Admin
      </h4>

      {formMsg && (
        <p style={{ 
          color: formMsg.includes('success') ? 'green' : 'red', 
          fontWeight: '500',
          textAlign: 'center' 
        }}>
          {formMsg}
        </p>
      )}

      <form onSubmit={handleCreateAdmin}>
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={adminForm.name}
          onChange={handleFormChange}
          required
          style={styles.input}
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={adminForm.email}
          onChange={handleFormChange}
          required
          style={styles.input}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={adminForm.password}
          onChange={handleFormChange}
          required
          style={styles.input}
        />

        <div style={{ marginTop: '15px', textAlign: 'right' }}>
          <button 
            type="submit" 
            style={{
              backgroundColor: collegeColors.primary,
              color: collegeColors.white,
              padding: '10px 20px',
              border: 'none',
              borderRadius: '6px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              marginRight: '8px'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = collegeColors.accent}
            onMouseOut={(e) => e.target.style.backgroundColor = collegeColors.primary}
          >
            Create
          </button>

          <button 
            type="button" 
            style={{
              backgroundColor: collegeColors.darkGrey,
              color: collegeColors.white,
              padding: '10px 18px',
              border: 'none',
              borderRadius: '6px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onClick={() => setShowModal(false)}
            onMouseOver={(e) => e.target.style.backgroundColor = '#666'}
            onMouseOut={(e) => e.target.style.backgroundColor = collegeColors.darkGrey}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
)}

      </main>
    </Layout>
  );
};

const styles = {
  metricsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '1.5rem',
    marginBottom: '1.5rem',
  },
  metricCard: {
    borderRadius: '0.35rem',
    padding: '1.5rem',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    boxShadow: '0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.15)',
  },
  metricIcon: {
    fontSize: '2rem',
    opacity: '0.7',
    marginRight: '1rem',
  },
  metricInfo: {
    flex: 1,
  },
  metricTitle: {
    fontSize: '0.8rem',
    textTransform: 'uppercase',
    margin: '0 0 0.25rem 0',
    opacity: '0.8',
    fontWeight: '600',
  },
  metricValue: {
    fontSize: '1.5rem',
    margin: '0',
    fontWeight: '700',
  },
  modalBackdrop: {
    position: 'fixed',
    top: 0, left: 0,
    width: '100%', height: '100%',
    background: 'rgba(0,0,0,0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000
  },
  modalContent: {
    background: '#fff',
    padding: '20px',
    borderRadius: '8px',
    width: '350px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.3)'
  },
  input: {
    width: '100%',
    padding: '8px',
    margin: '5px 0',
    border: '1px solid #ccc',
    borderRadius: '4px'
  }
};

export default AdminDashboard;
