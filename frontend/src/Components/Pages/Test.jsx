import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Home, BookOpen, FileQuestion, Search, Star, 
  ChevronLeft, ChevronRight, Check, X, Video,
  PlayCircle, BarChart3, RefreshCw,
  Share2, Download, TrendingUp, Users, AlertCircle,
  CheckCircle, XCircle, Play, ExternalLink, Lightbulb
} from 'lucide-react';
import Navbar from '../Pages/Navbar';
import Footer from '../Pages/Footer';
import Spinner from '../Pages/Spinner';

import { quizService } from '../../services/api';

import { motion, AnimatePresence } from 'framer-motion';


const collegeColors = {
  primary: '#003366',
  accent: '#FFC72C',
  background: '#F5F9FF',
  white: '#fff',
  darkGrey: '#444',
  success: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B'
};

export default function UserQuizPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [recommendedVideos, setRecommendedVideos] = useState([]);

  const [searchQuery, setSearchQuery] = useState('');

  const [showQuizModal, setShowQuizModal] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [userAnswersCorrect, setUserAnswersCorrect] = useState([]);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const [score, setScore] = useState(0);

  const navigate = useNavigate();

  const fetchYouTubeRecommendationsFromBackend = async () => {
    if (!currentQuiz || score === currentQuiz.questions.length) {
      setRecommendedVideos([]);
      return;
    }

    setLoadingRecommendations(true);
    
    try {
      const incorrectQuestions = currentQuiz.questions
        .map((question, index) => ({
          question: question.questionText,
          isCorrect: userAnswersCorrect[index] === true,
          index
        }))
        .filter(q => !q.isCorrect);

      if (incorrectQuestions.length === 0) {
        setRecommendedVideos([]);
        setLoadingRecommendations(false);
        return;
      }

      const searchTerms = [];

      const combinedText = incorrectQuestions.map(q => q.question).join(' ');
      const keywords = extractKeywords(combinedText);
      searchTerms.push(`${keywords.slice(0, 4).join(' ')} tutorial`);

      const limitedSearchTerms = searchTerms.slice(0, 3);

      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ searchTerms: limitedSearchTerms }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }

      const videos = await response.json();
      setRecommendedVideos(videos);

    } catch (error) {
      console.error('Error fetching YouTube recommendations:', error);
      setRecommendedVideos([
        {
          title: 'Study Tips and Learning Strategies',
          link: 'https://www.youtube.com/results?search_query=effective+study+techniques',
          thumbnail: '/api/placeholder/320/180',
          description: 'General study improvement techniques',
          topic: 'Study Skills'
        }
      ]);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const extractKeywords = (text) => {
    const commonWords = ['the', 'is', 'at', 'which', 'on', 'what', 'how', 'why', 'when', 'where', 'a', 'an', 'and', 'or', 'but', 'in', 'with', 'to', 'for', 'of', 'as', 'by'];
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3 && !commonWords.includes(word))
      .slice(0, 10);
  };

  const fetchQuizzes = useCallback(async (retryCount = 0) => {
    try {
      setLoading(true);
      setError(null);

      const quizzesData = await quizService.getAllQuizzes();

      const enhancedQuizzes = quizzesData.map(quiz => ({
        ...quiz,
        averageScore: quiz.averageScore || Math.floor(Math.random() * 40) + 60,
        totalAttempts: quiz.totalAttempts || Math.floor(Math.random() * 1000) + 100,
        estimatedTime: quiz.estimatedTime || (quiz.questions?.length || 5) * 1.5,
        tags: quiz.tags || ['practice', 'assessment'],
        createdAt: quiz.createdAt || new Date().toISOString()
      }));

      const validQuizzes = enhancedQuizzes.filter(quiz => quiz.title && Array.isArray(quiz.questions) && quiz.questions.length > 0 && quiz.questions.every(q => q.questionText && Array.isArray(q.options) && q.options.length > 0));
      setQuizzes(validQuizzes);
    } catch (err) {
      console.error("Error fetching quizzes:", err);

      if (retryCount < 2) {
        setTimeout(() => fetchQuizzes(retryCount + 1), 1000);
        return;
      }

      setError("Failed to load quizzes. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuizzes();

  }, [fetchQuizzes]);

  const filteredAndSortedQuizzes = useMemo(() => {
    let filtered = quizzes.filter(quiz => {
      const matchesSearch = (quiz.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (quiz.description || '').toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSearch;
    });

    return filtered;
  }, [quizzes, searchQuery]); 

  const startQuiz = async (quizId) => {
    try {
      setLoading(true);
      const quizData = await quizService.getQuizById(quizId);

      setCurrentQuiz({
        ...quizData,
        startTime: Date.now()
      });

      setCurrentQuestionIndex(0);
      setUserAnswers(new Array(quizData.questions.length).fill(-1));
      setUserAnswersCorrect(new Array(quizData.questions.length).fill(null));
      setAnswerSubmitted(false);
      setQuizFinished(false);
      setShowExplanation(false);
      setScore(0);
      setRecommendedVideos([]);
      setAiExplanations({});
      setGeneratingExplanation(false);


      setShowQuizModal(true);
      document.body.style.overflow = 'hidden';
    } catch (err) {
      console.error("Error loading quiz:", err);
      setError("Failed to load quiz. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (optionIndex) => {
    if (!answerSubmitted) {
      const newAnswers = [...userAnswers];
      newAnswers[currentQuestionIndex] = optionIndex;
      setUserAnswers(newAnswers);
    }
  };

  const [generatingExplanation, setGeneratingExplanation] = useState(false);
  const [aiExplanations, setAiExplanations] = useState({});

  const generateAIExplanation = async (question, options, correctOptionIndex, userAnswerIndex) => {
    try {
      setGeneratingExplanation(true);
      
      console.log('Requesting AI explanation from backend...');
      
      const response = await fetch('/api/ai/generate-explanation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: question.questionText,
          options: options,
          correctAnswerIndex: correctOptionIndex,
          userAnswerIndex: userAnswerIndex
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      
      if (!data.success || !data.explanation) {
        throw new Error('Invalid response format from backend');
      }
      
      const explanation = data.explanation.trim();
      
      setAiExplanations(prev => ({
        ...prev,
        [currentQuestionIndex]: explanation
      }));
  
      console.log('AI Explanation generated successfully:', {
        length: explanation.length,
        model: data.metadata?.model,
        tokensUsed: data.metadata?.tokensUsed
      });
      
      return explanation;
        
    } catch (error) {
      console.error('Error generating AI explanation:', error);
      
      const errorExplanation = `⚠️ **AI Explanation Unavailable**
  
  Unable to generate AI explanation at this time. This could be due to:
  - API service temporarily unavailable
  - Network connectivity issues
  - Configuration problems
  
  **Manual Review:** Please review the correct answer and think about why it's the best choice among the given options.`;
  
      setAiExplanations(prev => ({
        ...prev,
        [currentQuestionIndex]: errorExplanation
      }));
      
      return errorExplanation;
    } finally {
      setGeneratingExplanation(false);
    }
  };
  
const submitAnswer = useCallback(async () => {
  if (currentQuiz && userAnswers[currentQuestionIndex] !== -1 && !answerSubmitted) {
    const currentQuestion = currentQuiz.questions[currentQuestionIndex];
    const selectedAnswer = userAnswers[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correctOptionIndex;

    const newAnswersCorrect = [...userAnswersCorrect];
    newAnswersCorrect[currentQuestionIndex] = isCorrect;
    setUserAnswersCorrect(newAnswersCorrect);

    if (isCorrect) {
      setScore(prev => prev + 1);
    } 

    setAnswerSubmitted(true);
    setShowExplanation(true);

    if (!aiExplanations[currentQuestionIndex]) {
      await generateAIExplanation(
        currentQuestion,
        currentQuestion.options,
        currentQuestion.correctOptionIndex,
        selectedAnswer 
      );
    }
  }
}, [currentQuiz, userAnswers, currentQuestionIndex, answerSubmitted, userAnswersCorrect, aiExplanations]); // REMOVED: currentStreak dependency

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setAnswerSubmitted(userAnswersCorrect[currentQuestionIndex - 1] !== null);
      setShowExplanation(userAnswersCorrect[currentQuestionIndex - 1] !== null);
    }
  };

  const goToNextQuestion = () => {
    if (currentQuiz && currentQuestionIndex < currentQuiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setAnswerSubmitted(userAnswersCorrect[currentQuestionIndex + 1] !== null);
      setShowExplanation(userAnswersCorrect[currentQuestionIndex + 1] !== null);
    } else if (answerSubmitted) {
      finishQuiz();
    }
  };

  const finishQuiz = useCallback(() => {
    saveQuizResult();
    setQuizFinished(true);
  }, []);

  const saveQuizResult = async () => {
    if (!currentQuiz) return;

    const result = {
      quizId: currentQuiz._id,
      score: score,
      total: currentQuiz.questions.length,
      percentage: Math.round((score / currentQuiz.questions.length) * 100),
      answers: userAnswers,
      completedAt: new Date().toISOString()
    };

    try {
      console.log("Quiz result saved:", result);
    } catch (err) {
      console.error("Error saving quiz result:", err);
    }
  };

  const closeQuizModal = () => {
    setShowQuizModal(false);
    setCurrentQuiz(null);
    setQuizFinished(false);
    setShowExplanation(false);
    setRecommendedVideos([]);
    document.body.style.overflow = 'auto';
  };


  const calculatePercentage = () => {
    return currentQuiz ? Math.round((score / currentQuiz.questions.length) * 100) : 0;
  };

  const getPerformanceLevel = (percentage) => {
    if (percentage >= 90) return { level: 'Outstanding', color: '#10B981', icon: '🏆', bgColor: '#ECFDF5' };
    if (percentage >= 80) return { level: 'Excellent', color: '#059669', icon: '⭐', bgColor: '#F0FDF4' };
    if (percentage >= 70) return { level: 'Good', color: '#0891B2', icon: '👍', bgColor: '#F0F9FF' };
    if (percentage >= 60) return { level: 'Fair', color: '#D97706', icon: '📈', bgColor: '#FFFBEB' };
    return { level: 'Needs Practice', color: '#DC2626', icon: '📚', bgColor: '#FEF2F2' };
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.4 }
    }
  };

  const cardHoverVariants = {
    hover: {
      y: -8,
      scale: 1.02,
      boxShadow: '0 20px 40px rgba(0,51,102,0.15)',
      transition: { duration: 0.3 }
    }
  };

  return (
    <div className="container-fluid p-0" style={{ background: "#f0f2f5" }}>
      <Navbar />
      
      <section
        aria-label="Hero section with search"
        style={{
          backgroundColor: "#003366",
          color: "#fff",
          padding: "50px 15vw",
          textAlign: "center",
          borderRadius: "30px",
          animation: "fadeZoomIn 1s ease-out",
          maxWidth: "900px",
          margin: "40px auto",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
        }}
      >
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            style={{ flex: '1 1 60%' }}
          >
            <h4 className="mb-3" style={{ color: '#ff7c2c' }}>
              Empower Your Learning Journey
            </h4>
            <p className="lead opacity-90 mb-4" style={{ color: 'rgba(255,255,255,0.9)' }}>
              Test your knowledge with interactive quizzes and get personalized learning recommendations
            </p>


            <div className="mt-4 d-flex justify-content-center">
              <div
                className="input-group"
                style={{
                  maxWidth: "500px",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
                  borderRadius: "12px",
                  overflow: "hidden",
                }}
              >
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search quizzes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    border: 'none',
                    borderRadius: "0",
                    padding: "10px 14px"
                  }}
                />
                <span className="input-group-text" style={{ backgroundColor: '#ffc72c' }}>
                  <Search size={18} color="#fff" />
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <main className="container py-5">
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="alert alert-danger rounded-3 shadow-sm d-flex align-items-center"
              role="alert"
            >
              <X size={20} className="me-2" />
              {error}
              <button
                className="btn btn-sm btn-outline-danger ms-auto"
                onClick={() => fetchQuizzes()}
              >
                Retry
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {loading && !showQuizModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-5"
            >
              <div className="spinner-grow text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
                <span className="visually-hidden">Loading...</span>
              </div>
              <h5 className="text-primary">Loading amazing quizzes...</h5>
              <p className="text-muted">Please wait while we fetch the latest content</p>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="row g-4"
        >
          {filteredAndSortedQuizzes.map((quiz, index) => (
            <motion.div
              key={quiz._id}
              variants={itemVariants}
              className="col-lg-4 col-md-6"
            >
              <motion.div
                variants={cardHoverVariants}
                whileHover="hover"
                whileTap={{ scale: 0.98 }}
                className="card h-100 border-0 shadow rounded-5 overflow-hidden position-relative"
                style={{
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  borderRadius: '30px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
              >

                <div className="card-body p-4">
                  <h5 className="card-title fw-bold mb-3" style={{ color: collegeColors.primary }}>
                    {quiz.title}
                  </h5>

                  
                  <div className="row g-2 mb-4">
                    <div className="col-4 text-center">
                    </div>
                    <div className="col-4 text-center">
                      <div className="d-flex flex-column align-items-center">
                        <FileQuestion size={16} className="text-success mb-1" />
                        <small className="text-muted fw-semibold">{quiz.questions?.length || 0}</small>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      className="btn btn-primary flex-grow-1 d-flex align-items-center justify-content-center"
                      onClick={() => startQuiz(quiz._id)}
                      style={{
                        backgroundColor: collegeColors.primary,
                        borderColor: collegeColors.primary,
                        fontWeight: '600'
                      }}
                    >
                      <PlayCircle size={18} className="me-2" />
                      Start Quiz
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        <AnimatePresence>
          {!loading && filteredAndSortedQuizzes.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-5"
            >
              <div className="mb-4">
                <Search size={64} className="text-muted mb-3" />
                <h4 className="text-muted mb-2">No Quizzes Found</h4>
                <p className="text-muted">
                  {searchQuery ? `No quizzes match "${searchQuery}"` : 'No quizzes available at the moment'}
                </p>
              </div>
              {searchQuery && (
                <button
                  className="btn btn-outline-primary"
                  onClick={() => {
                    setSearchQuery('');
                  }}
                >
                  Clear Search
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {showQuizModal && currentQuiz && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal fade show d-block"
            style={{
              backgroundColor: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(8px)',
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              overflowY: 'auto',
              zIndex: 1050
            }}
          >
            <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="modal-content border-0 shadow-lg"
                style={{ 
                  borderRadius: '20px', 
                  overflow: 'hidden',
                  maxHeight: '90vh',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {!quizFinished ? (
                  <>
                    <div
                      className="modal-header border-0 text-white position-sticky top-0 z-1"
                      style={{
                        background: `linear-gradient(135deg, ${collegeColors.primary} 0%, #004080 100%)`,
                        padding: '20px 30px',
                        zIndex: 1
                      }}
                    >
                      <div className="d-flex justify-content-between align-items-center w-100">
                        <div>
                          <h4 className="modal-title fw-bold mb-1">{currentQuiz.title}</h4>
                          <div className="d-flex align-items-center gap-3">
                            <span className="badge bg-light text-dark px-3 py-2">
                              Question {currentQuestionIndex + 1} of {currentQuiz.questions.length}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="btn-close btn-close-white"
                          onClick={closeQuizModal}
                        ></button>
                      </div>

                      <div className="progress mt-3" style={{ height: '6px', borderRadius: '3px' }}>
                        <div
                          className="progress-bar bg-warning"
                          style={{
                            width: `${((currentQuestionIndex + 1) / currentQuiz.questions.length) * 100}%`,
                            transition: 'width 0.3s ease'
                          }}
                        ></div>
                      </div>
                    </div>

                    <div 
                      className="modal-body p-4"
                      style={{
                        overflowY: 'auto',
                        flex: '1 1 auto',
                        maxHeight: 'calc(90vh - 180px)'
                      }}
                    >
                      {currentQuiz.questions[currentQuestionIndex] && (
                        <motion.div
                          key={currentQuestionIndex}
                          initial={{ opacity: 0, x: 50 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4 }}
                        >
                          <div className="mb-4">
                            <h5 className="fw-bold mb-3" style={{ color: collegeColors.primary, lineHeight: '1.6' }}>
                              {currentQuiz.questions[currentQuestionIndex].questionText}
                            </h5>

                            <div className="row g-3">
                              {currentQuiz.questions[currentQuestionIndex].options.map((option, index) => {
                                const isSelected = userAnswers[currentQuestionIndex] === index;
                                const isCorrect = index === currentQuiz.questions[currentQuestionIndex].correctOptionIndex;
                                
                                let buttonClass = "btn btn-outline-secondary w-100 text-start p-3";
                                let iconComponent = null;

                                if (answerSubmitted) {
                                  if (isCorrect) {
                                    buttonClass = "btn btn-success w-100 text-start p-3";
                                    iconComponent = <CheckCircle size={20} className="float-end" />;
                                  } else if (isSelected && !isCorrect) {
                                    buttonClass = "btn btn-danger w-100 text-start p-3";
                                    iconComponent = <XCircle size={20} className="float-end" />;
                                  } else {
                                    buttonClass = "btn btn-light w-100 text-start p-3";
                                  }
                                } else if (isSelected) {
                                  buttonClass = "btn btn-primary w-100 text-start p-3";
                                  iconComponent = <div className="float-end bg-white rounded-circle p-1">
                                    <Check size={16} className="text-primary" />
                                  </div>;
                                }

                                return (
                                  <div key={index} className="col-12">
                                    <motion.button
                                      whileHover={!answerSubmitted ? { scale: 1.02 } : {}}
                                      whileTap={!answerSubmitted ? { scale: 0.98 } : {}}
                                      className={buttonClass}
                                      onClick={() => handleAnswerSelect(index)}
                                      disabled={answerSubmitted}
                                      style={{
                                        minHeight: '60px',
                                        border: isSelected && !answerSubmitted ? '2px solid #0066cc' : '1px solid #dee2e6',
                                        transition: 'all 0.2s ease',
                                        fontWeight: isSelected ? '600' : '400'
                                      }}
                                    >
                                      <div className="d-flex align-items-center justify-content-between">
                                        <span className="me-2">
                                          <span className="badge bg-secondary me-2" style={{ minWidth: '24px' }}>
                                            {String.fromCharCode(65 + index)}
                                          </span>
                                          {option}
                                        </span>
                                        {iconComponent}
                                      </div>
                                    </motion.button>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          <AnimatePresence>
  {showExplanation && answerSubmitted && (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="alert alert-info border-0 rounded-3 mt-3"
      style={{ 
        backgroundColor: '#f8f9ff', 
        borderLeft: '4px solid #0066cc',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)' 
      }}
    >
      <div className="d-flex align-items-start gap-3">
        <Lightbulb size={20} className="text-primary mt-1 flex-shrink-0" />
        <div className="flex-grow-1">
          <h6 className="fw-bold text-primary mb-2 d-flex align-items-center gap-2">
            🤖 AI Explanation
            {userAnswersCorrect[currentQuestionIndex] ? (
              <span className="badge bg-success">Correct!</span>
            ) : (
              <span className="badge bg-danger">Review</span>
            )}
          </h6>
          
          {generatingExplanation ? (
            <div className="d-flex align-items-center gap-3 py-3">
              <div className="spinner-border spinner-border-sm text-primary" role="status">
                <span className="visually-hidden">Generating explanation...</span>
              </div>
              <div>
                <div className="fw-semibold text-primary">AI is analyzing this question...</div>
                <small className="text-muted">Generating personalized explanation based on your answer</small>
              </div>
            </div>
          ) : aiExplanations[currentQuestionIndex] ? (
            <div className="text-dark" style={{ lineHeight: '1.7', fontSize: '0.95rem' }}>
              {aiExplanations[currentQuestionIndex].split('\n').map((paragraph, index) => (
                paragraph.trim() && (
                  <div key={index} className="mb-2">
                    {/* Handle markdown-style formatting */}
                    {paragraph.trim().startsWith('**') && paragraph.trim().endsWith('**') ? (
                      <h6 className="fw-bold text-primary mt-3 mb-2">
                        {paragraph.trim().replace(/\*\*/g, '')}
                      </h6>
                    ) : paragraph.trim().startsWith('- ') ? (
                      <div className="ms-3 mb-1">
                        • {paragraph.trim().substring(2)}
                      </div>
                    ) : paragraph.trim().startsWith('⚠️') ? (
                      <div className="alert alert-warning border-0 py-2 px-3 small">
                        {paragraph.trim()}
                      </div>
                    ) : (
                      <p className="mb-2">{paragraph.trim()}</p>
                    )}
                  </div>
                )
              ))}
            </div>
          ) : (
            <div className="alert alert-warning border-0 mb-0 py-2">
              <div className="d-flex align-items-center gap-2">
                <AlertCircle size={16} className="text-warning flex-shrink-0" />
                <span className="text-warning small">
                  AI explanation is temporarily unavailable. Please review the answer manually.
                </span>
              </div>
            </div>
          )}
          
          {!generatingExplanation && (!aiExplanations[currentQuestionIndex] || aiExplanations[currentQuestionIndex].includes('⚠️')) && (
            <button
              className="btn btn-sm btn-outline-primary mt-2"
              onClick={() => generateAIExplanation(
                currentQuiz.questions[currentQuestionIndex],
                currentQuiz.questions[currentQuestionIndex].options,
                currentQuiz.questions[currentQuestionIndex].correctOptionIndex,
                userAnswers[currentQuestionIndex]
              )}
            >
              <RefreshCw size={14} className="me-1" />
              Retry AI Explanation
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )}
</AnimatePresence>

                        </motion.div>
                      )}
                    </div>

                    <div 
                      className="modal-footer border-0 p-4 pt-0 position-sticky bottom-0 bg-white"
                      style={{ zIndex: 1 }}
                    >
                      <div className="d-flex justify-content-between align-items-center w-100">
                        <button
                          className="btn btn-outline-secondary d-flex align-items-center"
                          onClick={goToPreviousQuestion}
                          disabled={currentQuestionIndex === 0}
                        >
                          <ChevronLeft size={18} className="me-1" />
                          Previous
                        </button>

                        <div className="d-flex gap-2">
                          {!answerSubmitted && userAnswers[currentQuestionIndex] !== -1 && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="btn btn-success px-4"
                              onClick={submitAnswer}
                            >
                              Submit Answer
                            </motion.button>
                          )}

                          {answerSubmitted && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="btn btn-primary d-flex align-items-center px-4"
                              onClick={goToNextQuestion}
                            >
                              {currentQuestionIndex === currentQuiz.questions.length - 1 ? (
                                <>
                                  Finish Quiz
                                </>
                              ) : (
                                <>
                                  Next
                                  <ChevronRight size={18} className="ms-1" />
                                </>
                              )}
                            </motion.button>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <div className="modal-header border-0 text-center" style={{ 
                      background: `linear-gradient(135deg, ${collegeColors.primary} 0%, #004080 100%)`,
                      position: 'sticky',
                      top: 0,
                      zIndex: 1
                    }}>
                      <div className="w-100 text-white py-3">
                      </div>
                      <button
                        type="button"
                        className="btn-close btn-close-white position-absolute top-0 end-0 m-3"
                        onClick={closeQuizModal}
                      ></button>
                    </div>

                    <div 
                      className="modal-body p-4"
                      style={{
                        overflowY: 'auto',
                        flex: '1 1 auto',
                        maxHeight: 'calc(90vh - 180px)'
                      }}
                    >
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        <div className="text-center mb-4">
                          <div 
                            className="mx-auto mb-3 d-flex align-items-center justify-content-center"
                            style={{
                              width: '120px',
                              height: '120px',
                              borderRadius: '50%',
                              background: `conic-gradient(${getPerformanceLevel(calculatePercentage()).color} ${calculatePercentage() * 3.6}deg, #e9ecef 0deg)`,
                              position: 'relative'
                            }}
                          >
                            <div 
                              className="bg-white rounded-circle d-flex align-items-center justify-content-center"
                              style={{ width: '90px', height: '90px' }}
                            >
                              <div className="text-center">
                                <h2 className="fw-bold mb-0" style={{ color: getPerformanceLevel(calculatePercentage()).color }}>
                                  {calculatePercentage()}%
                                </h2>
                                <small className="text-muted">Score</small>
                              </div>
                            </div>
                          </div>

                          <div 
                            className="badge px-4 py-2 rounded-pill mb-3"
                            style={{ 
                              backgroundColor: getPerformanceLevel(calculatePercentage()).bgColor,
                              color: getPerformanceLevel(calculatePercentage()).color,
                              fontSize: '1rem',
                              fontWeight: '600'
                            }}
                          >
                            {getPerformanceLevel(calculatePercentage()).icon} {getPerformanceLevel(calculatePercentage()).level}
                          </div>
                        </div>

                        <div className="row g-3 mb-4">
                          <div className="col-md-6 col-6">
                            <div className="text-center p-3 bg-light rounded-3">
                              <CheckCircle size={24} className="text-success mb-2" />
                              <h4 className="fw-bold mb-1 text-success">{score}</h4>
                              <small className="text-muted">Correct</small>
                            </div>
                          </div>
                          <div className="col-md-6 col-6">
                            <div className="text-center p-3 bg-light rounded-3">
                              <XCircle size={24} className="text-danger mb-2" />
                              <h4 className="fw-bold mb-1 text-danger">{currentQuiz.questions.length - score}</h4>
                              <small className="text-muted">Incorrect</small>
                            </div>
                          </div>
                        </div>

                        {(score < currentQuiz.questions.length) && (
                          <div className="mb-4">
                            <div className="d-flex align-items-center justify-content-between mb-3">
                              <h5 className="fw-bold mb-0" style={{ color: collegeColors.primary }}>
                                <Video size={20} className="me-2" />
                                Recommended Learning Videos
                              </h5>
                              {!loadingRecommendations && recommendedVideos.length === 0 && (
                                <button
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={fetchYouTubeRecommendationsFromBackend}
                                >
                                  <RefreshCw size={16} className="me-1" />
                                  Get Recommendations
                                </button>
                              )}
                            </div>

                            {loadingRecommendations ? (
                              <div className="text-center py-4">
                                <div className="spinner-border text-primary" role="status">
                                  <span className="visually-hidden">Loading recommendations...</span>
                                </div>
                                <p className="mt-2 text-muted">Finding the best learning resources for you...</p>
                              </div>
                            ) : recommendedVideos.length > 0 ? (
                              <div className="row g-3">
                                {recommendedVideos.map((video, index) => (
                                  <div key={index} className="col-md-6">
                                    <div className="card border-0 shadow-sm h-100">
                                      <div className="card-body p-3">
                                        <div className="d-flex align-items-start gap-3">
                                          <div 
                                            className="bg-primary bg-gradient rounded d-flex align-items-center justify-content-center flex-shrink-0"
                                            style={{ width: '60px', height: '45px' }}
                                          >
                                            <Play size={20} className="text-white" />
                                          </div>
                                          <div className="flex-grow-1">
                                            <h6 className="fw-bold mb-1" style={{ 
                                              overflow: 'hidden',
                                              display: '-webkit-box',
                                              WebkitLineClamp: 2,
                                              WebkitBoxOrient: 'vertical'
                                            }}>
                                              {video.title}
                                            </h6>
                                            <p className="text-muted small mb-2" style={{
                                              overflow: 'hidden',
                                              display: '-webkit-box',
                                              WebkitLineClamp: 2,
                                              WebkitBoxOrient: 'vertical'
                                            }}>
                                              {video.description}
                                            </p>
                                            <div className="d-flex align-items-center justify-content-between">
                                              <span className="badge bg-light text-dark">{video.topic}</span>
                                              <a
                                                href={video.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn btn-sm btn-outline-primary"
                                              >
                                                <ExternalLink size={14} className="me-1" />
                                                Watch
                                              </a>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-4 bg-light rounded-3">
                                <Video size={32} className="text-muted mb-2" />
                                <p className="text-muted mb-2">No specific recommendations available</p>
                                <p className="text-muted small">Great job! You performed well on this quiz.</p>
                              </div>
                            )}
                          </div>
                        )}
                      </motion.div>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />

      <style>{`
        @keyframes fadeZoomIn {
          0% {
            opacity: 0;
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 51, 102, 0.3);
        }

        .card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0, 51, 102, 0.15);
        }

        .modal-backdrop {
          backdrop-filter: blur(8px);
        }

        .progress-bar {
          transition: width 0.6s ease-in-out;
        }

        .spinner-grow {
          animation-duration: 1.5s;
        }

        .badge {
          letter-spacing: 0.5px;
        }

        .btn {
          transition: all 0.3s ease;
        }

        .alert {
          border-left-width: 4px;
        }

        .card-body:hover .card-title {
          color: #004080;
        }

        @media (max-width: 768px) {
          .modal-dialog {
            margin: 10px;
          }
          
          .modal-xl {
            max-width: calc(100vw - 20px);
          }
        }
      `}</style>
    </div>
  );
}



