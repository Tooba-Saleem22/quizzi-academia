import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const collegeColors = {
  primary: "#003366",
  accent: "#FFC72C",
  background: "#F5F9FF",
  white: "#fff",
  darkGrey: "#444",
};

const API_URL = "http://localhost:5000/api/courses";
const UNSPLASH_ACCESS_KEY = "0-DDt4RopkV28s14iuDUKqV2kKP4zFJz0Bh89uXLoVY";

export default function CourseShowcase() {
  const [courses, setCourses] = useState([]);
  const [bgImage, setBgImage] = useState("");

  useEffect(() => {
    fetchCourses();
    fetchLightImages();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setCourses(data);
    } catch (error) {
      console.error("Failed to fetch courses", error);
    }
  };

  const fetchLightImages = async () => {
    try {
      const res = await fetch(
        `https://api.unsplash.com/photos/random?query=clean+minimal+workspace,laptop,books,elearning,online+education,study+desk&orientation=landscape&color=white&content_filter=high&count=1&client_id=${UNSPLASH_ACCESS_KEY}`
      );
      const data = await res.json();

      if (data && data[0] && data[0].urls) {
        setBgImage(data[0].urls.full);
      }
    } catch (error) {
      console.error("Failed to fetch Unsplash image", error);
    }
  };

  const headingVariants = {
    hidden: { opacity: 0, y: -30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: "easeOut" },
    },
  };

  const cardContainer = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.15 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, x: -40 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <div
      style={{
        backgroundImage: bgImage ? `url(${bgImage})` : collegeColors.background,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh",
        padding: "70px 20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        transition: "background-image 0.6s ease-in-out",
      }}
    >
      <motion.h1
        variants={headingVariants}
        initial="hidden"
        animate="visible"
        style={{
          fontSize: "3.5rem",
          fontWeight: "900",
          color: collegeColors.primary,
          letterSpacing: "1px",
          textAlign: "center",
          marginBottom: "80px",
          textTransform: "uppercase",
          position: "relative",
          textShadow: `0 2px 5px ${collegeColors.accent}`,
          animation: "floatUp 4s ease-in-out infinite",
        }}
      >
        <motion.span
          initial={{ scale: 0.95 }}
          animate={{ scale: [0.95, 1, 0.95] }}
          transition={{ duration: 2.5, repeat: Infinity }}
          style={{
            display: "inline-block",
            paddingBottom: "12px",
            borderBottom: `5px solid ${collegeColors.accent}`,
          }}
        >
          Courses We Offer
        </motion.span>
      </motion.h1>

      <motion.div
        className="grid"
        variants={cardContainer}
        initial="hidden"
        animate="visible"
        style={{
          width: "100%",
          maxWidth: "1100px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "30px",
        }}
      >
        {courses.map((course) => (
          <motion.div
            key={course._id}
            variants={cardVariants}
            whileHover={{
              scale: 1.08,
              rotateY: 360,
              backgroundColor: collegeColors.accent,
              color: collegeColors.primary,
            }}
            transition={{ duration: 0.6, type: "spring" }}
            style={{
              background: collegeColors.primary,
              color: collegeColors.white,
              padding: "22px",
              borderRadius: "16px",
              textAlign: "center",
              fontSize: "18px",
              fontWeight: "600",
              boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
              transformStyle: "preserve-3d",
              cursor: "default",
              transition: "all 0.3s ease",
            }}
          >
            {course.name}
          </motion.div>
        ))}
      </motion.div>

      <style>
        {`
        @keyframes floatUp {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
          100% { transform: translateY(0px); }
        }
        `}
      </style>
    </div>
  );
}
