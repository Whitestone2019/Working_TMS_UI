

import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import {
  fetchAssessmentsByTrainee,
  createAssessment,
  updateAssessment,
  fetchCompletedSubTopics, fetchFeedbackBySyllabusForManager
} from "../../../api_service";

const AssessmentEntryModal = ({ isOpen, onClose, trainee, onSubmitAssessment }) => {
  const [assessmentList, setAssessmentList] = useState([]);
  const [existingAssessmentId, setExistingAssessmentId] = useState(null);
  const [selectedSyllabus, setSelectedSyllabus] = useState([]);
  const [selectedSubTopics, setSelectedSubTopics] = useState([]);

  const [syllabusData, setSyllabusData] = useState([]);
  const [completedSubTopics, setCompletedSubTopics] = useState([]);
  const [selectedSyllabusId, setSelectedSyllabusId] = useState(null);
  const [feedbackData, setFeedbackData] = useState([]);
  const [privilegeRoles] = useState(["CEO", "CTO", "HR", "TM"]);

  const [assessmentData, setAssessmentData] = useState({
    traineeId: '',
    assessmentType: '',
    marks: '',
    maxMarks: '100',
    remarks: '',
    assessmentDate: new Date().toISOString().split('T')[0],
    subTopics: [],
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showUpdateAlert, setShowUpdateAlert] = useState(false);

  const assessmentTypeOptions = [
    { value: 'weekly', label: 'Weekly Assessment' },
    { value: 'monthly', label: 'Monthly Assessment' },
    { value: 'module', label: 'Module Assessment' },
    { value: 'practical', label: 'Practical Assessment' },
    { value: 'project', label: 'Project Assessment' }
  ];



  // ---------------- LOAD ASSESSMENTS ----------------
  useEffect(() => {
    if (!isOpen || !trainee?.traineeId) return;


    const loadAssessments = async () => {
      try {
        // setSelectedSyllabus([]);
        // setSelectedSubTopics([]);
        console.log("Fetching assessments for traineeId:", trainee.traineeId);
        const res = await fetchAssessmentsByTrainee(trainee.traineeId);
        console.log("Assessments response:", res);
        const list = Array.isArray(res?.data) ? res.data : [];
        const sortedList = list.sort((a, b) =>
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        setAssessmentList(sortedList);
        //if (sortedList.length > 0) populateForm(sortedList[0]);
      } catch (err) {
        console.error(err);
        setAssessmentList([]);
      }
    };

    loadAssessments();
  }, [isOpen, trainee?.traineeId]);




  // const populateForm = (assessment) => {
  //   console.log("Populating form with assessment:", assessment);
  //   if (!assessment?.assessmentId) return;
  //   setSelectedSyllabus([]);
  //   setSelectedSubTopics([]);

  //   setExistingAssessmentId(assessment.assessmentId);


  //   const parsedSubTopics =
  //     typeof assessment.subTopics === "string"
  //       ? assessment.subTopics.split("|").map(Number)
  //       : [];


  //   setAssessmentData({
  //     traineeId: trainee.traineeId,
  //     assessmentType: assessment.assessmentType?.toLowerCase() || '',
  //     marks: String(assessment.marks || ''),
  //     maxMarks: String(assessment.maxMarks || '100'),
  //     remarks: assessment.remarks || '',
  //     assessmentDate: assessment.assessmentDate
  //       ? new Date(assessment.assessmentDate).toISOString().split('T')[0]
  //       : new Date().toISOString().split('T')[0],
  //     subTopics: parsedSubTopics,


  //   });
  //   setSelectedSubTopics(parsedSubTopics);
  //   console.log("Parsed subtopics:", syllabusData);
  //   console.log("Populated form with assessment data:", assessmentData);
  // };

  const populateForm = async (assessment) => {
    if (!assessment?.assessmentId) return;

    setSelectedSyllabus([]);
    setSelectedSubTopics([]);

    setExistingAssessmentId(assessment.assessmentId);

    const parsedSubTopics =
      typeof assessment.subTopics === "string"
        ? assessment.subTopics.split("|").map(Number)
        : [];

    setAssessmentData({
      traineeId: trainee.traineeId,
      assessmentType: assessment.assessmentType?.toLowerCase() || '',
      marks: String(assessment.marks || ''),
      maxMarks: String(assessment.maxMarks || '100'),
      remarks: assessment.remarks || '',
      assessmentDate: assessment.assessmentDate
        ? new Date(assessment.assessmentDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      subTopics: parsedSubTopics,
    });

    setSelectedSubTopics(parsedSubTopics);

    //  FIX: find syllabusId from subTopics
    if (syllabusData?.length && parsedSubTopics.length) {
      const matchedSyllabus = syllabusData.find(s =>
        s.subTopics.some(st => parsedSubTopics.includes(st.subTopicId))
      );

      if (matchedSyllabus) {
        setSelectedSyllabusId(matchedSyllabus.syllabusId);
      }
    }

   
    

  };
  useEffect(() => {
    const loadFeedback = async () => {
      try {
        if (trainee?.traineeId && selectedSyllabusId) {
          const feedback = await fetchFeedbackBySyllabusForManager(
            trainee.traineeId,
            selectedSyllabusId

          );
          console.log("Selected Syllabus ID:", selectedSyllabusId);
          console.log("Trainee ID:", trainee?.traineeId);
          setFeedbackData(
            Array.isArray(feedback) ? feedback : []
          );
          console.log("Feedback API full response:", feedback);
        }
      } catch (err) {
        console.error("Feedback fetch error", err);
        setFeedbackData([]);
      }
    };

    loadFeedback();
  }, [selectedSyllabusId, trainee?.traineeId]);

  useEffect(() => {
    if (assessmentList.length > 0 && syllabusData.length > 0) {
      populateForm(assessmentList[0]);
    }
  }, [assessmentList, syllabusData]);
  useEffect(() => {
    if (!syllabusData?.length || !assessmentData.subTopics.length) return;

    const matchedSyllabusTitles = syllabusData
      .filter(syllabus =>
        syllabus.subTopics.some(subTopic =>
          assessmentData.subTopics.includes(subTopic.subTopicId)
        )
      )
      .map(syllabus => syllabus.title);

    setSelectedSyllabus(matchedSyllabusTitles);
  }, [syllabusData, assessmentData.subTopics]);



  const handleInputChange = (field, value) => {
    setAssessmentData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Assessment Type
    if (!assessmentData.assessmentType) {
      newErrors.assessmentType = "Assessment type is required";
    }

    //  Marks
    if (!assessmentData.marks) {
      newErrors.marks = "Marks obtained is required";
    }

    //  Max Marks
    if (!assessmentData.maxMarks) {
      newErrors.maxMarks = "Maximum marks is required";
    }

    //  Syllabus
    if (!selectedSyllabus || selectedSyllabus.length === 0) {
      newErrors.syllabus = "Please select at least one syllabus";
    }

    //  Sub Topics
    if (!assessmentData.subTopics || assessmentData.subTopics.length === 0) {
      newErrors.subTopics = "Please select at least one sub topic";
    }

    //  Remarks
    if (!assessmentData.remarks || assessmentData.remarks.trim().length < 10) {
      newErrors.remarks = "Remarks must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Submitting assessment data:", assessmentData, existingAssessmentId);
    // if (!validateForm()) return;

    setIsSubmitting(true);
    const payload = {
      ...assessmentData,
      subTopicIds: assessmentData.subTopicIds,
      subTopics: selectedSubTopics.join("|"),
      marks: parseInt(assessmentData.marks),
      maxMarks: parseInt(assessmentData.maxMarks),
      percentage: Math.round((assessmentData.marks / assessmentData.maxMarks) * 100),
    };

    console.log("Payload to submit:", payload);
    try {
      if (existingAssessmentId) {
        await updateAssessment(existingAssessmentId, payload);
        setShowUpdateAlert(true);
        setTimeout(() => { setShowUpdateAlert(false); }, 2000);
      } else {
        await createAssessment(trainee.traineeId, payload);
      }
      if (onSubmitAssessment) {
        await onSubmitAssessment();   //  notify parent
      }
      onClose();

    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };
  const restrictedRoles = ["CEO", "CTO", "HR", "PM"];
  const roleName = sessionStorage.getItem("roleName");
  const isRestricted = restrictedRoles.includes(roleName);
  useEffect(() => {
    if (!trainee?.traineeId) {
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
          trainee.traineeId
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
  }, [trainee?.traineeId]);


  if (!isOpen) return null;



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

  // const handleSyllabusChange = values => {
  //   let selected = Array.isArray(values) ? values : [values];

  //   if (selected.includes("ALL")) {
  //     selected = syllabusOptions
  //       .filter(opt => opt.value !== "ALL")
  //       .map(opt => opt.value);
  //   }

  //   setSelectedSyllabus(selected);
  //   //handleInputChange("syllabusTitles", selected);
  //   setSelectedSubTopics([]);
  //   handleInputChange("subTopicIds", []);
  // };


  const handleSyllabusChange = values => {
    let selected = Array.isArray(values) ? values : [values];

    if (selected.includes("ALL")) {
      selected = syllabusOptions
        .filter(opt => opt.value !== "ALL")
        .map(opt => opt.value);
    }

    setSelectedSyllabus(selected);

    //  syllabusId nikalna (first selected syllabus)
    const selectedObj = syllabusData.find(s => s.title === selected[0]);
    if (selectedObj) {
      setSelectedSyllabusId(selectedObj.syllabusId);
    }

    setSelectedSubTopics([]);
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


  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold">{existingAssessmentId ? "Update Assessment" : "Add Assessment"}</h2>
            <p className="text-sm text-muted-foreground">{trainee?.name}</p>
          </div>

          <Button variant="ghost" size="icon" onClick={onClose} iconName="X" className="text-black" />
        </div>

        <div className="grid grid-cols-3 gap-6 p-6">
          {assessmentList.length > 0 && (
            <div className="col-span-1 border rounded-lg p-3 space-y-2">
              {assessmentList.map(a => (
                <div
                  key={a.assessmentId}
                  onClick={() => populateForm(a)}
                  className={`p-3 rounded cursor-pointer border
                    ${existingAssessmentId === a.assessmentId ? 'bg-primary/10 border-primary' : 'hover:bg-muted'}`}
                >
                  <div className="flex justify-between text-sm font-medium">
                    <span>{a.assessmentType}</span>
                    <span>{a.marks}/{a.maxMarks}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{a.assessmentDate}</p>
                </div>
              ))}
            </div>
          )}

          <div className={assessmentList.length > 0 ? "col-span-2" : "col-span-3"}>
            {showUpdateAlert && (
              <div className="mb-4 bg-green-50 text-green-700 border border-green-200 p-3 rounded text-sm">
                Assessment updated successfully
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <Select
                  label="Assessment Type"
                  disabled={isRestricted}
                  options={assessmentTypeOptions}
                  value={assessmentData.assessmentType}
                  onChange={(v) => handleInputChange('assessmentType', v)}
                  error={errors.assessmentType}
                />
                <Input
                  label="Assessment Date"
                  type="date"
                  disabled={isRestricted}
                  value={assessmentData.assessmentDate}
                  onChange={(e) => handleInputChange('assessmentDate', e.target.value)}
                />
                <Input
                  label="Marks Obtained"

                  disabled={isRestricted}
                  type="number"
                  value={assessmentData.marks}
                  onChange={(e) => handleInputChange('marks', e.target.value)}
                  error={errors.marks}
                />
                <Input
                  label="Maximum Marks"
                  type="number"
                  disabled={isRestricted}
                  value={assessmentData.maxMarks}
                  onChange={(e) => handleInputChange('maxMarks', e.target.value)}
                />

              </div>

              {assessmentData?.marks && assessmentData?.maxMarks && (
                <div className="bg-muted/30 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">Percentage:</span>
                    <span className="text-lg font-bold text-primary">
                      {Math.round((parseInt(assessmentData?.marks) / parseInt(assessmentData?.maxMarks)) * 100)}%
                    </span>
                  </div>
                  <div className="mt-2 bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.round((parseInt(assessmentData?.marks) / parseInt(assessmentData?.maxMarks)) * 100)}%`
                      }}
                    />
                  </div>
                </div>
              )}
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

                {/*  FEEDBACK BELOW SUBTOPICS */}
                {feedbackData.length > 0 && (
                  <div className="mt-4 border rounded-lg p-4 bg-muted/20">
                    <h3 className="text-sm font-semibold mb-3 text-foreground">
                      Feedback
                    </h3>

                    {feedbackData.map((item, index) => (
                      <div key={index} className="grid grid-cols-2 gap-4">

                        {/* Trainee Feedback */}
                        <div>
                          <p className="text-xs font-medium text-gray-600 mb-1">
                            Trainee Feedback
                          </p>
                          <div className="bg-gray-50 p-2 rounded border text-sm">
                            {item?.traineeFeedbackGiven
                              ? item?.traineeFeedback
                              : "Not given"}
                          </div>
                        </div>

                        {/* Trainer Feedback */}
                        {privilegeRoles.includes(roleName) && (
                          <div>
                            <p className="text-xs font-medium text-gray-600 mb-1">
                              Trainer Feedback
                            </p>
                            <div className="bg-blue-50 p-2 rounded border text-sm">
                              {item?.trainerFeedbackGiven
                                ? item?.trainerFeedback
                                : "Not given"}
                            </div>
                          </div>
                        )}

                      </div>
                    ))}
                  </div>
                )}

              </div>
              <textarea
                rows={4}
                className="w-full border rounded-lg p-2"
                disabled={isRestricted}
                placeholder="Remarks"
                value={assessmentData.remarks}
                onChange={(e) => handleInputChange('remarks', e.target.value)}
              />
              {errors.remarks && <p className="text-error text-sm">{errors.remarks}</p>}

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                {!isRestricted && (
                  <Button type="submit" loading={isSubmitting}>Save Assessment</Button>
                )}
              </div>



            </form>

          </div>
        </div>
      </div>
    </div>
  );

};

export default AssessmentEntryModal;