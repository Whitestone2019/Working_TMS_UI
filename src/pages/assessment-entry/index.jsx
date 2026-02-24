
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../../components/ui/Header';
import NavigationBreadcrumb from '../../components/ui/NavigationBreadcrumb';
import SessionTimeoutHandler from '../../components/ui/SessionTimeoutHandler';
import TraineeSelector from './components/TraineeSelector';
import AssessmentForm from './components/AssessmentForm';
import AssessmentHistory from './components/AssessmentHistory';
import AssessmentDetailsModal from './components/AssessmentDetailsModal';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { fetchAllTrainees,fetchAllTraineeSummaryAdmin, fetchAssessmentsByTrainee, fetchTraineesByManagerId, fetchTraineeSummaryByManager } from '../../api_service';

const AssessmentEntry = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const interview = location.state?.interview || null;

  const [selectedTrainee, setSelectedTrainee] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [historyAssessments, setHistoryAssessments] = useState([]);
  // Mock data for trainees
  const [trainees, setTrainees] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(false);

const privilegedRoles = ["CEO", "CTO", "HR"];


const roleName = sessionStorage.getItem("roleName")?.toLowerCase();

  const triggerReload = () => {
    setRefreshKey(prev => prev + 1);
  };



  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const managerId = sessionStorage.getItem("userId");
  //       const res = await fetchTraineeSummaryByManager(managerId);

  //       const normalizedTrainees = (res.data || []).map(t => ({
  //         trngid: t.traineeId,
  //         traineeId: t.traineeId,
  //         name: t.name,
  //         email: t.email,
  //         completionPercentage: t.completionPercentage,
  //         interviewStatus: t.interviewStatus,
  //         lastAssessmentDate: t.lastAssessmentDate,
  //         lastAssessmentScore: t.lastAssessmentScore,
  //         syllabusProgress: t.syllabusProgress || []   // keep the full syllabus
  //       }));


  //       setTrainees(normalizedTrainees);
  //       console.log("Normalized trainees:", normalizedTrainees);

  //     } catch (error) {
  //       console.error("Error fetching trainees:", error);
  //     }
  //   };

  //   fetchData();
  // }, []);


  useEffect(() => {
  const fetchData = async () => {
    try {
      const roleName = sessionStorage.getItem("roleName");
      const userId = sessionStorage.getItem("userId");

      let res;

      // 🔥 Role based API call
     if (privilegedRoles.includes(roleName)) {

        res = await fetchAllTraineeSummaryAdmin();
      } else {
        if (!userId) {
          console.warn("UserId not found in session");
          setTrainees([]);
          return;
        }
        res = await fetchTraineeSummaryByManager(userId);
      }

      const normalizedTrainees = (res?.data || []).map(t => ({
        trngid: t.traineeId,
        traineeId: t.traineeId,
        name: t.name,
        email: t.email,
        completionPercentage: t.completionPercentage,
        interviewStatus: t.interviewStatus,
        lastAssessmentDate: t.lastAssessmentDate,
        lastAssessmentScore: t.lastAssessmentScore,
        syllabusProgress: t.syllabusProgress || [] // keep full syllabus
      }));

      setTrainees(normalizedTrainees);
      console.log("Normalized trainees:", normalizedTrainees);

    } catch (error) {
      console.error("Error fetching trainees:", error);
      setTrainees([]);
    }
  };

  fetchData();
}, []);


  useEffect(() => {
    console.log('Interview data from navigation state:', interview);
    if (interview && interview.trainees) {
      handleTraineeSelect(interview.trainees[0]);
    }
  }, [interview]);

  useEffect(() => {
    if (!selectedTrainee?.trngid) return;

    const loadAssessments = async () => {
      const data = await getTraineeAssessments(selectedTrainee.trngid);
      setHistoryAssessments(data);
    };

    loadAssessments();
  }, [selectedTrainee, refreshKey]);




  const handleTraineeSelect = async (trainee) => {
    if (!trainee?.trngid) return;

    setSelectedTrainee(trainee);

    try {
      const data = await getTraineeAssessments(trainee.trngid);
      setHistoryAssessments(data);
    } catch (error) {
      console.error("Error fetching assessments:", error);
      setHistoryAssessments([]);
    }
  };

  const handleSaveDraft = async (draftData) => {
    try {
      // Simulate API call for draft save
      await new Promise(resolve => setTimeout(resolve, 800));
      console.log('Draft saved:', draftData);
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  };

  const handleCancel = () => {
    setSelectedTrainee(null);
  };

  const handleViewAssessmentDetails = (assessment) => {
    setSelectedAssessment(assessment);
    setShowDetailsModal(true);
  };

  const handleEditAssessment = (assessment) => {
    setShowDetailsModal(false);
    // Logic to populate form with assessment data for editing
    console.log('Edit assessment:', assessment);
  };

  const handleLogout = () => {
    navigate('/');
  };

  const handleSessionExpired = () => {
    navigate('/');
  };




  const getTraineeAssessments = async (traineeId) => {
    try {
      const response = await fetchAssessmentsByTrainee(traineeId);
      console.log('Fetched assessments for trainee:', response);

      const normalized = (response.data ?? []).map(a => ({
        assessmentId: a.assessmentId,
        date: a.assessmentDate ?? null,
        type: a.assessmentType ?? '',
        marks: Number(a.marks ?? 0),
        maxMarks: Number(a.maxMarks ?? 0),
        percentage: Number(a.percentage ?? 0),
        remarks: a.remarks ?? '',
        strengths: a.strengths ?? '',
        improvements: a.improvements ?? '',
        recommendations: a.recommendations ?? '',
        submittedAt: a.submittedAt,
        // Fix: Ensure this key matches what the Modal expects
        subTopics: a.subTopics,
        user: a.user
      }))
        .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

      return normalized || [];
    } catch (err) {
      console.error("Error fetching assessments for trainee:", err);
    }
  };


  return (
    <div className="min-h-screen bg-background">
      <Header

        userName={sessionStorage.getItem("userName") || "User"}
    
        onLogout={handleLogout}
      />
      <SessionTimeoutHandler
        sessionDuration={30}
        warningTime={5}
        onSessionExpired={handleSessionExpired}
        onSessionExtended={() => { }}
        isActive={true}
      />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Breadcrumb Navigation */}
          <NavigationBreadcrumb userRole="manager" className="mb-6" />

          {/* Page Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Assessment Entry</h1>
              <p className="text-muted-foreground">
                Enter weekly evaluation marks and feedback for trainees
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate('/manager-dashboard')}
              iconName="ArrowLeft"
              iconPosition="left"
            >
              Back to Dashboard
            </Button>
          </div>

          {/* Success Message */}
          {showSuccessMessage && (
            <div className="mb-6 p-4 bg-success/10 border border-success/20 rounded-lg flex items-center">
              <Icon name="CheckCircle" size={20} className="text-success mr-3" />
              <div className="flex-1">
                <p className="text-success font-medium">Assessment saved successfully!</p>
                <p className="text-success/80 text-sm">The assessment has been recorded and the trainee will be notified.</p>
              </div>
            </div>
          )}

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Left Column - Trainee Selection */}
            <div className="xl:col-span-1">
              <TraineeSelector
                selectedTrainee={selectedTrainee}
                onTraineeSelect={handleTraineeSelect}
                trainees={trainees.length ? trainees : []}
              />
            </div>

            {/* Right Column - Assessment Form and History */}
            <div className="xl:col-span-2 space-y-8">
              {/* Assessment Form */}
              <AssessmentForm
                trainee={selectedTrainee}
                // onSave={handleSaveAssessment}

                onSuccess={triggerReload}
                assessmentFormData={interview || null}
                onSaveDraft={handleSaveDraft}
                onCancel={handleCancel}
                isLoading={isLoading}
              />

              {/* Assessment History */}
              {selectedTrainee && (
                <AssessmentHistory
                  trainee={selectedTrainee}
                  assessments={historyAssessments}
                  onViewDetails={handleViewAssessmentDetails}
                />
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-12 p-6 bg-card border border-border rounded-lg">
            <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              <Button
                variant="outline"
                onClick={() => navigate('/interview-scheduling')}
                iconName="Calendar"
                iconPosition="left"
                fullWidth
              >
                Schedule Interviews
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/manager-dashboard')}
                iconName="LayoutDashboard"
                iconPosition="left"
                fullWidth
              >
                Manager Dashboard
              </Button>
            </div>
          </div>
        </div>
      </main>
      {/* Assessment Details Modal */}
      <AssessmentDetailsModal
        assessment={selectedAssessment}
        trainee={selectedTrainee}

        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        onEdit={handleEditAssessment}
      />
    </div>
  );
};

export default AssessmentEntry;

