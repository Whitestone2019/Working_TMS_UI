

import React, { useState, useEffect, useCallback, useRef } from "react";
import Header from "../../../components/ui/Header";
import Button from "../../../components/ui/Button";
import { useNavigate } from "react-router-dom";
import NavigationBreadcrumb from "../../../components/ui/NavigationBreadcrumb";
import Icon from "../../../components/AppIcon";


import {
  fetchCompletedSubTopics,
  fetchCompletedSubTopicsByManager,
  approveSubTopicAPI,
  rejectSubTopicAPI,
  fetchSyllabusByTrainer, fetchSyllabusProgressByEmpId, submitTrainerFeedbackAPI,
  getSyllabusFeedbackAPI
} from "../../../api_service";

export default function TraineeStepsPage() {
  const navigate = useNavigate();

  const [trainees, setTrainees] = useState([]);
  const [selectedTrainee, setSelectedTrainee] = useState(null);
  const [expandedSyllabus, setExpandedSyllabus] = useState({});
  const [reviewInput, setReviewInput] = useState({});
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false); // Added loading state
  const [traineeProgress, setTraineeProgress] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSubtopic, setFeedbackSubtopic] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const privilegeRoles = ["CEO", "CTO", "HR", "PM"];

  const tableRef = useRef(null);
  const roleName = sessionStorage.getItem("roleName");
  const isRestrictedRole = privilegeRoles.includes(roleName);

  const scrollLeft = () => {
    tableRef.current.scrollBy({ left: -300, behavior: "smooth" });
  };

  const scrollRight = () => {
    tableRef.current.scrollBy({ left: 300, behavior: "smooth" });
  };

  const filteredTrainees = trainees.filter((t) =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  useEffect(() => {
    if (!selectedTrainee) return;

    const loadProgress = async () => {
      try {
        const empid = selectedTrainee.id;
        const trainerId = sessionStorage.getItem("empid");
        const res = await fetchSyllabusProgressByEmpId(empid);
        const data = res?.data || res;

        if (!data || data.length === 0) return;

        for (let step of data) {
          //  Logic: Check if EVERY subtopic is complete and approved
          const allSubtopicsFinished = step.subTopics?.every(sub =>
            sub.stepProgress?.some(p => p.complete === true && p.checker === true)
          );

          // If syllabus is not fully complete, skip to next syllabus
          if (!allSubtopicsFinished) continue;

          //  If fully complete, check if feedback already exists in DB
          let feedbackRes = null;
          try {
            // Note: Ensure your API params match your backend signature
            feedbackRes = await getSyllabusFeedbackAPI(empid, trainerId, step.syllabusId);
          } catch (err) {
            if (err?.response?.status !== 404) console.error("Feedback Check Error:", err);
          }

          //  Only show modal if feedback record is missing or not yet given by trainer
          if (!feedbackRes || feedbackRes.feedbackGivenTrainer === false) {

            const lastSub = step.subTopics[step.subTopics.length - 1];

            setFeedbackSubtopic({
              ...lastSub,
              syllabusTitle: step.title,
              syllabusId: step.syllabusId,
            });
            setShowFeedbackModal(true);


            break;
          }
        }

        setTraineeProgress(data);
      } catch (err) {
        console.error("Failed to fetch syllabus progress:", err);
      }
    };

    loadProgress();
  }, [selectedTrainee, refreshKey]);

  const buildTraineeStructure = (data = []) => {
    const traineeMap = {};

    data.forEach((syllabus) => {
      syllabus.subTopics?.forEach((sub) => {
        sub.stepProgress?.forEach((progress) => {
          const user = progress.user;
          if (!user) return;

          // Agar user pehle se map mein nahi hai, toh create karein
          if (!traineeMap[user.trngid]) {
            traineeMap[user.trngid] = {
              id: user.trngid,
              name: `${user.firstname} ${user.lastname}`,
              syllabi: {},
            };
          }


          if (!traineeMap[user.trngid].syllabi[syllabus.title]) {
            traineeMap[user.trngid].syllabi[syllabus.title] = {
              title: syllabus.title,
              subTopics: [],
            };
          }


          traineeMap[user.trngid].syllabi[syllabus.title].subTopics.push({
            id: sub.subTopicId,
            progressId: progress.stepProgressId,
            name: sub.name,
            status: progress.complete ? "COMPLETED" : "PENDING",
            managerDecision: progress.checker, // true/false/null
            review: progress.review || "",
            startDateTime: progress.startDateTime,
            endDateTime: progress.endDateTime,
          });
        });
      });
    });

    // Object ko array mein convert karein
    return Object.values(traineeMap).map((t) => ({
      ...t,
      syllabi: Object.values(t.syllabi),
    }));
  };

  const loadData = useCallback(async () => {
    setIsLoading(true);

    try {
      const managerId = sessionStorage.getItem("empid");
      const roleName = sessionStorage.getItem("roleName");

      let res;
      let list = [];

      if (privilegeRoles.includes(roleName)) {
        res = await fetchCompletedSubTopics();
        list = Array.isArray(res?.data) ? res.data : [];
      } else {
        res = await fetchSyllabusByTrainer(managerId);
        list = Array.isArray(res) ? res : []; // <-- important!
      }

      console.log("Syllabus list:", list);
      const structured = buildTraineeStructure(list);
      setTrainees(structured);


      
      // Maintain selected trainee after refresh
      if (selectedTrainee) {
        const updatedSelection = structured.find(
          (t) => t.id === selectedTrainee.id
        );
        setSelectedTrainee(updatedSelection || structured[0] || null);
      } else {
        setSelectedTrainee(structured[0] || null);
      }

    } catch (err) {
      console.error("API ERROR:", err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedTrainee?.id]);


  useEffect(() => {
    loadData();
  }, [refreshKey]);

  const handleDecision = async (subKey, value, progressId) => {
    const review = reviewInput[subKey] || "";

    if (value === "REJECT" && !review.trim()) {
      alert("Review is mandatory for rejection");
      return;
    }

    try {
      if (value === "ACCEPT") {
        await approveSubTopicAPI(progressId, review);
        alert("Approved successfully");
      } else {
        await rejectSubTopicAPI(progressId, review);
        alert("Rejected successfully");
      }

      //  Trigger the reload logic by incrementing key
      setRefreshKey((p) => p + 1);

      // Clear specific review input after success
      setReviewInput(prev => {
        const next = { ...prev };
        delete next[subKey];
        return next;
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => navigate("/");

  const formatCombinedDT = (dt) => {
    if (!dt) return "-";
    const d = new Date(dt);
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
  };

  const toggleSyllabus = (key) => {
    setExpandedSyllabus((p) => ({ ...p, [key]: !p[key] }));
  };


  return (
    <div className="min-h-screen bg-background">
      <Header
        userName={sessionStorage.getItem("userName") || "User"}
        userRole="manager"
        onLogout={handleLogout}
      />

      <main className="pt-20 max-w-7xl mx-auto px-2">
        <NavigationBreadcrumb userRole="manager" />

        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_3.7fr] gap-4 mt-6">
          {/* LEFT PANEL */}


          {/* <div className="bg-white border border-purple-200 rounded-2xl shadow p-4 lg:col-span-2"> */}
          <div className="bg-white border border-purple-200 rounded-2xl shadow p-4">

            {/* HEADER */}
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-lg font-semibold text-muted-foreground">Select Trainee</h2>
                <p className="text-sm text-gray-500">Choose a trainee</p>
              </div>
              {isLoading && <Icon name="RotateCw" size={16} className="animate-spin text-purple-600" />}
            </div>

            {/* SEARCH */}
            <input
              type="text"
              placeholder="Search trainee..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
            />

            {/* LIST */}
            <div className="space-y-3 max-h-[400px] overflow-y-auto">

              {filteredTrainees.length === 0 ? (
                <div className="text-center py-6 text-gray-400">
                  No trainees found
                </div>
              ) : (
                filteredTrainees.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTrainee(t)}
                    className={`p-4 border rounded-xl cursor-pointer transition-all
            ${selectedTrainee?.id === t.id
                        ? "border-purple-500 bg-purple-50"
                        : "hover:border-purple-300"
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
                          <p className="text-xs text-gray-500">ID: {t.id}</p>
                        </div>
                      </div>

                      {/* RIGHT */}
                      <div className="text-xs text-gray-500">
                        {t.syllabi?.length || 0} syllabus
                      </div>

                    </div>

                  </div>
                ))
              )}
            </div>

          </div>

          {/* RIGHT PANEL */}
          {/* <div className="bg-white border border-blue-200 rounded-2xl shadow lg:col-span-3"> */}
          <div className="bg-white border border-purple-200 rounded-2xl shadow min-w-0">
            <div className="p-4 bg-purple-200 rounded-t-2xl font-bold text-black-800 flex justify-between">
              <span>Syllabus – {selectedTrainee?.name || "Select Trainee"}</span>
              {isLoading && <span className="text-xs font-normal">Updating...</span>}
            </div>
            <div className="relative">

              <button
                onClick={scrollLeft}
                className="absolute left-1 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md rounded-full p-2 hover:bg-gray-100"
              >
                <Icon name="ChevronLeft" size={18} />
              </button>

              <button
                onClick={scrollRight}
                className="absolute right-1 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md rounded-full p-2 hover:bg-gray-100"
              >
                <Icon name="ChevronRight" size={18} />
              </button>

              <div className="relative">
                <div
                  ref={tableRef}
                  className="p-2 overflow-x-auto scrollbar-hide scroll-smooth"
                >
                  {/* ... Table UI Remains the same ... */}
                  <table className="w-full text-sm border-separate border-spacing-y-2">
                    {/* ... table content from original snippet ... */}
                    <thead className="sticky top-0 bg-purple-100 z-10">
                      <tr className="bg-purple-200">
                        <th className="p-3 text-left min-w-[100px]">Topic</th>
                        <th className="p-3 text-center min-w-[100px]">Status</th>
                        <th className="p-3 text-center min-w-[200px]">Start Time</th>
                        <th className="p-3 text-center min-w-[200px]">End Time</th>
                        <th className="p-3 text-left min-w-[180px]">Review</th>
                        <th className="p-3 text-center min-w-[100px]">Accept</th>
                        <th className="p-3 text-center min-w-[100px]">Reject</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedTrainee?.syllabi?.map((syllabus) => {
                        const syllabusKey = `syllabus-${syllabus.title}`;
                        return (
                          <React.Fragment key={syllabusKey}>
                            <tr onClick={() => toggleSyllabus(syllabusKey)} className="bg-purple-50 cursor-pointer">
                              <td className="p-3 font-semibold flex gap-2">
                                <Icon name={expandedSyllabus[syllabusKey] ? "ChevronDown" : "ChevronRight"} size={16} />
                                {syllabus.title}
                              </td>
                              <td colSpan="6"></td>
                            </tr>
                            {expandedSyllabus[syllabusKey] && syllabus.subTopics.map((st) => {
                              const subKey = `${syllabusKey}-${st.id}`;
                              return (
                                <tr key={subKey} className="bg-white shadow-sm hover:shadow-md transition rounded-xl">
                                  <td className="p-3 pl-6">{st.name}</td>
                                  <td className="p-3 text-center">
                                    {st.managerDecision === true && <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Accepted</span>}
                                    {st.managerDecision === false && <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">Rejected</span>}
                                    {st.managerDecision === null && <span className="px-2 py-1 bg-gray-200 text-gray-600 rounded text-xs">{st.status}</span>}
                                  </td>
                                  <td className="p-3 text-center">{formatCombinedDT(st.startDateTime)}</td>
                                  <td className="p-3 text-center">{formatCombinedDT(st.endDateTime)}</td>
                                  <td className="p-3">
                                    <input
                                      className="w-full border rounded px-2 py-1 accent-purple-600 focus:ring-purple-500 "
                                      placeholder="Review"
                                      disabled={isRestrictedRole}

                                      value={reviewInput[subKey] ?? st.review ?? ""}
                                      onChange={(e) => setReviewInput((p) => ({ ...p, [subKey]: e.target.value }))}
                                    />
                                  </td>
                                  <td className="p-3 text-center">
                                    <input type="radio" name={`decision-${subKey}`} checked={st.managerDecision === true} disabled={isRestrictedRole} onChange={() => handleDecision(subKey, "ACCEPT", st.progressId)} className="w-3.5 h-3.5 text-purple-600" />
                                  </td>
                                  <td className="p-3 text-center">
                                    <input type="radio" name={`decision-${subKey}`} checked={st.managerDecision === false} disabled={isRestrictedRole} onChange={() => handleDecision(subKey, "REJECT", st.progressId)} className="w-3.5 h-3.5 text-purple-600" />
                                  </td>
                                </tr>
                              );
                            })}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div></div>

            </div>
          </div>
        </div>
      </main>
      {showFeedbackModal && feedbackSubtopic && !isRestrictedRole && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">

          <div className="bg-card p-6 rounded-lg max-w-md w-full mx-4">

            <div className="text-center">

              <Icon
                name="CheckCircle"
                size={48}
                className="text-success mx-auto mb-4"
              //className="text-purple-600 mx-auto mb-4" 
              />

              <h3 className="text-lg font-semibold text-foreground mb-2">
                Feedback
              </h3>

              <textarea
                className="w-full border p-2 rounded mb-4
           focus:ring-2 focus:ring-purple-300 focus:border-purple-500 focus:outline-none"
                placeholder="Enter your feedback..."
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                rows={4}
              />

              <div className="flex space-x-3">

                <Button
                  variant="outline"
                  onClick={() => {
                    setShowFeedbackModal(false);
                    setFeedbackText("");
                  }}
                  className="flex-1"
                  disabled={feedbackText.trim() === ""}
                >
                  Cancel
                </Button>

                <Button
                  variant="default"
                  disabled={feedbackText.trim() === "" || isRestrictedRole}
                  onClick={async () => {
                    try {
                      const trainerId = sessionStorage.getItem("empid");
                      if (!trainerId) return alert("Trainer ID missing");

                      await submitTrainerFeedbackAPI(
                        selectedTrainee.id,
                        trainerId,
                        feedbackSubtopic.syllabusId,
                        feedbackText
                      );

                      // CLOSE FIRST to prevent flicker
                      setShowFeedbackModal(false);
                      setFeedbackText("");
                      setFeedbackSubtopic(null); // Clear the subtopic reference

                      alert("Feedback submitted successfully!");
                      setRefreshKey(p => p + 1); // Trigger re-fetch
                    } catch (err) {
                      alert("Failed to submit feedback");
                    }
                  }}
                >
                  Submit Feedback
                </Button>


              </div>
            </div>

          </div>
        </div>
      )}


    </div>
  );
}