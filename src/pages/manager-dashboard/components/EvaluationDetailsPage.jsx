// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom"; // ✅ add navigate
// import Header from "../../../components/ui/Header";

// export default function EvaluationDetailsPage() {
//   const { attemptId } = useParams();
//   const navigate = useNavigate(); // ✅ init navigate

//   const [data, setData] = useState(null);
//   const [marks, setMarks] = useState({});
//   const [review, setReview] = useState("");
//   const [activeSection, setActiveSection] = useState("");

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const res = await fetch(
//           `http://localhost:8080/api/assessmenttest/attempt/${attemptId}`
//         );
//         const result = await res.json();
//         setData(result);
//       } catch (err) {
//         console.error(err);
//       }
//     };
//     fetchData();
//   }, [attemptId]);

//   const questions = data?.questions || [];

//   const grouped = {};
//   questions.forEach((q, index) => {
//     if (!grouped[q.section]) grouped[q.section] = [];
//     grouped[q.section].push({ ...q, index });
//   });

//   const sections = Object.keys(grouped);

//   useEffect(() => {
//     if (sections.length > 0 && !activeSection) {
//       setActiveSection(sections[0]);
//     }
//   }, [sections]);

//   if (!data) return <div className="p-10">Loading...</div>;

//   // const handleMarksChange = (index, value) => {
//   //   setMarks((prev) => ({
//   //     ...prev,
//   //     [index]: Number(value)
//   //   }));
//   // };


//   const handleMarksChange = (questionId, value) => {
//   setMarks((prev) => ({
//     ...prev,
//     [questionId]: Number(value)
//   }));
// };
//   let total = 0;
//   let maxTotal = 0;

// //   questions.forEach((q, index) => {
// //   const isMCQ = q.options && q.options.length > 0;

// //   if (isMCQ) {
// //     maxTotal += 1;
// //     if (q.selectedAnswer === q.correctAnswer) total += 1;
// //   } else if (q.section === "Coding") {
// //     maxTotal += 10;
// //     total += marks[q.questionId] || 0;
// //   } else {
// //     // Text question
// //     maxTotal += 5;
// //     total += marks[q.questionId] || 0;
// //   }
// // });





// // questions.forEach((q) => {
// //   //const isMCQ = q.options && q.options.length > 0;
// //   const isMCQ = q.sectionType === "MCQ";


// //   if (isMCQ) {
// //     maxTotal += 1; // display only
// //   } 
// //   else if (q.section === "Coding") {
// //     maxTotal += 10;
// //     total += marks[q.questionId] || 0;
// //   } 
// //   else {
// //     maxTotal += 5;
// //     total += marks[q.questionId] || 0;
// //   }
// // });



// questions.forEach((q) => {
//   const isMCQ = q.sectionType === "MCQ";
//   const isCoding = q.sectionType === "CODING";

//   const isCorrect =
//     q.selectedAnswer?.trim()?.toLowerCase() ===
//     q.correctAnswer?.trim()?.toLowerCase();

//   if (isMCQ) {
//     maxTotal += 1;

//     if (isCorrect) {
//       total += 1; // ✅ MCQ marks add
//     }
//   } 
//   else if (isCoding) {
//     maxTotal += 10;
//     total += marks[q.questionId] || 0;
//   } 
//   else {
//     maxTotal += 5;
//     total += marks[q.questionId] || 0;
//   }
// });


//   // const handleSubmit = () => {
//   //   const payload = {
//   //     attemptId,
//   //     totalMarks: total,
//   //     codingMarks: marks,
//   //     review
//   //   };

//   //   console.log("FINAL SUBMIT:", payload);
//   //   alert("Evaluation Submitted Successfully!");
//   // };

// // const handleSubmit = async () => {
// //   const payload = {
// //     marks, 
// //      review,
   
// //   };

// //   try {
// //     const res = await fetch(`http://localhost:8080/api/assessmenttestcheck/submit-evaluation/${attemptId}`,
// //       {
      
// //       method: "POST",
// //       headers: { "Content-Type": "application/json" },
// //       body: JSON.stringify(payload),
// //     });

// //     console.log("Sending Payload:", payload);
// //   console.log("Marks Object:", marks);
// //   console.log("Marks Keys (questionIds):", Object.keys(marks));

// //     console.log("resposnse",res);
// //     if (res.ok) {
// //       alert("Evaluation Submitted Successfully!");
// //       navigate("/previous-page"); // Success ke baad redirect karein
// //     } else {
// //       const errorData = await res.json();
// //       console.error("Backend Error:", errorData);
// //     }
// //   } catch (err) {
// //     console.error("Network Error:", err);
// //   }
// // };


// const handleSubmit = async () => {

//   // 🔥 ensure all non-MCQ questions have marks
//   const finalMarks = {};

//   questions.forEach((q) => {
//    // const isMCQ = q.options && q.options.length > 0;
// const isMCQ = q.sectionType === "MCQ";
//     if (!isMCQ) {
//       finalMarks[q.questionId] = marks[q.questionId] || 0;
//     }
//   });

//   const payload = {
//     marks: finalMarks,
//     review,
//   };

//   try {
//     const res = await fetch(
//       `http://localhost:8080/api/assessmenttestcheck/submit-evaluation/${attemptId}`,
//       {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       }
//     );

//     if (res.ok) {
//       alert("Evaluation Submitted Successfully!");
//       navigate(-1);
//     } else {
//       const errorData = await res.json();
//       console.error("Backend Error:", errorData);
//     }
//   } catch (err) {
//     console.error("Network Error:", err);
//   }
// };
//   return (
//     <div className="min-h-screen bg-blue-50">
//       <Header userName="Trainer" userRole="Evaluator" />

//       <div className="pt-24 px-4">
//         <div className="max-w-7xl mx-auto">

//           {/* 🔥 BACK BUTTON */}
//           <button
//             onClick={() => navigate(-1)}
//             className="mb-4 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
//           >
//             ← Back
//           </button>

//           <div className="flex gap-6">

//             {/* LEFT */}
//             <div className="w-1/4 bg-white rounded-xl shadow p-4 h-fit">
//               <h2 className="font-bold text-blue-700 mb-4">Sections</h2>

//               {sections.map((sec, i) => (
//                 <div
//                   key={i}
//                   onClick={() => setActiveSection(sec)}
//                   className={`p-3 mb-2 rounded-lg cursor-pointer ${
//                     activeSection === sec
//                       ? "bg-blue-600 text-white"
//                       : "bg-gray-100 hover:bg-blue-100"
//                   }`}
//                 >
//                   {sec}
//                 </div>
//               ))}
//             </div>

//             {/* RIGHT */}
//             <div className="w-3/4">
//               <h1 className="text-2xl font-bold text-blue-700 mb-4">
//                 {data.assessmentTitle}
//               </h1>

//               <div className="bg-white rounded-2xl shadow-lg p-6">
//                 <h2 className="text-lg font-semibold text-purple-700 mb-4">
//                   {activeSection}
//                 </h2>

//               {grouped[activeSection]?.map((q) => {
//   //const isMCQ = q.options && q.options.length > 0;
//   const isMCQ =
//   q.correctAnswer &&
//   q.options &&
//   q.options.length > 0;
//   //const isCoding = activeSection === "Coding";
//   //const isMCQ = q.sectionType === "MCQ";
// const isCoding = q.sectionType === "CODING";

//   const isCorrect =
//     q.selectedAnswer?.trim()?.toLowerCase() ===
//     q.correctAnswer?.trim()?.toLowerCase();

//   return (
//     <div key={q.index} className="border-b pb-4 mb-4">
//       <p className="font-medium">
//         Q{q.index + 1}: {q.question}
//       </p>

//       <p className="text-sm">Your: {q.selectedAnswer || "NA"}</p>
//       <p className="text-sm">Correct: {q.correctAnswer || "NA"}</p>

//       {/* MCQ */}
//       {isMCQ && (
//         <p className={isCorrect ? "text-green-600" : "text-red-600"}>
//         {isCorrect ? "Correct ✔" : "Wrong ❌"}
//         </p>
//       )}

//       {/* Text/Descriptive Questions */}
//      {/* Text/Descriptive Questions */}
// {!isMCQ && !isCoding && (
//   <div className="flex items-center gap-2 mt-2">
//     <label className="text-sm font-medium">Marks (0-5):</label>
//     <input
//       type="number"
//       min="0"
//       max="5"
//       // value={marks[q.index] || ""}
//       // onChange={(e) => handleMarksChange(q.index, e.target.value)}
//       value={marks[q.questionId] || ""}
// onChange={(e) => handleMarksChange(q.questionId, e.target.value)}
//       className="border px-2 py-1 w-20"
//     />
//     <span className="text-sm text-gray-500">/5</span>
//   </div>
// )}

// {/* Coding Questions */}
// {isCoding && (
//   <div className="flex items-center gap-2 mt-2">
//     <label className="text-sm font-medium">Marks (0-10):</label>
//     <input
//       type="number"
//       min="0"
//       max="10"
//       // value={marks[q.index] || ""}
//       // onChange={(e) => handleMarksChange(q.index, e.target.value)}
//       value={marks[q.questionId] || ""}
// onChange={(e) => handleMarksChange(q.questionId, e.target.value)}
//       className="border px-2 py-1 w-20"
//     />
//     <span className="text-sm text-gray-500">/10</span>
//   </div>
// )}
//     </div>
//   );
// })}
//               </div>

//               <div className="bg-white p-5 rounded-xl shadow mt-6">
//                 <p>
//                   Total: <b>{total} / {maxTotal}</b>
//                 </p>

//                 <textarea
//                   value={review}
//                   onChange={(e) => setReview(e.target.value)}
//                   className="w-full border mt-2 p-2"
//                 />
//               </div>

//               <button
//                 onClick={handleSubmit}
//                 className="mt-4 px-6 py-2 bg-green-600 text-white rounded"
//               >
//                 Submit
//               </button>

//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Header from "../../../components/ui/Header";
import {
  getEvaluationByAttemptId,
  submitEvaluation,
} from "../../../api_service";

export default function EvaluationDetailsPage() {

  const { attemptId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const traineeName = location.state?.traineeName || "Trainee";

  const [data, setData] = useState(null);
  const [marks, setMarks] = useState({});
  const [review, setReview] = useState("");
  const [activeSection, setActiveSection] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  // ✅ FETCH
  // useEffect(() => {
  //   const fetchEvaluation = async () => {
  //     try {
  //       const res = await fetch(
  //         `http://localhost:8080/api/assessmenttestcheck/evaluation/${attemptId}`
  //       );

  //       const result = await res.json();

  //       setData(result);

  //       let existingMarks = {};
  //       result.questions.forEach((q) => {
  //         existingMarks[q.questionId] = q.marks || 0;
  //       });

  //       setMarks(existingMarks);
  //       setReview(result.remarks || "");

  //       // 🔥 IMPORTANT FIX
  //       setIsSubmitted(result.submitted === true);

  //     } catch (err) {
  //       console.error(err);
  //     }
  //   };

  //   fetchEvaluation();
  // }, [attemptId]);

  useEffect(() => {
  const fetchEvaluation = async () => {
    try {
      const res = await getEvaluationByAttemptId(attemptId);
      const result = res.data;

      setData(result);

      let existingMarks = {};
      result.questions.forEach((q) => {
        existingMarks[q.questionId] = q.marks || 0;
      });

      setMarks(existingMarks);
      setReview(result.remarks || "");
      setIsSubmitted(result.submitted === true);

    } catch (err) {
      console.error(err);
    }
  };

  fetchEvaluation();
}, [attemptId]);

  const questions = data?.questions || [];

  // ✅ COMPLETE STATUS
  const isFullyEvaluated =
    questions.length > 0 &&
    questions.every((q) => q.evaluated === true);

  // ✅ GROUP
  const grouped = {};
  questions.forEach((q, index) => {
    if (!grouped[q.section]) grouped[q.section] = [];
    grouped[q.section].push({ ...q, index });
  });

  const sections = Object.keys(grouped);

  useEffect(() => {
    if (sections.length > 0 && !activeSection) {
      setActiveSection(sections[0]);
    }
  }, [sections]);

  
    const handleLogout = () => navigate("/");

  // ✅ VALIDATION
  // const handleMarksChange = (questionId, value, type) => {
  //   let num = Number(value);

  //   if (type === "CODING") {
  //     if (num > 10) num = 10;
  //     if (num < 0) num = 0;
  //   } else {
  //     if (num > 5) num = 5;
  //     if (num < 0) num = 0;
  //   }

  //   setMarks((prev) => ({
  //     ...prev,
  //     [questionId]: num
  //   }));
  // };

  const handleMarksChange = (questionId, value, type) => {

  if (value === "") {
    setMarks((prev) => ({
      ...prev,
      [questionId]: ""
    }));
    return;
  }

  let num = Number(value);

  if (type === "CODING") {
    if (num > 10) {
      alert("Max marks for coding is 10");
      num = 10;
    }
    if (num < 0) num = 0;
  } else {
    if (num > 5) {
      alert("Max marks is 5");
      num = 5;
    }
    if (num < 0) num = 0;
  }

  setMarks((prev) => ({
    ...prev,
    [questionId]: num
  }));
};

  // ✅ TOTAL
  let total = 0;
  let maxTotal = 0;

  questions.forEach((q) => {
    const isMCQ = q.sectionType === "MCQ";
    const isCoding = q.sectionType === "CODING";

    const isCorrect =
      q.selectedAnswer?.trim()?.toLowerCase() ===
      q.correctAnswer?.trim()?.toLowerCase();

    if (isMCQ) {
      maxTotal += 1;
      if (isCorrect) total += 1;
    } else if (isCoding) {
      maxTotal += 10;
      total += marks[q.questionId] || 0;
    } else {
      maxTotal += 5;
      total += marks[q.questionId] || 0;
    }
  });

  // ✅ SUBMIT / UPDATE
  // const handleSubmit = async () => {

  //   const finalMarks = {};

  //   questions.forEach((q) => {
  //     if (q.sectionType !== "MCQ") {
  //       finalMarks[q.questionId] = marks[q.questionId] || 0;
  //     }
  //   });

  //   const payload = {
  //     marks: finalMarks,
  //     review,
  //   };

  //   try {
  //     const res = await fetch(
  //       `http://localhost:8080/api/assessmenttestcheck/submit-evaluation/${attemptId}`,
  //       {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify(payload),
  //       }
  //     );

  //     if (res.ok) {
  //       alert(isSubmitted ? "Updated Successfully ✅" : "Submitted Successfully ✅");
  //       navigate(-1);
  //     }

  //   } catch (err) {
  //     console.error(err);
  //   }
  // };


//   const handleSubmit = async () => {

//   const finalMarks = {};

//   questions.forEach((q) => {
//     if (q.sectionType !== "MCQ") {
//       finalMarks[q.questionId] = marks[q.questionId] || 0;
//     }
//   });

//   const payload = {
//     marks: finalMarks,
//     review,
//   };

//   try {
//     await submitEvaluation(attemptId, payload);

//     alert(
//       isSubmitted
//         ? "Updated Successfully ✅"
//         : "Submitted Successfully ✅"
//     );

//     navigate(-1);

//   } catch (err) {
//     console.error(err);
//   }
// };


const handleSubmit = async () => {

  const finalMarks = {};
  let isValid = true;

  questions.forEach((q) => {
    if (q.sectionType !== "MCQ") {

      const mark = marks[q.questionId];

      // ❌ validation: agar empty hai
      if (mark === undefined || mark === "") {
        isValid = false;
      } else {
        finalMarks[q.questionId] = mark;
      }
    }
  });

  if (!isValid) {
    alert("⚠️ Please evaluate all questions before submitting");
    return;
  }

  const payload = {
    marks: finalMarks,
    review,
  };

  try {
    await submitEvaluation(attemptId, payload);

    alert(
      isSubmitted
        ? "Updated Successfully ✅"
        : "Submitted Successfully ✅"
    );

    navigate(-1);

  } catch (err) {
    console.error(err);
  }
};
  if (!data) return <div className="p-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-blue-50">

       <Header
                userName={sessionStorage.getItem("userName") || "User"}
                userRole="manager"
                onLogout={handleLogout}
            />


      <div className="pt-20 px-3 md:px-6">

        {/* BACK */}
        <button
          onClick={() => navigate(-1)}
          className="mb-3 px-3 py-1 bg-gray-200 rounded"
        >
          ← Back
        </button>

        {/* ✅ TRAINEE NAME */}
       

        <div className="flex flex-col md:flex-row gap-4">

          {/* LEFT */}
          <div className="w-full md:w-1/4 bg-white rounded-xl shadow p-3">
            <h2 className="font-bold text-blue-700 mb-3">Sections</h2>

            {sections.map((sec, i) => (
              <div
                key={i}
                onClick={() => setActiveSection(sec)}
                className={`p-2 mb-2 rounded cursor-pointer text-sm
                  ${activeSection === sec
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100"
                  }`}
              >
                {sec}
              </div>
            ))}
          </div>

          {/* RIGHT */}
          <div className="w-full md:w-3/4">

           <div className="mb-3 p-3 bg-white rounded-xl shadow">
          <p className="text-sm">
            Trainee:
            <span className="ml-2 font-bold text-blue-700">
              {traineeName}
            </span>
          </p>
        

            <h2 className="text-xl font-bold text-blue-700 mb-1">
              {data.assessmentTitle}
            </h2>

           </div>

            <div className="bg-white rounded-xl shadow p-4">

              {grouped[activeSection]?.map((q) => {

                const isMCQ = q.sectionType === "MCQ";
                const isCoding = q.sectionType === "CODING";

                return (
                  <div key={q.index} className="border-b pb-3 mb-3">

                    <p className="font-medium">
                      Q{q.index + 1}: {q.question}
                    </p>

                    <p className="text-xs">Your: {q.selectedAnswer || "NA"}</p>
                    <p className="text-xs">Correct: {q.correctAnswer || "NA"}</p>

                    {/* TEXT */}
                    {!isMCQ && !isCoding && (
                      <>
                        <p className="text-xs text-gray-500 mt-1">
                          Enter marks (0 - 5)
                        </p>
                        <input
                          type="number"
                          min="0"
                          max="5"
                          value={marks[q.questionId] ?? ""}
                          onChange={(e) =>
                            handleMarksChange(q.questionId, e.target.value, "TEXT")
                          }
                          className="border px-2 py-1 mt-1 w-24"
                        />
                      </>
                    )}

                    {/* CODING */}
                    {isCoding && (
                      <>
                        <p className="text-xs text-gray-500 mt-1">
                          Enter marks (0 - 10)
                        </p>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          value={marks[q.questionId] ?? ""}
                          onChange={(e) =>
                            handleMarksChange(q.questionId, e.target.value, "CODING")
                          }
                          className="border px-2 py-1 mt-1 w-24"
                        />
                      </>
                    )}

                  </div>
                );
              })}
            </div>

            {/* TOTAL */}
            <div className="bg-white p-4 rounded-xl shadow mt-4">
              <p className="font-semibold">
                Total: {total} / {maxTotal}
              </p>

              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                className="w-full border mt-2 p-2"
                placeholder="Write review..."
              />
            </div>

            <button
              onClick={handleSubmit}
              className="mt-4 px-6 py-2 bg-green-600 text-white rounded"
            >
              {isSubmitted ? "Update Evaluation" : "Submit Evaluation"}
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}