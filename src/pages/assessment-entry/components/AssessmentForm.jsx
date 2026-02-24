

import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { createAssessment } from '../../../api_service'
import { fromTheme } from 'tailwind-merge';
import { fetchCompletedSubTopics } from '../../../api_service';

const AssessmentForm = ({
  trainee,
  onSuccess,
  onSaveDraft,
  onCancel,
  assessmentFormData,
  isLoading = false,
  className = ''
}) => {
  console.log('Assessment form data prop:', assessmentFormData);



  const [formData, setFormData] = useState({
    marks: '',
    maxMarks: '100',
    assessmentDate: new Date()?.toISOString()?.split('T')?.[0],
    assessmentType: 'weekly',
    remarks: '',
    strengths: '',
    improvements: '',
    recommendations: '',
    subTopicIds: [],
    interviewDone: false,
  });


  const [errors, setErrors] = useState({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState('');

  const [selectedSyllabus, setSelectedSyllabus] = useState([]);
  const [selectedSubTopics, setSelectedSubTopics] = useState([]);

  const [syllabusData, setSyllabusData] = useState([]);
  const [completedSubTopics, setCompletedSubTopics] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const restrictedRoles = ["CEO", "CTO", "HR", "PM"];
  const roleName = sessionStorage.getItem("roleName");
  const isRestricted = restrictedRoles.includes(roleName);

  const assessmentTypeOptions = [
    { value: 'weekly', label: 'Weekly Assessment' },
    { value: 'monthly', label: 'Monthly Review' },
    { value: 'milestone', label: 'Milestone Assessment' },
    { value: 'final', label: 'Final Evaluation' }
  ];

  useEffect(() => {
    if (!assessmentFormData) return;

    const subTopics =
      typeof assessmentFormData?.rawItems?.[0]?.interviewSchedule?.subTopics === "string"
        ? assessmentFormData.rawItems[0].interviewSchedule.subTopics
          .split("|")
          .map(Number)
        : [];

    setFormData(prev => ({
      ...prev,
      subTopicIds: subTopics,
      interviewDone: true
    }));

    setSelectedSubTopics(subTopics);
  }, [assessmentFormData]);


  // Auto-save functionality
  useEffect(() => {
    if (hasUnsavedChanges && trainee) {
      const autoSaveTimer = setTimeout(() => {
        handleAutoSave();
      }, 30000); // Auto-save every 30 seconds

      return () => clearTimeout(autoSaveTimer);
    }
  }, [formData, hasUnsavedChanges, trainee]);

  const handleAutoSave = () => {
    if (trainee && formData?.marks) {
      const draftData = {
        ...formData,
        empid: trainee?.trngid,
        isDraft: true,
        autoSaved: true
      };

      // Simulate auto-save
      setAutoSaveStatus('Auto-saved');
      setTimeout(() => setAutoSaveStatus(''), 3000);
    }
  };

  // console.log('Form data state:', trainee);
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);

    // Clear specific field error
    if (errors?.[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  useEffect(() => {
    if (!syllabusData.length || selectedSubTopics.length === 0) return;

    const matchedSyllabusTitles = syllabusData
      .filter(syllabus =>
        syllabus.subTopics.some(subTopic =>
          selectedSubTopics.includes(subTopic.subTopicId)
        )
      )
      .map(syllabus => syllabus.title);

    setSelectedSyllabus(matchedSyllabusTitles);
  }, [syllabusData, selectedSubTopics]);


  //  helper function – syllabus + subtopic filtering
  const getCompletedSyllabusData = (data, traineeId) => {
    return data
      .map(syllabus => {
        const completedSubTopics = syllabus.subTopics?.filter(subTopic =>
          subTopic.stepProgress?.some(
            progress =>
              progress.checker === true &&
              progress.complete === true &&
              progress.user?.trngid === traineeId
          )
        );

        //  syllabus hide if no valid subtopics
        if (!completedSubTopics || completedSubTopics.length === 0) {
          return null;
        }

        return {
          ...syllabus,
          subTopics: completedSubTopics
        };
      })
      .filter(Boolean);
  };


  const validateForm = () => {
    const newErrors = {};

    if (!formData?.subTopicIds || formData?.subTopicIds.length === 0) {
      newErrors.subTopicIds = 'Subtopic is required';
    }

    // Marks validation
    if (!formData?.marks) {
      newErrors.marks = 'Marks are required';
    } else {
      const marks = parseFloat(formData?.marks);
      const maxMarks = parseFloat(formData?.maxMarks);
      if (isNaN(marks) || marks < 0) {
        newErrors.marks = 'Marks must be a positive number';
      } else if (marks > maxMarks) {
        newErrors.marks = `Marks cannot exceed ${maxMarks}`;
      }
    }

    // Assessment date validation
    if (!formData?.assessmentDate) {
      newErrors.assessmentDate = 'Assessment date is required';
    } else {
      const selectedDate = new Date(formData.assessmentDate);
      const today = new Date();
      if (selectedDate > today) {
        newErrors.assessmentDate = 'Assessment date cannot be in the future';
      }
    }

    // Remarks validation
    if (!formData?.remarks?.trim()) {
      newErrors.remarks = 'Remarks are required';
    } else if (formData?.remarks?.trim()?.length < 10) {
      newErrors.remarks = 'Remarks must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const getSubtopicInfo = (trainee, options = { type: 'last' }) => {
    // Flatten all subTopics from all syllabusProgress
    const allSubTopics = trainee.syllabusProgress.flatMap(sp => sp.subTopics || []);
    if (!allSubTopics.length) return 'N/A';

    if (options.type === 'all') {
      // Return array of subtopic names
      return allSubTopics.map(st => st.name).join(', ');
    }

    // Default: get last subtopic based on stepNumber
    const lastSubTopic = allSubTopics.reduce((prev, current) =>
      prev.stepNumber < current.stepNumber ? current : prev
    );

    return lastSubTopic ? `Step  ${lastSubTopic.name}` : 'N/A';
    //return lastSubTopic ? `Step ${lastSubTopic.stepNumber}: ${lastSubTopic.name}` : 'N/A';
  };

  const handleSubmit = async (isDraft = false) => {
    if (!isDraft && !validateForm()) {
      return;
    }

    const assessmentData = {
      ...formData,
      empid: trainee?.trngid,
      traineeName: trainee?.name,
      currentStep: trainee?.currentStep,
      subTopicIds: formData.subTopicIds,
      // isDraft,
      submittedAt: new Date()?.toISOString(),
      percentage: Math.round((parseFloat(formData?.marks) / parseFloat(formData?.maxMarks)) * 100)
    };

    console.log('Final assessment data to submit:', assessmentData);

    try {

      console.log('Submitting assessment data:', assessmentData);
      const response = await createAssessment(assessmentData.empid, assessmentData);
      console.log('Assessment saved successfully:', response);


      alert("Assessment saved successfully!");


      resetForm();
      if (onSuccess) {
        onSuccess();
      }



    } catch (error) {
      console.error('Error submitting assessment:', error);
    }

    if (isDraft) {
      onSaveDraft(assessmentData);
    }

    setHasUnsavedChanges(false);
  };


  const resetForm = () => {
    setFormData({
      marks: '',
      maxMarks: '100',
      assessmentDate: new Date().toISOString().split('T')[0],
      assessmentType: 'weekly',
      remarks: '',
      strengths: '',
      improvements: '',
      recommendations: ''
    });

    setErrors({});
    setHasUnsavedChanges(false);
    setAutoSaveStatus('');
  };
  const handleCancel = () => {
    if (hasUnsavedChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to cancel?')) {
        onCancel();
      }
    } else {
      onCancel();
    }
  };

  const getGradeColor = (percentage) => {
    if (percentage >= 90) return 'text-success';
    if (percentage >= 80) return 'text-primary';
    if (percentage >= 70) return 'text-warning';
    return 'text-error';
  };


  useEffect(() => {
    if (!trainee?.trngid) {
      setCompletedSubTopics([]);
      return;
    }

    const loadData = async () => {
      try {
        const response = await fetchCompletedSubTopics();

        const rawData = Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
            ? response.data
            : [];

        //  APPLY SAME LOGIC TO SYLLABUS
        const completedSyllabus = getCompletedSyllabusData(
          rawData,
          trainee.trngid
        );

        setSyllabusData(completedSyllabus);

        //  dropdown ke liye flat subtopic list
        const subTopicOptions = completedSyllabus.flatMap(syllabus =>
          syllabus.subTopics.map(subTopic => ({
            value: subTopic.subTopicId,
            label: `${syllabus.title} - ${subTopic.stepNumber}. ${subTopic.name}`,
            title: syllabus.title
          }))
        );

        setCompletedSubTopics(subTopicOptions);
      } catch (error) {
        console.error("Error fetching completed syllabus", error);
        setSyllabusData([]);
        setCompletedSubTopics([]);
      }
    };

    loadData();
  }, [trainee?.trngid]);

  const syllabusOptions = [
    { value: "ALL", label: "All Syllabus" },
    ...syllabusData.map(s => ({
      value: s.title,
      label: s.title
    }))
  ];

  const filteredSubTopicOptions = (() => {
    if (
      selectedSyllabus.length === 0 ||
      selectedSyllabus.includes("ALL")
    ) {
      return [
        { value: "ALL_SUBTOPICS", label: "All Subtopics" },
        ...completedSubTopics
      ];
    }

    return [
      { value: "ALL_SUBTOPICS", label: "All Subtopics" },
      ...completedSubTopics.filter(sub =>
        selectedSyllabus.includes(sub.title)
      )
    ];
  })();

  const handleSyllabusChange = values => {
    let selected = Array.isArray(values) ? values : [values];

    if (selected.includes("ALL")) {
      selected = syllabusOptions
        .filter(opt => opt.value !== "ALL")
        .map(opt => opt.value);
    }

    setSelectedSyllabus(selected);

    handleInputChange("subTopicIds", []);
  };

  const handleSubTopicChange = values => {
    let selected = Array.isArray(values) ? values : [values];

    if (selected.includes("ALL_SUBTOPICS")) {
      selected = filteredSubTopicOptions
        .filter(opt => opt.value !== "ALL_SUBTOPICS")
        .map(opt => opt.value);
    }

    setSelectedSubTopics(selected);
    handleInputChange("subTopicIds", selected);
  };


  const calculatePercentage = () => {
    const marks = parseFloat(formData?.marks);
    const maxMarks = parseFloat(formData?.maxMarks);
    if (!isNaN(marks) && !isNaN(maxMarks) && maxMarks > 0) {
      return Math.round((marks / maxMarks) * 100);
    }
    return 0;
  };

  if (!trainee) {
    return (
      <div className={`bg-card border border-border rounded-lg p-8 text-center ${className}`}>
        <Icon name="ClipboardList" size={48} className="text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">No Trainee Selected</h3>
        <p className="text-muted-foreground">Please select a trainee to begin assessment entry.</p>
      </div>
    );
  }

  return (
    <div className={`bg-card border border-border rounded-lg ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Assessment Entry</h2>

            <p className="text-sm text-muted-foreground">
              Assessing: {trainee?.username} {getSubtopicInfo(trainee)}
            </p>

          </div>
          <div className="flex items-center space-x-2">
            {autoSaveStatus && (
              <span className="text-xs text-success flex items-center">
                <Icon name="Check" size={12} className="mr-1" />
                {autoSaveStatus}
              </span>
            )}
            {hasUnsavedChanges && (
              <span className="text-xs text-warning flex items-center">
                <Icon name="AlertCircle" size={12} className="mr-1" />
                Unsaved changes
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="p-6 space-y-6">
        {/* Assessment Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">


          <Select
            label="Assessment Type"
            disabled={isRestricted}
            options={assessmentTypeOptions}
            value={formData?.assessmentType}
            onChange={(value) => handleInputChange('assessmentType', value)}
            required
          />
          <Input
            label="Assessment Date"
            disabled={isRestricted}
            type="date"
            value={formData?.assessmentDate}
            onChange={(e) => handleInputChange('assessmentDate', e?.target?.value)}
            error={errors?.assessmentDate}
            required
          />
        </div>

        {/* Marks Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Marks Obtained"
            disabled={isRestricted}
            type="number"
            placeholder="Enter marks"
            value={formData?.marks}
            onChange={(e) => handleInputChange('marks', e?.target?.value)}
            error={errors?.marks}
            min="0"
            max={formData?.maxMarks}
            required
          />
          <Input
            label="Maximum Marks"
            disabled={isRestricted}
            type="number"
            value={formData?.maxMarks}
            onChange={(e) => handleInputChange('maxMarks', e?.target?.value)}
            min="1"
          />
          <div className="flex flex-col">
            <label className="text-sm font-medium text-foreground mb-2">Percentage</label>
            <div className={`flex items-center justify-center h-10 px-3 border border-border rounded-lg bg-muted ${getGradeColor(calculatePercentage())}`}>
              <span className="text-lg font-semibold">
                {calculatePercentage()}%
              </span>
            </div>
          </div>
        </div>




        {/*  TITLE DROPDOWN */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            {/* SYLLABUS MULTI SELECT */}
            <Select
              label="Syllabus"
              disabled={isRestricted}
              options={syllabusOptions}
              value={selectedSyllabus}
              onChange={handleSyllabusChange}
              multiple
              searchable
            />

            {/*  SELECTED SYLLABUS CHIPS – JUST BELOW */}
            {selectedSyllabus.length > 0 && (
              <div className="mt-1">
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Selected Syllabus
                </p>

                <div className="flex flex-wrap gap-2">
                  {selectedSyllabus.map(title => (
                    <span
                      key={title}
                      className="px-3 py-1 text-xs rounded-full
          bg-secondary/10 text-secondary
          border border-secondary/30"
                    >
                      {title}
                    </span>
                  ))}
                </div>
              </div>
            )}

          </div>


          <div className="space-y-3">
            {/*  DROPDOWN */}
            <Select
              label="Completed Sub Topics"
              disabled={isRestricted}
              options={filteredSubTopicOptions}
              value={selectedSubTopics}
              onChange={handleSubTopicChange}
              multiple
              searchable
            />



            {/*  SELECTED SUBTOPICS DISPLAY */}
            {selectedSubTopics.length > 0 && (
              <div>
                <p className="text-sm font-medium text-foreground mb-1">
                  Selected Sub Topics:
                </p>

                <div className="flex flex-wrap gap-2">
                  {selectedSubTopics.map(id => {
                    const sub = completedSubTopics.find(s => s.value === id);
                    if (!sub) return null;

                    return (
                      <span
                        key={id}
                        className="px-3 py-1 text-xs rounded-full 
                         bg-primary/10 text-primary 
                         border border-primary/30"
                      >
                        {sub.label}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

        </div>


        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Interview Completed?
          </label>
          <div className="flex items-center space-x-6">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="interviewDone"
                checked={formData.interviewDone === true}
                onChange={() => handleInputChange("interviewDone", true)}
                className="form-radio"
                disabled
              />
              <span>Yes</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="interviewDone"
                checked={formData.interviewDone === false}
                onChange={() => handleInputChange("interviewDone", false)}
                className="form-radio"
                disabled
              />
              <span>No</span>
            </label>
          </div>
        </div>


        {/* Remarks Section */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            General Remarks *
          </label>
          <textarea
            className="w-full h-24 px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            disabled={isRestricted}
            placeholder="Enter detailed remarks about the trainee's performance..."
            value={formData?.remarks}
            onChange={(e) => handleInputChange('remarks', e?.target?.value)}
          />
          {errors?.remarks && (
            <p className="text-sm text-error mt-1">{errors?.remarks}</p>
          )}
        </div>

        {/* Detailed Feedback */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Strengths
            </label>
            <textarea
              className="w-full h-20 px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              disabled={isRestricted}
              placeholder="What did the trainee do well?"
              value={formData?.strengths}
              onChange={(e) => handleInputChange('strengths', e?.target?.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Areas for Improvement
            </label>
            <textarea
              className="w-full h-20 px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              disabled={isRestricted}
              placeholder="What needs improvement?"
              value={formData?.improvements}
              onChange={(e) => handleInputChange('improvements', e?.target?.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Recommendations
            </label>
            <textarea
              className="w-full h-20 px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              disabled={isRestricted}
              placeholder="Specific recommendations..."
              value={formData?.recommendations}
              onChange={(e) => handleInputChange('recommendations', e?.target?.value)}
            />
          </div>



        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
          {!isRestricted && (
            <Button
              variant="default"
              onClick={() => handleSubmit(false)}
              loading={isLoading}
              iconName="Save"
              iconPosition="left"
              className="flex-1 sm:flex-none"
            >
              Save Assessment
            </Button>
          )}

          {!isRestricted && (
            <Button
              variant="ghost"
              onClick={handleCancel}
              iconName="X"
              iconPosition="left"
              className="flex-1 sm:flex-none"
            >
              Cancel
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssessmentForm;