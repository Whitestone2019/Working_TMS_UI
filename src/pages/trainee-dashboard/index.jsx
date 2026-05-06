import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import NavigationBreadcrumb from '../../components/ui/NavigationBreadcrumb';
import SessionTimeoutHandler from '../../components/ui/SessionTimeoutHandler';
import ProgressTracker from '././components/ProgressTracker';
import CurrentStepContent from './components/CurrentStepContent';
import AssessmentHistory from './components/AssessmentHistory';
import InterviewSchedule from './components/InterviewSchedule';
import QuickActions from './components/QuickActions';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { fetchAssessmentsByTrainee } from '../../api_service';
import { fetchUserByEmpId } from "../../api_service";
import { fetchInterviewScheduleByEmpId, fetchSyllabusProgressByEmpId, fetchAllDelays, fetchTraineeDelays } from "../../api_service"

const TraineeDashboard = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(2);
  const [completedSteps, setCompletedSteps] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [syllabus, setSyllabus] = useState([]);
  const [stepsStatus, setStepsStatus] = useState([]);
  const [overall, setOverall] = useState(0);
  const [assessments, setAssessments] = useState([]);
  const [traineeInfo, setTraineeInfo] = useState(null);
  const [interviews, setInterviews] = useState([]);

  const [loading, setLoading] = useState(false);
  const [syllabusProgress, setSyllabusProgress] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [delayNotifications, setDelayNotifications] = useState([]);

  const [delays, setDelays] = useState([]);


  useEffect(() => {
    const loadTraineeInfo = async () => {
      try {
        const empId = sessionStorage.getItem("empid");

        const user = await fetchUserByEmpId(empId);
        console.log("Fetched trainee info:", user);
        if (user) {
          setTraineeInfo({
            name: `${user.firstname} ${user.lastname}`,
            id: user.trngid,
            email: user.email,
            program: user.designation || "Training Program",
            startDate: user.createdAt || "2024-10-01", // or whatever
          });
        }
      } catch (err) {
        console.error("Failed to load trainee info", err);
      }
    };

    loadTraineeInfo();
  }, []);




  useEffect(() => {
    const loadData = async () => {
      try {
        const empId = sessionStorage.getItem("empid");

        // Interview schedule API call
        const response = await fetchInterviewScheduleByEmpId(empId);

        console.log("Fetched interview schedule response:", response);
        if (response?.data) {



          const cleanData = response.data.map(item => {
            const schedule = item.interviewSchedule;
            const trainee = item.user;
            const trainer = schedule?.trainer;
            const interviewer = item?.interviewSchedule?.managerId;
            return {
              id: item.id,
              scheduleId: schedule?.scheduleId,
              date: schedule?.date,
              time: schedule?.time,
              interviewType: schedule?.interviewType,
              location: schedule?.location,
              duration: schedule?.duration,
              notes: schedule?.notes,
              meetingLink: schedule?.meetingLink,
              subTopics: schedule?.subTopics,
              interviewerName: interviewer?.firstname + " " + interviewer?.lastname,
              interviewerEmail: interviewer?.emailid,
              eventId: item?.eventId,
              rsvpStatus: item?.rsvpStatus?.trim(),
            };
          })
            .sort((a, b) => new Date(b.date) - new Date(a.date));

          console.log("Loaded interviews:", cleanData);
          setInterviews(cleanData);
        }

      } catch (err) {
        console.error("Error loading dashboard:", err);
      }
    };

    loadData();
  }, [refreshKey]);


  useEffect(() => {
    const loadTraineeData = async () => {
      try {
        const empId = sessionStorage.getItem("empid");
        if (!empId) return;

        //  Fetch assessments
        const assessmentRes = await fetchAssessmentsByTrainee(empId);
        const list = Array.isArray(assessmentRes.data) ? assessmentRes.data : [];

        const normalized = list.map((a, index) => ({
          id: a.assessmentId,
          week: index + 1, // Because API does not provide week number
          date: a.assessmentDate,
          step: a.assessmentType || "Weekly Assessment",

          marks: Number(a.marks),
          maxMarks: Number(a.maxMarks),
          grade:
            Number(a.marks) >= 85
              ? "A"
              : Number(a.marks) >= 70
                ? "B"
                : Number(a.marks) >= 55
                  ? "C"
                  : "D",

          // Manager name from user object
          managerName: `${a.user.firstname} ${a.user.lastname}`,

          managerAvatar:
            "https://ui-avatars.com/api/?background=random&name=" +
            encodeURIComponent(`${a.user.firstname} ${a.user.lastname}`),

          managerAvatarAlt: `Avatar of ${a.user.firstname} ${a.user.lastname}`,

          remarks: a.remarks,
          feedback: a.recommendations,
          submittedAt: a.submittedAt,

          status: Number(a.currentStep) >= 1 ? "completed" : "pending"
        }))
          .sort((a, b) => new Date(b.date) - new Date(a.date));

        setAssessments(normalized);

      } catch (err) {
        console.error("Error loading trainee dashboard data:", err);
      }
    };

    loadTraineeData();
  }, [refreshKey]);

  useEffect(() => {
    const empId = sessionStorage.getItem("empid");
    if (!empId) return;

    const loadDelays = async () => {
      try {
        const response = await fetchTraineeDelays(empId);
        const list = Array.isArray(response.data) ? response.data : [];
        setDelays(list);
      } catch (err) {
        console.error("Failed to fetch delays:", err);
      }
    };

    loadDelays();

    // Optional: auto-refresh every 1 minute
    const interval = setInterval(loadDelays, 60000);
    return () => clearInterval(interval);

  }, []);

  useEffect(() => {
    if (!delays || delays.length === 0) {
      setDelayNotifications([]);
      return;
    }

    const delayedItems = delays.filter(item => item.delayDays > 0);

    setDelayNotifications(delayedItems);

  }, [delays]);

  // Mock authentication check
  useEffect(() => {
    const checkAuth = async () => {
      // Simulate auth check
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const handleStepComplete = (stepNumber) => {
    if (stepNumber === currentStep) {
      setCompletedSteps(prev => Math.max(prev, stepNumber));
      setCurrentStep(prev => Math.min(prev + 1, 8));
    }
  };

  const handleStepClick = (stepNumber) => {
    if (stepNumber <= completedSteps + 1) {
      setCurrentStep(stepNumber);
    }
  };

  const handleLogout = () => {
    // Clear session data
    localStorage.removeItem('authToken');

    sessionStorage.clear();
    navigate('/');
  };

  const handleSessionExpired = () => {
    handleLogout();
  };


  const empid = sessionStorage.getItem("empid");
  //   useEffect(() => {
  //     const fetchData = async () => {
  //       try {
  //         setLoading(true);
  //         const result = await fetchSyllabusProgressByEmpId(empid);

  //         const apiData = result?.data || result || [];

  //         const sortedData = [...apiData].sort((a, b) => {
  //           const dateA = new Date(a?.createdDate || 0);
  //           const dateB = new Date(b?.createdDate || 0);
  //           return dateA - dateB;
  //         });
  //         setSyllabusProgress(sortedData);
  //         // ✅ Extract only departmentIds
  // const departmentIds = sortedData.flatMap(item =>
  //   (item.departments || []).map(dep => dep.departmentId)
  // );

  // // ✅ Make distinct
  // const uniqueDepartmentIds = [...new Set(departmentIds)];

  // // ✅ Store in sessionStorage
  // sessionStorage.setItem("departmentIds", JSON.stringify(uniqueDepartmentIds));

  // console.log("Stored Department IDs:", uniqueDepartmentIds);

  //         const formattedSteps = sortedData.map((item, index, arr) => {
  //           //  current step completed
  //           const isCompleted = item?.subTopics?.every(sub =>
  //             sub?.stepProgress?.some(p => p.complete === true && p.checker === true)
  //           );


  //           //  previous step completed
  //           const prevCompleted =
  //             index === 0
  //               ? true
  //               : arr[index - 1]?.subTopics?.every(sub =>
  //                 sub?.stepProgress?.some(
  //                   p => p.complete === true && p.checker === true
  //                 )
  //               );

  //           return {
  //             stepNumber: index + 1,
  //             title: item?.title || `Step ${index + 1}`,
  //             description: item?.topic || '',
  //             completed: isCompleted,
  //             locked: !prevCompleted
  //           };
  //         });

  //         console.log("Formatted steps status:", formattedSteps);


  //         setStepsStatus(formattedSteps);

  //         const totalSteps = stepsStatus.length;
  //         const completedSteps = stepsStatus.filter(s => s.completed).length;

  //         const progressPercentage =
  //           totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;
  //         setOverall(progressPercentage.toFixed(0));
  //         setLoading(false);
  //       } catch (err) {
  //         console.error(err);
  //         setLoading(false);
  //       }
  //     };

  //     if (empid) fetchData();
  //   }, [empid, refreshKey]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await fetchSyllabusProgressByEmpId(empid);

        const apiData = result?.data || result || [];

        const sortedData = [...apiData].sort((a, b) => {
          const dateA = new Date(a?.createdDate || 0);
          const dateB = new Date(b?.createdDate || 0);
          return dateA - dateB;
        });
        setSyllabusProgress(sortedData);
        //  Extract only departmentIds
        const departmentIds = sortedData.flatMap(item =>
          (item.departments || []).map(dep => dep.departmentId)
        );

        //  Make distinct
        const uniqueDepartmentIds = [...new Set(departmentIds)];

        //  Store in sessionStorage
        sessionStorage.setItem("departmentIds", JSON.stringify(uniqueDepartmentIds));

        console.log("Stored Department IDs:", uniqueDepartmentIds);

        //  Extract all trainers
        const allTrainers = sortedData.flatMap(item => item.trainers || []);

        //  Remove duplicates based on trainerId
        const uniqueTrainers = Object.values(
          allTrainers.reduce((acc, trainer) => {
            if (!acc[trainer.trainerId]) {
              acc[trainer.trainerId] = trainer; // store full object
            }
            return acc;
          }, {})
        );

        //  Store in sessionStorage
        sessionStorage.setItem("trainers", JSON.stringify(uniqueTrainers));

        console.log("Stored Unique Trainers:", uniqueTrainers);

        const formattedSteps = sortedData.map((item, index, arr) => {
          //  current step completed
          const isCompleted = item?.subTopics?.every(sub =>
            sub?.stepProgress?.some(p => p.complete === true && p.checker === true)
          );


          //  previous step completed
          const prevCompleted =
            index === 0
              ? true
              : arr[index - 1]?.subTopics?.every(sub =>
                sub?.stepProgress?.some(
                  p => p.complete === true && p.checker === true
                )
              );

          return {
            stepNumber: index + 1,
            title: item?.title || `Step ${index + 1}`,
            description: item?.topic || '',
            completed: isCompleted,
            locked: !prevCompleted
          };
        });

        console.log("Formatted steps status:", formattedSteps);


        setStepsStatus(formattedSteps);

        const totalSteps = stepsStatus.length;
        const completedSteps = stepsStatus.filter(s => s.completed).length;

        const progressPercentage =
          totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;
        setOverall(progressPercentage.toFixed(0));
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    if (empid) fetchData();
  }, [empid, refreshKey]);
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Session Management */}
      <SessionTimeoutHandler
        sessionDuration={30}
        warningTime={5}
        onSessionExpired={handleSessionExpired}
        onSessionExtended={() => { }}
        isActive={true}
      />
      {/* Header */}
      <Header
        userRole="trainee"
        userName={traineeInfo?.name}
        onLogout={handleLogout}
      />


      {/* Main Content */}
      <main className="pt-16">
        {delayNotifications.length > 0 && (
          <div className="max-w-7xl mx-auto px-6 mt-4">
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg shadow-sm">
              ⚠️ You have {delayNotifications.length} delayed syllabus pending.
            </div>
          </div>
        )}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Breadcrumb Navigation */}
          <NavigationBreadcrumb
            userRole="trainee"
            showHomeIcon={true}
            className="mb-6"
          />

          {/* Welcome Section */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-6 border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-black mb-2">
                    Welcome back, {traineeInfo?.name}!
                  </h1>
                  <p className="text-muted-foreground">
                    Continue your learning journey in the {traineeInfo?.program}
                  </p>
                  <div className="flex items-center space-x-4 mt-3 text-sm text-muted-foreground">
                    <span className="flex items-center">
                      <Icon name="Calendar" size={14} className="mr-1" />
                      Started: {
                        traineeInfo?.startDate
                          ? new Date(traineeInfo.startDate).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                          })
                          : "Not Available"
                      }

                    </span>
                    <span className="flex items-center">
                      <Icon name="User" size={14} className="mr-1" />
                      ID: {traineeInfo?.id}
                    </span>
                  </div>
                </div>
                <div className="hidden md:block">
                  <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center">
                    <Icon name="GraduationCap" size={40} color="white" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <div className="xl:col-span-2 space-y-8">

              <ProgressTracker
                stepsStatus={stepsStatus}
                onStepClick={(stepId) => {
                  console.log('Clicked step:', stepId);
                }}
              />



              {/* Assessment History */}
              <AssessmentHistory
                assessments={assessments}
                syllabus={syllabusProgress} />
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-8">

              {/* Interview Schedule */}
              <InterviewSchedule interviews={interviews} />

              {/* Progress Summary Card */}
              <div className="bg-card rounded-lg border border-border p-6">
                <h3 className="text-lg font-semibold text-black mb-4 flex items-center">
                  <Icon name="Target" size={20} className="mr-2 text-primary" />
                  Progress Summary
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Steps Completed</span>
                    <span className="font-medium text-black">{stepsStatus.filter(item => item.locked === false).length - 1}/{stepsStatus.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Current Step</span>
                    <span className="font-medium text-black">Step {stepsStatus.filter(item => item.completed === false)[0]?.title}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Overall Progress</span>
                    <span className="font-medium text-primary">{overall}%
                    </span>
                  </div>
                  <div className="pt-4 border-t border-border">
                    <Button
                      variant="default"
                      size="sm"
                      iconName="TrendingUp"
                      iconPosition="left"
                      iconSize={14}
                      fullWidth
                      onClick={() => navigate('/syllabus-content-viewer')}
                    >
                      View Detailed Content
                    </Button>
                  </div>
                </div>
              </div>


            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TraineeDashboard;