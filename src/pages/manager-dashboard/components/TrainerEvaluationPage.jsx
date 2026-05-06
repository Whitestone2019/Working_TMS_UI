import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  fetchAllTraineeSummaryAdmin,
  fetchTraineeSummaryByManager, getAssessmentsByTrainee,
  getResultByTraineeAndAssessment
} from "../../../api_service";
import Icon from "../../../components/AppIcon";
import Header from "../../../components/ui/Header";
import { Search } from "lucide-react";
import NavigationBreadcrumb from "../../../components/ui/NavigationBreadcrumb";

export default function TrainerEvaluationPage() {

  const [trainees, setTrainees] = useState([]);
  const [filteredTrainees, setFilteredTrainees] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [assessmentStatus, setAssessmentStatus] = useState({});
  const [selectedTrainee, setSelectedTrainee] = useState(null);
  const [search, setSearch] = useState("");

  const navigate = useNavigate();
  const privilegedRoles = ["CEO", "HR", "CTO", "TM"];

  const roleName = sessionStorage.getItem("roleName");

  const restrictedRoles = ["CEO", "HR", "CTO", "TM"];

  const isRestricted = restrictedRoles.includes(roleName);

  const location = useLocation();
  const traineeName = location.state?.firstName || "Trainee";

  //  TOTAL MARKS CALCULATION
  const calculateTotalMarks = (questions) => {
    let total = 0;

    questions.forEach((q) => {
      if (q.section === "English") total += 1;       // MCQ
      else if (q.section === "Coding") total += 5;   // Coding
      else total += 5;                               // Text
    });

    return total;
  };

  //  FETCH TRAINEES + THEIR MARKS
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

            } catch { }
          }

          t.totalMarks = totalMarks;
          t.totalMaxMarks = totalMaxMarks;
          t.totalTests = data.length;
          t.evaluatedCount = evaluatedCount;
          t.percentage = totalMaxMarks
            ? ((totalMarks / totalMaxMarks) * 100).toFixed(1)
            : 0;

        } catch { }
      }

      setTrainees(baseTrainees);
      setFilteredTrainees(baseTrainees);
    };

    fetchData();
  }, []);

  //  SEARCH
  useEffect(() => {
    const filtered = trainees.filter(t =>
      t.name.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredTrainees(filtered);
  }, [search, trainees]);

  //  TRAINEE CLICK
  const handleTraineeClick = async (trainee) => {
    setSelectedTrainee(trainee);

    const res = await getAssessmentsByTrainee(trainee.trngid);
    const data = res.data;
    setAssessments(data);

    let statusMap = {};

    for (let a of data) {
      try {
        
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

  //  NAVIGATION
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
    <div className="min-h-screen bg-background">

      <Header
        userName={sessionStorage.getItem("userName") || "User"}
        userRole="manager"
        onLogout={handleLogout}
      />
      <div className="pt-20 px-10 max-w-7xl mx-auto">
        <NavigationBreadcrumb userRole="manager" className="mb-4" />
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-[1.4fr_2.6fr] gap-4 mt-4">

          {/* LEFT SIDE */}
          <div className="bg-white border border-purple-200 rounded-2xl shadow p-5">

            {/* HEADER */}
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-lg font-semibold text-muted-foreground">
                  Select Trainee
                </h2>
                <p className="text-sm text-gray-500">Choose a trainee</p>
              </div>
            </div>

            {/* SEARCH */}
            <div className="flex items-center border rounded-lg px-3 mb-4 bg-white focus-within:ring-2 focus-within:ring-purple-400">
              <Icon name="Search" size={16} className="text-gray-400" />

              <input
                type="text"
                placeholder="Search trainee..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full p-2 outline-none border-none focus:ring-0 focus:outline-none"
              />
            </div>

            {/* LIST */}
            <div className="space-y-3 max-h-[450px] overflow-y-auto">

              {filteredTrainees.length === 0 ? (
                <div className="text-center py-6 text-gray-400">
                  No trainees found
                </div>
              ) : (
                filteredTrainees.map((t) => {

                  const isAllEvaluated =
                    t.totalTests > 0 && t.evaluatedCount === t.totalTests;

                  return (
                    <div
                      key={t.trngid}
                      onClick={() => handleTraineeClick(t)}
                      className={`p-4 border rounded-xl cursor-pointer transition-all
              ${selectedTrainee?.trngid === t.trngid
                          ? "border-purple-500 bg-purple-50 shadow-sm"
                          : "hover:border-purple-300 hover:bg-purple-50"
                        }`}
                    >

                      <div className="flex justify-between items-center">

                        {/* LEFT */}
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                            <Icon name="User" size={18} className="text-purple-600" />
                          </div>

                          <div>
                            <h3 className="font-medium text-black">{t.name}</h3>
                            <p className="text-xs text-gray-500">
                              {t.totalMarks} / {t.totalMaxMarks}
                            </p>
                          </div>
                        </div>

                        {/* RIGHT */}
                        <div className="text-xs text-right">
                          <p className="text-gray-600 font-medium">
                            {t.percentage}%
                          </p>
                          <p className="text-gray-400">
                            {t.evaluatedCount}/{t.totalTests}
                          </p>
                        </div>

                      </div>

                      {/* STATUS */}
                      <div className="mt-2">
                        <span
                          className={`px-2 py-1 text-xs rounded-full font-medium
                  ${isAllEvaluated
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                            }`}
                        >
                          {isAllEvaluated ? "Completed" : "Pending"}
                        </span>
                      </div>

                    </div>
                  );
                })
              )}

            </div>
          </div>
          {/* RIGHT SIDE */}
          <div className="p-4 w-full">

            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-700">
                Trainee:
                <span className="ml-2 text-muted-foreground font-bold">
                  {selectedTrainee?.name || "Select Trainee"}
                </span>
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

              {/*  NO ASSESSMENT MESSAGE */}
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
                          <h3 className="text-lg font-semibold text-black">
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
    </div>
  );
}