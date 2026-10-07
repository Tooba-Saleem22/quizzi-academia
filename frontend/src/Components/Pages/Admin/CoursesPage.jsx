import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Trash, Edit, Plus, Save, ArrowRight, BookOpen, Users, Clock, Search
} from 'lucide-react';
import Layout from './Layout';

const collegeColors = {
  primary: '#003366',
  accent: '#FFC72C',
  background: '#F5F9FF',
  white: '#fff',
  darkGrey: '#444',
  lightGrey: '#ddd'
};

const API_URL = 'http://localhost:5000/api/courses';

const Modal = React.memo(({ show, title, onClose, children }) => {
  useEffect(() => {
    if (show) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [show]);

  if (!show) return null;

  return (
    <>
      <div 
        className="modal-backdrop fade show" 
        style={{ 
          backgroundColor: 'rgba(0,0,0,0.6)', 
          zIndex: 1040 
        }}
        onClick={onClose}
      />
      <div 
        className="modal fade show d-block"
        tabIndex="-1" 
        role="dialog" 
        aria-labelledby="modalTitle" 
        aria-hidden="true"
        style={{ 
          zIndex: 1050,
          overflowY: 'auto',
          display: 'block'
        }} 
      >
        <div className="modal-dialog modal-lg modal-dialog-centered" style={{ maxWidth: '900px' }}>
          <div className="modal-content shadow-lg border-0" style={{ borderRadius: '12px' }}>
            <div 
              className="modal-header text-white d-flex align-items-center" 
              style={{ 
                backgroundColor: collegeColors.primary,
                borderTopLeftRadius: '12px',
                borderTopRightRadius: '12px',
                padding: '1.5rem 2rem'
              }}
            >
              <h5 className="modal-title fw-bold d-flex align-items-center gap-2" id="modalTitle">
                <BookOpen size={24} />
                {title}
              </h5>
              <button 
                type="button" 
                className="btn-close btn-close-white" 
                onClick={onClose}
                aria-label="Close"
              />
            </div>
            <div className="modal-body p-4" style={{ backgroundColor: collegeColors.background }}>
              {children}
            </div>
          </div>
        </div>
      </div>
    </>
  );
});

const CourseCard = React.memo(({ course, onManageModules, onEdit, onDelete }) => {
  const handleManageClick = useCallback(() => {
    onManageModules(course._id);
  }, [course._id, onManageModules]);

  const handleEditClick = useCallback(() => {
    onEdit(course);
  }, [course, onEdit]);

  const handleDeleteClick = useCallback(() => {
    onDelete(course._id);
  }, [course._id, onDelete]);

  return (
    <div className="col">
      <div className="card h-100 border-0 shadow-sm" style={{ borderRadius: '12px', overflow: 'hidden' }}>
        <div className="position-relative" style={{ height: '220px', overflow: 'hidden' }}>
          <img
            src={`http://localhost:5000/uploads/${course.image}`}
            alt={course.name}
            className="w-100 h-100"
            style={{ objectFit: 'cover' }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://via.placeholder.com/400x220?text=No+Image";
            }}
          />
          <div className="position-absolute top-0 start-0 w-100 h-100" 
               style={{ background: 'linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.3))' }} />
        </div>

        <div className="card-body p-4">
          <h5 className="card-title fw-bold mb-2" style={{ color: collegeColors.primary }}>
            {course.name}
          </h5>
          <p className="card-text text-muted" style={{ fontSize: '0.95rem', lineHeight: '1.5', minHeight: '70px' }}>
            {course.description}
          </p>
        </div>

        <div className="card-footer bg-white border-0 p-4 pt-0">
          <div className="d-flex justify-content-between align-items-center gap-2">
            <button
              className="btn btn-sm px-3 py-2 d-flex align-items-center gap-2 fw-medium"
              style={{ 
                backgroundColor: collegeColors.primary,
                borderColor: collegeColors.primary,
                color: "#fff",
                transition: 'background-color 0.2s ease, transform 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              onClick={handleManageClick}
            >
              Manage Modules <ArrowRight size={14} />
            </button>
            <div className="d-flex gap-2">
              <button
                className="btn btn-outline-primary btn-sm p-2 d-flex align-items-center"
                onClick={handleEditClick}
                title="Edit Course"
                style={{ transition: 'background-color 0.2s ease, border-color 0.2s ease' }}
              >
                <Edit size={16} />
              </button>
              <button
                className="btn btn-outline-danger btn-sm p-2 d-flex align-items-center"
                onClick={handleDeleteClick}
                title="Delete Course"
                style={{ transition: 'background-color 0.2s ease, border-color 0.2s ease' }}
              >
                <Trash size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default function CourseManagement() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setCourses(data);
    } catch (err) {
      console.error("Failed to fetch courses:", err);
      setError('Failed to load courses. Please try again later.');
    }
  };

  const filteredCourses = useMemo(() => {
    return courses.filter(course =>
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [courses, searchTerm]);

  const handleManageModules = useCallback((courseId) => {
    navigate(`/courses/${courseId}/modules`);
  }, [navigate]);

  const handleEditCourse = useCallback((course) => {
    setEditingCourse({ ...course });
    setShowEditModal(true);
  }, []);

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }

    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete course.');
      }

      setCourses(prevCourses => prevCourses.filter((course) => course._id !== id));
    } catch (err) {
      alert(err.message || 'Error deleting course.');
    }
  }, []);

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !description.trim() || !imageFile) {
      setError('Please fill all required fields and select an image.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('image', imageFile);

      const res = await fetch(API_URL, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to create course.');
      }

      const newCourse = await res.json();
      setCourses(prevCourses => [...prevCourses, newCourse]);
      
      setName('');
      setDescription('');
      setImageFile(null);
      setShowAddModal(false);
      e.target.reset();
    } catch (err) {
      setError(err.message || 'Something went wrong during course creation.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCourseEdit = async () => {
    if (!editingCourse.name.trim() || !editingCourse.description.trim()) {
      setError('Course name and description cannot be empty.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/${editingCourse._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editingCourse.name,
          description: editingCourse.description,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update course.');
      }

      const updatedCourse = await res.json();
      
      setCourses(prevCourses => 
        prevCourses.map(course =>
          course._id === editingCourse._id ? updatedCourse : course
        )
      );
      
      setEditingCourse(null);
      setShowEditModal(false);
    } catch (err) {
      setError(err.message || 'Error updating course.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseAddModal = useCallback(() => {
    setShowAddModal(false);
    setError('');
    setName('');
    setDescription('');
    setImageFile(null);
  }, []);

  const handleCloseEditModal = useCallback(() => {
    setShowEditModal(false);
    setEditingCourse(null);
    setError('');
  }, []);

  const handleShowAddModal = useCallback(() => {
    setShowAddModal(true);
  }, []);

  return (
    <Layout>
      <div style={{ flexGrow: 1, overflowY: 'auto', padding: 30 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ marginBottom: 20, maxWidth: 400, position: 'relative' }}>
            <Search
              size={18}
              style={{
                position: 'absolute',
                top: '50%',
                left: 10,
                transform: 'translateY(-50%)',
                color: collegeColors.darkGrey,
              }}
            />
            <input
              type="text"
              placeholder="Search by course title or description..."
              value={searchTerm}
              onChange={handleSearchChange}
              style={{
                width: '400px',
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

          <button 
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '10px 20px',
              backgroundColor: collegeColors.accent,
              border: 'none',
              borderRadius: 6,
              color: collegeColors.primary,
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: 16,
              transition: 'background-color 0.3s ease',
            }}
            onClick={handleShowAddModal}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#e6b800'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = collegeColors.accent}
          >
            <Plus size={18} style={{ marginRight: 8 }} />
            Create New Course
          </button>
        </div>

        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course._id}
              course={course}
              onManageModules={handleManageModules}
              onEdit={handleEditCourse}
              onDelete={handleDelete}
            />
          ))}
        </div>

        {filteredCourses.length === 0 && !loading && (
          <div className="text-center py-5">
            <BookOpen size={64} style={{ color: collegeColors.primary + '40' }} className="mb-3" />
            <h4 style={{ color: collegeColors.primary }}>
              {searchTerm ? "No Courses Found" : "No Courses Yet"}
            </h4>
            <p className="text-muted">
              {searchTerm 
                ? "Your search did not match any courses. Please try a different keyword."
                : "Start by adding your first course to populate your curriculum."
              }
            </p>
          </div>
        )}
      </div>

      <Modal
        show={showAddModal}
        title="Add New Course"
        onClose={handleCloseAddModal}
      >
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="courseName" className="form-label fw-bold" style={{ color: collegeColors.primary }}>
              Course Name <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className="form-control form-control-lg border-0 shadow-sm"
              id="courseName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Introduction to Computer Science"
              style={{ borderRadius: '8px' }}
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="courseDesc" className="form-label fw-bold" style={{ color: collegeColors.primary }}>
              Course Description <span className="text-danger">*</span>
            </label>
            <textarea
              className="form-control border-0 shadow-sm"
              id="courseDesc"
              rows="4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a detailed description of the course content and objectives."
              style={{ borderRadius: '8px' }}
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="courseImage" className="form-label fw-bold" style={{ color: collegeColors.primary }}>
              Course Image <span className="text-danger">*</span>
            </label>
            <input
              type="file"
              className="form-control border-0 shadow-sm"
              id="courseImage"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
              style={{ borderRadius: '8px' }}
              required
            />
            <small className="text-muted">Please select a high-quality image (JPG, PNG) for the course thumbnail.</small>
          </div>

          {error && <div className="alert alert-danger mt-3">{error}</div>}

          <div className="d-flex justify-content-end gap-3 pt-3">
            <button 
              type="button" 
              className="btn btn-outline-secondary px-4 py-2"
              onClick={handleCloseAddModal}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn px-4 py-2 d-flex align-items-center gap-2" 
              disabled={loading}
              style={{ 
                backgroundColor: collegeColors.primary,
                borderColor: collegeColors.primary,
                color: collegeColors.white,
                transition: 'background-color 0.2s ease, transform 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <Save size={16} /> {loading ? 'Adding Course...' : 'Add Course'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        show={showEditModal}
        title="Edit Course Details"
        onClose={handleCloseEditModal}
      >
        {editingCourse && (
          <>
            <div className="mb-4">
              <label htmlFor="editCourseName" className="form-label fw-bold" style={{ color: collegeColors.primary }}>
                Course Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control form-control-lg border-0 shadow-sm"
                id="editCourseName"
                value={editingCourse.name}
                onChange={(e) =>
                  setEditingCourse({ ...editingCourse, name: e.target.value })
                }
                style={{ borderRadius: '8px' }}
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="editCourseDesc" className="form-label fw-bold" style={{ color: collegeColors.primary }}>
                Course Description <span className="text-danger">*</span>
              </label>
              <textarea
                className="form-control border-0 shadow-sm"
                id="editCourseDesc"
                rows="4"
                value={editingCourse.description}
                onChange={(e) =>
                  setEditingCourse({ ...editingCourse, description: e.target.value })
                }
                style={{ borderRadius: '8px' }}
                required
              />
            </div>
            <div className="mb-4">
              <label className="form-label fw-bold" style={{ color: collegeColors.primary }}>
                Current Course Image
              </label>
              <div className="mt-2 border rounded shadow-sm p-3 d-flex justify-content-center" 
                   style={{ maxWidth: '350px', backgroundColor: collegeColors.white }}>
                <img
                  src={`http://localhost:5000/uploads/${editingCourse.image}`}
                  alt={editingCourse.name}
                  className="img-fluid rounded"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://via.placeholder.com/300x200?text=No+Image";
                  }}
                  style={{ maxHeight: '200px', objectFit: 'contain' }}
                />
              </div>
              <small className="text-muted d-block mt-2">
                Note: Image cannot be updated directly. Please delete and re-add the course to change the image.
              </small>
            </div>

            {error && <div className="alert alert-danger mt-3">{error}</div>}

            <div className="d-flex justify-content-end gap-2">
              <button 
                className="btn btn-outline-secondary px-4 py-2"
                onClick={handleCloseEditModal}
              >
                Cancel
              </button>
              <button 
                type="button"
                className="btn px-4 py-2 d-flex align-items-center gap-2"
                onClick={handleSaveCourseEdit}
                disabled={loading}
                style={{ 
                  backgroundColor: collegeColors.primary,
                  borderColor: collegeColors.primary,
                  color: collegeColors.white,
                  transition: 'background-color 0.2s ease, transform 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <Save size={16} /> {loading ? 'Saving Changes...' : 'Save Changes'}
              </button>
            </div>
          </>
        )}
      </Modal>
    </Layout>
  );
}