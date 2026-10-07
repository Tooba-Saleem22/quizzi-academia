import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, BookOpen, Play, X, FileText,
  AlertCircle, Loader2, Info
} from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';

const API_URL = 'http://localhost:5000/api';

const collegeColors = {
  primary: '#003366',
  accent: '#FFC72C',
  background: '#F5F9FF',
  white: '#fff',
  darkGrey: '#444'
};

export default function UserModulesPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);

  const [explanation, setExplanation] = useState('');
  const [loadingExplanation, setLoadingExplanation] = useState(false);
  const [showExplanationModal, setShowExplanationModal] = useState(false);

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

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

  const extractVideoId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url?.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const openArticle = (module) => {
    setSelectedModule(module);
    setExplanation(module.article || 'No article available.');
    setShowExplanationModal(true);
  };

  const openVideoModal = (module) => {
    setSelectedModule(module);
    setShowVideoModal(true);
  };

  const fetchExplanation = async (module) => {
    setSelectedModule(module); 
    setLoadingExplanation(true);
    setExplanation('');
    try {
      const res = await fetch(`${API_URL}/modules/explanation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: module.name }), 
      });
      const data = await res.json();
      if (res.ok) setExplanation(data.explanation);
      else setExplanation('Error: ' + data.error);
    } catch (err) {
      setExplanation('Failed to fetch explanation.');
    } finally {
      setLoadingExplanation(false);
      setShowExplanationModal(true);
    }
  };

  const Modal = ({ show, title, onClose, children, size = "lg", isVideoModal = false }) => {
    if (!show) return null;
    
    const videoModalStyles = isVideoModal ? {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0,0,0,0.8)',
      zIndex: 1055,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    } : {};

    const videoDialogStyles = isVideoModal ? {
      maxWidth: '95vw',
      width: '95vw',
      maxHeight: '95vh',
      margin: '0',
      backgroundColor: 'transparent',
      border: 'none'
    } : {};

    const videoContentStyles = isVideoModal ? {
      backgroundColor: '#fff',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
      animation: 'modalFadeIn 0.3s ease-out'
    } : {};

    return (
      <div 
        className={isVideoModal ? "" : "modal"} 
        tabIndex="-1" 
        style={isVideoModal ? videoModalStyles : { display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
        onClick={isVideoModal ? (e) => e.target === e.currentTarget && onClose() : undefined}
      >
        <div 
          className={isVideoModal ? "" : `modal-dialog modal-${size}`}
          style={isVideoModal ? videoDialogStyles : {}}
        >
          <div 
            className="modal-content" 
            style={isVideoModal ? videoContentStyles : {}}
          >
            <div className="modal-header" style={{ background: collegeColors.primary }}>
              <h5 className="modal-title text-white">{title}</h5>
              <button 
                onClick={onClose} 
                className="btn-close btn-close-white"
                style={{ fontSize: '1.2rem' }}
              />
            </div>
            <div 
              className="modal-body" 
              style={isVideoModal ? { 
                padding: '0',
                maxHeight: 'none',
                overflow: 'visible'
              } : { 
                maxHeight: '70vh', 
                overflowY: 'auto' 
              }}
            >
              {children}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const Alert = ({ type, message, onClose }) => {
    if (!message) return null;
    return (
      <div className={`mb-3 alert alert-${type}`} role="alert">
        <AlertCircle size={20} className="text-red-600" />
        <span className="flex-1">{message}</span>
        <button onClick={onClose} className="btn-close">
          <X size={16} />
        </button>
      </div>
    );
  };

  if (loading && !course) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="h5 text-muted">Loading your course...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100" style={{ background: collegeColors.background }}>
      <Navbar />

      <div className="container py-4">
        <div className="mb-4">
          <div className="d-flex justify-content-between mb-4">
            <div className="d-flex align-items-center">
              <button onClick={() => navigate('/courses')} className="btn btn-light me-3">
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="h3 text-dark">{course ? course.name : 'Course Modules'}</h1>
                <p className="text-muted">{course?.description || 'Explore your course modules'}</p>
              </div>
            </div>
          </div>

          <div className="row mb-4">
            <div className="col-md-4 mb-3">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body d-flex align-items-center">
                  <div className="rounded-circle p-3 me-3" style={{ background: '#003366', color: '#fff' }}>
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <p className="small text-muted mb-1">Total Modules</p>
                    <p className="h5 fw-semibold mb-0">{modules.length}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Alert type="error" message={error} onClose={() => setError('')} />

        <div className="row">
          {modules.map((module) => (
            <div key={module._id} className="col-md-3 mb-4">
              <div className="card h-100">
                <div className="position-relative">
                  <img
                    src={`http://localhost:5000/uploads/${module.image}`}
                    alt={module.name}
                    className="card-img-top"
                    style={{ height: '160px', objectFit: 'cover' }}
                    onError={(e) => e.target.src = `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=160&fit=crop`}
                  />
                  <div className="position-absolute top-0 start-0 p-2 bg-dark text-white fw-bold">
                    {module.name}
                  </div>
                </div>

                <div className="card-body d-flex flex-column gap-2">
                  <button
                    onClick={() => openArticle(module)}
                    className="btn btn-sm btn-primary"
                    style={{ background: collegeColors.primary }}
                  >
                    <FileText size={14} className="me-1" /> Read
                  </button>
                  <button
                    onClick={() => openVideoModal(module)}
                    className="btn btn-sm btn-danger"
                  >
                    <Play size={14} className="me-1" /> Watch
                  </button>
                  <button
                    onClick={() => fetchExplanation(module)}
                    className="btn btn-sm btn-info"
                    disabled={loadingExplanation && selectedModule?._id === module._id}
                  >
                    {loadingExplanation && selectedModule?._id === module._id ? (
                      <>
                        <Loader2 size={14} className="me-1 animate-spin" /> 
                        Loading...
                      </>
                    ) : (
                      <>
                        <Info size={14} className="me-1" /> 
                        Get Explanation
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}

          {modules.length === 0 && !loading && (
            <div className="text-center py-5">
              <div className="card mx-auto" style={{ maxWidth: '400px' }}>
                <div className="card-body">
                  <div className="bg-primary text-white rounded-circle p-4 mx-auto mb-3">
                    <BookOpen size={32} />
                  </div>
                  <h3 className="h5">No modules available</h3>
                  <p className="text-muted">This course doesn't have any modules yet.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal 
        show={showVideoModal} 
        onClose={() => setShowVideoModal(false)} 
        isVideoModal={true}
      >
        {selectedModule && (
          <div style={{ position: 'relative' }}>
            <div 
              className="ratio ratio-16x9" 
              style={{ 
                minHeight: '60vh',
                maxHeight: '80vh',
                width: '100%'
              }}
            >
              <iframe
                src={`https://www.youtube.com/embed/${extractVideoId(selectedModule.youtubeUrl)}?rel=0&modestbranding=1&autoplay=1`}
                title={selectedModule.name}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{
                  borderRadius: '0 0 8px 8px',
                  width: '100%',
                  height: '100%'
                }}
              />
            </div>
          </div>
        )}
      </Modal>

      <Modal show={showExplanationModal} title={`📖 ${selectedModule?.name || 'Explanation'}`} onClose={() => setShowExplanationModal(false)} size="lg">
        {loadingExplanation ? (
          <div className="text-center">
            <Loader2 className="animate-spin mb-3" />
            <p>Generating explanation...</p>
          </div>
        ) : (
          <p style={{ whiteSpace: 'pre-wrap' }}>{explanation}</p>
        )}
      </Modal>

      <style>
        {`
          @keyframes modalFadeIn {
            0% {
              opacity: 0;
              transform: scale(0.9) translateY(-20px);
            }
            100% {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }

          /* Responsive video modal adjustments */
          @media (max-width: 768px) {
            .modal[style*="position: fixed"] .modal-content {
              margin: 10px !important;
            }
            
            .modal[style*="position: fixed"] .ratio {
              min-height: 50vh !important;
              max-height: 70vh !important;
            }
          }

          @media (max-width: 576px) {
            .modal[style*="position: fixed"] {
              padding: 10px !important;
            }
            
            .modal[style*="position: fixed"] .modal-dialog {
              max-width: 98vw !important;
              width: 98vw !important;
            }
            
            .modal[style*="position: fixed"] .ratio {
              min-height: 40vh !important;
              max-height: 60vh !important;
            }
          }

          /* Improve video loading experience */
          .ratio iframe {
            background: linear-gradient(45deg, #f0f0f0 25%, transparent 25%), 
                        linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), 
                        linear-gradient(45deg, transparent 75%, #f0f0f0 75%), 
                        linear-gradient(-45deg, transparent 75%, #f0f0f0 75%);
            background-size: 20px 20px;
            background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
            transition: all 0.3s ease;
          }

          /* Loading button styles */
          .btn:disabled {
            opacity: 0.75;
            cursor: not-allowed;
          }

          .animate-spin {
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>

      <Footer />
    </div>
  );
}





