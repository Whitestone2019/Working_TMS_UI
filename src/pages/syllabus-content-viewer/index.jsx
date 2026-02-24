import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../../components/ui/Header';
import SecureContentWrapper from '../../components/ui/SecureContentWrapper';
import SessionTimeoutHandler from '../../components/ui/SessionTimeoutHandler';
import NavigationBreadcrumb from '../../components/ui/NavigationBreadcrumb';
import StepNavigationSidebar from './components/StepNavigationSidebar';
import ContentDisplay from './components/ContentDisplay';
import SecurityWatermark from './components/SecurityWatermark';
import ProgressTracker from './components/ProgressTracker';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { updateStepProgress, fetchUserByEmpId, fetchSyllabusProgressByEmpId } from '../../api_service';

const SyllabusContentViewer = () => {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [currentStepId, setCurrentStepId] = useState(null);
  const [sessionActive, setSessionActive] = useState(true);
  const [showProgressTracker, setShowProgressTracker] = useState(false);
  const [syllabusSteps, setSyllabusSteps] = useState([]);
  const [traineeInfo, setTraineeInfo] = useState({});
  const [loading, setLoading] = useState(true);
  const [subTopicIndex, setSubTopicIndex] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);


  const { state } = useLocation();
  const stepNumber = state || 1;

  const currentStep = syllabusSteps?.find((step) => step?.id === currentStepId);
  // console.log("Current Step:", currentStepId);
  const currentStepIndex = syllabusSteps?.findIndex((step) => step?.id === currentStepId);
  const completedSteps = syllabusSteps?.filter((step) => step?.isCompleted)?.length;
  const [timeSpent, setTimeSpent] = useState(currentStep?.durationSeconds || 0);
  const contentRef = useRef(null);

  const empid = sessionStorage.getItem("empid");

  useEffect(() => { setSubTopicIndex(0); }, [currentStepId]);

  useEffect(() => {
    const loadTraineeInfo = async () => {
      try {
        const empId = sessionStorage.getItem("empid");
        const user = await fetchUserByEmpId(empId);
        if (user) {
          setTraineeInfo({
            name: `${user.firstname} ${user.lastname}`,
            id: user.empid,
            email: user.email,
            program: user.designation || "Training Program",
            startDate: user.createdAt || "2024-10-01",
          });
        }
      } catch (err) {
        console.error("Failed to load trainee info", err);
      }
    };
    loadTraineeInfo();
  }, []);

 
useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      const empid = sessionStorage.getItem("empid");
      if (!empid) return;

      // Fetch progress from API
      const response = await fetchSyllabusProgressByEmpId(empid);
      const apiData = response?.data || response;

      console.log("Raw API Response:", apiData);

      const formattedSteps = apiData.map((item, index, arr) => {
        // 🔹 Check if all subtopics in this syllabus are completed AND approved by manager
        const isStepCompleted = item?.subTopics?.every(sub =>
          sub?.stepProgress?.some(p => p.complete === true && p.checker === true)
        );

        // 🔹 Check if the previous syllabus was fully completed to handle locking logic
        const prevStepCompleted =
          index === 0
            ? true
            : arr[index - 1]?.subTopics?.every(sub =>
                sub?.stepProgress?.some(p => p.complete === true && p.checker === true)
              );

        return {
          id: item?.syllabusId,         // For React navigation
          syllabusId: item?.syllabusId, // Explicit API syllabusId
          stepNumber: index + 1,
          title: item?.title || `Step ${index + 1}`,
          description: item?.topic || "",
          trainer: item?.trainer
            ? {
                id: item.trainer.trainerId,
                name: item.trainer.name,
                email: item.trainer.email,
              }
            : null,
          isLocked: !prevStepCompleted,
          isCompleted: isStepCompleted,
          progress: item?.subTopics?.length
            ? Math.round(
                (item.subTopics.filter(sub =>
                  sub.stepProgress?.some(p => p.complete === true && p.checker === true)
                ).length / item.subTopics.length) * 100
              )
            : 0,
          topics: [
            {
              title: item?.topic,
              subTopics: item?.subTopics?.map(sub => ({
                id: sub?.subTopicId,       // Subtopic ID for React UI
                subTopicId: sub?.subTopicId, // Explicit subtopicId from API
                title: sub?.name,
                name: sub?.name,
                description: sub?.description,
                filePath: sub?.filePath,
                stepNumber: sub?.stepNumber,
                completed: sub?.stepProgress?.some(p => p.complete === true),
                managerDecision: sub?.stepProgress?.some(p => p.checker === true),
                review: sub?.stepProgress?.[0]?.review || null,
              })) || [],
            },
          ],
        };
      });

      console.log("Formatted Steps with Syllabus IDs:", formattedSteps);

      setSyllabusSteps(formattedSteps);

      // Set initial current step safely
      if (formattedSteps.length > 0) {
        const activeStep = formattedSteps[stepNumber - 1] || formattedSteps[0];
        setCurrentStepId(activeStep.id);
        console.log("Initial Active Syllabus ID:", activeStep.syllabusId);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching syllabus data:", error);
      setLoading(false);
    }
  };

  fetchData();
}, [empid, refreshKey]);


  const handleContextMenu = (e) => { e?.preventDefault(); return false; };
  const handleSelectStart = (e) => { e?.preventDefault(); return false; };
  const handleKeyDown = (e) => {
    if (e?.ctrlKey && (e?.key === 's' || e?.key === 'p' || e?.key === 'c' || e?.key === 'a') || e?.key === 'F12' || e?.key === 'PrintScreen') {
      e?.preventDefault(); return false;
    }
  };


  const handleStepSelect = (stepId) => {
    const step = syllabusSteps?.find((s) => s?.id === stepId);
    if (step && !step?.isLocked) setCurrentStepId(stepId);
  };



  const handleCompleteStep = (stepId) => {
    setSyllabusSteps(prevSteps => prevSteps.map((step, index) => {
      if (step.id === stepId) {
        const stepCompleted = step.topics[0]?.subTopics?.every(sub => sub.managerDecision) ?? false;

        return {
          ...step,
          isCompleted: stepCompleted,
          progress: stepCompleted ? 100 : 0,
          completedAt: stepCompleted ? new Date().toISOString() : null,
        };
      }

      // Only unlock the next step if current step is actually completed
      const prevIndex = prevSteps.findIndex(s => s.id === stepId);
      if (index === prevIndex + 1 && prevSteps[prevIndex].topics[0]?.subTopics?.every(sub => sub.managerDecision)) {
        return { ...step, isLocked: false };
      }

      return step;
    }));
  };



  const handleNextStep = () => {
    if (currentStepIndex < syllabusSteps?.length - 1) {
      const nextStep = syllabusSteps?.[currentStepIndex + 1];
      if (!nextStep?.isLocked) setCurrentStepId(nextStep?.id);
    }
  };

  const handlePreviousStep = () => {
    if (currentStepIndex > 0) setCurrentStepId(syllabusSteps?.[currentStepIndex - 1]?.id);
  };

  const canGoNext = currentStepIndex < syllabusSteps?.length - 1 && !syllabusSteps?.[currentStepIndex + 1]?.isLocked;
  const canGoPrevious = currentStepIndex > 0;

  const handleSessionExpired = () => { setSessionActive(false); navigate('/trainee-dashboard'); };
  const handleLogout = () => { navigate('/trainee-dashboard'); };

  if (!sessionActive) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center p-8 bg-card rounded-lg elevation-2 max-w-md">
          <Icon name="Shield" size={48} className="text-warning mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Session Expired</h2>
          <p className="text-muted-foreground mb-4"> Your secure learning session has expired. Please return to your dashboard. </p>
          <Button variant="default" onClick={() => navigate('/trainee-dashboard')} iconName="ArrowLeft" iconPosition="left">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header userRole="trainee" userName={traineeInfo?.name} onLogout={handleLogout} />
      <div className="pt-16 flex h-screen">
        <StepNavigationSidebar steps={syllabusSteps} currentStepId={currentStepId} onStepSelect={handleStepSelect} isCollapsed={isSidebarCollapsed} onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="bg-surface border-b border-border px-6 py-3">
            <NavigationBreadcrumb userRole="trainee" />
          </div>
          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 overflow-hidden" ref={contentRef}>
              <ContentDisplay currentStep={currentStep} traineeInfo={traineeInfo} onStepComplete={handleCompleteStep} onNextStep={handleNextStep} onPreviousStep={handlePreviousStep} canGoNext={canGoNext} canGoPrevious={canGoPrevious}  />
            </div>
            {showProgressTracker && <div className="w-80 border-l border-border overflow-y-auto">
              <ProgressTracker currentStep={currentStep} totalSteps={syllabusSteps?.length} completedSteps={completedSteps} timeSpent={45} estimatedTimeRemaining={180} className="m-4" />
            </div>}
          </div>
        </div>
        <Button variant="default" size="icon" onClick={() => setShowProgressTracker(!showProgressTracker)} className="fixed bottom-6 right-6 z-40 h-12 w-12 rounded-full elevation-2" iconName={showProgressTracker ? "X" : "BarChart3"} iconSize={20} title={showProgressTracker ? "Hide Progress" : "Show Progress"} />
      </div>
      <div className="fixed bottom-4 left-4 bg-card border border-border rounded-lg p-3 text-xs z-30 max-w-xs">
        <div className="flex items-center space-x-2">
          <Icon name="Shield" size={14} className="text-warning" />
          <span className="text-muted-foreground">This content is protected and monitored for security.</span>
        </div>
      </div>
    </div>
  );
};

export default SyllabusContentViewer;