
// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import Header from "../../../components/ui/Header";
// import NavigationBreadcrumb from "../../../components/ui/NavigationBreadcrumb";
// import Icon from "../../../components/ui/../AppIcon";
// import axios from "axios";
// import { submitAssessment,checkAssessmentAttempt} from "../../../api_service";

// function TraineeTestPage() {
//   const { assessmentId } = useParams();
//   const navigate = useNavigate();

//   const [assessment, setAssessment] = useState(null);
//   const [answers, setAnswers] = useState({});
//   const [visited, setVisited] = useState({});

//   const [activeSection, setActiveSection] = useState(0);
//   const [activeQuestion, setActiveQuestion] = useState(0);

//   const [timeLeft, setTimeLeft] = useState(0);
//   const [sectionTimers, setSectionTimers] = useState({});
//   const [submitted, setSubmitted] = useState(false);

//   const traineeId = sessionStorage.getItem("empid");
//   // const trainerIds = sessionStorage.getItem("trainerIds") || "[]";
//   const trainerIds = JSON.parse(sessionStorage.getItem("trainerIds") || "[]");
// const trainerIdsStr = trainerIds.map((id) => id.toString());
// const playBeep = () => {
//   const context = new AudioContext();
//   const oscillator = context.createOscillator();
//   oscillator.type = "square";
//   oscillator.frequency.setValueAtTime(440, context.currentTime);
//   oscillator.connect(context.destination);
//   oscillator.start();
//   oscillator.stop(context.currentTime + 0.1);
// };
// const alertAudio = new Audio("https://www.soundjay.com/buttons/sounds/beep-07.mp3");

  
//   useEffect(() => {
//   const fetchAssessment = async () => {
//     try {
//       // Check if already submitted
//       const checkRes = await checkAssessmentAttempt(assessmentId, traineeId);
//       if (checkRes.data === true) {
//         alert("You have already submitted this assessment!");
//         navigate("/trainee-assessment-list");
//         return;
//       }

//       // Fetch assessment data
//       const res = await axios.get(
//         `http://localhost:8080/api/assessment/test/${assessmentId}`
//       );
//       setAssessment(res.data);

//       const totalTime = res.data.sections.reduce(
//         (sum, sec) => sum + Number(sec.time),
//         0
//       );
//       setTimeLeft(totalTime * 60);

//       const secTimers = {};
//       res.data.sections.forEach((sec) => {
//         secTimers[sec.id] = Number(sec.time) * 60;
//       });
//       setSectionTimers(secTimers);
//     } catch (err) {
//       console.error(err);
//       alert("Failed to load assessment.");
//     }
//   };

//   fetchAssessment();
// }, [assessmentId, traineeId, navigate]);
//   /* ---------------- TIMER ---------------- */
//   useEffect(() => {
//     if (!assessment || submitted) return;

//     const timer = setInterval(() => {
//       setTimeLeft((prev) => {
//         if (prev <= 1) {
//           handleSubmit();
//           return 0;
//         }
//         return prev - 1;
//       });

//       setSectionTimers((prev) => {
//         const updated = { ...prev };
//         const currentSec = assessment.sections[activeSection];

//         if (currentSec && updated[currentSec.id] > 0) {
//           updated[currentSec.id] -= 1;
//         }

//         return updated;
//       });
//     }, 1000);

//     return () => clearInterval(timer);
//   }, [assessment, activeSection, submitted]);

//   /* ---------------- ANSWER ---------------- */
//   const handleAnswer = (qId, value) => {
//     if (submitted) return;

//     setAnswers((prev) => ({
//       ...prev,
//       [qId]: value,
//     }));

//     setVisited((prev) => ({
//       ...prev,
//       [qId]: true,
//     }));
//   };

//   const handleQuestionClick = (qId, index) => {
//     setActiveQuestion(index);

//     setVisited((prev) => ({
//       ...prev,
//       [qId]: true,
//     }));
//   };

//   /* ---------------- SUBMIT ---------------- */
//   // const handleSubmit = async () => {
//   //   if (submitted) return;

//   //   setSubmitted(true);

//   //   try {
//   //     await submitAssessment(assessmentId, {
//   //       traineeId,
//   //       trainerIds,
//   //       answers,
//   //     });

//   //     alert("Submitted!");
//   //     navigate("/trainee-assessment-list");
//   //   } catch (err) {
//   //     setSubmitted(false);
//   //   }
//   // };


//   const handleSubmit = async () => {
//   const alreadySubmitted = sessionStorage.getItem(`submitted_${assessmentId}`);
//   if (submitted || alreadySubmitted === "true") return;

//   setSubmitted(true);
//   sessionStorage.setItem(`submitted_${assessmentId}`, "true");

//   try {
//     const traineeIdStr = traineeId.toString();
//     const trainerIdsArr = JSON.parse(sessionStorage.getItem("trainerIds") || "[]");
//     const trainerIdsStr = trainerIdsArr.map((id) => id.toString());

//     // GROUP ANSWERS BY SECTION
//     const formattedSections = assessment.sections.map((section) => ({
//       sectionId: section.id,
//       sectionName: section.sectionName,
//        timeSpent: Number(section.time) * 60 - (sectionTimers[section.id] || 0),
//       questions: section.questions.map((q) => ({
//         questionId: q.id,
//         answer: answers[q.id] !== undefined ? answers[q.id].toString() : "",
//       })),
//     }));

//     await submitAssessment(assessmentId, {
//       traineeId: traineeIdStr,
//       trainerIds: trainerIdsStr,
//       answers: formattedSections,
//     });

//     alert("Test Submitted Successfully!");
//     navigate("/trainee-assessment-list");
//   } catch (err) {
//     console.error("Submission error:", err);
//     setSubmitted(false);
//     sessionStorage.removeItem(`submitted_${assessmentId}`);
//     alert("Submission failed. Please try again.");
//   }
// };
//   /* ---------------- RESTRICTIONS ---------------- */

//   const forceSubmitAndExit = () => {
//     if (!submitted) {
//       alert("Test submitted due to restricted action!");
//       handleSubmit();
//       navigate("/trainee-assessment-list");
//     }
//   };

//  useEffect(() => {
//   const forceSubmitAndExit = () => {
//     if (!submitted) {
//       alert("Test submitted due to restricted action!");
//        alertAudio.play().catch(() => {}); // play alert
//       handleSubmit();
//       navigate("/trainee-assessment-list");
//     }
//   };

//   const handleVisibility = () => { if(document.hidden) forceSubmitAndExit(); };
//   const handleBlur = () => { forceSubmitAndExit(); };
//   const preventRightClick = (e) => { e.preventDefault(); alertAudio.play().catch(() => {});; };
//   const handleKey = (e) => {
//     // Block Ctrl/Cmd + C/X/V, ESC, Tab switching
//     if (
//       e.ctrlKey || e.metaKey || 
//       e.key === "Escape" || 
//       e.key === "Tab"
//     ) {
//       e.preventDefault();
//       forceSubmitAndExit();
//       alertAudio.play().catch(() => {});
//     }
//   };
//   const handleBeforeUnload = (e) => {
//     if (!submitted) {
//       handleSubmit();
//       e.preventDefault();
//       e.returnValue = "";
//        alertAudio.play().catch(() => {});
//     }
//   };

//   document.addEventListener("visibilitychange", handleVisibility);
//   window.addEventListener("blur", handleBlur);
//   document.addEventListener("contextmenu", preventRightClick);
//   window.addEventListener("keydown", handleKey);
//   window.addEventListener("beforeunload", handleBeforeUnload);

//   // Fullscreen enforcement
//   document.documentElement.requestFullscreen?.();
//   const handleFullScreenChange = () => { if(!document.fullscreenElement) forceSubmitAndExit(); };
//   document.addEventListener("fullscreenchange", handleFullScreenChange);

//   return () => {
//     document.removeEventListener("visibilitychange", handleVisibility);
//     window.removeEventListener("blur", handleBlur);
//     document.removeEventListener("contextmenu", preventRightClick);
//     window.removeEventListener("keydown", handleKey);
//     window.removeEventListener("beforeunload", handleBeforeUnload);
//     document.removeEventListener("fullscreenchange", handleFullScreenChange);
//   };
// }, [submitted]);

//   useEffect(() => {
//     const enterFullScreen = () => {
//       document.documentElement.requestFullscreen();
//     };

//     enterFullScreen();

//     const handleFullScreenChange = () => {
//       if (!document.fullscreenElement && !submitted) {
//         forceSubmitAndExit();
//       }
//     };

//     document.addEventListener("fullscreenchange", handleFullScreenChange);

//     return () => {
//       document.removeEventListener("fullscreenchange", handleFullScreenChange);
//     };
//   }, []);

//   /* ---------------- UI ---------------- */

//   if (!assessment) return <p className="p-10">Loading...</p>;

//   // const currentSection = assessment.sections[activeSection];
//   // const currentQuestion = currentSection.questions[activeQuestion];
//   if (!assessment || !assessment.sections || assessment.sections.length === 0) {
//   return <p className="p-10">No assessment data available.</p>;
// }

// const currentSection = assessment.sections[activeSection];
// const currentQuestion =
//   currentSection && currentSection.questions && currentSection.questions.length > 0
//     ? currentSection.questions[activeQuestion]
//     : null;

// if (!currentQuestion) {
//   return <p className="p-10">No questions available in this section.</p>;
// }

//   const minutes = Math.floor(timeLeft / 60);
//   const seconds = timeLeft % 60;

//   const secTime = sectionTimers[currentSection.id] || 0;
//   const secMin = Math.floor(secTime / 60);
//   const secSec = secTime % 60;

//   return (
//     <div className="min-h-screen bg-blue-50">
//       <Header userName="Trainee" userRole="trainee" testMode={true} />

//       <main className="pt-20 max-w-7xl mx-auto px-4">
//         <NavigationBreadcrumb userRole="trainee" />

//         <div className="mt-6 bg-white p-6 rounded-2xl shadow">

//           {/* HEADER */}
//           <div className="flex justify-between mb-6">
//             <h2 className="text-2xl font-bold flex items-center gap-2">
//               <Icon name="ClipboardList" />
//               {assessment.title}
//             </h2>

//             <div className="text-red-500 font-bold">
//               {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
//             </div>
//           </div>

//           <div className="grid grid-cols-12 gap-6">

//             {/* LEFT SECTIONS */}
//             <div className="col-span-2 bg-gray-100 p-4 rounded-xl">
//               {assessment.sections.map((sec, i) => (
//                 <div
//                   key={sec.id}
//                   onClick={() => {
//                     setActiveSection(i);
//                     setActiveQuestion(0);
//                   }}
//                   className={`p-2 mb-2 cursor-pointer rounded ${
//                     activeSection === i
//                       ? "bg-blue-500 text-white"
//                       : "bg-white"
//                   }`}
//                 >
//                   {sec.sectionName}
//                 </div>
//               ))}
//             </div>

//             {/* QUESTION */}
//             <div className="col-span-7 bg-white p-6 rounded-xl border">

//               <div className="flex justify-between mb-4">
//                 <h3 className="font-semibold">
//                   Q{activeQuestion + 1}. {currentQuestion.question}
//                 </h3>

//                 {/* ✅ SECTION TIMER RIGHT */}
//                 <span className="text-red-500 text-sm">
//                   ⏱ {secMin}:{secSec < 10 ? `0${secSec}` : secSec}
//                 </span>
//               </div>

//               {/* ✅ MCQ 2 PER ROW */}
//               {currentSection.type === "MCQ" && (
//                 <div className="grid grid-cols-2 gap-3">
//                   {currentQuestion.options.map((opt, i) => (
//                     <label
//                       key={i}
//                       className="border p-2 rounded cursor-pointer"
//                     >
//                       <input
//                         type="radio"
//                         name={currentQuestion.id}
//                         checked={answers[currentQuestion.id] === i}
//                         onChange={() =>
//                           handleAnswer(currentQuestion.id, i)
//                         }
//                         className="mr-2"
//                       />
//                       {opt}
//                     </label>
//                   ))}
//                 </div>
//               )}

//               {/* TEXT */}
//               {currentSection.type === "TEXT" && (
//                 <input
//                   className="border p-2 w-full"
//                   value={answers[currentQuestion.id] || ""}
//                   onChange={(e) =>
//                     handleAnswer(currentQuestion.id, e.target.value)
//                   }
//                 />
//               )}

//               {/* CODING */}
//               {currentSection.type === "CODING" && (
//                 <textarea
//                   className="w-full h-40 p-3 bg-black text-green-400 font-mono rounded"
//                   value={answers[currentQuestion.id] || ""}
//                   onChange={(e) =>
//                     handleAnswer(currentQuestion.id, e.target.value)
//                   }
//                 />
//               )}

//               {/* NAV */}
//               <div className="flex justify-between mt-6">
//                 <button
//                   disabled={activeQuestion === 0}
//                   onClick={() =>
//                     setActiveQuestion((prev) => prev - 1)
//                   }
//                   className="bg-gray-300 px-4 py-2 rounded"
//                 >
//                   Prev
//                 </button>

//                 <button
//                   disabled={
//                     activeQuestion ===
//                     currentSection.questions.length - 1
//                   }
//                   onClick={() =>
//                     setActiveQuestion((prev) => prev + 1)
//                   }
//                   className="bg-blue-500 text-white px-4 py-2 rounded"
//                 >
//                   Next
//                 </button>
//               </div>
//             </div>

//             {/* RIGHT PALETTE */}
//             <div className="col-span-3 bg-gray-100 p-4 rounded-xl">
//               <div className="grid grid-cols-5 gap-2">
//                 {currentSection.questions.map((q, i) => {
//                   const isAnswered =
//                     answers[q.id] !== undefined &&
//                     answers[q.id] !== "";

//                   const isVisited = visited[q.id];

//                   let color = "bg-gray-300";
//                   if (isAnswered) color = "bg-green-500 text-white";
//                   else if (isVisited) color = "bg-red-500 text-white";

//                   return (
//                     <div
//                       key={q.id}
//                       onClick={() => handleQuestionClick(q.id, i)}
//                       className={`p-2 text-center rounded cursor-pointer ${color}`}
//                     >
//                       {i + 1}
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>

//           </div>

//           {/* SUBMIT */}
//           <div className="text-center mt-6">
//             <button
//               onClick={handleSubmit}
//               className="bg-blue-600 text-white px-6 py-3 rounded-xl"
//             >
//               Submit Test
//             </button>
//           </div>

//         </div>
//       </main>
//     </div>
//   );
// }

// export default TraineeTestPage;
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../../components/ui/Header";
import NavigationBreadcrumb from "../../../components/ui/NavigationBreadcrumb";
import Icon from "../../../components/ui/../AppIcon";
import axios from "axios";
import { submitAssessment, checkAssessmentAttempt,getAssessmentTest } from "../../../api_service";

function TraineeTestPage() {
  const { assessmentId } = useParams();
  const navigate = useNavigate();

  const [assessment, setAssessment] = useState(null);
  const [answers, setAnswers] = useState({});
  const [visited, setVisited] = useState({});
  const [activeSection, setActiveSection] = useState(0);
  const [activeQuestion, setActiveQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [sectionTimers, setSectionTimers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const traineeId = sessionStorage.getItem("empid");
  const submittedRef = useRef(false);
  const isSubmittingRef = useRef(false);

  const playBeep = () => {
    try {
      const context = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(800, context.currentTime);
      gainNode.gain.setValueAtTime(0.1, context.currentTime);
      oscillator.connect(gainNode);
      gainNode.connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.5);
    } catch (e) { console.warn("Audio context failed", e); }
  };

  const shuffleArray = (array) => [...array].sort(() => Math.random() - 0.5);

  /* ---------------- FETCH & SETUP ---------------- */
  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        const checkRes = await checkAssessmentAttempt(assessmentId, traineeId);
        if (checkRes.data === true) {
          alert("You have already submitted this assessment!");
          navigate("/trainee-dashboard");
          return;
        }

        //const res = await axios.get(`http://localhost:8080/api/assessment/test/${assessmentId}`);
        const res = await getAssessmentTest(assessmentId);
        let data = res.data;

        const savedSection = sessionStorage.getItem(`activeSection_${assessmentId}`);
        if (savedSection !== null) setActiveSection(Number(savedSection));

        const shuffleTarget = sessionStorage.getItem(`shuffleSection_${assessmentId}`);
        if (shuffleTarget !== null) {
          const targetIdx = Number(shuffleTarget);
          data.sections[targetIdx].questions = shuffleArray(data.sections[targetIdx].questions);
          sessionStorage.removeItem(`shuffleSection_${assessmentId}`);
        }

        setAssessment(data);

        // Timer Setup
        const totalSecs = data.sections.reduce((sum, sec) => sum + Number(sec.time), 0) * 60;
        const savedTime = sessionStorage.getItem(`timeLeft_${assessmentId}`);
        setTimeLeft(savedTime ? Number(savedTime) : totalSecs);

        // Logic fix: Set individual section timers
        const secTimers = {};
        data.sections.forEach((sec) => {
          secTimers[sec.id] = Number(sec.time) * 60;
        });
        setSectionTimers(secTimers);

      } catch (err) {
        console.error(err);
        alert("Failed to load assessment.");
      }
    };
    fetchAssessment();
  }, [assessmentId, traineeId, navigate]);

  /* ---------------- TIMER ---------------- */
  useEffect(() => {
    if (!assessment || submitted) return;

    const timer = setInterval(() => {
      // Update Total Timer
      setTimeLeft((prev) => {
        const newTime = prev <= 1 ? 0 : prev - 1;
        sessionStorage.setItem(`timeLeft_${assessmentId}`, newTime);
        if (newTime === 0) handleSubmit();
        return newTime;
      });

      // Update Current Section Timer for analytics/submission
      setSectionTimers(prev => {
        const currentSecId = assessment.sections[activeSection].id;
        return {
          ...prev,
          [currentSecId]: Math.max(0, (prev[currentSecId] || 0) - 1)
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [assessment, submitted, activeSection]);

  /* ---------------- RESTRICTIONS ---------------- */
  useEffect(() => {
    if (submitted) return;
    const triggerViolation = (msg) => {
      playBeep();
      alert(msg);
      sessionStorage.setItem(`shuffleSection_${assessmentId}`, activeSection.toString());
      sessionStorage.setItem(`activeSection_${assessmentId}`, activeSection.toString());
      window.location.reload();
    };

    const handleKey = (e) => {
      if (e.key === "Escape" || e.key === "Tab" || (e.ctrlKey && (e.key === 'c' || e.key === 'z' || e.key === 'x')) || e.altKey || e.metaKey) {
        e.preventDefault();
        triggerViolation("Shortcut Restricted! Section questions shuffled.");
      }
    };

    const handleVisibility = () => { if (document.hidden) triggerViolation("Tab Switching Restricted!"); };

    document.addEventListener("keydown", handleKey);
    document.addEventListener("copy", (e) => { e.preventDefault(); triggerViolation("Copy Restricted!"); });
    //document.addEventListener("paste", (e) => { e.preventDefault(); triggerViolation("Paste Restricted!"); });
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [submitted, assessmentId, activeSection]);

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async () => {
    if (submittedRef.current || isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    submittedRef.current = true;
    setSubmitted(true);

    try {
      const trainerIdsArr = JSON.parse(sessionStorage.getItem("trainerIds") || "[]");
      const formattedSections = assessment.sections.map((section) => ({
        sectionId: section.id,
        sectionName: section.sectionName,
        // Calculation fix for timeSpent
        timeSpent: Math.max(0, (Number(section.time) * 60) - (sectionTimers[section.id] || 0)),
        questions: section.questions.map((q) => ({
          questionId: q.id,
          answer: answers[q.id] !== undefined ? answers[q.id].toString() : "",
        })),
      }));

      await submitAssessment(assessmentId, {
        traineeId: traineeId.toString(),
        //trainerIds: trainerIdsArr.map(id => id.toString()),
        answers: formattedSections,
      });

      alert("Test Submitted Successfully!");
      sessionStorage.clear(); // Clear all test related data
      navigate("/trainee-dashboard");
    } catch (err) {
      console.error(err);
      isSubmittingRef.current = false;
      setSubmitted(false);
      alert("Submission failed.");
    }
  };

  const handleAnswer = (qId, value) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [qId]: value }));
  };

  if (!assessment) return <p className="p-10 text-center font-bold">Loading Test...</p>;

  const currentSection = assessment.sections[activeSection];
  const currentQuestion = currentSection?.questions?.[activeQuestion];

//   const secTime = sectionTimers[currentSection.id] || 0;
const secTime = sectionTimers[currentSection.id] || 0;
const secMin = Math.floor(secTime / 60);
const secSec = secTime % 60;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header userName="Trainee" userRole="trainee" testMode={true} />
      <main className="pt-16 max-w-7xl mx-auto px-4">
        <NavigationBreadcrumb userRole="trainee" />
        
        <div className="mt-4 bg-white p-5 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-5 pb-3 border-b">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Icon name="ClipboardList" className="text-blue-600" /> {assessment.title}
            </h2>
            <div className="text-red-600 font-mono text-xl font-bold bg-red-50 px-3 py-1 rounded-md">
              {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
            </div>
          </div>

          <div className="grid grid-cols-12 gap-5">
            {/* Sidebar Sections */}
            <div className="col-span-2 space-y-1">
              {assessment.sections.map((sec, i) => (
                <button
                  key={sec.id}
                  onClick={() => { 
                    setActiveSection(i); 
                    setActiveQuestion(0);
                    sessionStorage.setItem(`activeSection_${assessmentId}`, i.toString());
                  }}
                  className={`w-full text-left p-2.5 rounded-lg text-sm font-medium transition-all ${
                    activeSection === i ? "bg-blue-600 text-white" : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-100"
                  }`}
                >
                  {sec.sectionName}
                </button>
              ))}
            </div>

            {/* Question Content */}
            {/* <div className="col-span-7 bg-white p-5 rounded-xl border border-gray-200 min-h-[450px]">
              {currentQuestion ? (
                <>
                  <div className="mb-4">
                    <span className="text-blue-600 font-bold text-sm uppercase">Question {activeQuestion + 1}</span>
                    <h3 className="text-lg font-semibold text-gray-800 mt-2">{currentQuestion.question}</h3>

                    <span className="text-red-500 text-sm">
  ⏱ {secMin}:{secSec < 10 ? `0${secSec}` : secSec}
</span>
                  </div>

                  {currentSection.type === "MCQ" && (
                    <div className="grid grid-cols-2 gap-3 mt-6">
                      {currentQuestion.options.map((opt, i) => (
                        <label key={i} className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                          answers[currentQuestion.id] === i ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:bg-gray-50"
                        }`}>
                          <input
                            type="radio"
                            name={currentQuestion.id}
                            checked={answers[currentQuestion.id] === i}
                            onChange={() => handleAnswer(currentQuestion.id, i)}
                            className="w-4 h-4 text-blue-600"
                          />
                          <span className="ml-3 text-sm text-gray-700">{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {(currentSection.type === "TEXT" || currentSection.type === "CODING") && (
                    <textarea
                      className={`w-full p-4 mt-4 rounded-lg border-2 border-gray-100 focus:border-blue-400 outline-none transition-all ${
                        currentSection.type === "CODING" ? "bg-gray-900 text-green-400 font-mono h-60" : "bg-blue-50/30 text-gray-800 h-40"
                      }`}
                      value={answers[currentQuestion.id] || ""}
                      onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                      placeholder="Enter your response here..."
                    />
                  )}

                  <div className="flex justify-between mt-10 pt-5 border-t">
                    <button
                      disabled={activeQuestion === 0}
                      onClick={() => setActiveQuestion(prev => prev - 1)}
                      className="px-5 py-2 text-gray-600 font-bold disabled:opacity-30"
                    >
                      ← Previous
                    </button>
                    <button
                      disabled={activeQuestion === currentSection.questions.length - 1}
                      onClick={() => setActiveQuestion(prev => prev + 1)}
                      className="bg-blue-600 text-white px-8 py-2 rounded-lg font-bold hover:bg-blue-700 transition"
                    >
                      Next →
                    </button>
                  </div>
                </>
              ) : <p className="text-gray-400">No questions found.</p>}
            </div> */}

            {/* Question Content - Width 'col-span-6' aur Height 'min-h-[300px]' ki gayi hai */}
<div className="col-span-6 bg-white p-5 rounded-xl border border-gray-200 min-h-[300px] shadow-sm">
  {currentQuestion ? (
    <>
      <div className="mb-4">
        <span className="text-blue-600 font-bold text-xs uppercase tracking-tight">Question {activeQuestion + 1}</span>
        {/* Text size thoda chota kiya 'text-base' */}
        <h3 className="text-base font-semibold text-gray-800 mt-1">{currentQuestion.question}</h3>
        
        <span className="text-red-500 text-xs font-medium block mt-1">
          ⏱ {secMin}:{secSec < 10 ? `0${secSec}` : secSec}
        </span>
      </div>

      {/* Options ka spacing kam karne ke liye 'gap-2' aur padding 'p-2' kiya */}
      {currentSection.type === "MCQ" && (
        <div className="grid grid-cols-2 gap-2 mt-4">
          {currentQuestion.options.map((opt, i) => (
            <label key={i} className={`flex items-center p-2 rounded-lg border cursor-pointer transition-all text-sm ${
              answers[currentQuestion.id] === i ? "border-blue-500 bg-blue-50" : "border-gray-100 hover:bg-gray-50"
            }`}>
              <input
                type="radio"
                name={currentQuestion.id}
                checked={answers[currentQuestion.id] === i}
                onChange={() => handleAnswer(currentQuestion.id, i)}
                className="w-3.5 h-3.5 text-blue-600"
              />
              <span className="ml-2 text-gray-700">{opt}</span>
            </label>
          ))}
        </div>
      )}

      {/* Textarea ki height bhi kam ki 'h-32' or 'h-40' */}
      {(currentSection.type === "TEXT" || currentSection.type === "CODING") && (
        <textarea
          className={`w-full p-3 mt-3 rounded-lg border border-gray-200 focus:border-blue-300 outline-none transition-all text-sm ${
            currentSection.type === "CODING" ? "bg-gray-900 text-green-400 font-mono h-48" : "bg-gray-50 text-gray-800 h-32"
          }`}
          value={answers[currentQuestion.id] || ""}
          onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
          placeholder="Type your answer..."
        />
      )}

      {/* Navigation buttons ka margin kam kiya 'mt-6' */}
      <div className="flex justify-between mt-6 pt-4 border-t">
        <button
          disabled={activeQuestion === 0}
          onClick={() => setActiveQuestion(prev => prev - 1)}
          className="px-4 py-1.5 text-sm text-gray-500 font-bold disabled:opacity-30"
        >
          ← Prev
        </button>
        <button
          disabled={activeQuestion === currentSection.questions.length - 1}
          onClick={() => setActiveQuestion(prev => prev + 1)}
          className="bg-blue-600 text-white px-6 py-1.5 rounded-lg text-sm font-bold hover:bg-blue-700 transition"
        >
          Next →
        </button>
      </div>
    </>
  ) : <p className="text-gray-400">No questions found.</p>}
</div>

            {/* Question Palette */}
            <div className="col-span-3 bg-gray-50 p-4 rounded-xl border border-gray-200 h-fit">
              <h4 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">Question Palette</h4>
              <div className="grid grid-cols-5 gap-2">
                {currentSection.questions.map((q, i) => {
                  const answered = answers[q.id] !== undefined && answers[q.id] !== "";
                  return (
                    <button
                      key={q.id}
                      onClick={() => setActiveQuestion(i)}
                      className={`h-9 w-9 rounded-md text-xs font-bold transition-all ${
                        activeQuestion === i ? "ring-2 ring-blue-500 border-2 border-white" : ""
                      } ${answered ? "bg-green-500 text-white" : "bg-white text-gray-400 border"}`}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t flex justify-center">
            <button
              onClick={handleSubmit}
              className="bg-green-600 text-white px-12 py-3 rounded-xl font-bold text-lg hover:bg-green-700 shadow-lg transition-transform active:scale-95"
            >
              FINISH & SUBMIT TEST
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default TraineeTestPage;