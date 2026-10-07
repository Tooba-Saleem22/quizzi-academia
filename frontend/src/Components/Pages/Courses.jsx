import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Search, X } from "lucide-react";

const API_URL = "http://localhost:5000/api/courses";

export default function CourseManagement() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setCourses(data);
      setFilteredCourses(data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const handleManageModules = (courseId) => {
    navigate(`/courses/${courseId}/modulesP`);
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim() === "") {
      setFilteredCourses(courses);
    } else {
      const filtered = courses.filter((course) =>
        course.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredCourses(filtered);
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    setFilteredCourses(courses);
  };

  return (
    <div className="container-fluid p-0" style={{ background: "#f0f2f5" }}>

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
          <h1
            style={{
              fontSize: "2.8rem",
              fontWeight: "bold",
              marginBottom: "10px",
              userSelect: "none",
              color:"#FFF"
            }}
          >
            Welcome to Our Courses
          </h1>
          <p style={{ fontSize: "1.2rem", opacity: 0.9, userSelect: "none" ,              color:"#FFc72c"
}}>
            Browse professional courses and enhance your skills.
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
                placeholder="Search courses..."
                value={searchTerm}
                onChange={handleSearch}
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
          </div>        </div>
      </section>

      <main className="container pb-5 pt-4" aria-label="Available courses">
        <h2 className="mb-4 text-center fw-bold">Available Courses</h2>

        {error && <div className="alert alert-danger">{error}</div>}

        {loading ? (
          <div
            className="text-center"
            style={{ fontSize: "1.2rem", color: "#666", marginTop: "2rem" }}
            role="status"
            aria-live="polite"
          >
            Loading courses...
          </div>
        ) : filteredCourses.length === 0 ? (
          <p className="text-center text-muted">No courses found.</p>
        ) : (
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            {filteredCourses.map((course) => (
              <div key={course._id} className="col">
                <article
                  className="card h-100 shadow-sm"
                  style={{
                    borderRadius: "30px",
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                    cursor: "pointer",
                    backgroundColor: "#fff",
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                    border:"1px #003366"
                  }}
                  onClick={() => handleManageModules(course._id)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.05)";
                    e.currentTarget.style.boxShadow =
                      "0 8px 20px rgba(0,0,0,0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.boxShadow = "0 1px 5px rgba(0,0,0,0.1)";
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      handleManageModules(course._id);
                    }
                  }}
                  aria-label={`Manage modules for course ${course.name}`}
                >
                  <div
                    className="card-img-top"
                    style={{
                      height: "200px",
                      overflow: "hidden",
                      borderTopLeftRadius: "16px",
                      borderTopRightRadius: "16px",
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src={`http://localhost:5000/uploads/${course.image}`}
                      alt={course.name}
                      className="w-100 h-100"
                      style={{ objectFit: "cover" }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/api/placeholder/400/200";
                      }}
                    />
                  </div>
                  <div
                    className="card-body"
                    style={{ flexGrow: 1, display: "flex", flexDirection: "column" }}
                  >
                    <h5 className="card-title fw-bold">{course.name}</h5>
                    <p
                      className="card-text text-muted"
                      style={{ fontSize: "14px", flexGrow: 1 }}
                    >
                      {course.description}
                    </p>
                  </div>
                  <footer
                    className="card-footer bg-white border-0 d-flex justify-content-end"
                    style={{ flexShrink: 0 }}
                  >
                    <button
                      className="btn d-flex align-items-center gap-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleManageModules(course._id);
                      }}
                      style={{
                        backgroundColor: "#003366",
                        border: "none",
                        color: "#fff",
                        borderRadius: "8px",
                        padding: "6px 12px",
                        fontWeight: "bold",
                      }}
                      aria-label={`Manage modules button for course ${course.name}`}
                    >
                      Modules <ArrowRight size={14} />
                    </button>
                  </footer>
                </article>
              </div>
            ))}
          </div>
        )}
      </main>


      <style>
        {`
          @keyframes fadeZoomIn {
            0% {
              opacity: 0;
              transform: scale(0.95);
            }
            100% {
              opacity: 1;
              transform: scale(1);
            }
          }

          .form-control:focus {
            box-shadow: 0 0 8px #ffc72c;
            border-color: #ffc72c;
            outline: none;
            transition: box-shadow 0.3s ease;
          }
        `}
      </style>
    </div>
  );
}
