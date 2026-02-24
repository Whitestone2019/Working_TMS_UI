

              import React, { useState, useEffect, useRef } from "react";
              import Icon from "../../../components/AppIcon";
              import Button from "../../../components/ui/Button";
              import PdfViewer from "./PdfViewer";
              import { startSubTopic, completeSubTopic,submitTraineeFeedbackAPI ,getSyllabusFeedbackAPI} from "../../../api_service";

              const ContentDisplay = ({ currentStep, traineeInfo, onStepComplete, onNextStep, onPreviousStep, canGoNext, canGoPrevious, canComplete, onRefresh }) => {
                const [timeSpent, setTimeSpent] = useState(0);
                const [startTime] = useState(Date.now());
                const [currentSubIndex, setCurrentSubIndex] = useState(0);
                const [showCompletionModal, setShowCompletionModal] = useState(false);
                const [fileData, setFileData] = useState(null);

                const topic = currentStep?.topics?.[0] ?? { subTopics: [] };
                const subTopics = Array.isArray(topic.subTopics) ? topic.subTopics : [];
                const totalSubs = subTopics.length;
                //const completedSubs = subTopics.filter((s) => s?.completed).length;
                // Isse progress hamesha sahi dikhegi chahe data refresh ho kar aaye

                const [showFeedbackModal, setShowFeedbackModal] = useState(false);
              const [feedbackText, setFeedbackText] = useState("");
              const [feedbackData, setFeedbackData] = useState(null);

              


              // const completedSubs = subTopics.filter((s) => 
              //   s?.completed === true || (s?.stepProgress && s.stepProgress[0]?.complete === true)
              // ).length;
              //   const calcProgress = totalSubs > 0 ? Math.round((completedSubs / totalSubs) * 100) : 0;
              // This calculation runs every time the component renders
const completedSubs = subTopics.filter((s) => 
  s?.completed === true || 
  (s?.stepProgress && s.stepProgress[0]?.complete === true)
).length;

const calcProgress = totalSubs > 0 ? Math.round((completedSubs / totalSubs) * 100) : 0;
                const sub = subTopics[currentSubIndex] ?? null;
                const isLastSub = currentSubIndex === subTopics.length - 1;
                const allSteps = traineeInfo?.steps || [];
                const currentIndex = allSteps.findIndex(s => s.id === currentStep.id);
                const isLastStep = currentIndex === allSteps.length - 1;
                const isLastSubOfLastStep = isLastStep && isLastSub;
              const syllabusId = currentStep?.id;
              const trainerId = currentStep?.trainer?.id;

            const trainingId = currentStep?.syllabusId;


                const startedSubRef = useRef(null);
                const empid = sessionStorage.getItem("empid");
              const isLastSubTopic = () => {
                return currentSubIndex === subTopics.length - 1;
              };

                useEffect(() => setCurrentSubIndex(0), [currentStep?.id]);

                useEffect(() => {
                  const interval = setInterval(() => { setTimeSpent(Math.floor((Date.now() - startTime) / 1000)); }, 1000);
                  return () => clearInterval(interval);
                }, [startTime]);

                const formatTime = (seconds) => {
                  const hours = Math.floor(seconds / 3600);
                  const minutes = Math.floor((seconds % 3600) / 60);
                  const secs = seconds % 60;
                  return hours > 0 ? `${hours}h ${minutes}m ${secs}s` : `${minutes}m ${secs}s`;
                };

                const getPreviewUrl = () => {
                  if (!fileData || !fileData.url || !fileData.mime) return null;
                  const isOffice = fileData.mime.includes("word") || fileData.mime.includes("presentation") || fileData.mime.includes("excel") || fileData.name.endsWith(".doc") || fileData.name.endsWith(".docx") || fileData.name.endsWith(".pptx") || fileData.name.endsWith(".xlsx");
                  if (isOffice) return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileData.url)}`;
                  return fileData.url;
                };

                useEffect(() => {
                  if (!sub?.filePath) { setFileData(null); return; }
                  const cleanFileName = sub.filePath.replace(/\\/g, "/").split("/").pop();
                  const relativePath = sub.filePath.replace(/\\/g, "/");
                  //fetch(`http://localhost:8080/api/syllabus/preview?path=${cleanFileName}`)
                  fetch(`${process.env.REACT_APP_API_URL}/syllabus/preview?path=${cleanFileName}`)
                    .then(res => res.ok ? res.blob() : Promise.reject(res.status))
                    .then(blob => setFileData({ url: URL.createObjectURL(blob), mime: blob.type, name: cleanFileName }))
                    .catch(err => setFileData({ error: true, message: "Unable to load this file." }));
                }, [sub]);

                useEffect(() => {
                  if (!currentStep || !empid) return;
                  const currentSub = subTopics[currentSubIndex];
                  if (!currentSub?.id) return;
                  if (startedSubRef.current === currentSub.id) return;
                  startedSubRef.current = currentSub.id;
                  const payload = { empid, subtopicId: currentSub.id, starttimeSeconds: Date.now(), complete: false, checker: false ,};
                  startSubTopic(payload).catch(err => console.error("Start subtopic failed:", err));
                }, [currentSubIndex, currentStep?.id, subTopics, empid]);



              const markSubtopicCompleted = async () => {
                if (!sub) return;

                // Agar manager ne accept kar liya hai toh dobara update ki zarurat nahi
                if (sub.managerDecision === true) return;

                try {
                  sub.completed = true;

                  await completeSubTopic({
                    empid,
                    subtopicId: sub.id,
                    endtimeSeconds: Math.floor(Date.now() / 1000),
                    complete: true,
                    checker: false, 
                  });

                  // ✅ Refresh data from Parent
                  if (onRefresh) {
                    await onRefresh(); 
                  
                  }
                } catch (err) {
                  console.error("Complete subtopic failed:", err);
                  sub.completed = false;
                }
              };

useEffect(() => {
  const fetchFeedbackStatus = async () => {
    try {
      // ✅ Using the 3 parameters as requested
      if (!empid || !trainerId || !syllabusId) return;

      const res = await getSyllabusFeedbackAPI(
        empid,      // Trainee ID from session
        trainerId,  // Trainer ID from currentStep
        syllabusId  // Syllabus ID from currentStep
      );
      
      const data = res?.data || res;
      setFeedbackData(data);
    } catch (err) {
      // If 404, record doesn't exist yet, so feedbackData remains null
      setFeedbackData(null);
    }
  };

  fetchFeedbackStatus();
}, [empid, trainerId, syllabusId]);


              const confirmCompletion = async () => {
                await markSubtopicCompleted();
                setShowCompletionModal(false);

                
              onStepComplete?.(currentStep?.id);
           
              if (
                isLastSubTopic() &&
                (!feedbackData || feedbackData?.feedbackGivenTrainee === false)
              )
              {
                  setShowFeedbackModal(true);
                  return;
                }

                // otherwise directly complete
                onRefresh?.();
              
              };



                const nextSub = () => { if (sub && !sub.completed) markSubtopicCompleted(); if (currentSubIndex < subTopics.length - 1) setCurrentSubIndex(currentSubIndex + 1); else onNextStep(); };



                const prevSub = () => currentSubIndex > 0 ? setCurrentSubIndex(currentSubIndex - 1) : onPreviousStep();
                const handleCompleteStep = () => { if (completedSubs === totalSubs) onStepComplete(currentStep?.id); else setShowCompletionModal(true); };


                // const confirmCompletion = async () => {
                //   // last subtopic complete karo
                //   if (!sub?.completed) {
                //     await markSubtopicCompleted();
                //   }

                //   setShowCompletionModal(false);
                //   onStepComplete(currentStep?.id);

                //   onRefresh?.();
                // };


                if (!currentStep) return (
                  <div className="flex items-center justify-center h-full text-center text-muted-foreground">
                    <Icon name="BookOpen" size={48} className="mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Content Selected</h3>
                    <p>Select a step from the sidebar to begin learning.</p>
                  </div>
                );

                return (
                  <div className="flex flex-col h-full">
                    <div className="flex-shrink-0 bg-surface border-b border-border p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h1 className="text-2xl font-bold mb-2"> Step {currentStep?.stepNumber}: {currentStep?.title} </h1>
                          <p className="text-muted-foreground">{currentStep?.description}</p>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-2">
                            <Icon name="Clock" size={16} />
                            <span>Time: {formatTime(timeSpent)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 px-6">
                        <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                          <span>Step Progress</span>
                          <span>{calcProgress}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: `${calcProgress}%` }} />
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6">
                      <div className="max-w-4xl mx-auto">
                        {sub ? (
                          <>
                            <h2 className="text-xl font-bold">{sub.title ?? sub.name}</h2>
                            <p className="text-gray-700 whitespace-pre-line mt-2">{sub.description}</p>
                            {sub?.filePath && fileData && !fileData.error && (
                              <div className="bg-gray-50 mt-6 border rounded-xl shadow-lg p-4 max-h-[600px] ">
                                <div className="flex justify-between items-center mb-3">
                                  <h3 className="text-sm font-semibold text-gray-800">{fileData.name}</h3>
                                </div>
                                <div className="rounded-xl overflow-hidden border bg-white">
                                  {fileData.mime.startsWith("image/") ? (
                                    <img src={fileData.url} alt="Preview" className="w-full max-h-[550px] object-contain" />
                                  ) : fileData.mime === "application/pdf" ? (
                                    <PdfViewer url={fileData.url} />
                                  ) : (
                                    <div className="text-sm text-gray-500 italic p-4 text-center">Preview not available</div>
                                  )}
                                </div>
                              </div>
                            )}
                            {fileData?.error && <div className="text-red-500 mt-4">{fileData.message}</div>}
                          </>
                        ) : (
                          <div className="text-center py-20 text-muted-foreground">No subtopics available for this step.</div>
                        )}
                      </div>
                    </div>
                    <div className="flex-shrink-0 bg-surface border-t border-border p-6 mb-10">
                      <div className="flex items-end justify-between">
                        <Button variant="outline" onClick={prevSub} iconName="ChevronLeft" iconPosition="left">
                          {currentSubIndex === 0 ? "Previous Step" : "Previous Topic"}
                        </Button>
                        <div className="flex items-center space-x-3">


                          <Button
                            variant="success"
                            iconName="CheckCircle"
                            iconPosition="left"

                            // checker true hua to disable
                            disabled={sub?.managerDecision === true}

                            onClick={async () => {
                              // already approved → kuch nahi
                              if (sub?.managerDecision === true) return;

                              // last subtopic → popup
                              if (isLastSub) {
                                setShowCompletionModal(true);
                                return;
                              }

                              // normal subtopic
                              if (!sub?.completed) {
                                await markSubtopicCompleted();
                              }
                            }}
                          >
                            {sub?.managerDecision
                              ? "Approved"
                              : sub?.completed
                                ? "Completed"
                                : "Mark as Completed"}
                          </Button>




                          <Button
                            variant="default"
                            onClick={nextSub}
                            iconName="ChevronRight"
                            iconPosition="right"
                            disabled={
                              !sub?.completed ||          //  not completed
                              !sub?.managerDecision ||    //  checker false
                              isLastSubOfLastStep
                            }
                          >
                            {isLastSub ? "Next Step" : "Next Topic"}
                          </Button>

                        </div>
                      </div>
                    </div>
                    {showCompletionModal && (
                      <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="bg-card p-6 rounded-lg elevation-3 max-w-md mx-4">
                          <div className="text-center">
                            <Icon name="CheckCircle" size={48} className="text-success mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-foreground mb-2">Complete This Step?</h3>
                            <p className="text-muted-foreground mb-6">Make sure you have reviewed all subtopics before completing this step.</p>
                            <div className="flex space-x-3">
                              <Button variant="outline" onClick={() => setShowCompletionModal(false)} className="flex-1">Review More</Button>
                              <Button variant="success" onClick={confirmCompletion} className="flex-1">Complete Step</Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                  {showFeedbackModal && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="bg-card p-6 rounded-lg max-w-md w-full mx-4">
                    <div className="text-center">
                      <Icon name="CheckCircle" size={48} className="text-success mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">Feedback </h3>
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
                          onClick={() => setShowFeedbackModal(false)}
                          className="flex-1"
                          disabled={feedbackText.trim() === ""} // ❌ Cancel disabled if feedback is empty
                        >
                          Cancel
                        </Button>
              {/*         
                        <Button
                variant="success"
                onClick={() => {
                  console.log("Feedback submitted:", feedbackText);
              
                  setShowFeedbackModal(false);
              onStepComplete?.(currentStep?.id);
                  //  Yaha step complete hoga
                

                  setFeedbackText("");
                }}
                className="flex-1"
                disabled={feedbackText.trim() === ""} 
              >
                Submit
              </Button> */}
              <Button
                variant="success"
                onClick={async () => {
                  try {
                    await submitTraineeFeedbackAPI(
                      empid,
                      trainerId,          // trngid
                  trainingId  ,    // syllabusId
                      feedbackText ,
                      
                         // feedback text
                    );
                    setFeedbackData({
                feedbackGivenTrainee: true
              });


                    setShowFeedbackModal(false);
                    setFeedbackText("");

                    // Step complete trigger
                    onStepComplete?.(currentStep?.id);

                  } catch (err) {
                    console.error("Feedback submit failed:", err);
                    alert("Failed to submit feedback");
                  }
                }}
                className="flex-1"
                disabled={feedbackText.trim() === ""} 
              >
                Submit
              </Button>


                      </div>
                    </div>
                  </div>
                </div>
              )}

                  </div>
                );
              };

              export default ContentDisplay;
