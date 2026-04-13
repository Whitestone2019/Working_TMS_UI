// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { fetchAllTraineeSummaryAdmin, fetchTraineeSummaryByManager } from "../../../api_service";
// import Header from "../../../components/ui/Header";

// export default function TrainerEvaluationPage() {
//   const [trainees, setTrainees] = useState([]);
//   const [assessments, setAssessments] = useState([]);
//   const [selectedTrainee, setSelectedTrainee] = useState(null);
//   const [selectedAssessment, setSelectedAssessment] = useState(null);

//   const navigate=useNavigate();

//   const privilegedRoles = ["ADMIN", "SUPER_ADMIN"];

  

//   useEffect(() => {
//     const fetchData = async () => {
//       const roleName = sessionStorage.getItem("roleName");
//       const userId = sessionStorage.getItem("userId");

//       let res;
//       if (privilegedRoles.includes(roleName)) {
//         res = await fetchAllTraineeSummaryAdmin();
//       } else {
//         res = await fetchTraineeSummaryByManager(userId);
//       }

//       const normalized = (res?.data || []).map((t) => ({
//         trngid: t.traineeId,
//         name: t.name
//       }));

//       setTrainees(normalized);
//     };

//     fetchData();
//   }, []);

//   const handleTraineeClick = async (trainee) => {
//     setSelectedTrainee(trainee);
//     setSelectedAssessment(null);



//     try {
//       const res = await fetch(
//         `http://localhost:8080/api/assessmenttest/trainee/${trainee.trngid}/assessments`
//       );
//       const data = await res.json();
//       setAssessments(data);
//     } catch (err) {
//       console.error("API Error:", err);
//       alert("Failed to fetch assessments");
//     }
//   };

//   const handleAssessmentClick = (attemptId) => {
//   navigate(`/evaluation/${attemptId}`);
// };

//   return (
//     <div className="min-h-screen bg-blue-50">
//       <Header userName="User" userRole="manager" />

//       <div className="pt-20 flex">

//         {/* TRAINEES */}
//         <div className="w-1/3 p-6">
//           <h2 className="text-xl font-bold text-blue-700 mb-4">Trainees</h2>

//           {trainees.map((t) => (
//             <div
//               key={t.trngid}
//               onClick={() => handleTraineeClick(t)}
//               className={`p-4 mb-2 rounded-xl cursor-pointer ${
//                 selectedTrainee?.trngid === t.trngid
//                   ? "bg-blue-600 text-white"
//                   : "bg-white hover:bg-blue-100"
//               }`}
//             >
//               {t.name}
//             </div>
//           ))}
//         </div>

//         {/* RIGHT SIDE */}
//         <div className="w-2/3 p-6">

//           {/* ASSESSMENT CARDS */}
//           {!selectedAssessment && (
//             <div className="grid grid-cols-2 gap-4">
//               {assessments.map((a, index) => (
//                 <div
//                   key={index}
//                   className="p-5 bg-white rounded-2xl shadow-lg"
//                 >
//                   <h3 className="text-lg font-bold text-blue-700">
//                     {a.assessmentTitle}
//                   </h3>

//                   <p className="text-sm text-gray-500">
//                     ID: {a.assessmentId}
//                   </p>

//                   <p className="text-sm mt-2">
//                     Questions: {a.questions.length}
//                   </p>

//                 <button
//   onClick={() => {
//     console.log("Clicked attemptId:", a?.attemptId);
//     if (!a?.attemptId) {
//       alert("Attempt ID missing!");
//       return;
//     }
//     handleAssessmentClick(a.attemptId);
//   }}
//   className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
// >
//   Evaluate
// </button>
//                 </div>
//               ))}
//             </div>
//           )}

//           {/* DETAILS VIEW */}
         

//         </div>
//       </div>
//     </div>
//   );
// }



import React, { useEffect, useState } from "react";
import { useNavigate,useLocation } from "react-router-dom";
import {
  fetchAllTraineeSummaryAdmin,
  fetchTraineeSummaryByManager,getAssessmentsByTrainee,
  getResultByTraineeAndAssessment
} from "../../../api_service";

import Header from "../../../components/ui/Header";
import { Search } from "lucide-react";

export default function TrainerEvaluationPage() {

  const [trainees, setTrainees] = useState([]);
  const [filteredTrainees, setFilteredTrainees] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [assessmentStatus, setAssessmentStatus] = useState({});
  const [selectedTrainee, setSelectedTrainee] = useState(null);
  const [search, setSearch] = useState("");

  const navigate = useNavigate();
  const privilegedRoles = ["CEO", "HR","CTO","TM"];

  const roleName = sessionStorage.getItem("roleName");

const restrictedRoles = ["CEO", "HR", "CTO", "TM"];

const isRestricted = restrictedRoles.includes(roleName);

  const location = useLocation();
const traineeName = location.state?.firstName || "Trainee";

  // ✅ TOTAL MARKS CALCULATION
  const calculateTotalMarks = (questions) => {
    let total = 0;

    questions.forEach((q) => {
      if (q.section === "English") total += 1;       // MCQ
      else if (q.section === "Coding") total += 5;   // Coding
      else total += 5;                               // Text
    });

    return total;
  };

  // 🔥 FETCH TRAINEES + THEIR MARKS
  useEffect(() => {
    const fetchData = async () => {
      const roleName = sessionStorage.getItem("roleName");
      const userId = sessionStorage.getItem("userId");

      let res;
      if (privilegedRoles.includes(roleName)) {
        res = await fetchAllTraineeSummaryAdmin();
      } else {
        res = await fetchTraineeSummaryByManager(userId);
      }

      const baseTrainees = (res?.data || []).map((t) => ({
        trngid: t.traineeId,
        name: t.name,
        totalMarks: 0,
        totalMaxMarks: 0,
        percentage: 0,
        evaluatedCount: 0,
        totalTests: 0
      }));

      // 🔥 FETCH ALL MARKS FOR EACH TRAINEE
      for (let t of baseTrainees) {
        try {
          // const res = await fetch(
          //   `http://localhost:8080/api/assessmenttest/trainee/${t.trngid}/assessments`
          // );
          // const data = await res.json();
          const res = await getAssessmentsByTrainee(t.trngid);
const data = res.data;

          let totalMarks = 0;
          let totalMaxMarks = 0;
          let evaluatedCount = 0;

          for (let a of data) {
            try {
              // const resultRes = await fetch(
              //   `http://localhost:8080/api/assessmenttestcheck/result?traineeId=${t.trngid}&assessmentId=${a.assessmentId}`
              // );
              // const result = await resultRes.json();
              const resultRes = await getResultByTraineeAndAssessment(
  t.trngid,
  a.assessmentId
);
const result = resultRes.data;

              const allEvaluated = result.questions.every(q => q.evaluated);

              const maxMarks = calculateTotalMarks(result.questions);

              totalMaxMarks += maxMarks;

              if (allEvaluated) {
                totalMarks += result.totalMarks;
                evaluatedCount++;
              }

            } catch {}
          }

          t.totalMarks = totalMarks;
          t.totalMaxMarks = totalMaxMarks;
          t.totalTests = data.length;
          t.evaluatedCount = evaluatedCount;
          t.percentage = totalMaxMarks
            ? ((totalMarks / totalMaxMarks) * 100).toFixed(1)
            : 0;

        } catch {}
      }

      setTrainees(baseTrainees);
      setFilteredTrainees(baseTrainees);
    };

    fetchData();
  }, []);

  // 🔍 SEARCH
  useEffect(() => {
    const filtered = trainees.filter(t =>
      t.name.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredTrainees(filtered);
  }, [search, trainees]);

  // 🔥 TRAINEE CLICK
  const handleTraineeClick = async (trainee) => {
    setSelectedTrainee(trainee);

    // const res = await fetch(
    //   `http://localhost:8080/api/assessmenttest/trainee/${trainee.trngid}/assessments`
    // );
    // const data = await res.json();

    const res = await getAssessmentsByTrainee(trainee.trngid);
const data = res.data;
    setAssessments(data);

    let statusMap = {};

    for (let a of data) {
      try {
        // const resultRes = await fetch(
        //   `http://localhost:8080/api/assessmenttestcheck/result?traineeId=${trainee.trngid}&assessmentId=${a.assessmentId}`
        // );

        // const result = await resultRes.json();
        const resultRes = await getResultByTraineeAndAssessment(
  trainee.trngid,
  a.assessmentId
);
const result = resultRes.data;

        const allEvaluated = result.questions.every(q => q.evaluated);

        statusMap[a.assessmentId] = {
          evaluated: allEvaluated,
          marks: allEvaluated ? result.totalMarks : 0,
          total: calculateTotalMarks(result.questions)
        };

      } catch {
        statusMap[a.assessmentId] = { evaluated: false, marks: 0, total: 0 };
      }
    }

    setAssessmentStatus(statusMap);
  };

  // 🔥 NAVIGATION
  // const handleAssessmentClick = (attemptId) => {
  //   navigate(`/evaluation/${attemptId}`);
    
  // };

  const handleAssessmentClick = (attemptId) => {

    if (isRestricted) {
    alert("You are not authorized");
    return;
  }

  navigate(`/evaluation/${attemptId}`, {
    state: { traineeName: selectedTrainee?.name }
  });
};

    const handleLogout = () => navigate("/");

  return (
    <div className="min-h-screen bg-blue-50">

      <Header
                userName={sessionStorage.getItem("userName") || "User"}
                userRole="manager"
                onLogout={handleLogout}
            />


      <div className="pt-20 flex flex-col md:flex-row">

        {/* LEFT SIDE */}
        <div className="w-full md:w-1/3 p-4">

          <h2 className="text-xl font-bold text-blue-700 mb-3">
            Trainees
          </h2>

          {/* SEARCH */}
          <div className="flex items-center bg-white border rounded-lg px-2 mb-3">
            <Search size={18} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search trainee..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full p-2 outline-none"
            />
          </div>

          {filteredTrainees.map((t) => {

            const isAllEvaluated =
              t.totalTests > 0 && t.evaluatedCount === t.totalTests;

            return (
              <div
                key={t.trngid}
                onClick={() => handleTraineeClick(t)}
                className={`p-3 mb-2 rounded-xl cursor-pointer flex justify-between items-center 
                  ${isAllEvaluated ? "bg-green-100" : "bg-red-100"}`}
              >
                <div>
                  <p className="font-semibold">{t.name}</p>

                  <p className="text-xs text-gray-600">
                    {t.totalMarks} / {t.totalMaxMarks}
                  </p>

                  <p className="text-xs text-gray-500">
                    {t.percentage}% • {t.evaluatedCount}/{t.totalTests} done
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* RIGHT SIDE */}
        <div className="w-full md:w-2/3 p-4">

        <div className="mb-4">
  <h2 className="text-lg font-semibold text-gray-700">
    Trainee:
    <span className="ml-2 text-blue-700 font-bold">
      {selectedTrainee?.name || "Select Trainee"}
    </span>
  </h2>
</div>
<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

  {/* ✅ NO ASSESSMENT MESSAGE */}
  {assessments.length === 0 ? (
    <div className="col-span-2 text-center py-10">
      <p className="text-gray-500 text-lg font-medium">
        Assessment is not available
      </p>
    </div>
  ) : (
    assessments.map((a, index) => {

      const status = assessmentStatus[a.assessmentId] || {};
      const isEvaluated = status.evaluated;

      return (
        <div
          key={index}
          className="bg-white rounded-2xl p-5 shadow-md border border-gray-100 
          hover:shadow-xl hover:-translate-y-1 transition duration-300"
        >

          {/* TOP */}
          <div className="flex justify-between items-start">

            <div>
              <h3 className="text-lg font-semibold text-blue-800">
                {a.assessmentTitle}
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                {a.questions.length} Questions
              </p>
            </div>

            {/* MARKS BADGE */}
            <div
              className={`px-3 py-1 text-xs rounded-full font-semibold
                ${isEvaluated
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-500"}`}
            >
              {isEvaluated ? `${status.marks}/${status.total}` : "Pending"}
            </div>

          </div>

          {/* DIVIDER */}
          <div className="border-t my-4"></div>

          {/* BOTTOM */}
          <div className="flex justify-between items-center">

            <p className={`text-sm font-medium
              ${isEvaluated ? "text-green-600" : "text-blue-600"}`}>
              {isEvaluated ? "Evaluated" : "Needs Evaluation"}
            </p>

{!isRestricted && (
            <button
              onClick={() => handleAssessmentClick(a.attemptId)}
              className={`px-4 py-1.5 text-xs rounded-lg text-white font-medium
                shadow-sm transition
                ${isEvaluated
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-blue-600 hover:bg-blue-700"}`}
            >
              {isEvaluated ? "View" : "Evaluate"}
            </button>
)}

          </div>

        </div>
      );
    })
  )}

</div>
        </div>

      </div>
    </div>
  );
}