

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import NavigationBreadcrumb from '../../components/ui/NavigationBreadcrumb';
import TraineeMetricsPanel from './components/TraineeMetricsPanel';
import FilterToolbar from './components/FilterToolbar';
import TraineeDataTable from './components/TraineeDataTable';
import AssessmentEntryModal from './components/AssessmentEntryModal';
import TraineeSyllabusPage from './components/TraineeSyllabusPage';
import { fetchAllTraineeSummaryAdmin, fetchCompletedSubTopics, fetchTraineeSummaryByManager,fetchManagerDelays } from '../../api_service';
const ManagerDashboard = () => {
  const navigate = useNavigate();
  const [selectedTrainees, setSelectedTrainees] = useState([]);
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [selectedTraineeForAssessment, setSelectedTraineeForAssessment] = useState(null);
  const [traineeInfo, setTraineeInfo] = useState(null);
const [selectedTraineeId, setSelectedTraineeId] = useState(null);
const [showDelayBox, setShowDelayBox] = useState(true);


  const [syllabusOptions, setSyllabusOptions] = useState([
    { value: 'all', label: 'All Syllabus' }
  ]);

  const privilegedRoles = ["CEO", "CTO", "HR"];

  const [filters, setFilters] = useState({
    searchName: '',
    syllabusId: 'all',
    syllabusStep: 'all',
    completionStatus: 'all',
    dateFrom: '',
    dateTo: ''
  });

  const [trainees, setTrainees] = useState([]);
  const [filteredTrainees, setFilteredTrainees] = useState([]);
  const [delayNotifications, setDelayNotifications] = useState([]);

  useEffect(() => {
    fetchTrainees();
    fetchAllSyllabus();
  }, []);


const fetchTrainees = async () => {
  try {
    const roleName = sessionStorage.getItem("roleName");
    const userId = sessionStorage.getItem("userId");

    if (!roleName) {
      console.warn("Role not found in session");
      return;
    }

    let response;

    //  Role based API call
    if (privilegedRoles.includes(roleName)) {
      response = await fetchAllTraineeSummaryAdmin();
    } else {
      if (!userId) {
        console.warn("UserId not found in session");
        return;
      }
      response = await fetchTraineeSummaryByManager(userId);
    }

    const traineeList = Array.isArray(response?.data) ? response.data : [];

    const transformedList = traineeList.map((trainee) => {
      const subtopics = [];
      let lastSubTopicName = "Not Started";
      let lastStepNumber = -1;

      trainee?.syllabusProgress?.forEach((syllabus) => {
        syllabus?.subTopics?.forEach((sub) => {
          subtopics.push(sub.name);

          const isCompleted = sub?.stepProgress?.some(
            (sp) => sp?.complete === true
          );

          if (isCompleted && sub.stepNumber > lastStepNumber) {
            lastStepNumber = sub.stepNumber;
            lastSubTopicName = sub.name;
          }
        });
      });

      return {
        ...trainee,
        subtopics,
        currentStep: lastSubTopicName,
      };
    });

    setTrainees(transformedList);
    setFilteredTrainees(transformedList);

  } catch (err) {
    console.error("Error fetching trainee summary:", err);
    setTrainees([]);
    setFilteredTrainees([]);
  }
};



  const fetchAllSyllabus = async () => {
    try {
      const res = await fetchCompletedSubTopics();
      const list = res?.data || [];

      const options = [
        { value: 'all', label: 'All Steps', stepNo: 0 }
      ];

      list.forEach((item, index) => {
        options.push({
          value: item.syllabusId,           // backend value
          stepNo: index + 1,                 // static step
          label: `Step ${index + 1} : ${item.title}`
        });
      });

      // sort by stepNo
      options.sort((a, b) => a.stepNo - b.stepNo);

      setSyllabusOptions(options);
    } catch (e) {
      console.error('Error fetching syllabus', e);
    }
  };


  const metrics = {
    totalTrainees: trainees?.length,
    avgCompletion: Math.round(trainees?.reduce((sum, t) => sum + t?.completionPercentage, 0) / trainees?.length),
    pendingAssessments: trainees?.filter(t => {
      const lastAssessment = new Date(t.lastAssessmentDate);
      const weekAgo = new Date();
      weekAgo?.setDate(weekAgo?.getDate() - 7);
      return lastAssessment < weekAgo;
    })?.length,
    upcomingInterviews: trainees?.filter(t => t?.interviewStatus === 'scheduled')?.length
  };

  // Filter trainees based on current filters
  useEffect(() => {
    let filtered = [...trainees];

    if (filters?.searchName) {
      filtered = filtered?.filter(trainee =>
        trainee?.name?.toLowerCase()?.includes(filters?.searchName?.toLowerCase()) ||
        trainee?.email?.toLowerCase()?.includes(filters?.searchName?.toLowerCase())
      );
    }
    const getStepNumber = (currentStep) => {
      if (!currentStep || currentStep === 'No Assessment Yet') return null;
      const match = currentStep.match(/\d+/);
      return match ? Number(match[0]) : null;
    };


    if (filters?.syllabusStep !== 'all') {
      filtered = filtered?.filter(trainee => {
        const stepNumber = getStepNumber(trainee?.currentStep);


        return stepNumber === Number(filters?.syllabusStep);
      });
    }

    const getStatus = (p) => {
      if (p >= 85) return "completed";
      if (p > 0) return "in-progress";
      return "not-started";
    };


    if (filters?.completionStatus !== 'all') {
      filtered = filtered?.filter(
        trainee => getStatus(trainee?.completionPercentage) === filters?.completionStatus
      );
    }


    if (filters?.dateFrom) {
      filtered = filtered?.filter(trainee => {
        const assessmentDate = new Date(trainee.lastAssessmentDate);
        const fromDate = new Date(filters.dateFrom);
        return assessmentDate >= fromDate;
      });
    }

    if (filters?.dateTo) {
      filtered = filtered?.filter(trainee => {
        const assessmentDate = new Date(trainee.lastAssessmentDate);
        const toDate = new Date(filters.dateTo);
        return assessmentDate <= toDate;
      });
    }

    setFilteredTrainees(filtered);
  }, [filters, trainees]);

  const handleSelectTrainee = (traineeId, isSelected) => {
    if (isSelected) {
      setSelectedTrainees(prev => [...prev, traineeId]);
    } else {
      setSelectedTrainees(prev => prev?.filter(id => id !== traineeId));
    }
  };

  const handleSelectAll = (isSelected) => {
    if (isSelected) {
      setSelectedTrainees(filteredTrainees?.map(t => t?.traineeId));
    } else {
      setSelectedTrainees([]);
    }
  };

  const handleSort = (key, direction) => {
    const sorted = [...filteredTrainees]?.sort((a, b) => {
      let aValue = a?.[key];
      let bValue = b?.[key];

      if (key === 'lastAssessmentDate') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      } else if (key === 'completion') {
        aValue = a?.completionPercentage;
        bValue = b?.completionPercentage;
      } else if (typeof aValue === 'string') {
        aValue = aValue?.toLowerCase();
        bValue = bValue?.toLowerCase();
      }

      if (direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredTrainees(sorted);
  };


  const handleViewProfile = (traineeId) => {
    navigate(`/progress-reports?trainee=${traineeId}`);
  };

  // const handleAddAssessment = (traineeId) => {
  //   console.log("traineesHHHHH:", traineeId);
  //   const trainee = trainees?.find(t => t?.traineeId === traineeId);
  //   console.log("Selected Trainee for Assessment:", trainee);
  //   setSelectedTraineeForAssessment(trainee);
  //   setShowAssessmentModal(true);
  // };
const handleAddAssessment = (traineeId) => {
  const trainee = filteredTrainees?.find(
    t => t?.traineeId === traineeId
  );

  setSelectedTraineeForAssessment(trainee);
  setShowAssessmentModal(true);
};

  const handleScheduleInterview = (traineeId) => {
    navigate(`/interview-scheduling?trainee=${traineeId}`);
  };


  const handleExportReports = () => {
    // Mock export functionality
    const exportData = {
      trainees: filteredTrainees,
      exportDate: new Date()?.toISOString(),
      filters: filters
    };

    console.log('Exporting reports:', exportData);
    // Create mock CSV content
    const csvContent = [
      ['Name', 'Email', 'Current Step', 'Completion %', 'Last Assessment', 'Score', 'Interview Status']?.join(','),
      ...filteredTrainees?.map(t => [
        t?.name,
        t?.email,
        t?.currentStep,
        t?.completionPercentage,
        t?.lastAssessmentDate,
        t?.lastAssessmentScore,
        t?.interviewStatus
      ]?.join(','))
    ]?.join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL?.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trainee-reports-${new Date()?.toISOString()?.split('T')?.[0]}.csv`;
    a?.click();
    window.URL?.revokeObjectURL(url);
  };

  const handleBulkScheduleInterview = () => {
    if (selectedTrainees?.length === 0) {

      alert('Please select trainees to schedule interviews');
      return;
    }
    navigate(`/interview-scheduling?trainees=${selectedTrainees?.join(',')}`);
  };

  const handleBulkAddAssessment = () => {
    navigate('/assessment-entry');
  };

  const handleSubmitAssessment = async (assessmentData) => {
    // Mock API call
    console.log('Submitting assessment:', assessmentData);

    // Update trainee's last assessment data
    setTrainees(prev => prev?.map(trainee => {
      if (trainee?.traineeId=== assessmentData?.trngid) {
        return {
          ...trainee,
          lastAssessmentDate: assessmentData?.assessmentDate,
          lastAssessmentScore: assessmentData?.marks,
          // Update completion percentage based on assessment
          completionPercentage: Math.min(100, trainee?.completionPercentage + 5)
        };
      }
      return trainee;
    }));

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  const handleLogout = () => {
    navigate('/');
  };
 const selectedTrainee = filteredTrainees.find(
  t => String(t?.traineeId) === String(selectedTraineeId)
);

  

useEffect(() => {
  const managerId = sessionStorage.getItem("userId");

  const loadDelays = async () => {
    try {
      const response = await fetchManagerDelays(managerId);
      setDelayNotifications(response.data || []);
    } catch (error) {
      console.error("Error fetching manager delays:", error);
    }
  };

  loadDelays();
}, []);

  return (
    <div className="min-h-screen bg-background">
      <Header

        userName={sessionStorage.getItem("userName") || "User"}
        userRole="manager"
        onLogout={handleLogout}
      />
      <main className="pt-16">
      

{showDelayBox && delayNotifications.length > 0 && (
  <div className="max-w-7xl mx-auto px-6 mt-6">
    <div className="relative bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg shadow-sm">

      {/*  Cross Button */}
      <button
        onClick={() => setShowDelayBox(false)}
        className="absolute top-2 right-3 text-red-600 hover:text-red-800 text-lg font-bold"
      >
        ×
      </button>

      {(() => {
        const firstDelay = delayNotifications[0];

        return (
          <>
            <strong>
              ⚠ Delay Alert
            </strong>

            <div className="mt-2">
              • {firstDelay.traineeId} → {firstDelay.delayDays} day(s) delay
            </div>
          </>
        );
      })()}
    </div>
  </div>
)}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Breadcrumb Navigation */}
          <NavigationBreadcrumb userRole="manager" className="mb-6" />

          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Manager Dashboard</h1>
            <p className="text-muted-foreground">
              Comprehensive oversight of trainee progress with advanced filtering and reporting capabilities
            </p>
          </div>

          {/* Metrics Panel */}
          <TraineeMetricsPanel metrics={metrics} />

          {/* Filter Toolbar */}
          <FilterToolbar
            filters={filters}
            syllabusOptions={syllabusOptions}
            onFilterChange={setFilters}
            onExportReports={handleExportReports}
            onScheduleInterview={handleBulkScheduleInterview}
            onAddAssessment={handleBulkAddAssessment}
            resultsCount={filteredTrainees?.length}
          />

          {/* Trainee Data Table */}
          <TraineeDataTable
            trainees={filteredTrainees}
            selectedTrainees={selectedTrainees}
            onSelectTrainee={handleSelectTrainee}
            onSelectAll={handleSelectAll}
            onViewProfile={handleViewProfile}
            onAddAssessment={handleAddAssessment}
            onScheduleInterview={handleScheduleInterview}
            onSort={handleSort}
            onViewSyllabus={(id) => setSelectedTraineeId(id)} 
          />

         {/* {selectedTraineeId && selectedTrainee && (
        <TraineeSyllabusPage
          traineeId={selectedTraineeId}
          traineeName={`${selectedTrainee.firstname} ${selectedTrainee.lastname}`}
          onClose={() => setSelectedTraineeId(null)}
        />
      )} */}

{selectedTraineeId && selectedTrainee && (
  <TraineeSyllabusPage
    traineeId={selectedTraineeId}
   traineeName={selectedTrainee?.name}
    onClose={() => setSelectedTraineeId(null)}
  />
)}

          {/* Assessment Entry Modal */}
          <AssessmentEntryModal
          key={selectedTraineeForAssessment?.traineeId}  
            isOpen={showAssessmentModal}
            onClose={() => {
              setShowAssessmentModal(false);
              setSelectedTraineeForAssessment(null);
            }}
            trainee={selectedTraineeForAssessment}
            onSubmitAssessment={handleSubmitAssessment}
          />
        </div>
      </main>
    </div>
  );
};

export default ManagerDashboard;