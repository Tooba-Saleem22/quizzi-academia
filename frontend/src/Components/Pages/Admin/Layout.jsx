import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Menu, Home, BookOpen, FileQuestion,
  Users, Settings, User, LogOut
} from 'lucide-react';
import { BsCreditCard2Front } from 'react-icons/bs';
import axios from 'axios';

const collegeColors = {
  primary: '#003366',
  accent: '#FFC72C',
  background: '#F5F9FF',
  white: '#fff',
  darkGrey: '#444'
};

const routeTitleMap = {
  '/admin/dashboard': 'Dashboard',
  '/coursesPage': 'Courses',
  '/quizPage': 'Quizzes',
  '/usersPage': 'Users',
  '/settingsPage': 'Settings',
  '/profilePage': 'Profile',
  '/payment-ver': 'Payments'
};

const Layout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [activeItem, setActiveItem] = useState('');
  const [user, setUser] = useState({});
  const [websiteName, setWebsiteName] = useState('');
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const path = location.pathname;
    const matchedTitle = Object.entries(routeTitleMap).find(([route]) =>
      path.startsWith(route)
    );
    if (matchedTitle) setActiveItem(matchedTitle[1]);
  }, [location.pathname]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/user/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(res.data);
      } catch (err) {
        console.error('Error fetching profile in Layout:', err);
      }
    };

    const fetchWebsiteName = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/settings`);
        if (res.data.success) {
          setWebsiteName(res.data.data?.websiteName || 'Quizzi Academi');
        }
      } catch (err) {
        console.error('Failed to fetch website name in Layout:', err);
        setWebsiteName('Quizzi Academi');
      }
    };

    fetchUser();
    fetchWebsiteName();
  }, []);

  const toggleSidebar = () => setCollapsed(!collapsed);

  const handleNavigation = (title) => {
    setActiveItem(title);
    switch (title) {
      case 'Dashboard': navigate('/admin/dashboard'); break;
      case 'Courses': navigate('/coursesPage'); break;
      case 'Quizzes': navigate('/quizPage'); break;
      case 'Users': navigate('/usersPage'); break;
      case 'Settings': navigate('/settingsPage'); break;
      case 'Profile': navigate('/profilePage'); break;
      case 'Payments': navigate('/payment-ver'); break;
      default: break;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/loginPage');
  };

  return (
    <div className="d-flex vh-100" style={{ background: collegeColors.background, overflow: 'hidden' }}>
      <div
        className="text-white d-flex flex-column justify-content-between"
        style={{
          background: collegeColors.primary,
          width: collapsed ? '65px' : '210px',
          transition: 'width 0.3s ease',
          borderTopRightRadius: '16px',
          borderBottomRightRadius: '16px',
          height: '100vh',
          position: 'fixed',
          zIndex: 1000
        }}
      >
        <div>
          <div className="d-flex align-items-center justify-content-between p-3 border-bottom border-light">
            {!collapsed && (
              <h1 style={{ fontSize: '20px', fontFamily: `'Pacifico', cursive`, color: collegeColors.accent }}>
                {websiteName.split(' ')[0]} <span style={{ color: 'white' }}>{websiteName.split(' ')[1] || ''}</span>
              </h1>
            )}
            <button onClick={toggleSidebar} className="btn btn-sm btn-light rounded-circle">
              <Menu size={20} />
            </button>
          </div>

          <div className="mt-4">
            <SidebarItem icon={<Home size={20} />} title="Dashboard" active={activeItem === 'Dashboard'} collapsed={collapsed} onClick={handleNavigation} />
            <SidebarItem icon={<BookOpen size={20} />} title="Courses" active={activeItem === 'Courses'} collapsed={collapsed} onClick={handleNavigation} />
            <SidebarItem icon={<FileQuestion size={20} />} title="Quizzes" active={activeItem === 'Quizzes'} collapsed={collapsed} onClick={handleNavigation} />
            <SidebarItem icon={<Users size={20} />} title="Users" active={activeItem === 'Users'} collapsed={collapsed} onClick={handleNavigation} />
            <SidebarItem icon={<BsCreditCard2Front size={20} />} title="Payments" active={activeItem === 'Payment Verifications'} collapsed={collapsed} onClick={handleNavigation} />
            <SidebarItem icon={<Settings size={20} />} title="Settings" active={activeItem === 'Settings'} collapsed={collapsed} onClick={handleNavigation} />
            <SidebarItem icon={<User size={20} />} title="Profile" active={activeItem === 'Profile'} collapsed={collapsed} onClick={handleNavigation} />
          </div>
        </div>

        <div className="p-3">
          <SidebarItem
            icon={<LogOut size={20} />}
            title="Logout"
            collapsed={collapsed}
            onClick={handleLogout}
            isLogout
          />
        </div>
      </div>

      <div className="flex-grow-1" style={{ marginLeft: collapsed ? '65px' : '210px' }}>
        <header
          className="shadow d-flex align-items-center justify-content-between"
          style={{
            margin: '15px 20px 0',
            background: collegeColors.white,
            borderRadius: '16px',
            padding: '8px 24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            border: `1px solid ${collegeColors.primary}`,
            color: collegeColors.darkGrey,
          }}
        >
          <h4 style={{ fontWeight: '600', fontSize: '1.2rem', color: collegeColors.primary }}>
            {activeItem}
          </h4>

          <div
            onClick={() => navigate('/profilePage')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter') navigate('/profilePage'); }}
            className="d-flex align-items-center px-3 py-1"
            style={{
              background: collegeColors.primary,
              borderRadius: '30px',
              color: collegeColors.accent,
              gap: '10px',
              minWidth: '180px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
              cursor: 'pointer',
              userSelect: 'none',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.35)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.25)';
            }}
          >
            {user?.profileImage ? (
              <img
                src={`http://localhost:5000/uploads/${user.profileImage}`}
                alt="Profile"
                className="rounded-circle"
                style={{
                  width: 36,
                  height: 36,
                  objectFit: 'cover',
                  border: `2px solid ${collegeColors.accent}`,
                }}
              />
            ) : (
              <div
                className="rounded-circle bg-warning text-dark d-flex align-items-center justify-content-center"
                style={{ width: 36, height: 36, fontWeight: 'bold' }}
              >
                {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            )}
            <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{user?.fullName || 'User'}</span>
          </div>
        </header>

        <main className="p-4" style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 70px)' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

const SidebarItem = ({ icon, title, active, collapsed, onClick, isLogout = false }) => {
  const [isHovered, setIsHovered] = useState(false);

  const style = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: collapsed ? 'center' : 'flex-start',
    padding: isLogout ? '8px 12px' : '12px 16px',
    color: 'white',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    backgroundColor: active
      ? '#001f4d'
      : isHovered
      ? '#004080'
      : 'transparent',
    borderRadius: '10px',
    margin: '0 10px 8px 10px',
    transform: isHovered ? 'scale(1.05)' : 'scale(1)',
    fontSize: isLogout ? '0.85rem' : '1rem',
    fontWeight: isLogout ? 'bold' : 'normal',
    border: isLogout ? `1px solid ${collegeColors.accent}` : 'none',
    maxWidth: isLogout ? '150px' : '100%',
    alignSelf: isLogout ? 'center' : 'auto'
  };

  return (
    <div
      style={style}
      onClick={() => onClick(title)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div>{icon}</div>
      {!collapsed && <span style={{ marginLeft: '10px' }}>{title}</span>}
    </div>
  );
};

export default Layout;
