import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import NavigationBreadcrumb from '../../components/ui/NavigationBreadcrumb';
import CalendarView from './components/CalendarView';
import TraineeSelectionPanel from './components/TraineeSelectionPanel';
import SchedulingForm from './components/SchedulingForm';
import ConflictDetection from './components/ConflictDetection';
import EmailNotificationPreview from './components/EmailNotificationPreview';
import InterviewStatusTracker from './components/InterviewStatusTracker';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';



import { createSchedule, fetchAllTraineeSummaryAdmin, assignTrainees, fetchAllTrainees, fetchAllTraineeSummary, fetchAllSchedules, updateInterviewSchedule, deleteInterviewSchedule, fetchTraineesByManagerId, fetchTraineeSummaryByManager } from "../../api_service";



const InterviewScheduling = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedTrainees, setSelectedTrainees] = useState([]);
  const [activeView, setActiveView] = useState('calendar');
  const [conflicts, setConflicts] = useState([]);
  const [showNotificationPreview, setShowNotificationPreview] = useState(false);
  const [trainers, setTrainers] = useState([]);
  const [trainees, setTrainees] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [formdata, setFormdata] = useState();
// Add this near your other useState declarations
const [selectedManagers, setSelectedManagers] = useState([]);
  const privilegedRoles = ["CEO", "CTO", "HR", "PM"];
  const roleName = sessionStorage.getItem("roleName");
  const isRestricted = privilegedRoles.includes(roleName);

  const mockTrainees = [
    {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah.johnson@company.com",
      progressPercentage: 85,
      lastInterviewDate: "2024-09-15",
      interviewStatus: "due",
      priority: "high"
    },
    {
      id: 2,
      name: "Michael Chen",
      email: "michael.chen@company.com",
      progressPercentage: 72,
      lastInterviewDate: "2024-09-20",
      interviewStatus: "overdue",
      priority: "high"
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      email: "emily.rodriguez@company.com",
      progressPercentage: 90,
      lastInterviewDate: "2024-10-01",
      interviewStatus: "scheduled",
      priority: "medium"
    },
    {
      id: 4,
      name: "David Kim",
      email: "david.kim@company.com",
      progressPercentage: 65,
      lastInterviewDate: "2024-08-30",
      interviewStatus: "due",
      priority: "medium"
    },
    {
      id: 5,
      name: "Lisa Thompson",
      email: "lisa.thompson@company.com",
      progressPercentage: 95,
      lastInterviewDate: "2024-10-10",
      interviewStatus: "completed",
      priority: "low"
    }
  ];

  const mockInterviewers = [
    {
      id: 1,
      name: "Dr. Robert Smith",
      title: "Senior Technical Lead",
      email: "robert.smith@company.com",
      availability: "Mon-Fri 9AM-5PM"
    },
    {
      id: 2,
      name: "Jennifer Davis",
      title: "HR Manager",
      email: "jennifer.davis@company.com",
      availability: "Mon-Thu 10AM-4PM"
    },
    {
      id: 3,
      name: "Mark Wilson",
      title: "Project Manager",
      email: "mark.wilson@company.com",
      availability: "Tue-Fri 9AM-6PM"
    }
  ];


  const mockInterviews = [
    {
      id: 1,
      traineeName: "Emily Rodriguez",
      interviewerName: "Dr. Robert Smith",
      scheduledDate: "2024-10-25",
      time: "10:00",
      duration: 60,
      type: "Technical Interview",
      location: "Conference Room A",
      status: "confirmed",
      notes: "Focus on React and JavaScript fundamentals"
    },
    {
      id: 2,
      traineeName: "Sarah Johnson",
      interviewerName: "Jennifer Davis",
      scheduledDate: "2024-10-26",
      time: "14:00",
      duration: 45,
      type: "Behavioral Interview",
      location: "Virtual Meeting",
      status: "pending",
      notes: "Assess communication and teamwork skills"
    },
    {
      id: 3,
      traineeName: "Michael Chen",
      interviewerName: "Mark Wilson",
      scheduledDate: "2024-10-24",
      time: "11:00",
      duration: 90,
      type: "Progress Review",
      location: "Conference Room B",
      status: "completed",
      notes: "Monthly progress assessment completed"
    }
  ];

  const mockConflicts = [
    {
      id: 1,
      type: "interviewer-busy",
      severity: "high",
      title: "Interviewer Unavailable",
      description: "Dr. Robert Smith has a conflicting meeting at this time",
      date: "2024-10-25",
      time: "15:00",
      affectedResources: ["Dr. Robert Smith"],
      alternatives: [
        { date: "2024-10-25", time: "16:00" },
        { date: "2024-10-26", time: "10:00" }
      ],
      canOverride: false
    },
    {
      id: 2,
      type: "room-booked",
      severity: "medium",
      title: "Room Already Booked",
      description: "Conference Room A is reserved for another meeting",
      date: "2024-10-26",
      time: "09:00",
      affectedResources: ["Conference Room A"],
      alternatives: [
        { date: "2024-10-26", time: "09:00", room: "Conference Room B" },
        { date: "2024-10-26", time: "10:00", room: "Conference Room A" }
      ],
      canOverride: true
    }
  ];

  // Handle date selection
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedTime(null);
    checkForConflicts(date, null);
  };

  // Handle time slot selection
  const handleTimeSlotSelect = (date, time) => {
    console.log('Selected Date and Time:', time);
    setSelectedDate(date);
    setSelectedTime(time);
    checkForConflicts(date, time);
  };

  // Handle trainee selection
  const handleTraineeSelect = (empid) => {
    setSelectedTrainees(prev => {
      if (prev?.includes(empid)) {
        return prev?.filter(id => id !== empid);
      } else {
        return [...prev, empid];
      }
    });
  };

  // Handle bulk trainee selection
  const handleBulkTraineeSelect = (empids) => {
    setSelectedTrainees(empids);
  };

  // Check for scheduling conflicts
  const checkForConflicts = (date, time) => {
    if (!date || !time) {
      setConflicts([]);
      return;
    }

    // Simulate conflict detection
    const dateStr = date?.toDateString();
    const foundConflicts = mockConflicts?.filter(conflict => {
      const conflictDate = new Date(conflict.date);
      return conflictDate?.toDateString() === dateStr && conflict?.time === time;
    });

    setConflicts(foundConflicts);
  };

  // const handleSchedule = async (scheduleData) => {

  //   console.log("Scheduling Data:", scheduleData);
  //   if (scheduleData.scheduleId) {
  //     console.log("Updating existing schedule with ID:", scheduleData);

  //     const updateRes = await updateInterviewSchedule(scheduleData.scheduleId, {
  //       interviewer: scheduleData.interviewer,
  //       date: scheduleData.date,
  //       time: scheduleData.time,
  //       interviewType: scheduleData.interviewType,
  //       location: scheduleData.location,
  //       subTopicIds: scheduleData.subTopicIds,
  //       duration: scheduleData.duration,
  //       notes: scheduleData.notes,
  //       trainees: scheduleData.trainees
  //     })

  //     console.log("Update Response:", updateRes);
  //     alert(" Interview Updated Successfully!");

  //     try {

  //     } catch (error) {
  //       console.error("Update Error:", error);
  //       alert(" Failed to update interview");
  //     }
  //     return;
  //   } else {
  //     alert("Creating new schedule");


  //     try {
  //       //  Create Schedule
  //       const scheduleRes = await createSchedule(scheduleData.interviewer, {
  //         date: scheduleData.date,
  //         time: scheduleData.time,
  //         interviewType: scheduleData.interviewType,
  //         location: scheduleData.location,
  //         subTopicIds: scheduleData.subTopicIds,
  //         duration: scheduleData.duration,
  //         notes: scheduleData.notes
  //       });

  //       console.log("Schedule Response:", scheduleRes);

  //       const scheduleId = scheduleRes?.data?.scheduleId;

  //       if (!scheduleId) {
  //         alert(" Schedule ID not received from backend!");
  //         console.error("Response did not contain scheduleId:", scheduleRes);
  //         return;
  //       }


  //       console.log("created Schedule ID:", scheduleData);
  //       const emailIds = [...scheduleData.trainees, scheduleData.interviewerId];
  //       console.log("Trainee Emails for Notification:", emailIds);
  //       // assign Trainees
  //       await assignTrainees(scheduleId, emailIds);

  //       alert(" Interview Scheduled Successfully!");

  //     } catch (error) {
  //       console.error("Schedule Error:", error);
  //       alert(" Failed to schedule interview");
  //     }
  //   }
  // };


  // Handle conflict resolution

  useEffect(() => {
  if (isRestricted && activeView === 'calendar') {
    setActiveView('tracker');
  }
}, [isRestricted, activeView]);

  const formatDateLocal = (date) => {
    if (!date) return null;

    // if already string, return as-is
    if (typeof date === "string") return date;

    const d = new Date(date);

    return d.getFullYear() + "-" +
      String(d.getMonth() + 1).padStart(2, "0") + "-" +
      String(d.getDate()).padStart(2, "0");
  };

  const handleSchedule = async (scheduleData) => {

    if (isRestricted) {
      alert("You are not authorized to schedule interviews.");
      return;
    }
    console.log("Scheduling Data:", scheduleData);
    console.log("fsf", formatDateLocal(scheduleData.date));

    if (scheduleData.scheduleId) {
      console.log("Updating existing schedule with ID:", scheduleData);

      // const updateRes = await updateInterviewSchedule(scheduleData.scheduleId, {
      //   interviewer: scheduleData.interviewer,
      //   date: formatDateLocal(scheduleData.date),
      //   date1: scheduleData.date,
      //   time: scheduleData.time,
      //   interviewType: scheduleData.interviewType,
      //   location: scheduleData.location,
      //   subTopicIds: scheduleData.subTopicIds,
      //   duration: scheduleData.duration,
      //   notes: scheduleData.notes,
      //   trainees: scheduleData.trainees
      // })
      const updateRes = await updateInterviewSchedule(scheduleData.scheduleId, {
        //interviewer: scheduleData.interviewerId,
        interviewer: scheduleData.interviewerIds, 
        date: formatDateLocal(scheduleData.date),
        date1: scheduleData.date,
        time: scheduleData.time,
        interviewType: scheduleData.interviewType,
        location: scheduleData.location,
        subTopicIds: scheduleData.subTopicIds,
        duration: scheduleData.duration,
        notes: scheduleData.notes,
        trainees: scheduleData.trainees
      })

      console.log("Update Response:", updateRes);
      alert(" Interview Updated Successfully!");

      try {

      } catch (error) {
        console.error("Update Error:", error);
        alert(" Failed to update interview");
      }
      return;
    } else {
      alert("Creating new schedule");


      try {
        //  Create Schedule
        const scheduleRes = await createSchedule(scheduleData.interviewerIds, {
          date: formatDateLocal(scheduleData.date),
          date1: scheduleData.date,
          time: scheduleData.time,
          interviewType: scheduleData.interviewType,
          location: scheduleData.location,
          subTopicIds: scheduleData.subTopicIds,
          duration: scheduleData.duration,
          notes: scheduleData.notes
        });

        console.log("Schedule Response:", scheduleRes);

        const scheduleId = scheduleRes?.data?.scheduleId;

        if (!scheduleId) {
          alert(" Schedule ID not received from backend!");
          console.error("Response did not contain scheduleId:", scheduleRes);
          return;
        }


        console.log("created Schedule ID:", scheduleData);
       // const emailIds = [...scheduleData.trainees, scheduleData.interviewerId];
       const emailIds = [
  ...scheduleData.trainees,
  ...scheduleData.interviewerIds   //  spread
];
        console.log("Trainee Emails for Notification:", emailIds);
        // assign Trainees
        await assignTrainees(scheduleId, emailIds);

        alert(" Interview Scheduled Successfully!");

      } catch (error) {
        console.error("Schedule Error:", error);
        alert(" Failed to schedule interview");
      }
    }
  };
  const handleResolveConflict = (conflictId, resolution) => {
    console.log('Resolving conflict:', conflictId, resolution);

    if (conflictId === 'all') {
      setConflicts([]);
    } else {
      setConflicts(prev => prev?.filter(c => c?.id !== conflictId));
    }
  };

  // Handle view alternatives
  const handleViewAlternatives = (conflict) => {
    console.log('Viewing alternatives for:', conflict);
    // This would typically open a modal or navigate to alternatives view
  };

  const handleCancelInterview = async (interviewId) => {
    if (isRestricted) {
      alert("You are not authorized to cancel interviews.");
      return;
    }
    const confirmCancel = window.confirm("Are you sure you want to cancel this interview? " + interviewId);
    if (!confirmCancel) {
      return;
    }
    try {
      const delInterviewData = await deleteInterviewSchedule(interviewId);
      console.log("Cancelled Interview ID:", interviewId);

      loadAllSchedules();
    } catch (error) {
      console.error("Cancellation Error:", error);
      alert("Failed to cancel interview.");
    }
  };
  const handleCompleteInterview = (interview) => {
    console.log('Completing interview:', interview);
    // This would mark the interview as complete in the backend
    navigate('/assessment-entry', { state: { interview } });
  }



const handleRescheduleInterview = (interviews) => {
  if (!interviews || interviews.length === 0) return;

  //  schedule common hoga sabka
  const schedule = interviews[0].interviewSchedule;

  //  ONLY TRAINEES pick karo
  const traineeIds = interviews
    .filter(i => i.roleRvsp?.toLowerCase() === 'trainee')
    .map(i => i.user?.trngid)
    .filter(Boolean);

  console.log("All Trainee IDs:", traineeIds);

  const interviewDate = schedule?.date ? new Date(schedule.date) : null;
  const interviewTime = schedule?.time ? schedule.time.slice(0, 5) : null;

  setSelectedDate(interviewDate);
  setSelectedTime(interviewTime);
  setSelectedTrainees(traineeIds);

  setFormdata({
    ...schedule,
    scheduleId: schedule?.scheduleId,
    traineeIds: traineeIds
  });

  setActiveView('calendar');
};

  const handleStatusUpdate = async (interviewId, newStatus) => {

    switch (newStatus) {
      case 'cancel':
        await handleCancelInterview(interviewId);
        break;
      case 'feedback':
        console.log("Viewing feedback for Interview ID:", interviewId);
        break;
      case 'complete':
        console.log("Marking Interview ID as complete:", interviewId);
        handleCompleteInterview(interviewId);
        break;
      default:
        break;
    }


    console.log('Updating interview status:', interviewId, newStatus);
  };

  // Handle interview details view
  const handleViewInterviewDetails = (interviewId, section = null) => {
    console.log('Viewing interview details:', interviewId, section);
    // This would navigate to interview details page or open modal
  };




  // Handle email notifications
  const handleSendNotifications = (emailData) => {
    console.log('Sending notifications:', emailData);
    setShowNotificationPreview(false);
    alert('Notifications sent successfully!');
  };

  // Handle template update
  const handleUpdateTemplate = (templateId) => {
    console.log('Updating template:', templateId);
    // This would open template editor
  };

  // Handle logout
  const handleLogout = () => {
    navigate('/');
  };

  const getSelectedTraineeData = () => {
    return mockTrainees?.filter(trainee => selectedTrainees?.includes(trainee?.id));
  };

  const getSelectedInterviewer = () => {
    return mockInterviewers?.[0]; // Default to first interviewer for demo
  };

  // const viewTabs = [
  //   { id: 'calendar', label: 'Calendar View', icon: 'Calendar' },
  //   { id: 'tracker', label: 'Status Tracker', icon: 'List' },

  // ];

  const viewTabs = isRestricted
  ? [
      { id: 'tracker', label: 'Status Tracker', icon: 'List' }
    ]
  : [
      { id: 'calendar', label: 'Calendar View', icon: 'Calendar' },
      { id: 'tracker', label: 'Status Tracker', icon: 'List' }
    ];



  const loadAllTrainers = async () => {
    try {
      const result = await fetchAllTrainees();
      console.log("TRAINERS API RESULT:", result); // 
      setTrainers(result.data);
    } catch (error) {
      console.error("Failed to load trainers:", error);
    }
  };


  // const loadAllTrainees = async () => {
  //   try {
  //     const managerId = sessionStorage.getItem("userId");
  //     const result = await fetchTraineeSummaryByManager(managerId); // Use your API
  //     console.log("Trainee API Result:", result);

  //     if (!result?.data) {
  //       setTrainees([]);
  //       return;
  //     }

  //     // Map API response to format suitable for TraineeSelectionPanel
  //     const formatted = result.data.map(t => ({
  //       id: t.traineeId,
  //       name: t.name,
  //       email: t.email,
  //       progressPercentage: t.completionPercentage || 0,
  //       lastInterviewDate: t.lastAssessmentDate !== "N/A" ? t.lastAssessmentDate : null,
  //       interviewStatus: t.interviewStatus === null ? "due" : (t.interviewStatus ? "completed" : "due"),
  //       lastAssessmentScore: t.lastAssessmentScore || 0
  //     }));

  //     console.log("Formatted Trainees:", formatted);
  //     setTrainees(formatted);

  //   } catch (error) {
  //     console.error("Failed to load trainees:", error);
  //     setTrainees([]);
  //   }
  // };

  const loadAllTrainees = async () => {
    try {
      const roleName = sessionStorage.getItem("roleName");
      const userId = sessionStorage.getItem("userId");

      let result;

      //  Role based API call
      if (privilegedRoles.includes(roleName)) {
        // CEO case
        result = await fetchAllTraineeSummaryAdmin();
      } else {
        // Manager case
        if (!userId) {
          console.warn("UserId not found in session");
          setTrainees([]);
          return;
        }
        result = await fetchTraineeSummaryByManager(userId);
      }

      console.log("Trainee API Result:", result);

      if (!result?.data) {
        setTrainees([]);
        return;
      }

      //  Map API response
      const formatted = result.data.map(t => ({
        id: t.traineeId,
        
        name: t.name,
        email: t.email,
        progressPercentage: t.completionPercentage || 0,
        lastInterviewDate:
          t.lastAssessmentDate && t.lastAssessmentDate !== "N/A"
            ? t.lastAssessmentDate
            : null,
        interviewStatus:
          t.interviewStatus === null
            ? "due"
            : t.interviewStatus
              ? "completed"
              : "due",
        lastAssessmentScore: t.lastAssessmentScore || 0
      }));

      console.log("Formatted Trainees:", formatted);
      setTrainees(formatted);

    } catch (error) {
      console.error("Failed to load trainees:", error);
      setTrainees([]);
    }
  };

  const loadAllSchedules = async () => {
    try {
      const result = await fetchAllSchedules();
      console.log("SCHEDULES API RESULT:", result);

      const transformedSchedules = Object.values(result.data).map(item => {
        return {
          id: item.interviewSchedule?.scheduleId,
          traineeName: item.user?.firstname || "Trainee",
          interviewerName: item.interviewSchedule?.trainer?.name || "N/A",
          scheduledDate: item.interviewSchedule?.date,
          time: item.interviewSchedule?.time,
          duration: item.interviewSchedule?.duration,
          type: item.interviewSchedule?.interviewType,
          location: item.interviewSchedule?.location,
          status: item.rsvpStatus || "PENDING",
          notes: item.interviewSchedule?.notes || ""
        };
      });

      console.log("Transformed Schedules:", result.data);
      setSchedules(result.data);
    } catch (error) {
      console.error("Failed to load schedules:", error);
    }
  };


//   const loadAllSchedules = async () => {
//   try {
//     const result = await fetchAllSchedules();
//     const rawData = result.data;

//     // 1. Grouping by scheduleId
//     const groupedSchedules = rawData.reduce((acc, curr) => {
//       const sId = curr.interviewSchedule.scheduleId;
//       if (!acc[sId]) {
//         acc[sId] = {
//           interviewSchedule: curr.interviewSchedule,
//           trainees: [],
//           managers: curr.interviewSchedule.managers || []
//         };
//       }
//       // Agar role TRAINEE hai toh list mein daalo
//       if (curr.roleRvsp === "TRAINEE") {
//         acc[sId].trainees.push(curr.user);
//       }
//       return acc;
//     }, {});

//     const finalSchedules = Object.values(groupedSchedules);
//     console.log("Transformed Grouped Schedules:", finalSchedules);
//     setSchedules(finalSchedules); // Ab yahan aggregated data hai
//   } catch (error) {
//     console.error("Failed to load schedules:", error);
//   }
// };

  useEffect(() => {
    loadAllTrainers();
    loadAllTrainees();
    loadAllSchedules();
    // console.log("Selected Trainees:", selectedTrainees);
  }, []);



  return (
    <div className="min-h-screen bg-background">
      <Header

        userName={sessionStorage.getItem("userName") || "User"}
        userRole="manager"
        onLogout={handleLogout}
      />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Breadcrumb */}
          <NavigationBreadcrumb userRole="manager" className="mb-6" />

          {/* Page Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-card-foreground">Interview Scheduling</h1>
              <p className="text-card-foreground mt-2">
                Automate monthly interview coordination with conflict detection and notification management
              </p>
            </div>

            <div className="flex items-center space-x-3">

            </div>
          </div>

          {/* View Tabs */}
          <div className="flex items-center space-x-1 mb-6 border-b border-border">
            {viewTabs?.map(tab => (
              <button
                key={tab?.id}
                onClick={() => setActiveView(tab?.id)}
                className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors duration-150 ${activeView === tab?.id
                  ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-card-foreground'
                  }`}
              >
                <Icon name={tab?.icon} size={16} />
                <span>{tab?.label}</span>
                {tab?.badge > 0 && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-error text-error-foreground rounded-full">
                    {tab?.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Main Content */}
          {activeView === 'calendar' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Calendar and Scheduling Form */}
              <div className="lg:col-span-2 space-y-6">
                <CalendarView
                  selectedDate={selectedDate}
                  selectedTime={selectedTime}
                  onDateSelect={handleDateSelect}
                  interviews={schedules}
                  onTimeSlotSelect={handleTimeSlotSelect}
                  conflicts={conflicts}
                />

                {!isRestricted && (
                  <SchedulingForm
                    selectedDate={selectedDate}
                    selectedTime={selectedTime}
                    selectedTrainees={selectedTrainees}
                    interviewers={trainers}
                    Formdata={formdata}
                    onSchedule={handleSchedule}
                    onCancel={() => {
                      setSelectedDate(null);
                      setSelectedTime(null);
                      setSelectedTrainees([]);
                    }}
                    conflicts={conflicts}
                  />
                )}
              </div>

              {/* Trainee Selection Panel */}
              <div className="space-y-6">
                {/* 
                <TraineeSelectionPanel
                  trainees={trainees}
                  selectedTrainees={selectedTrainees}
                  onTraineeSelect={handleTraineeSelect}
                  onBulkSelect={handleBulkTraineeSelect}
                /> */}
                <TraineeSelectionPanel
                  trainees={trainees}
                  selectedTrainees={selectedTrainees}
                  onTraineeSelect={!isRestricted ? handleTraineeSelect : () => { }}
                  onBulkSelect={!isRestricted ? handleBulkTraineeSelect : () => { }}
                />
                {conflicts?.length > 0 && (
                  <ConflictDetection
                    conflicts={conflicts}
                    onResolveConflict={handleResolveConflict}
                    onViewAlternatives={handleViewAlternatives}
                  />
                )}
              </div>
            </div>
          )}

          {activeView === 'tracker' && (
            <InterviewStatusTracker
              interviews={schedules}
              onStatusUpdate={handleStatusUpdate}
              onViewDetails={handleViewInterviewDetails}
              onReschedule={handleRescheduleInterview}
            // onComplete={handleCompleteInterview}
            />
          )}

          {activeView === 'conflicts' && (
            <div className="max-w-4xl">
              <ConflictDetection
                conflicts={conflicts}
                onResolveConflict={handleResolveConflict}
                onViewAlternatives={handleViewAlternatives}
              />

              {conflicts?.length === 0 && (
                <div className="bg-card rounded-lg border border-border p-8 text-center">
                  <Icon name="CheckCircle" size={48} className="text-success mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Conflicts Detected</h3>
                  <p className="text-muted-foreground">
                    All scheduled interviews are conflict-free and ready to proceed.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Email Notification Preview Modal */}
          {showNotificationPreview && (
            <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
              <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-border flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-foreground">Email Notification Preview</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowNotificationPreview(false)}
                    iconName="X"
                    iconSize={20}
                  >
                  </Button>
                </div>
                <EmailNotificationPreview
                  interviewDetails={{
                    date: selectedDate,
                    time: selectedTime,
                    interviewType: 'Technical Interview',
                    duration: 60,
                    location: 'Conference Room A',
                    meetingLink: 'https://meet.google.com/abc-defg-hij',
                    notes: 'Please prepare for technical assessment'
                  }}
                  trainees={getSelectedTraineeData()}
                  interviewer={getSelectedInterviewer()}
                  onSendNotifications={handleSendNotifications}
                  onUpdateTemplate={handleUpdateTemplate}
                  className="border-0"
                />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default InterviewScheduling;