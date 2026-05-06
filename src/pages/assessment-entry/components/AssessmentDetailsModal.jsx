


import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { fetchCompletedSubTopics } from '../../../api_service';

const AssessmentDetailsModal = ({
  assessment,
  trainee,
  syllabus = [],
  isOpen,
  onClose,
  onEdit,
  className = ''
}) => {
  const [syllabusData, setSyllabusData] = useState([]);
  const [completedSubTopics, setCompletedSubTopics] = useState([]);
  const [selectedSyllabus, setSelectedSyllabus] = useState([]);
  const [selectedSubTopics, setSelectedSubTopics] = useState([]);

  useEffect(() => {
    if (!trainee?.traineeId || !assessment) return;

    const loadData = async () => {
      try {
        const response = await fetchCompletedSubTopics();

        const rawData = Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
            ? response.data
            : [];

        //  SAME function as EntryModal
        const completedSyllabus = getCompletedSyllabusData(
          rawData,
          trainee.traineeId
        );

        setSyllabusData(completedSyllabus);

        //  flat subtopic list (for label resolving)
        const subTopicOptions = completedSyllabus.flatMap(syllabus =>
          syllabus.subTopics.map(subTopic => ({
            value: subTopic.subTopicId,
            label: `${syllabus.title} - ${subTopic.stepNumber}. ${subTopic.name}`,
            title: syllabus.title
          }))
        );

        setCompletedSubTopics(subTopicOptions);

        //  normalize assessment subtopics
        const assessmentSubTopicIds =
          Array.isArray(assessment?.subTopics)
            ? assessment.subTopics
            : typeof assessment?.subTopics === "string"
              ? assessment.subTopics.split("|").map(Number)
              : [];

        //  set selected subtopics
        setSelectedSubTopics(assessmentSubTopicIds);

        //  auto-detect syllabus from subtopics
        const matchedSyllabusTitles = completedSyllabus
          .filter(syllabus =>
            syllabus.subTopics.some(sub =>
              assessmentSubTopicIds.includes(sub.subTopicId)
            )
          )
          .map(s => s.title);

        setSelectedSyllabus(matchedSyllabusTitles);

      } catch (err) {
        console.error("Error fetching completed syllabus:", err);
        setSyllabusData([]);
        setCompletedSubTopics([]);
        setSelectedSyllabus([]);
        setSelectedSubTopics([]);
      }
    };

    loadData();
  }, [trainee?.traineeId, assessment]);


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
        if (!completedSubTopics?.length) return null;
        return { ...syllabus, subTopics: completedSubTopics };
      })
      .filter(Boolean);
  };


  if (!isOpen || !assessment) return null;

  console.log('AssessmentDetailsModal assessment:', assessment);
  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getGradeColor = (percentage) => {
    if (percentage >= 90) return 'text-success bg-success/10 border-success/20';
    if (percentage >= 80) return 'text-primary bg-primary/10 border-primary/20';
    if (percentage >= 70) return 'text-warning bg-warning/10 border-warning/20';
    return 'text-error bg-error/10 border-error/20';
  };

  const getGradeLetter = (percentage) => {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  };

  const getPerformanceMessage = (percentage) => {
    if (percentage >= 90) return 'Excellent Performance';
    if (percentage >= 80) return 'Good Performance';
    if (percentage >= 70) return 'Satisfactory Performance';
    if (percentage >= 60) return 'Needs Improvement';
    return 'Poor Performance';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />

      {/* Modal */}
      <div className={`relative bg-card border border-border rounded-lg elevation-3 w-full max-w-2xl mx-4 max-h-[100vh] overflow-hidden ${className}`}>

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold text-black">Assessment Details</h2>
            <p className="text-sm text-muted-foreground">
              {trainee?.name} • {formatDate(assessment?.date)}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} iconName="X" iconSize={20} />
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">

          {/* Score Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className={`text-center p-6 rounded-lg border ${getGradeColor(assessment?.percentage)}`}>
              <div className="text-4xl font-bold mb-2">{getGradeLetter(assessment?.percentage)}</div>
              <div className="text-lg font-semibold mb-1">{assessment?.percentage}%</div>
              <div className="text-sm opacity-80">{getPerformanceMessage(assessment?.percentage)}</div>
            </div>

            <div className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-muted-foreground">{assessment?.marks}</div>
                <div className="text-sm text-muted-foreground">Marks Obtained</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-black">{assessment?.maxMarks}</div>
                <div className="text-sm text-muted-foreground">Maximum Marks</div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="text-center">
                <div className="text-lg font-semibold text-black capitalize">{assessment?.type?.replace('_', ' ')}</div>
                <div className="text-sm text-muted-foreground">Assessment Type</div>
              </div>
            </div>
          </div>

         

          {/* General Remarks + Recommendations SIDE BY SIDE */}
{(assessment?.remarks || assessment?.recommendations) && (
  <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">

    {/* LEFT - General Remarks */}
    {assessment?.remarks && (
      <div>
        <h3 className="text-lg font-semibold text-black mb-3 flex items-center">
          <Icon name="MessageSquare" size={20} className="mr-2" />
          General Remarks
        </h3>
        <div className="bg-muted/50 rounded-lg p-4 h-full">
          <p className="text-black leading-relaxed">
            {assessment?.remarks}
          </p>
        </div>
      </div>
    )}

    {/* RIGHT - Recommendations */}
    {assessment?.recommendations && (
      <div>
        <h3 className="text-lg font-semibold text-black mb-3 flex items-center">
          <Icon name="Lightbulb" size={20} className="mr-2 text-primary" />
          Recommendations
        </h3>
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 h-full">
          <p className="text-sm text-black">
            {assessment?.recommendations}
          </p>
        </div>
      </div>
    )}

  </div>
)}

          {/* Detailed Feedback */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {assessment?.strengths && (
              <div>
                <h4 className="font-semibold text-black mb-3 flex items-center">
                  <Icon name="TrendingUp" size={16} className="mr-2 text-success" />
                  Strengths
                </h4>
                <div className="bg-success/5 border border-success/20 rounded-lg p-3">
                  <p className="text-sm text-black">{assessment?.strengths}</p>
                </div>
              </div>
            )}

            {/* SYLLABUS | SUBTOPICS SIDE BY SIDE */}
            {syllabusData.length > 0 && selectedSubTopics.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-black mb-3 flex items-center">
                  <Icon name="BookOpen" size={18} className="mr-2" />
                  Syllabus & Subtopics
                </h3>

                <div className="space-y-3">
                  {syllabusData.map(syllabus => {
                    const matchedSubs = syllabus.subTopics.filter(sub =>
                      selectedSubTopics.includes(sub.subTopicId)
                    );

                    if (!matchedSubs.length) return null;

                    return (
                      <div
                        key={syllabus.title}
                        className=" rounded-lg p-3 bg-muted/20"
                      >
                        {/* LEFT: SYLLABUS */}
                        <div className="w-1/3 font-semibold text-sm text-black">
                          📘 {syllabus.title}
                        </div>

                        {/* RIGHT: SUBTOPICS */}
                        <div className="w-2/3 flex overflow-x gap-2 text-sm">
                          {matchedSubs.map(sub => (
                            <span
                              key={sub.subTopicId}
                              className="px-2 py-1 rounded-md
                  bg-primary/10 text-primary border border-primary/30"
                            >
                              {sub.stepNumber}.{sub.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}



            {assessment?.improvements && (
              <div>
                <h4 className="font-semibold text-black mb-3 flex items-center">
                  <Icon name="Target" size={16} className="mr-2 text-warning" />
                  Areas for Improvement
                </h4>
                <div className="bg-warning/5 border border-warning/20 rounded-lg p-3">
                  <p className="text-sm text-black">{assessment?.improvements}</p>
                </div>
              </div>
            )}

           
          </div>




          {/* Assessment Metadata */}
          <div className="bg-muted/30 rounded-lg p-4">
            <h4 className="font-semibold text-black mb-3">Assessment Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Assessment ID:</span>
                <span className="text-black font-medium">{assessment?.assessmentId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Submitted:</span>
                <span className="text-black font-medium">
                  {assessment?.submittedAt ? new Date(assessment.submittedAt)?.toLocaleString() : 'Not submitted'}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6">
          <Button variant="default" onClick={onClose} iconName="X" iconPosition="left">
            Close
          </Button>
        </div>

      </div>
    </div>
  );
}
export default AssessmentDetailsModal;

