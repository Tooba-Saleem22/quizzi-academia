import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Home, BookOpen, FileQuestion, Users, Settings, User, Menu, Search, Eye, Trash2 } from 'lucide-react';
import Layout from './Layout';

const collegeColors = {
  primary: '#003366',   
  secondary: '#0055A4',
  accent: '#FFC72C',   
  background: '#F5F9FF',
  white: '#fff',
  lightGrey: '#e1e8f0',
  darkGrey: '#444'
};

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewUser, setViewUser] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
      setLoading(false);
    } catch (error) {
      setError('Failed to load users');
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.role === 0 ? 'student' : 'admin').includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const deleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/admin/user/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(users.filter(user => user._id !== id));
      } catch (err) {
        setError('Failed to delete user');
      }
    }
  };

  const handleViewUser = (user) => setViewUser(user);
  const closeViewModal = () => setViewUser(null);
  const toggleSidebar = () => setCollapsed(!collapsed);

  const handleNavigation = (title) => {
    switch (title) {
      case 'Dashboard': navigate('/admin/dashboard'); break;
      case 'Courses': navigate('/coursesPage'); break;
      case 'Quizzes': navigate('/quizPage'); break;
      case 'Users': navigate('/usersPage'); break;
      case 'Settings': navigate('/settingsPage'); break;
      case 'Profile': navigate('/profilePage'); break;
      default: break;
    }
  };

  return (
    <Layout>
        <div
          style={{
            flexGrow: 1,
            overflowY: 'auto',
            padding: 30,
          }}
        >

          <div style={{ marginBottom: 20, maxWidth: 400, position: 'relative' }}>
            <Search
              size={18}
              style={{
                position: 'absolute',
                top: '50%',
                left: 10,
                transform: 'translateY(-50%)',
                color: collegeColors.secondary,
              }}
            />
            <input
              type="text"
              placeholder="Search by name, email or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 32px',
                borderRadius: 6,
                border: `1.5px solid ${collegeColors.lightGrey}`,
                outline: 'none',
                fontSize: 16,
                transition: 'border-color 0.3s',
              }}
              onFocus={e => e.target.style.borderColor = collegeColors.accent}
              onBlur={e => e.target.style.borderColor = collegeColors.lightGrey}
            />
          </div>

          {error && (
            <div
              style={{
                marginBottom: 20,
                padding: 12,
                backgroundColor: '#f8d7da',
                color: '#721c24',
                borderRadius: 6,
              }}
            >
              {error}
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', marginTop: 100 }}>
              <div className="spinner-border text-primary" role="status" style={{ width: 40, height: 40, borderWidth: 4, borderColor: collegeColors.accent }}>
                <span className="visually-hidden">Loading...</span>
              </div>
              <p style={{ color: collegeColors.secondary, marginTop: 10 }}>Loading users...</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto', borderRadius: 8, boxShadow: '0 0 15px rgba(0,0,0,0.05)' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: 15,
                  color: collegeColors.darkGrey,
                }}
              >
                <thead style={{ backgroundColor: collegeColors.secondary, color: collegeColors.white }}>
                  <tr>
                    {['User ID', 'Name', 'Email', 'Join Date', 'Role', 'Actions'].map(header => (
                      <th key={header} style={{ padding: '12px 15px', textAlign: header === 'Actions' ? 'center' : 'left' }}>{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length > 0 ? filteredUsers.map((user, i) => (
                    <tr
                      key={user._id}
                      style={{
                        backgroundColor: i % 2 === 0 ? collegeColors.white : '#f9fbff',
                        cursor: 'default',
                        transition: 'background-color 0.3s ease',
                      }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = collegeColors.lightGrey}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = i % 2 === 0 ? collegeColors.white : '#f9fbff'}
                    >
                      <td style={{ padding: '10px 15px', color: collegeColors.secondary }}>{user._id.substring(0, 6)}...</td>
                      <td style={{ padding: '10px 15px', fontWeight: 600 }}>{user.name}</td>
                      <td style={{ padding: '10px 15px' }}>{user.email}</td>
                      <td style={{ padding: '10px 15px', color: '#777' }}>{formatDate(user.createdAt)}</td>
                      <td style={{ padding: '10px 15px' }}>
                        <span
                          style={{
                            backgroundColor: user.role === 1 ? '#b3d7ff' : '#cde5d0',
                            color: user.role === 1 ? collegeColors.primary : '#2e7d32',
                            padding: '4px 10px',
                            borderRadius: 12,
                            fontWeight: '600',
                            fontSize: 14,
                            userSelect: 'none'
                          }}
                        >
                          {user.role === 1 ? 'Admin' : 'Student'}
                        </span>
                      </td>
                      <td style={{ padding: '10px 15px', textAlign: 'center' }}>
                        <button
                          title="View"
                          onClick={() => handleViewUser(user)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: collegeColors.secondary,
                            cursor: 'pointer',
                            marginRight: 12,
                            transition: 'color 0.2s',
                          }}
                          onMouseEnter={e => e.currentTarget.style.color = collegeColors.accent}
                          onMouseLeave={e => e.currentTarget.style.color = collegeColors.secondary}
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          title="Delete"
                          onClick={() => deleteUser(user._id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#cc0000',
                            cursor: 'pointer',
                            transition: 'color 0.2s',
                          }}
                          onMouseEnter={e => e.currentTarget.style.color = '#ff4c4c'}
                          onMouseLeave={e => e.currentTarget.style.color = '#cc0000'}
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: 30, color: '#999' }}>
                        No users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {viewUser && (
            <div
              style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                animation: 'fadeIn 0.3s ease forwards',
                zIndex: 1000,
              }}
              onClick={closeViewModal}
            >
              <div
                style={{
                  backgroundColor: collegeColors.white,
                  padding: 30,
                  borderRadius: 12,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                  minWidth: 320,
                  maxWidth: 400,
                  animation: 'slideUp 0.3s ease forwards',
                }}
                onClick={e => e.stopPropagation()}
              >
                <h2 style={{ color: collegeColors.primary, marginBottom: 20 }}>{viewUser.name}</h2>
                <p><strong>Email:</strong> {viewUser.email}</p>
                <p><strong>Joined:</strong> {formatDate(viewUser.createdAt)}</p>
                <p><strong>Role:</strong> {viewUser.role === 1 ? 'Admin' : 'Student'}</p>

                <button
                  onClick={closeViewModal}
                  style={{
                    marginTop: 20,
                    padding: '8px 20px',
                    backgroundColor: collegeColors.accent,
                    border: 'none',
                    borderRadius: 6,
                    color: collegeColors.primary,
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'background-color 0.3s ease',
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#e6b800'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = collegeColors.accent}
                >
                  Close
                </button>
              </div>
            </div>
          )}

          <style>
            {`
              @keyframes fadeIn {
                from {opacity: 0;}
                to {opacity: 1;}
              }
              @keyframes slideUp {
                from {transform: translateY(40px); opacity: 0;}
                to {transform: translateY(0); opacity: 1;}
              }
            `}
          </style>
        </div>
    </Layout>
  );
};

const SidebarItem = ({ icon, title, active, collapsed, onClick }) => {
  return (
    <div
      onClick={() => onClick(title)}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '12px 20px',
        color: active ? collegeColors.accent : collegeColors.white,
        cursor: 'pointer',
        fontWeight: active ? '700' : '500',
        fontSize: 16,
        backgroundColor: active ? 'rgba(255, 199, 44, 0.15)' : 'transparent',
        borderLeft: active ? `4px solid ${collegeColors.accent}` : '4px solid transparent',
        transition: 'background-color 0.3s, color 0.3s',
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={e => {
        if (!active) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
      }}
      onMouseLeave={e => {
        if (!active) e.currentTarget.style.backgroundColor = 'transparent';
      }}
      title={collapsed ? title : undefined}
    >
      {icon}
      {!collapsed && <span style={{ marginLeft: 15 }}>{title}</span>}
    </div>
  );
};

export default UsersPage;
