import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  User, Edit, Lock, Save, Eye, EyeOff, Camera 
} from 'lucide-react';
import Footer from './Footer';
const collegeColors = {
  primary: '#003366',
  accent: '#FFC72C',
  backgroundStart: '#F5F9FF',
  backgroundEnd: '#D6E4FF',
  white: '#fff',
  darkGrey: '#444',
};

const Profile = () => {
  const [user, setUser] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    role: '',
    profileImage: null
  });
  
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    profileImage: null,
  });
  const [activeTab, setActiveTab] = useState('profile');
  const [editMode, setEditMode] = useState(false);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  useEffect(() => {
    fetchUserData();
  }, []);
  
  const fetchUserData = async () => {
    try {
      setLoading(true);
  
      const token = localStorage.getItem('token');
  
      const response = await axios.get('/api/user/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      setUser(response.data);
  
      if (response.data?.profileImage) {
        setImagePreview(`http://localhost:5000/uploads/${response.data.profileImage}`);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setMessage({ text: 'Failed to load user data', type: 'error' });
      setLoading(false);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };
  
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords({ ...passwords, [name]: value });
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewURL = URL.createObjectURL(file);
      setImagePreview(previewURL);
  
      setFormData({ ...formData, profileImage: file });
      setUser({ ...user, profileImage: file });
    }
  };
    
  const updateProfile = async (e) => {
    e.preventDefault();
    try {
      setMessage({ text: '', type: '' });
      const token = localStorage.getItem('token');
      
      const formData = new FormData();
      formData.append('fullName', user.fullName);
      formData.append('email', user.email);
      formData.append('phoneNumber', user.phoneNumber);
      
      if (user.profileImage instanceof File) {
        formData.append('profileImage', user.profileImage);
      }
      
      const response = await axios.put('/api/user/profile', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setUser(response.data);
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
      setEditMode(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ 
        text: error.response?.data?.message || 'Failed to update profile', 
        type: 'error' 
      });
    }
  };
  
  const updatePassword = async (e) => {
    e.preventDefault();
    
    if (passwords.newPassword !== passwords.confirmPassword) {
      setMessage({ text: 'New passwords do not match!', type: 'error' });
      return;
    }
    
    try {
      setMessage({ text: '', type: '' });
      const token = localStorage.getItem('token');
      
      await axios.put('/api/user/change-password', 
        {
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setPasswords({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setMessage({ text: 'Password changed successfully!', type: 'success' });
    } catch (error) {
      console.error('Error changing password:', error);
      setMessage({ 
        text: error.response?.data?.message || 'Failed to change password', 
        type: 'error' 
      });
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const renderProfileContent = () => (
    <div style={styles.profileDetails}>
      <div style={styles.cardHeader}>
        <h3 style={styles.profileSectionTitle}>Personal Information</h3>
        <button 
          type="button" 
          onClick={() => setEditMode(!editMode)} 
          style={styles.editButton}
        >
          {editMode ? 'Cancel' : <><Edit size={16} /> Edit</>}
        </button>
      </div>

      <form onSubmit={updateProfile}>
        <div style={styles.formGroup}>
          <label style={styles.formLabel} htmlFor="fullName">Full Name</label>
          <input 
            type="text" 
            id="fullName"
            name="fullName"
            value={user.fullName || ''} 
            onChange={handleInputChange}
            style={{...styles.formInput, ...(editMode ? {} : styles.disabledInput)}} 
            disabled={!editMode}
            placeholder="Enter your full name"
          />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.formLabel} htmlFor="email">Email Address</label>
          <input 
            type="email" 
            id="email"
            name="email"
            value={user.email || ''} 
            onChange={handleInputChange}
            style={{...styles.formInput, ...(editMode ? {} : styles.disabledInput)}}
            disabled={!editMode}
            placeholder="Enter your email"
          />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.formLabel} htmlFor="phoneNumber">Phone Number</label>
          <input 
            type="text" 
            id="phoneNumber"
            name="phoneNumber"
            value={user.phoneNumber || ''} 
            onChange={handleInputChange}
            style={{...styles.formInput, ...(editMode ? {} : styles.disabledInput)}}
            disabled={!editMode}
            placeholder="Enter your phone number"
          />
        </div>
        
        {editMode && (
          <button type="submit" style={styles.primaryButton}>
            <Save size={16} />
            <span style={{marginLeft: '8px'}}>Save Changes</span>
          </button>
        )}
      </form>
    </div>
  );

  const renderPasswordContent = () => (
    <div style={styles.profileDetails}>
      <div style={styles.cardHeader}>
        <h3 style={styles.profileSectionTitle}>
          <Lock size={18} style={{marginRight: '8px'}} />
          Security Settings
        </h3>
      </div>

      <form onSubmit={updatePassword}>
        <div style={styles.formGroup}>
          <label style={styles.formLabel} htmlFor="currentPassword">Current Password</label>
          <div style={styles.passwordInputContainer}>
            <input 
              type={showPassword.current ? "text" : "password"}
              id="currentPassword"
              name="currentPassword"
              value={passwords.currentPassword} 
              onChange={handlePasswordChange}
              style={styles.formInput} 
              placeholder="Enter your current password"
            />
            <button 
              type="button" 
              onClick={() => togglePasswordVisibility('current')} 
              style={styles.passwordToggle}
            >
              {showPassword.current ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        <div style={styles.formGroup}>
          <label style={styles.formLabel} htmlFor="newPassword">New Password</label>
          <div style={styles.passwordInputContainer}>
            <input 
              type={showPassword.new ? "text" : "password"}
              id="newPassword"
              name="newPassword"
              value={passwords.newPassword} 
              onChange={handlePasswordChange}
              style={styles.formInput} 
              placeholder="Enter your new password"
            />
            <button 
              type="button" 
              onClick={() => togglePasswordVisibility('new')} 
              style={styles.passwordToggle}
            >
              {showPassword.new ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        <div style={styles.formGroup}>
          <label style={styles.formLabel} htmlFor="confirmPassword">Confirm New Password</label>
          <div style={styles.passwordInputContainer}>
            <input 
              type={showPassword.confirm ? "text" : "password"}
              id="confirmPassword"
              name="confirmPassword"
              value={passwords.confirmPassword} 
              onChange={handlePasswordChange}
              style={styles.formInput} 
              placeholder="Confirm your new password"
            />
            <button 
              type="button" 
              onClick={() => togglePasswordVisibility('confirm')} 
              style={styles.passwordToggle}
            >
              {showPassword.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {passwords.newPassword && passwords.confirmPassword && 
            passwords.newPassword !== passwords.confirmPassword && (
            <p style={styles.passwordMismatch}>Passwords do not match</p>
          )}
        </div>
        
        <button 
          type="submit" 
          style={styles.primaryButton}
          disabled={!passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword}
        >
          <Lock size={16} />
          <span style={{marginLeft: '8px'}}>Update Password</span>
        </button>
      </form>
    </div>
  );
  
  return (

      <div style={styles.mainContainer}>
        
        <div style={styles.contentContainer}>
          {loading ? (
            <div style={styles.loadingContainer}>
              <div style={styles.loadingSpinner}></div>
              <p>Loading your profile...</p>
            </div>
          ) : (
            <>
              {message.text && (
                <div style={message.type === 'error' ? styles.errorMessage : styles.successMessage}>
                  {message.text}
                </div>
              )}
              
              <div style={styles.profileContainer}>
        <button
          onClick={() => navigate('/')}
          aria-label="Go Back"
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

                <div style={styles.profileHeader}>
                  <div style={styles.profileAvatar}>
                    {imagePreview ? (
                      <img 
                        src={imagePreview} 
                        alt="Profile" 
                        style={styles.avatarImage} 
                      />
                    ) : (
                      <div style={styles.avatarPlaceholder}>
                        {user.fullName ? user.fullName.substring(0, 2).toUpperCase() : 'AP'}
                      </div>
                    )}
                    <input
                      type="file"
                      id="profileImage"
                      name="profileImage"
                      accept="image/*"
                      onChange={handleImageChange}
                      style={styles.fileInput}
                    />
                    
                    <label htmlFor="profileImage" style={styles.uploadButton}>
                      <Camera size={16} style={{marginRight: '5px'}} />
                      Change Photo
                    </label>
                  </div>
                  <div style={styles.profileInfo}>
                    <h3 style={styles.profileName}>{user.fullName || 'User Name'}</h3>
                    <p style={styles.profileEmail}>{user.email || 'user@example.com'}</p>
                    <p style={styles.profileRole}>{user.role || 'User'}</p>
                  </div>
                </div>
                
                <div style={styles.tabContainer}>
                  <button 
                    style={{
                      ...styles.tabButton, 
                      ...(activeTab === 'profile' ? styles.activeTab : {})
                    }}
                    onClick={() => setActiveTab('profile')}
                  >
                    <User size={18} style={{marginRight: '8px'}} />
                    Profile Information
                  </button>
                  <button 
                    style={{
                      ...styles.tabButton, 
                      ...(activeTab === 'password' ? styles.activeTab : {})
                    }}
                    onClick={() => setActiveTab('password')}
                  >
                    <Lock size={18} style={{marginRight: '8px'}} />
                    Password Settings
                  </button>
                </div>
                
                <div style={styles.contentSection}>
                  {activeTab === 'profile' ? renderProfileContent() : renderPasswordContent()}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
  );
};

const styles = {
  mainContainer: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f5f7fa',
  },
  contentContainer: {
    flex: 1,
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
  },
  loadingSpinner: {
    border: '4px solid rgba(0, 0, 0, 0.1)',
    borderRadius: '50%',
    borderTop: '4px solid #003366',
    width: '40px',
    height: '40px',
    animation: 'spin 1s linear infinite',
    marginBottom: '16px',
  },
  profileContainer: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
    overflow: 'hidden',
  },
  profileHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: '30px',
    borderBottom: '1px solid #ecf0f1',
    backgroundColor: '#f8f9fa',
    flexDirection: 'column',
    textAlign: 'center',
  },
  profileAvatar: {
    marginBottom: '20px',
    position: 'relative',
  },
  avatarPlaceholder: {
    width: '100px',
    height: '100px',
    backgroundColor: '#003366',
    color: 'white',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '50%',
    fontSize: '30px',
    fontWeight: 'bold',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  },
  avatarImage: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    objectFit: 'cover',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    border: '3px solid white',
  },
  fileInput: {
    display: 'none',
  },
  uploadButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '10px',
    padding: '6px 12px',
    backgroundColor: '#003366',
    color: 'white',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    border: 'none',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    margin: '0 0 8px 0',
    fontSize: '26px',
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  profileEmail: {
    margin: '0 0 10px 0',
    fontSize: '16px',
    color: '#7f8c8d',
  },
  profileRole: {
    margin: 0,
    display: 'inline-block',
    padding: '6px 12px',
    backgroundColor: '#003366',
    color: 'white',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 'bold',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  tabContainer: {
    display: 'flex',
    borderBottom: '1px solid #ecf0f1',
    backgroundColor: '#ffffff',
    justifyContent: 'center',
  },
  tabButton: {
    display: 'flex',
    alignItems: 'center',
    padding: '14px 24px',
    backgroundColor: 'transparent',
    border: 'none',
    borderBottom: '2px solid transparent',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '500',
    color: '#7f8c8d',
    transition: 'all 0.2s ease',
  },
  activeTab: {
    color: '#003366',
    borderBottom: '2px solid #003366',
    fontWeight: 'bold',
  },
  contentSection: {
    padding: '20px',
  },
  profileDetails: {
    padding: '20px',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  profileSectionTitle: {
    margin: '0',
    fontSize: '18px',
    color: '#2c3e50',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
  },
  editButton: {
    display: 'flex',
    alignItems: 'center',
    padding: '6px 16px',
    backgroundColor: '#f8f9fa',
    color: '#003366',
    border: '2px solid #003366',
    borderRadius: '20px',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  formGroup: {
    marginBottom: '20px',
  },
  formLabel: {
    display: 'block',
    marginBottom: '8px',
    color: '#2c3e50',
    fontSize: '14px',
    fontWeight: '500',
  },
  formInput: {
    width: '100%',
    padding: '12px',
    borderRadius: '6px',
    border: '1px solid #ddd',
    fontSize: '15px',
    boxSizing: 'border-box',
    transition: 'border 0.2s ease',
  },
  disabledInput: {
    backgroundColor: '#f8f9fa',
    cursor: 'not-allowed',
    opacity: '0.7',
  },
  passwordInputContainer: {
    position: 'relative',
    width: '100%',
  },
  passwordToggle: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: '#7f8c8d',
  },
  passwordMismatch: {
    color: '#e74c3c',
    fontSize: '12px',
    marginTop: '5px',
  },
  primaryButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#003366',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    padding: '12px 24px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '15px',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
    marginTop: '10px',
    width: '100%',
  },
  errorMessage: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '12px 16px',
    borderRadius: '6px',
    marginBottom: '20px',
    border: '1px solid #f5c6cb',
    display: 'flex',
    alignItems: 'center',
  },
  successMessage: {
    backgroundColor: '#d4edda',
    color: '#155724',
    padding: '12px 16px',
    borderRadius: '6px',
    marginBottom: '20px',
    border: '1px solid #c3e6cb',
    display: 'flex',
    alignItems: 'center',
  }
};

export default Profile;