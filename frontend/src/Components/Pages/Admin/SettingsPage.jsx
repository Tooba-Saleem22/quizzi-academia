import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Globe,
  MapPin,
  Mail,
  Phone,
  Share2,
  Image as ImageIcon,
  Save,
  Upload,
  Eye,
  EyeOff,
  Facebook,
  Instagram,
  Github,
  Youtube,
  Twitter,
  Linkedin,
  Check,
  X,
  Info,
  BookOpen,
  Users,
  MessageSquare,
  Award,
  RotateCcw
} from 'lucide-react';
import Layout from './Layout';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [settings, setSettings] = useState({
    websiteName: '',
    websiteTagline: '',
    websiteDescription: '',
    adminEmail: '',
    supportEmail: '',
    contactInfo: {
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    aboutUs: {
      title: '',
      description: '',
      missionStatement: '',
      imageUrl: ''
    },
    socialMedia: {
      facebook: '',
      instagram: '',
      youtube: '',
      twitter: '',
      linkedin: '',
      github: ''
    }
  });

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  console.log("API_BASE_URL:", API_BASE_URL);
  
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/settings`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setSettings(data.data);
      } else {
        throw new Error(data.error || 'Failed to fetch settings');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (section, field, value) => {
    if (section) {
      setSettings(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        handleInputChange('aboutUs', 'imageUrl', e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const saveSettings = async () => {
    try {
      setLoading(true);
      setSaveStatus('saving');
      
      const response = await fetch(`${API_BASE_URL}/api/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setSaveStatus('success');
        setSettings(data.data);
      } else {
        throw new Error(data.error || 'Failed to save settings');
      }
      
      setTimeout(() => setSaveStatus(null), 5000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const resetSettings = async () => {
    if (!window.confirm('Are you sure you want to reset all settings to default values? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      setSaveStatus('saving');
      
      const response = await fetch(`${API_BASE_URL}/api/settings/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setSaveStatus('success');
        setSettings(data.data);
      } else {
        throw new Error(data.error || 'Failed to reset settings');
      }
      
      setTimeout(() => setSaveStatus(null), 5000);
    } catch (error) {
      console.error('Error resetting settings:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: <Globe size={18} /> },
    { id: 'contact', label: 'Contact', icon: <MapPin size={18} /> },
    { id: 'about', label: 'About Us', icon: <Info size={18} /> },
    { id: 'social', label: 'Social Media', icon: <Share2 size={18} /> }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="mb-4">
            <div className="card">
              <div className="card-body">
                <h3 className="h5 card-title d-flex align-items-center">
                  <BookOpen className="me-2 text-primary" size={20} />
                  Website Configuration
                </h3>
                
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      Website Name
                    </label>
                    <input
                      type="text"
                      value={settings.websiteName}
                      onChange={(e) => handleInputChange(null, 'websiteName', e.target.value)}
                      className="form-control"
                      placeholder="Enter website name"
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      Tagline
                    </label>
                    <input
                      type="text"
                      value={settings.websiteTagline}
                      onChange={(e) => handleInputChange(null, 'websiteTagline', e.target.value)}
                      className="form-control"
                      placeholder="Enter website tagline"
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">
                    Website Description
                  </label>
                  <textarea
                    value={settings.websiteDescription}
                    onChange={(e) => handleInputChange(null, 'websiteDescription', e.target.value)}
                    rows={3}
                    className="form-control"
                    placeholder="Enter website description"
                  />
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      Admin Email
                    </label>
                    <input
                      type="email"
                      value={settings.adminEmail}
                      onChange={(e) => handleInputChange(null, 'adminEmail', e.target.value)}
                      className="form-control"
                      placeholder="admin@quizziacademy.com"
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      Support Email
                    </label>
                    <input
                      type="email"
                      value={settings.supportEmail}
                      onChange={(e) => handleInputChange(null, 'supportEmail', e.target.value)}
                      className="form-control"
                      placeholder="support@quizziacademy.com"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'contact':
        return (
          <div className="mb-4">
            <div className="card">
              <div className="card-body">
                <h3 className="h5 card-title d-flex align-items-center">
                  <Phone className="me-2 text-success" size={20} />
                  Contact Information
                </h3>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={settings.contactInfo.phone}
                      onChange={(e) => handleInputChange('contactInfo', 'phone', e.target.value)}
                      className="form-control"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      Address
                    </label>
                    <input
                      type="text"
                      value={settings.contactInfo.address}
                      onChange={(e) => handleInputChange('contactInfo', 'address', e.target.value)}
                      className="form-control"
                      placeholder="Street address"
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-4 mb-3">
                    <label className="form-label">
                      City
                    </label>
                    <input
                      type="text"
                      value={settings.contactInfo.city}
                      onChange={(e) => handleInputChange('contactInfo', 'city', e.target.value)}
                      className="form-control"
                      placeholder="City"
                    />
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label">
                      State
                    </label>
                    <input
                      type="text"
                      value={settings.contactInfo.state}
                      onChange={(e) => handleInputChange('contactInfo', 'state', e.target.value)}
                      className="form-control"
                      placeholder="State"
                    />
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label">
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      value={settings.contactInfo.zipCode}
                      onChange={(e) => handleInputChange('contactInfo', 'zipCode', e.target.value)}
                      className="form-control"
                      placeholder="ZIP Code"
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">
                    Country
                  </label>
                  <input
                    type="text"
                    value={settings.contactInfo.country}
                    onChange={(e) => handleInputChange('contactInfo', 'country', e.target.value)}
                    className="form-control"
                    placeholder="Country"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'about':
        return (
          <div className="mb-4">
            <div className="card">
              <div className="card-body">
                <h3 className="h5 card-title d-flex align-items-center">
                  <Info className="me-2 text-purple" size={20} />
                  About Us Content
                </h3>
                <div className="mb-3">
                  <label className="form-label">
                    About Us Title
                  </label>
                  <input
                    type="text"
                    value={settings.aboutUs.title}
                    onChange={(e) => handleInputChange('aboutUs', 'title', e.target.value)}
                    className="form-control"
                    placeholder="About Us Title"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">
                    Description
                  </label>
                  <textarea
                    value={settings.aboutUs.description}
                    onChange={(e) => handleInputChange('aboutUs', 'description', e.target.value)}
                    rows={4}
                    className="form-control"
                    placeholder="Describe your academy..."
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">
                    Mission Statement
                  </label>
                  <textarea
                    value={settings.aboutUs.missionStatement}
                    onChange={(e) => handleInputChange('aboutUs', 'missionStatement', e.target.value)}
                    rows={3}
                    className="form-control"
                    placeholder="Your mission statement..."
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">
                    About Us Image
                  </label>
                  <div className="d-flex align-items-center gap-3">
                    <div className="flex-grow-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="d-none"
                        id="about-image-upload"
                      />
                      <label
                        htmlFor="about-image-upload"
                        className="btn btn-outline-secondary"
                      >
                        <Upload className="me-2" size={16} />
                        Upload Image
                      </label>
                    </div>
                    {settings.aboutUs.imageUrl && (
                      <div className="rounded overflow-hidden" style={{ width: '80px', height: '80px' }}>
                        <img
                          src={settings.aboutUs.imageUrl}
                          alt="About Us"
                          className="w-100 h-100 object-fit-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'social':
        return (
          <div className="mb-4">
            <div className="card">
              <div className="card-body">
                <h3 className="h5 card-title d-flex align-items-center">
                  <Share2 className="me-2 text-pink" size={20} />
                  Social Media Links
                </h3>
                <div className="row">
                  <div className="col-md-6 mb-3 d-flex align-items-center gap-3">
                    <Facebook className="text-primary" size={20} />
                    <div className="flex-grow-1">
                      <label className="form-label">
                        Facebook
                      </label>
                      <input
                        type="url"
                        value={settings.socialMedia.facebook}
                        onChange={(e) => handleInputChange('socialMedia', 'facebook', e.target.value)}
                        className="form-control"
                        placeholder="https://facebook.com/quizziacademy"
                      />
                    </div>
                  </div>
                  <div className="col-md-6 mb-3 d-flex align-items-center gap-3">
                    <Instagram className="text-pink" size={20} />
                    <div className="flex-grow-1">
                      <label className="form-label">
                        Instagram
                      </label>
                      <input
                        type="url"
                        value={settings.socialMedia.instagram}
                        onChange={(e) => handleInputChange('socialMedia', 'instagram', e.target.value)}
                        className="form-control"
                        placeholder="https://instagram.com/quizziacademy"
                      />
                    </div>
                  </div>
                  <div className="col-md-6 mb-3 d-flex align-items-center gap-3">
                    <Youtube className="text-danger" size={20} />
                    <div className="flex-grow-1">
                      <label className="form-label">
                        YouTube
                      </label>
                      <input
                        type="url"
                        value={settings.socialMedia.youtube}
                        onChange={(e) => handleInputChange('socialMedia', 'youtube', e.target.value)}
                        className="form-control"
                        placeholder="https://youtube.com/@quizziacademy"
                      />
                    </div>
                  </div>
                  <div className="col-md-6 mb-3 d-flex align-items-center gap-3">
                    <Twitter className="text-info" size={20} />
                    <div className="flex-grow-1">
                      <label className="form-label">
                        Twitter
                      </label>
                      <input
                        type="url"
                        value={settings.socialMedia.twitter}
                        onChange={(e) => handleInputChange('socialMedia', 'twitter', e.target.value)}
                        className="form-control"
                        placeholder="https://twitter.com/quizziacademy"
                      />
                    </div>
                  </div>
                  <div className="col-md-6 mb-3 d-flex align-items-center gap-3">
                    <Linkedin className="text-primary" size={20} />
                    <div className="flex-grow-1">
                      <label className="form-label">
                        LinkedIn
                      </label>
                      <input
                        type="url"
                        value={settings.socialMedia.linkedin}
                        onChange={(e) => handleInputChange('socialMedia', 'linkedin', e.target.value)}
                        className="form-control"
                        placeholder="https://linkedin.com/company/quizziacademy"
                      />
                    </div>
                  </div>
                  <div className="col-md-6 mb-3 d-flex align-items-center gap-3">
                    <Github size={20} />
                    <div className="flex-grow-1">
                      <label className="form-label">
                        GitHub
                      </label>
                      <input
                        type="url"
                        value={settings.socialMedia.github}
                        onChange={(e) => handleInputChange('socialMedia', 'github', e.target.value)}
                        className="form-control"
                        placeholder="https://github.com/quizziacademy"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Layout>
        
        {saveStatus && (
            <div className={`alert alert-dismissible fade show d-flex align-items-center ${
              saveStatus === 'success'
                ? 'alert-success'
                : saveStatus === 'error'
                ? 'alert-danger'
                : 'alert-info'
            }`}>
              {saveStatus === 'success' && <Check className="me-2" size={16} />}
              {saveStatus === 'error' && <X className="me-2" size={16} />}
              {saveStatus === 'saving' && <div className="spinner-border spinner-border-sm me-2" role="status"></div>}
              <span>
                {saveStatus === 'success' && 'Settings saved successfully!'}
                {saveStatus === 'error' && 'Failed to save settings. Please try again.'}
                {saveStatus === 'saving' && 'Saving settings...'}
              </span>
              <button type="button" className="btn-close" onClick={() => setSaveStatus(null)}></button>
            </div>
        )}

          <div className="row">
  <div
    style={{
      display: 'flex',
      justifyContent: 'center',
      gap: '3rem',
      marginBottom: '1rem',
      paddingBottom: '1rem',
    }}
  >
    {tabs.map((tab) => (
      <button
        key={tab.id}
        onClick={() => setActiveTab(tab.id)}
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '10px 18px',
          fontSize: '15px',
          fontWeight: 600,
          backgroundColor: 'transparent',
          color: activeTab === tab.id ? '#003366' : '#555',
          border: 'none',
          borderBottom: activeTab === tab.id ? '3px solid #003366' : '3px solid transparent',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = '#003366';
        }}
        onMouseLeave={(e) => {
          if (activeTab !== tab.id) e.currentTarget.style.color = '#555';
        }}
      >
        <span style={{ marginRight: '8px' }}>{tab.icon}</span>
        {tab.label}
      </button>
    ))}
  </div>


<div
  style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  }}
>
  <div
    style={{
      width: '90%',               // Adjust as needed
      maxWidth: '900px',
      border: '1px solid #003366',
      borderRadius: '8px',
      padding: '2rem',
      backgroundColor: '#fff',
    }}
  >
    {loading && !saveStatus ? (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: '500px' }}
      >
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 text-muted">Loading settings...</p>
        </div>
      </div>
    ) : (
      renderTabContent()
    )}
  </div>
</div>
</div>
        <div className="d-flex justify-content-center mt-3 gap-3">
  <button
    onClick={resetSettings}
    disabled={loading}
    className="btn btn-outline-warning"
  >
    <RotateCcw className="me-2" size={16} />
    Reset to Default
  </button>

  <button
    onClick={saveSettings}
    disabled={loading}
    className="btn"
    style={{
      backgroundColor: '#003366',
      borderColor: '#003366',
      color: 'white',
    }}
  >
    {loading ? (
      <div
        className="spinner-border spinner-border-sm me-2"
        role="status"
        style={{ borderColor: 'white' }}
      >
        <span className="visually-hidden">Loading...</span>
      </div>
    ) : (
      <Save className="me-2" size={16} />
    )}
    {loading ? 'Saving...' : 'Save Settings'}
  </button>
</div>


    </Layout>
  );
};


export default Settings;