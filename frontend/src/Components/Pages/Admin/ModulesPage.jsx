import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Plus, Edit, Trash, Save, ArrowLeft, BookOpen, Play, X, Eye, ExternalLink,
  Clock, Users, Star, ChevronRight, Loader2, AlertCircle, CheckCircle,
  FileText, Video, Globe, Download, Share2, Heart, Upload, Image as ImageIcon
} from 'lucide-react';
import Layout from './Layout';

const API_URL = 'http://localhost:5000/api';

const collegeColors = {
  primary: '#003366',
  accent: '#FFC72C',
  background: '#F5F9FF',
  white: '#fff',
  darkGrey: '#444'
};

const theme = {
  primary: collegeColors.primary,
  primaryHover: '#1d4ed8',
  secondary: collegeColors.accent,
  success: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',
  background: collegeColors.background,
  surface: collegeColors.white,
  text: '#1f2937',
  textLight: '#6b7280',
  border: '#e5e7eb',
  borderLight: '#f3f4f6'
};

const Modal = React.memo(({ show, title, onClose, children, size = "lg", showCloseButton = true }) => {
  if (!show) return null;
  
  return (
    <div className="modal" tabIndex="-1" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className={`modal-dialog modal-${size}`}>
        <div className="modal-content">
          <div 
            className="modal-header"
            style={{ background: collegeColors.primary }}
          >
            <h5 className="modal-title text-white">{title}</h5>
            {showCloseButton && (
              <button 
                onClick={onClose}
                className="btn-close btn-close-white"
                aria-label="Close"
              />
            )}
          </div>
          <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
});

const Alert = React.memo(({ type, message, onClose }) => {
  if (!message) return null;
  
  const styles = {
    success: 'alert alert-success',
    error: 'alert alert-danger'
  };

  return (
    <div className={`mb-3 ${styles[type]}`} role="alert">
      {type === 'success' ? (
        <CheckCircle size={20} className="text-green-600" />
      ) : (
        <AlertCircle size={20} className="text-red-600" />
      )}
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="btn-close">
        <X size={16} />
      </button>
    </div>
  );
});

const FormInput = React.memo(({ label, error, children, required = false }) => (
  <div className="mb-3">
    <label className="form-label">
      {label} {required && <span className="text-danger">*</span>}
    </label>
    {children}
    {error && <div className="text-danger">{error}</div>}
  </div>
));

const ModuleCard = React.memo(({ module, index, onEdit, onDelete, onOpenArticle, onOpenVideo }) => {
  return (
    <div className="col-md-3 mb-4">
      <div className="card h-100">
        <div className="position-relative">
          <img
            src={`http://localhost:5000/uploads/${module.image}`}
            alt={module.name}
            className="card-img-top"
            style={{ height: '160px', objectFit: 'cover' }}
            onError={(e) => {
              e.target.src = `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=160&fit=crop&crop=center`;
            }}
          />
          <div className="position-absolute top-0 start-0 p-2 text-white"
                                style={{ background:"#003366" }}
          >
            Module {index + 1}
          </div>
          <div className="position-absolute bottom-0 start-0 p-2 text-white w-100" style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.7))' }}>
            <h5 className="card-title mb-0">{module.name}</h5>
          </div>
        </div>

        <div className="card-body d-flex flex-column">
          <div className="d-flex justify-content-between gap-2 mb-2">
            <button
              onClick={() => onOpenArticle(module.article)}
              className="btn btn-sm btn-primary flex-grow-1"
              style={{ background: collegeColors.primary }}
            >
              <FileText size={14} className="me-1" /> Read
            </button>
            <button
              onClick={() => onOpenVideo(module)}
              className="btn btn-sm btn-primary flex-grow-1"
            >
              <Play size={14} className="me-1" /> Watch
            </button>
          </div>
          <div className="d-flex justify-content-between gap-2 mt-auto">
            <button
              onClick={() => onEdit(module)}
              className="btn btn-sm btn-outline-primary" 
            >
              <Edit size={16} /> 
            </button>
            <button
              onClick={() => onDelete(module._id)}
              className="btn btn-sm btn-outline-danger" 
            >
              <Trash size={16}  /> 
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default function ModulesPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  
  const [addFormData, setAddFormData] = useState({
    name: '',
    image: null,
    article: '',
    youtubeUrl: ''
  });
  const [editFormData, setEditFormData] = useState({
    name: '',
    article: '',
    youtubeUrl: ''
  });
  
  const [imagePreview, setImagePreview] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  
  const [editingModule, setEditingModule] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const [completedModules, setCompletedModules] = useState(new Set());

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  useEffect(() => {
    if (successMessage || error) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, error]);

  const fetchCourse = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/courses/${courseId}`);
      if (!res.ok) throw new Error('Failed to fetch course');
      const data = await res.json();
      setCourse(data);
      setModules(data.modules || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load course details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = useCallback((data, isEdit = false) => {
    const errors = {};
    if (!data.name?.trim()) errors.name = 'Module name is required';
    if (!isEdit && !data.image) errors.image = 'Module image is required';
    if (!data.article?.trim()) errors.article = 'Article URL is required';
    if (!data.youtubeUrl?.trim()) errors.youtubeUrl = 'YouTube URL is required';
    
    if (data.article && !isValidUrl(data.article)) {
      errors.article = 'Please enter a valid article URL';
    }
    if (data.youtubeUrl && !isValidUrl(data.youtubeUrl)) {
      errors.youtubeUrl = 'Please enter a valid YouTube URL';
    }
    
    return errors;
  }, []);

  const isValidUrl = useCallback((string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }, []);

  const resetAddForm = useCallback(() => {
    setAddFormData({ name: '', image: null, article: '', youtubeUrl: '' });
    setImagePreview(null);
    setFormErrors({});
  }, []);

  const handleAddFormChange = useCallback((field, value) => {
    setAddFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [formErrors]);

  const handleEditFormChange = useCallback((field, value) => {
    setEditFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [formErrors]);

  const handleImageChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setFormErrors(prev => ({ ...prev, image: 'Image size should be less than 10MB' }));
        return;
      }
      setAddFormData(prev => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
      if (formErrors.image) {
        setFormErrors(prev => ({ ...prev, image: '' }));
      }
    }
  }, [formErrors.image]);

  const handleAddModule = useCallback(async (e) => {
    e.preventDefault();
    const errors = validateForm(addFormData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', addFormData.name);
      formDataToSend.append('image', addFormData.image);
      formDataToSend.append('article', addFormData.article);
      formDataToSend.append('youtubeUrl', addFormData.youtubeUrl);

      const res = await fetch(`${API_URL}/courses/${courseId}/modules`, {
        method: 'POST',
        body: formDataToSend,
      });

      if (!res.ok) throw new Error('Failed to create module');

      await fetchCourse();
      resetAddForm();
      setShowAddModal(false);
      setSuccessMessage('Module created successfully! 🎉');
    } catch (err) {
      setError(err.message || 'Failed to create module. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [addFormData, validateForm, courseId, resetAddForm]);

  const handleEditModule = useCallback((module) => {
    setEditingModule(module);
    setEditFormData({
      name: module.name || '',
      article: module.article || '',
      youtubeUrl: module.youtubeUrl || ''
    });
    setShowEditModal(true);
  }, []);

  const handleSaveEdit = useCallback(async () => {
    const errors = validateForm(editFormData, true);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/courses/${courseId}/modules/${editingModule._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });

      if (!res.ok) throw new Error('Failed to update module');

      await fetchCourse();
      setEditingModule(null);
      setEditFormData({ name: '', article: '', youtubeUrl: '' });
      setShowEditModal(false);
      setFormErrors({});
      setSuccessMessage('Module updated successfully! ✨');
    } catch (err) {
      setError(err.message || 'Failed to update module. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [editFormData, validateForm, courseId, editingModule]);

  const handleDeleteModule = useCallback(async (moduleId) => {
    if (!window.confirm('Are you sure you want to delete this module? This action cannot be undone.')) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/courses/${courseId}/modules/${moduleId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete module');

      await fetchCourse();
      setSuccessMessage('Module deleted successfully');
    } catch (err) {
      setError(err.message || 'Failed to delete module. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  const extractVideoId = useCallback((url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }, []);

  const openArticle = useCallback((url) => {
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  }, []);

  const openVideoModal = useCallback((module) => {
    setSelectedModule(module);
    setShowVideoModal(true);
  }, []);

  const toggleModuleCompletion = useCallback((moduleId) => {
    const newCompleted = new Set(completedModules);
    if (newCompleted.has(moduleId)) {
      newCompleted.delete(moduleId);
    } else {
      newCompleted.add(moduleId);
    }
    setCompletedModules(newCompleted);
  }, [completedModules]);

  const closeAddModal = useCallback(() => {
    setShowAddModal(false);
    resetAddForm();
  }, [resetAddForm]);

  const closeEditModal = useCallback(() => {
    setShowEditModal(false);
    setFormErrors({});
    setEditingModule(null);
    setEditFormData({ name: '', article: '', youtubeUrl: '' });
  }, []);

  const closeVideoModal = useCallback(() => {
    setShowVideoModal(false);
    setSelectedModule(null);
  }, []);

  const moduleStats = useMemo(() => ({
    total: modules.length,
    completed: completedModules.size
  }), [modules.length, completedModules.size]);

  if (loading && !course) {
    return (
      <Layout>
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="h5 text-muted">Loading your course...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-vh-100" style={{ background: collegeColors.background }}>
        <div className="container py-4">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start mb-4">
            <div className="d-flex align-items-start">
              <button
                onClick={() => navigate('/coursesPage')}
                className="btn  me-3"
                title="Back to Courses"
                style={{ transition: 'all 0.3s', color:"#FFC72C" }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(23, 47, 202, 0.2)')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="h3 fw-bold mb-1 text-dark">
                  {course ? course.name : 'Course Modules'}
                </h1>
                <p className="text-muted mb-0">
                  {course?.description || 'Manage and explore your course modules'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn d-flex align-items-center mt-3 mt-md-0"
              style={{
                backgroundColor: collegeColors.accent,
                color: collegeColors.primary,
                transition: 'transform 0.3s, box-shadow 0.3s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'scale(1.03)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <Plus size={18} className="me-2" /> Add Module
            </button>
          </div>

          <div className="row mb-4">
            <div className="col-md-4 mb-3">
              <div
                className="card h-100 border-0 shadow-sm"
                style={{
                  transition: 'transform 0.3s, box-shadow 0.3s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.05)';
                }}
              >
                <div className="card-body d-flex align-items-center">
                  <div
                    className="rounded-circle p-3 me-3"
                    style={{ background: '#003366', color: '#fff' }}
                  >
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <p className="small text-muted mb-1">Total Modules</p>
                    <p className="h5 fw-semibold mb-0">{moduleStats.total}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Alert type="success" message={successMessage} onClose={() => setSuccessMessage('')} />
          <Alert type="error" message={error} onClose={() => setError('')} />

          <div className="row">
            {modules.map((module, index) => (
              <ModuleCard
                key={module._id}
                module={module}
                index={index}
                onEdit={handleEditModule}
                onDelete={handleDeleteModule}
                onOpenArticle={openArticle}
                onOpenVideo={openVideoModal}
              />
            ))}

            {modules.length === 0 && !loading && (
              <div className="text-center py-5">
                <div className="card mx-auto" style={{ maxWidth: '400px' }}>
                  <div className="card-body">
                    <div className="bg-primary text-white rounded-circle p-4 mx-auto mb-3">
                      <BookOpen size={32} />
                    </div>
                    <h3 className="h5">No modules yet</h3>
                    <p className="text-muted">Create your first module to get started with course content.</p>
                    <button
                      onClick={() => setShowAddModal(true)}
                      style={{ background: collegeColors.accent, color: collegeColors.primary }}
                      className="btn btn-primary"
                    >
                      <Plus size={20} /> Create First Module
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <Modal show={showAddModal} title="Create New Module" onClose={closeAddModal}>
          <form onSubmit={handleAddModule}>
            <FormInput label="Module Title" error={formErrors.name} required>
              <input
                type="text"
                className="form-control"
                value={addFormData.name}
                onChange={(e) => handleAddFormChange('name', e.target.value)}
                placeholder="Enter module title..."
              />
            </FormInput>

            <FormInput label="Module Cover Image" error={formErrors.image} required>
              <div className="border border-dashed border-gray-300 rounded p-3 text-center">
                <input
                  type="file"
                  className="d-none"
                  id="moduleImage"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                <label htmlFor="moduleImage" className="cursor-pointer">
                  {imagePreview ? (
                    <div className="mb-2">
                      <img src={imagePreview} alt="Preview" className="img-thumbnail" style={{ maxHeight: '200px' }} />
                      <p className="small text-muted">Click to change image</p>
                    </div>
                  ) : (
                    <div className="text-muted">
                      <Upload size={32} className="mb-2" />
                      <p className="font-weight-bold">Upload Cover Image</p>
                      <p className="small">PNG or JPG, max 10MB</p>
                    </div>
                  )}
                </label>
              </div>
            </FormInput>

            <FormInput label="Article URL" error={formErrors.article} required>
              <input
                type="url"
                className="form-control"
                value={addFormData.article}
                onChange={(e) => handleAddFormChange('article', e.target.value)}
                placeholder="https://example.com/article"
              />
            </FormInput>

            <FormInput label="YouTube Video URL" error={formErrors.youtubeUrl} required>
              <input
                type="url"
                className="form-control"
                value={addFormData.youtubeUrl}
                onChange={(e) => handleAddFormChange('youtubeUrl', e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </FormInput>

            <div className="d-flex justify-content-end mt-3">
              <button 
                type="button" 
                onClick={closeAddModal}
                className="btn btn-secondary me-2"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={loading}
                style={{ background: collegeColors.primary }}
                className="btn btn-primary"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {loading ? 'Creating...' : 'Create Module'}
              </button>
            </div>
          </form>
        </Modal>

        <Modal show={showEditModal} title="Edit Module" onClose={closeEditModal}>
          {editingModule && (
            <form>
              <FormInput label="Module Title" error={formErrors.name} required>
                <input
                  type="text"
                  className="form-control"
                  value={editFormData.name}
                  onChange={(e) => handleEditFormChange('name', e.target.value)}
                />
              </FormInput>

              <div>
                <label className="form-label">Current Cover Image</label>
                <div className="bg-light rounded p-2">
                  <img
                    src={`http://localhost:5000/uploads/${editingModule.image}`}
                    alt={editingModule.name}
                    className="img-fluid rounded"
                    style={{ maxHeight: '200px' }}
                    onError={(e) => {
                      e.target.src = `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200&h=150&fit=crop&crop=center`;
                    }}
                  />
                </div>
                <p className="small text-muted bg-warning p-2 rounded">
                  💡 To update the cover image, please create a new module
                </p>
              </div>

              <FormInput label="Article URL" error={formErrors.article} required>
                <input
                  type="url"
                  className="form-control"
                  value={editFormData.article}
                  onChange={(e) => handleEditFormChange('article', e.target.value)}
                />
              </FormInput>

              <FormInput label="YouTube Video URL" error={formErrors.youtubeUrl} required>
                <input
                  type="url"
                  className="form-control"
                  value={editFormData.youtubeUrl}
                  onChange={(e) => handleEditFormChange('youtubeUrl', e.target.value)}
                />
              </FormInput>

              <div className="d-flex justify-content-end mt-3">
                <button 
                  type="button"
                  onClick={closeEditModal}
                  className="btn btn-secondary me-2"
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={loading}
                  style={{ background: collegeColors.primary }}
                  className="btn btn-primary"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}
        </Modal>

        <Modal show={showVideoModal} title={`🎥 ${selectedModule?.name || 'Video Content'}`} onClose={closeVideoModal} size="xl">
          {selectedModule && (
            <div>
              <div className="ratio ratio-16x9">
                <iframe
                  src={`https://www.youtube.com/embed/${extractVideoId(selectedModule.youtubeUrl)}?rel=0&modestbranding=1&showinfo=0`}
                  title={selectedModule.name}
                  className="embed-responsive-item"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              <div className="d-flex flex-wrap gap-3 mt-3">
                <button
                  onClick={() => window.open(selectedModule.youtubeUrl, '_blank')}
                  className="btn btn-danger"
                >
                  <ExternalLink size={16} className="me-1" /> Watch on YouTube
                </button>

                <button
                  onClick={() => openArticle(selectedModule.article)}
                  style={{ background: collegeColors.primary }}
                  className="btn btn-light"
                >
                  <FileText size={16} className="me-1" /> Read Article
                </button>

                <button
                  onClick={() => toggleModuleCompletion(selectedModule._id)}
                  className={`btn ${completedModules.has(selectedModule._id) ? 'btn-success' : 'btn-secondary'}`}
                >
                  <CheckCircle size={16} className="me-1" />
                  {completedModules.has(selectedModule._id) ? 'Completed' : 'Mark Complete'}
                </button>
              </div>

              <div className="bg-light rounded p-3 mt-3">
                <h4 className="font-weight-bold">About this module</h4>
                <p>
                  Explore the content through both video and article formats to get a comprehensive understanding of the topic.
                </p>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  );
}