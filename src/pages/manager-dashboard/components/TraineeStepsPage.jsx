

import React, { useState, useEffect, useCallback } from "react";
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
   fetchSyllabusByTrainer,fetchSyllabusProgressByEmpId, submitTrainerFeedbackAPI,
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
const privilegeRoles = ["CEO", "CTO", "HR"<"PM"];

const roleName = sessionStorage.getItem("roleName");
const isRestrictedRole = privilegeRoles.includes(roleName);
// useEffect(() => {
//     if (!selectedTrainee) return;

//     const loadProgress = async () => {
//         try {
//             const empid = selectedTrainee.id;
//             const res = await fetchSyllabusProgressByEmpId(empid);
//             const data = res?.data || res;

//             if (!data || data.length === 0) return;

//             for (let step of data) {

//                 const lastSubtopic =
//                     step.subTopics?.[step.subTopics.length - 1];

//                 if (!lastSubtopic) continue;

//                 const isCompletedAndApproved =
//                     lastSubtopic.stepProgress?.some(
//                         p => p.complete === true && p.checker === true
//                     );

//                 if (isCompletedAndApproved) {

//                     // Agar already isi syllabus ka feedback show nahi hua
//                     if (!feedbackSubtopic ||
//                         feedbackSubtopic.id !== lastSubtopic.subTopicId) {

//                         setFeedbackSubtopic({
//                             ...lastSubtopic,
//                             syllabusTitle: step.title,
//                         });

//                         setShowFeedbackModal(true);
//                         break; // ek baar mein ek hi popup
//                     }
//                 }
//             }

//             setTraineeProgress(data);

//         } catch (err) {
//             console.error("Failed to fetch syllabus progress:", err);
//         }
//     };

//     loadProgress();
// }, [selectedTrainee, refreshKey]);

    // const buildTraineeStructure = (data = []) => {
    //     const traineeMap = {};

    //     data.forEach((syllabus) => {
    //         syllabus.subTopics?.forEach((sub) => {
    //             sub.stepProgress?.forEach((progress) => {
    //                 const user = progress.user;
    //                 if (!user) return;

    //                 if (!traineeMap[user.trngid]) {
    //                     traineeMap[user.trngid] = {
    //                         id: user.trngid,
    //                         name: `${user.firstname} ${user.lastname}`,
    //                         syllabi: {},
    //                     };
    //                 }

    //                 if (!traineeMap[user.trngid].syllabi[syllabus.title]) {
    //                     traineeMap[user.trngid].syllabi[syllabus.title] = {
    //                         title: syllabus.title,
    //                         subTopics: [],
    //                     };
    //                 }

    //                 let managerDecision = null;
    //                 if (progress.checker === true) managerDecision = true;
    //                 if (progress.checker === false) managerDecision = false;

    //                 traineeMap[user.trngid].syllabi[syllabus.title].subTopics.push({
    //                     id: sub.subTopicId,
    //                     progressId: progress.stepProgressId,
    //                     name: sub.name,
    //                     status: progress.complete ? "COMPLETED" : "PENDING",
    //                     managerDecision,
    //                     review: progress.review || "",
    //                     startDateTime: progress.startDateTime,
    //                     endDateTime: progress.endDateTime,
    //                 });
    //             });
    //         });
    //     });

    //     return Object.values(traineeMap).map((t) => ({
    //         ...t,
    //         syllabi: Object.values(t.syllabi),
    //     }));
    // };

// const buildTraineeStructure = (data = [], traineeFilterId) => {
//   const traineeMap = {};

//   data.forEach((syllabus) => {
//     syllabus.subTopics?.forEach((sub) => {
//       sub.stepProgress?.forEach((progress) => {
//         const user = progress.user;
//         if (!user) return;

//         // ✅ IMPORTANT FILTER (selected trainee only)
//         if (traineeFilterId && user.trngid !== traineeFilterId) return;

//         if (!traineeMap[user.trngid]) {
//           traineeMap[user.trngid] = {
//             id: user.trngid,
//             name: `${user.firstname} ${user.lastname}`,
//             syllabi: {},
//           };
//         }

//         if (!traineeMap[user.trngid].syllabi[syllabus.title]) {
//           traineeMap[user.trngid].syllabi[syllabus.title] = {
//             title: syllabus.title,
//             subTopics: [],
//           };
//         }

//         traineeMap[user.trngid].syllabi[syllabus.title].subTopics.push({
//           id: sub.subTopicId,
//           progressId: progress.stepProgressId,
//           name: sub.name,
//           status: progress.complete ? "COMPLETED" : "PENDING",
//           managerDecision: progress.checker,
//           review: progress.review || "",
//           startDateTime: progress.startDateTime,
//           endDateTime: progress.endDateTime,
//         });
//       });
//     });
//   });

//   return Object.values(traineeMap).map((t) => ({
//     ...t,
//     syllabi: Object.values(t.syllabi),
//   }));
// };

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

        // Syllabus ko title ke basis par group karein
        if (!traineeMap[user.trngid].syllabi[syllabus.title]) {
          traineeMap[user.trngid].syllabi[syllabus.title] = {
            title: syllabus.title,
            subTopics: [],
          };
        }

        // Subtopic push karein
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
        <div className="min-h-screen bg-blue-50">
            <Header
                userName={sessionStorage.getItem("userName") || "User"}
                userRole="manager"
                onLogout={handleLogout}
            />

            <main className="pt-20 max-w-7xl mx-auto px-2">
                <NavigationBreadcrumb userRole="manager" />

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mt-6">
                    {/* LEFT PANEL */}
                    <div className="bg-white border border-blue-200 rounded-2xl shadow">
                        {/* <div className="p-3 bg-blue-100 rounded-t-2xl font-bold text-blue-800 flex justify-between items-center">
                            <span className="flex gap-2"><Icon name="Users" size={18} /> Trainees</span>
                            {isLoading && <Icon name="RotateCw" size={14} className="animate-spin" />}
                        </div> */}
                        <div className="p-3 bg-blue-100 rounded-t-2xl text-blue-800">

  <div className="flex justify-between items-center font-bold mb-2">
    <span className="flex gap-2">
      <Icon name="Users" size={18} /> Trainees
    </span>
    {isLoading && <Icon name="RotateCw" size={14} className="animate-spin" />}
  </div>

  {/* 🔍 SEARCH INPUT */}
  <input
    type="text"
    placeholder="Search trainee..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
  />

</div>

                        <div className="max-h-[300px] overflow-y-auto">
                            {filteredTrainees.map((t) => (
                                <div
                                    key={t.id}
                                    onClick={() => setSelectedTrainee(t)}
                                    className={`p-3 cursor-pointer text-sm hover:bg-blue-50 ${selectedTrainee?.id === t.id &&
                                        "bg-blue-100 font-semibold"
                                        }`}
                                >
                                    {t.name}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT PANEL */}
                    <div className="lg:col-span-4 bg-white border border-blue-200 rounded-2xl shadow">
                        <div className="p-4 bg-blue-100 rounded-t-2xl font-bold text-blue-800 flex justify-between">
                            <span>Syllabus – {selectedTrainee?.name || "Select Trainee"}</span>
                            {isLoading && <span className="text-xs font-normal">Updating...</span>}
                        </div>

                        <div className="p-2 overflow-x-auto">
                            {/* ... Table UI Remains the same ... */}
                            <table className="w-full min-w-[1000px] table-fixed text-sm">
                                {/* ... table content from original snippet ... */}
                                <thead>
                                    <tr className="bg-blue-100">
                                        <th className="p-3 text-left w-[100px]">Topic</th>
                                        <th className="p-3 text-center w-[100px]">Status</th>
                                        <th className="p-3 text-center w-[200px]">Start Time</th>
                                        <th className="p-3 text-center w-[200px]">End Time</th>
                                        <th className="p-3 text-left w-[180px]">Review</th>
                                        <th className="p-3 text-center w-[100px]">Accept</th>
                                        <th className="p-3 text-center w-[100px]">Reject</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedTrainee?.syllabi?.map((syllabus) => {
                                        const syllabusKey = `syllabus-${syllabus.title}`;
                                        return (
                                            <React.Fragment key={syllabusKey}>
                                                <tr onClick={() => toggleSyllabus(syllabusKey)} className="bg-blue-50 cursor-pointer">
                                                    <td className="p-3 font-semibold flex gap-2">
                                                        <Icon name={expandedSyllabus[syllabusKey] ? "ChevronDown" : "ChevronRight"} size={16} />
                                                        {syllabus.title}
                                                    </td>
                                                    <td colSpan="6"></td>
                                                </tr>
                                                {expandedSyllabus[syllabusKey] && syllabus.subTopics.map((st) => {
                                                    const subKey = `${syllabusKey}-${st.id}`;
                                                    return (
                                                        <tr key={subKey} className="border-b">
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
                                                                    className="w-full border rounded px-2 py-1"
                                                                    placeholder="Review"
                                                                 disabled={isRestrictedRole}
 
                                                                    value={reviewInput[subKey] ?? st.review ?? ""}
                                                                    onChange={(e) => setReviewInput((p) => ({ ...p, [subKey]: e.target.value }))}
                                                                />
                                                            </td>
                                                            <td className="p-3 text-center">
                                                                <input type="radio" name={`decision-${subKey}`} checked={st.managerDecision === true}   disabled={isRestrictedRole} onChange={() => handleDecision(subKey, "ACCEPT", st.progressId)} />
                                                            </td>
                                                            <td className="p-3 text-center">
                                                                <input type="radio" name={`decision-${subKey}`} checked={st.managerDecision === false}  disabled={isRestrictedRole} onChange={() => handleDecision(subKey, "REJECT", st.progressId)} />
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </React.Fragment>
                                        );
                                    })}
                                </tbody>
                            </table>


                        </div>
                    </div>
                </div>
            </main>
    {showFeedbackModal && feedbackSubtopic &&   !isRestrictedRole && (
  <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
    
    <div className="bg-card p-6 rounded-lg max-w-md w-full mx-4">
      
      <div className="text-center">
        
        <Icon 
          name="CheckCircle" 
          size={48} 
          className="text-success mx-auto mb-4" 
        />

        <h3 className="text-lg font-semibold text-foreground mb-2">
          Feedback
        </h3>

        <textarea
          className="w-full border p-2 rounded mb-4"
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
  variant="success"
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