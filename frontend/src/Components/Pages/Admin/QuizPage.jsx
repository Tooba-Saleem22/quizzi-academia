import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, BookOpen, FileQuestion, Users, Settings, User, Menu, Search, Plus, MoreVertical, Trash2, Edit, Eye, X, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import Layout from './Layout';
import { quizService } from '../../../services/api';

const collegeColors = {
  primary: '#003366',   
  secondary: '#0055A4', 
  accent: '#FFC72C',   
  background: '#F5F9FF',
  white: '#fff',
  lightGrey: '#e1e8f0',
  darkGrey: '#444'
};

export default function QuizPage() {
  const [collapsed, setCollapsed] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [quizName, setQuizName] = useState('');
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [questions, setQuestions] = useState([{
    questionText: '',
    options: ['', '', '', ''],
    correctOptionIndex: 0
  }]);
  const [currentQuizId, setCurrentQuizId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const quizzesData = await quizService.getAllQuizzes();
      setQuizzes(quizzesData);
      setError(null);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load quizzes. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const toggleSidebar = () => setCollapsed(!collapsed);

  const handleNavigation = (title) => {
    switch (title) {
      case 'Dashboard':
        navigate('/admin/dashboard');
        break;
      case 'Courses':
        navigate('/coursesPage');
        break;
      case 'Quizzes':
        navigate('/quizPage');
        break;
      case 'Users':
        navigate('/usersPage');
        break;
      case 'Settings':
        navigate('/settingsPage');
        break;
      case 'Profile':
        navigate('/profilePage');
        break;
      default:
        break;
    }
  };

  const handleQuestionChange = (index, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].questionText = value;
    setQuestions(updatedQuestions);
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(updatedQuestions);
  };

  const handleCorrectOptionChange = (questionIndex, optionIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].correctOptionIndex = optionIndex;
    setQuestions(updatedQuestions);
  };

  const addQuestion = () => {
    setQuestions([...questions, {
      questionText: '',
      options: ['', '', '', ''],
      correctOptionIndex: 0
    }]);
  };

  const removeQuestion = (indexToRemove) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, index) => index !== indexToRemove));
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
  };

  const filteredQuizzes = quizzes.filter(quiz =>
    quiz.title?.toLowerCase().includes(searchQuery.toLowerCase())   );

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const quizData = {
        title: quizName,
        questions: questions,
      };
      
      await quizService.createQuiz(quizData);
      
      await fetchQuizzes();
      
      setShowModal(false);
      resetForm();
      document.body.classList.remove('modal-open');
      
      alert("Quiz created successfully!");
    } catch (err) {
      console.error("Error creating quiz:", err);
      setError("Failed to create quiz. Please try again.");
      alert("Failed to create quiz. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setQuizName('');
    setQuestions([{
      questionText: '',
      options: ['', '', '', ''],
      correctOptionIndex: 0
    }]);
    setCurrentQuizId(null);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
    document.body.classList.remove('modal-open');
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    resetForm();
    document.body.classList.remove('modal-open');
  };


  const handleDeleteQuiz = async (quizId) => {
    if (window.confirm("Are you sure you want to delete this quiz?")) {
      try {
        setLoading(true);
        await quizService.deleteQuiz(quizId);
        
        await fetchQuizzes();
        
        alert("Quiz deleted successfully");
      } catch (err) {
        console.error("Error deleting quiz:", err);
        setError("Failed to delete quiz. Please try again.");
        alert("Failed to delete quiz");
      } finally {
        setLoading(false);
      }
    }
  };


  const handleEditQuiz = async (quizId) => {
    try {
      setLoading(true);
      const quizData = await quizService.getQuizById(quizId);
      
      setQuizName(quizData.title);
      setQuestions(quizData.questions.map(q => ({
        questionText: q.questionText,
        options: q.options,
        correctOptionIndex: q.correctOptionIndex
      })));
      setCurrentQuizId(quizId);
      
      setShowEditModal(true);
      document.body.classList.add('modal-open');
    } catch (err) {
      console.error("Error fetching quiz data:", err);
      alert("Failed to load quiz for editing");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuiz = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const quizData = {
        title: quizName,
        questions: questions
      };
      
      await quizService.updateQuiz(currentQuizId, quizData);
      
      await fetchQuizzes();
      
      closeEditModal();
      
      alert("Quiz updated successfully!");
    } catch (err) {
      console.error("Error updating quiz:", err);
      setError("Failed to update quiz. Please try again.");
      alert("Failed to update quiz. Please try again.");
    } finally {
      setLoading(false);
    }
  };





  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

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
              color: collegeColors.secondary,
            }}
          />
          <input
            type="text"
            placeholder="Search by quiz title..."
            value={searchQuery}
            onChange={handleSearch}
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
            onClick={() => {
              setShowModal(true);
              document.body.classList.add('modal-open');
            }}
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
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#e6b800'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = collegeColors.accent}
          >
            <Plus size={18} style={{ marginRight: 8 }} />
            Create New Quiz
          </button>
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
            <p style={{ color: collegeColors.secondary, marginTop: 10 }}>Loading quizzes...</p>
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
                  {['Quiz ID', 'Quiz Title', 'Questions', 'Created At', '', 'Actions'].map(header => (
                    <th key={header} style={{ padding: '12px 15px', textAlign: header === 'Actions' ? 'center' : 'left' }}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredQuizzes.length > 0 ? filteredQuizzes.map((quiz, i) => (
                  <QuizTableRow 
                    key={quiz._id}
                    quiz={quiz}
                    index={i}
                    onDelete={handleDeleteQuiz}
                    onEdit={handleEditQuiz}
                    formatDate={formatDate}
                  />
                )) : (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: 30, color: '#999' }}>
                      No quizzes found. Create your first quiz!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {showModal && (
          <>
            <div 
              style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 1000,
                animation: 'fadeIn 0.3s ease forwards',
              }}
              onClick={closeModal}
            >
              <div 
                style={{
                  backgroundColor: collegeColors.white,
                  borderRadius: 12,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                  maxWidth: '90vw',
                  maxHeight: '90vh',
                  width: 800,
                  overflow: 'hidden',
                  animation: 'slideUp 0.3s ease forwards',
                }}
                onClick={e => e.stopPropagation()}
              >
                <div style={{ padding: '20px 30px', borderBottom: `1px solid ${collegeColors.lightGrey}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ color: collegeColors.primary, margin: 0 }}>Create New Quiz</h2>
                  <button 
                    onClick={closeModal}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: collegeColors.darkGrey,
                      cursor: 'pointer',
                      fontSize: 20,
                    }}
                  >
                    <X size={24} />
                  </button>
                </div>
                
                <div style={{ padding: 30, maxHeight: '70vh', overflowY: 'auto' }}>
                  <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: 30 }}>
                      <h3 style={{ color: collegeColors.primary, marginBottom: 15 }}>Quiz Details</h3>
                      <div>
                        <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: collegeColors.darkGrey }}>Quiz Name</label>
                        <input 
                          type="text" 
                          placeholder="Enter quiz name" 
                          value={quizName}
                          onChange={(e) => setQuizName(e.target.value)}
                          required
                          style={{
                            width: '100%',
                            padding: '10px 12px',
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
                    </div>

                    <div style={{ marginBottom: 30 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                        <h3 style={{ color: collegeColors.primary, margin: 0 }}>Questions ({questions.length})</h3>
                        <button 
                          type="button" 
                          onClick={addQuestion}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '8px 16px',
                            backgroundColor: collegeColors.secondary,
                            border: 'none',
                            borderRadius: 6,
                            color: collegeColors.white,
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            fontSize: 14,
                            transition: 'background-color 0.3s ease',
                          }}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = collegeColors.primary}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = collegeColors.secondary}
                        >
                          <Plus size={16} style={{ marginRight: 6 }} /> Add Question
                        </button>
                      </div>

                      {questions.map((question, qIndex) => (
                        <div key={qIndex} style={{ marginBottom: 20, border: `1px solid ${collegeColors.lightGrey}`, borderRadius: 8, overflow: 'hidden' }}>
                          <div style={{ backgroundColor: '#f8f9fa', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h4 style={{ margin: 0, color: collegeColors.primary }}>Question {qIndex + 1}</h4>
                            {questions.length > 1 && (
                              <button 
                                type="button" 
                                onClick={() => removeQuestion(qIndex)}
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
                            )}
                          </div>
                          <div style={{ padding: 20 }}>
                            <div style={{ marginBottom: 15 }}>
                              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: collegeColors.darkGrey }}>Question Text</label>
                              <input 
                                type="text" 
                                placeholder="Enter your question" 
                                value={question.questionText}
                                onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
                                required
                                style={{
                                  width: '100%',
                                  padding: '10px 12px',
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
                            
                            <div>
                              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: collegeColors.darkGrey }}>Options (select correct answer)</label>
                              {question.options.map((option, oIndex) => (
                                <div key={oIndex} style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
                                  <input 
                                    type="radio" 
                                    name={`correctOption-${qIndex}`} 
                                    checked={question.correctOptionIndex === oIndex}
                                    onChange={() => handleCorrectOptionChange(qIndex, oIndex)}
                                    required
                                    style={{ marginRight: 10 }}
                                  />
                                  <input 
                                    type="text" 
                                    placeholder={`Option ${oIndex + 1}`} 
                                    value={option}
                                    onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                                    required
                                    style={{
                                      flex: 1,
                                      padding: '8px 12px',
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
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 15, paddingTop: 20, borderTop: `1px solid ${collegeColors.lightGrey}` }}>
                      <button 
                        type="button" 
                        onClick={closeModal}
                        style={{
                          padding: '10px 20px',
                          backgroundColor: 'transparent',
                          border: `1px solid ${collegeColors.lightGrey}`,
                          borderRadius: 6,
                          color: collegeColors.darkGrey,
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          fontSize: 16,
                          transition: 'background-color 0.3s ease',
                        }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        style={{
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
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#e6b800'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = collegeColors.accent}
                      >
                        Save Quiz
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </>
        )}

        {showEditModal && (
          <>
            <div 
              style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 1000,
                animation: 'fadeIn 0.3s ease forwards',
              }}
              onClick={closeEditModal}
            >
              <div 
                style={{
                  backgroundColor: collegeColors.white,
                  borderRadius: 12,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                  maxWidth: '90vw',
                  maxHeight: '90vh',
                  width: 800,
                  overflow: 'hidden',
                  animation: 'slideUp 0.3s ease forwards',
                }}
                onClick={e => e.stopPropagation()}
              >
                <div style={{ padding: '20px 30px', borderBottom: `1px solid ${collegeColors.lightGrey}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ color: collegeColors.primary, margin: 0 }}>Edit Quiz</h2>
                  <button 
                    onClick={closeEditModal}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: collegeColors.darkGrey,
                      cursor: 'pointer',
                      fontSize: 20,
                    }}
                  >
                    <X size={24} />
                  </button>
                </div>
                
                <div style={{ padding: 30, maxHeight: '70vh', overflowY: 'auto' }}>
                  <form onSubmit={handleUpdateQuiz}>
                    <div style={{ marginBottom: 30 }}>
                      <h3 style={{ color: collegeColors.primary, marginBottom: 15 }}>Quiz Details</h3>
                      <div>
                        <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: collegeColors.darkGrey }}>Quiz Name</label>
                        <input 
                          type="text" 
                          placeholder="Enter quiz name" 
                          value={quizName}
                          onChange={(e) => setQuizName(e.target.value)}
                          required
                          style={{
                            width: '100%',
                            padding: '10px 12px',
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
                    </div>

                    <div style={{ marginBottom: 30 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                        <h3 style={{ color: collegeColors.primary, margin: 0 }}>Questions ({questions.length})</h3>
                        <button 
                          type="button" 
                          onClick={addQuestion}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '8px 16px',
                            backgroundColor: collegeColors.secondary,
                            border: 'none',
                            borderRadius: 6,
                            color: collegeColors.white,
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            fontSize: 14,
                            transition: 'background-color 0.3s ease',
                          }}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = collegeColors.primary}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = collegeColors.secondary}
                        >
                          <Plus size={16} style={{ marginRight: 6 }} /> Add Question
                        </button>
                      </div>

                      {questions.map((question, qIndex) => (
                        <div key={qIndex} style={{ marginBottom: 20, border: `1px solid ${collegeColors.lightGrey}`, borderRadius: 8, overflow: 'hidden' }}>
                          <div style={{ backgroundColor: '#f8f9fa', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h4 style={{ margin: 0, color: collegeColors.primary }}>Question {qIndex + 1}</h4>
                            {questions.length > 1 && (
                              <button 
                                type="button" 
                                onClick={() => removeQuestion(qIndex)}
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
                            )}
                          </div>
                          <div style={{ padding: 20 }}>
                            <div style={{ marginBottom: 15 }}>
                              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: collegeColors.darkGrey }}>Question Text</label>
                              <input 
                                type="text" 
                                placeholder="Enter your question" 
                                value={question.questionText}
                                onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
                                required
                                style={{
                                  width: '100%',
                                  padding: '10px 12px',
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
                            
                            <div>
                              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: collegeColors.darkGrey }}>Options (select correct answer)</label>
                              {question.options.map((option, oIndex) => (
                                <div key={oIndex} style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
                                  <input 
                                    type="radio" 
                                    name={`correctOption-${qIndex}`} 
                                    checked={question.correctOptionIndex === oIndex}
                                    onChange={() => handleCorrectOptionChange(qIndex, oIndex)}
                                    required
                                    style={{ marginRight: 10 }}
                                  />
                                  <input 
                                    type="text" 
                                    placeholder={`Option ${oIndex + 1}`} 
                                    value={option}
                                    onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                                    required
                                    style={{
                                      flex: 1,
                                      padding: '8px 12px',
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
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 15, paddingTop: 20, borderTop: `1px solid ${collegeColors.lightGrey}` }}>
                      <button 
                        type="button" 
                        onClick={closeEditModal}
                        style={{
                          padding: '10px 20px',
                          backgroundColor: 'transparent',
                          border: `1px solid ${collegeColors.lightGrey}`,
                          borderRadius: 6,
                          color: collegeColors.darkGrey,
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          fontSize: 16,
                          transition: 'background-color 0.3s ease',
                        }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        style={{
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
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#e6b800'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = collegeColors.accent}
                      >
                        Update Quiz
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </>
        )}

      </div>

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          
          .modal-open {
            overflow: hidden;
          }
          
          .spinner-border {
            display: inline-block;
            width: 2rem;
            height: 2rem;
            vertical-align: text-bottom;
            border: 0.25em solid currentColor;
            border-right-color: transparent;
            border-radius: 50%;
            animation: spinner-border 0.75s linear infinite;
          }
          
          @keyframes spinner-border {
            to {
              transform: rotate(360deg);
            }
          }
          
          .visually-hidden {
            position: absolute !important;
            width: 1px !important;
            height: 1px !important;
            padding: 0 !important;
            margin: -1px !important;
            overflow: hidden !important;
            clip: rect(0, 0, 0, 0) !important;
            white-space: nowrap !important;
            border: 0 !important;
          }
        `}
      </style>
    </Layout>
  );
}

function QuizTableRow({ quiz, index, onDelete, onEdit,  formatDate }) {
  return (
    <tr 
      style={{ 
        backgroundColor: index % 2 === 0 ? '#fff' : '#f8f9fa',
        transition: 'background-color 0.2s ease'
      }}
      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f0f8ff'}
      onMouseLeave={e => e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#fff' : '#f8f9fa'}
    >
      <td style={{ padding: '12px 15px', fontWeight: 'bold', color: collegeColors.secondary }}>
        #{quiz._id?.slice(-6) || 'N/A'}
      </td>
      <td style={{ padding: '12px 15px', fontWeight: '600' }}>
        {quiz.title || 'Untitled Quiz'}
      </td>
      <td style={{ padding: '12px 15px' }}>
        {quiz.questions?.length || 0} questions
      </td>
      <td style={{ padding: '12px 15px', color: '#666' }}>
        {quiz.createdAt ? formatDate(quiz.createdAt) : 'Unknown'}
      </td>
      <td style={{ padding: '12px 15px' }}>
      </td>
      <td style={{ padding: '12px 15px', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
          
          <button
            onClick={() => onEdit(quiz._id)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '4px',
              transition: 'background-color 0.2s ease',
              color: collegeColors.secondary,
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#e1e8f0'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
            title="Edit"
          >
            <Edit size={18} />
          </button>
          
          <button
            onClick={() => onDelete(quiz._id)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '4px',
              transition: 'background-color 0.2s ease',
              color: '#dc3545',
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8d7da'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
            title="Delete"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </td>
    </tr>
);
}