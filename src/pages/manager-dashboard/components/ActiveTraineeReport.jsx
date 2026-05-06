import React, { useEffect, useState } from "react";
import Header from "../../../components/ui/Header";
import NavigationBreadcrumb from "../../../components/ui/NavigationBreadcrumb";
import { useNavigate } from "react-router-dom";

import {
  fetchAllTraineeSummaryAdmin,
  fetchTraineeSummaryByManager,
  getAssessmentSummary
} from "../../../api_service";

const privilegedRoles = ["HR", "CEO", "CTO", "PM"];

const ActiveTraineeReport = () => {
  const [trainees, setTrainees] = useState([]);
  const navigate = useNavigate();

  const handleLogout = () => navigate("/");

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

//       // const data = (res?.data || []).map((t) => ({
//       //   trngid: t.traineeId,
//       //   name: t.name,
//       //   percentage: Math.floor(Math.random() * 100), // dummy %
//       //   totalTests: Math.floor(Math.random() * 10)
//       // }));

// const data = (res?.data || []).map((t) => ({
//   trngid: t.traineeId,
//   name: t.name,

//   //  API se real data
//   percentage: t.completionPercentage || 0,

//   //  total tests = syllabus count (approx logic)
//   totalTests: t.syllabusProgress?.length || 0,

//   //  optional extra (future use)
//   lastScore: t.lastAssessmentScore,
//   lastDate: t.lastAssessmentDate
// }));

//       setTrainees(data);
//     };

//     fetchData();
//   }, []);


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

    //  NEW API CALL (assessment summary)
   const traineeList = res?.data || [];

// const data = await Promise.all(
//   traineeList.map(async (t) => {
//     try {
//       //  traineeId pass karo (IMPORTANT CHANGE)
//       const assessmentRes = await getAssessmentSummary(t.userid);

//       return {
//         trngid: t.userid,
//         name: t.name,

//         percentage: t.completionPercentage || 0,
//         totalTests: assessmentRes?.data?.totalTests || 0
//       };
//     } catch (err) {
//       console.error("Error for trainee:", t.traineeId);

//       return {
//         trngid: t.traineeId,
//         name: t.name,
//         percentage: t.completionPercentage || 0,
//         totalTests: 0
//       };
//     }
//   })
// );

const data = await Promise.all(
  traineeList.map(async (t) => {
    try {
      const id = t.userid || t.userId;

      //  ensure departmentIds always present
      const deptIds = t.assignedDepartments?.length
  ? t.assignedDepartments.map(d => d.departmentId)
  : [1];

      const assessmentRes = await getAssessmentSummary(id, deptIds);
      const summary = assessmentRes|| {}; //  FIX

      return {
        trngid: t.traineeId,
         userid:t.userid,
        name: t.name,
        percentage: t.completionPercentage || 0,

       totalTests: summary.totalAssigned || 0, 
        completed: summary.completed || 0,      
        pending: summary.pending || 0  ,
        
       departmentIds: t.assignedDepartments?.map(d => d.departmentId) || []
        
        
      };
    } catch (err) {
      console.error("Error:", t);

      return {
        trngid: t.traineeId,
        userid:t.userid,
        name: t.name,
        percentage: t.completionPercentage || 0,
        totalTests: 0,
        completed: 0,
        pending: 0,
       departmentIds: t.assignedDepartments?.map(d => d.departmentId) || []
      };
    }
  })
);
setTrainees(data);
  
  };

  fetchData();
}, []);
  return (
    <div className="min-h-screen bg-background">
      <Header
        userName={sessionStorage.getItem("userName")}
        userRole="manager"
        onLogout={handleLogout}
      />

      <main className="pt-20 max-w-7xl mx-auto px-4">
          <NavigationBreadcrumb userRole="manager" className="mb-4" />

        <h1 className="text-3xl font-bold text-black-700 mt-6 mb-6">
          Active Trainee Dashboard
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {trainees.map((t) => (
            <div
              key={t.trngid}
              onClick={() =>
                navigate(`/trainee-report/${t.trngid}`, { state: t })
              }
              className="bg-white rounded-2xl shadow-md p-4 cursor-pointer hover:scale-105 transition border"
            >
              <h3 className="text-lg font-semibold text-black">
                {t.name}
              </h3>

              <p className="text-sm text-gray-500">
                Tests: {t.totalTests}
              </p>

              <div className="mt-3">
                <div className="bg-purple-100 h-2 rounded-full">
                  <div
                    className="bg-purple-600 h-2 rounded-full"
                    style={{ width: `${t.percentage}%` }}
                  />
                </div>
                <p className="text-xs text-purple-600 mt-1">
                  {t.percentage}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default ActiveTraineeReport;