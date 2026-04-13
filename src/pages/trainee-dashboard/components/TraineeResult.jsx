import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../../components/ui/Header";
import NavigationBreadcrumb from "../../../components/ui/NavigationBreadcrumb";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { getResultByTraineeAndAssessment } from "../../../api_service";

function TraineeResult() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  const pdfRef = useRef(); // 🔥 for PDF

  useEffect(() => {
    fetchResult();
  }, []);

//   const fetchResult = async () => {
//     try {
//       const traineeId = sessionStorage.getItem("empid");

//       const res = await axios.get(
//         "http://localhost:8080/api/assessmenttestcheck/result",
//         {
//           params: {
//             traineeId,
//             assessmentId: id
//           }
//         }
//       );

//       setData(res.data);
//     } catch (err) {
//       console.log(err);
//     }
//   };



const fetchResult = async () => {
  try {
    const traineeId = sessionStorage.getItem("empid");

    const res = await getResultByTraineeAndAssessment(
      traineeId,
      id
    );

    setData(res.data);
  } catch (err) {
    console.log(err);
  }
};

  if (!data) return <p className="p-6">Loading...</p>;

  // ✅ evaluation check
  const allEvaluated = data.questions.every(q => q.evaluated === true);

  if (!allEvaluated) {
    return (
      <div className="min-h-screen bg-blue-50">
        <Header
          userName={sessionStorage.getItem("userName") || "Trainee"}
          userRole="trainee"
          onLogout={() => navigate("/")}
        />

        <main className="pt-20 px-4">
          <NavigationBreadcrumb userRole="trainee" />

          <div className="bg-white mt-10 p-6 rounded-xl shadow text-center">
            <h2 className="text-xl font-bold text-red-600">
              Result Not Available
            </h2>
            <p className="text-gray-500 mt-2">
              Evaluation is still pending
            </p>

            <button
              onClick={() => navigate(-1)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              Go Back
            </button>
          </div>
        </main>
      </div>
    );
  }

  // ✅ calculations
  const calculateTotalMaxMarks = (questions) => {
    let total = 0;
    questions.forEach((q) => {
      if (q.section === "Coding") total += 10;
      else if (q.section === "English") total += 1;
      else total += 5;
    });
    return total;
  };

  const groupBySection = (questions) => {
    return questions.reduce((acc, q) => {
      if (!acc[q.section]) acc[q.section] = [];
      acc[q.section].push(q);
      return acc;
    }, {});
  };

  const calculateSectionMarks = (grouped) => {
    let result = {};

    Object.keys(grouped).forEach((sec) => {
      let obtained = 0;
      let total = 0;

      grouped[sec].forEach((q) => {
        obtained += q.marks;

        if (q.section === "Coding") total += 10;
        else if (q.section === "English") total += 1;
        else total += 5;
      });

      result[sec] = { obtained, total };
    });

    return result;
  };

  const maxMarks = calculateTotalMaxMarks(data.questions);
  const percentage = ((data.totalMarks / maxMarks) * 100).toFixed(1);

  const grouped = groupBySection(data.questions);
  const sectionMarks = calculateSectionMarks(grouped);

  const getGrade = () => {
    if (percentage >= 80) return "A";
    if (percentage >= 60) return "B";
    if (percentage >= 40) return "C";
    return "Fail";
  };

  // 🔥 PDF DOWNLOAD
  const downloadPDF = async () => {
    const element = pdfRef.current;

    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");

    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`${data.assessmentTitle}_Result.pdf`);
  };

  return (
    <div className="min-h-screen bg-blue-50">

      <Header
        userName={sessionStorage.getItem("userName") || "Trainee"}
        userRole="trainee"
        onLogout={() => navigate("/")}
      />

      <main className="pt-20 max-w-6xl mx-auto px-3 sm:px-4">

        <NavigationBreadcrumb userRole="trainee" />

        {/* 🔥 PDF BUTTON */}
        <div className="flex justify-end mt-4">
          <button
            onClick={downloadPDF}
            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm"
          >
            Download PDF
          </button>
        </div>

        {/* 🔥 RESULT CONTENT */}
        <div ref={pdfRef}>

          {/* SUMMARY */}
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow mt-4 border">

            <h2 className="text-xl sm:text-2xl font-bold text-blue-700">
              {data.assessmentTitle} Result
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-sm">

              <div className="bg-green-50 p-3 rounded-lg text-center">
                <p>Obtained</p>
                <b className="text-green-600">{data.totalMarks}</b>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg text-center">
                <p>Total</p>
                <b className="text-blue-600">{maxMarks}</b>
              </div>

              <div className="bg-purple-50 p-3 rounded-lg text-center">
                <p>%</p>
                <b>{percentage}</b>
              </div>

              {/* <div className={`p-3 rounded-lg text-center font-bold ${
                percentage >= 40 ? "bg-green-100" : "bg-red-100"
              }`}>
                {getGrade()}
              </div> */}

            </div>

            <p className="mt-3 text-sm">
              Remarks: <b>{data.remarks}</b>
            </p>

          </div>

          {/* SECTION SUMMARY */}
          <div className="bg-white p-4 rounded-xl shadow mt-5">
            <h3 className="font-semibold text-blue-700 mb-3">
              Section Summary
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.keys(sectionMarks).map((sec, i) => (
                <div key={i} className="bg-blue-50 p-3 rounded-lg text-center">
                  <p className="font-semibold">{sec}</p>
                  <p>{sectionMarks[sec].obtained}/{sectionMarks[sec].total}</p>
                </div>
              ))}
            </div>
          </div>

          {/* QUESTIONS */}
          {Object.keys(grouped).map((sectionName, idx) => (
            <div key={idx} className="mt-5">

              <h3 className="bg-blue-500 text-white px-3 py-2 rounded-t-lg text-sm sm:text-base">
                {sectionName}
              </h3>

              <div className="bg-white rounded-b-lg shadow">

                {grouped[sectionName].map((q, index) => (
                  <div
                    key={index}
                    className={`p-3 border-b text-sm ${
                      q.isCorrect ? "bg-green-50" : "bg-red-50"
                    }`}
                  >
                    {/* <p className="font-medium">
                      Q{index + 1}. {q.question}
                    </p> */}

                    <div className="grid grid-cols-2 gap-2 mt-2">

                      <div>
                        <span className="text-gray-500">Your:</span>
                        <p>{q.selectedAnswer}</p>
                      </div>

                      {/* <div>
                        <span className="text-gray-500">Correct:</span>
                        <p>{q.correctAnswer}</p>
                      </div> */}

                      <div>
                        <span className="text-gray-500">Marks:</span>
                        <p>{q.marks}</p>
                      </div>

                      <div>
                        <span>Status:</span>
                        <p className={q.isCorrect ? "text-green-600" : "text-red-600"}>
                          {q.isCorrect ? "✔" : "✘"}
                        </p>
                      </div>

                    </div>
                  </div>
                ))}

              </div>
            </div>
          ))}

        </div>

      </main>
    </div>
  );
}

export default TraineeResult;