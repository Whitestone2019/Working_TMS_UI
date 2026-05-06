import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Button from "../../../components/ui/Button";
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

  //  FETCH
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

  //  COMPLETE STATUS
  const isFullyEvaluated =
    questions.length > 0 &&
    questions.every((q) => q.evaluated === true);

  //  GROUP
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

  //  VALIDATION
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

  //  TOTAL
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

  //  SUBMIT / UPDATE
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

        //  validation: agar empty hai
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
          ? "Updated Successfully "
          : "Submitted Successfully "
      );

      navigate(-1);

    } catch (err) {
      console.error(err);
    }
  };
  if (!data) return <div className="p-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-background">

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

        {/*  TRAINEE NAME */}


        <div className="flex flex-col md:flex-row gap-4">

          {/* LEFT */}
          <div className="w-full md:w-1/4 bg-white rounded-xl shadow p-3">
            <h2 className="font-bold text-black mb-3">Sections</h2>

            {sections.map((sec, i) => (
              <div
                key={i}
                onClick={() => setActiveSection(sec)}
                className={`p-2 mb-2 rounded cursor-pointer text-sm
                  ${activeSection === sec
                    ? "bg-primary text-white"
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
                <span className="ml-2 font-bold text-muted-foreground">
                  {traineeName}
                </span>
              </p>


              <h2 className="text-xl font-bold text-black mb-1">
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
                          className="border px-2 py-1 mt-1 w-24 
                          focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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
                          className="border px-2 py-1 mt-1 w-24 accent-purple"
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

            <Button
              onClick={handleSubmit}
              variant="default"
            >
              {isSubmitted ? "Update Evaluation" : "Submit Evaluation"}
            </Button>

          </div>
        </div>
      </div>
    </div>
  );
}