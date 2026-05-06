import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const AssessmentHistory = ({ className = '', assessments = [], syllabus = [] }) => {
  const [selectedAssessment, setSelectedAssessment] = useState(null);


  const getGradeColor = (grade) => {
    if (!grade) return 'text-muted-foreground';
    if (grade?.startsWith('A')) return 'text-success';
    if (grade?.startsWith('B')) return 'text-primary';
    if (grade?.startsWith('C')) return 'text-warning';
    return 'text-error';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return 'CheckCircle';
      case 'pending':
        return 'Clock';
      default:
        return 'AlertCircle';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-success';
      case 'pending':
        return 'text-warning';
      default:
        return 'text-error';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not assessed';
    return new Date(dateString)?.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const calculateAverage = () => {
    const completedAssessments = assessments?.filter((a) => a?.marks !== null);
    if (completedAssessments?.length === 0) return 0;

    const total = completedAssessments?.reduce((sum, a) => sum + a?.marks, 0);
    return Math.round(total / completedAssessments?.length);
  };

  return (
    <div className={`bg-card rounded-lg border border-border ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-black flex items-center">
              <Icon name="ClipboardCheck" size={24} className="mr-3 text-primary" />
              Assessment History
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Weekly assessment results and manager feedback
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">{calculateAverage()}%</div>
            <div className="text-xs text-muted-foreground">Average Score</div>
          </div>
        </div>
      </div>
      {/* Assessment List */}
      <div className="p-6 ">
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
          {assessments?.map((assessment) =>
            <div
              key={assessment?.id}
              className={`border border-border rounded-lg p-4 transition-all duration-200 hover:shadow-sm ${selectedAssessment === assessment?.id ? 'border-primary bg-primary/5' : ''}`
              }>

              {/* Assessment Summary */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${assessment?.status === 'completed' ? 'bg-success/10' : 'bg-warning/10'}`
                  }>
                    <Icon
                      name={getStatusIcon(assessment?.status)}
                      size={20}
                      className={getStatusColor(assessment?.status)} />

                  </div>
                  <div>
                    <h3 className="font-medium text-black">Week {assessment?.week} Assessment</h3>
                    <p className="text-sm text-muted-foreground">{assessment?.step}</p>
                  </div>
                </div>
                <div className="text-right">
                  {assessment?.marks !== null ?
                    <div className="flex items-center space-x-3">
                      <div>
                        <div className="text-lg font-semibold text-black">
                          {assessment?.marks}/{assessment?.maxMarks}
                        </div>
                        <div className={`text-sm font-medium ${getGradeColor(assessment?.grade)}`}>
                          Grade: {assessment?.grade}
                        </div>
                      </div>
                    </div> :

                    <div className="text-sm text-muted-foreground">
                      Pending Assessment
                    </div>
                  }
                </div>
              </div>

              {/* Assessment Details */}
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                <span>Assessed on: {formatDate(assessment?.date)}</span>
                <span>Manager: {assessment?.managerName}</span>
              </div>



              {/* Remarks Preview */}
              {assessment?.remarks &&
                <div className="bg-muted/30 rounded-lg p-3 mb-3">
                  <p className="text-sm text-black line-clamp-2">
                    {assessment?.remarks?.split('\n')?.[0]}
                  </p>
                </div>
              }

              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {assessment?.status === 'completed' &&
                    <div className="flex items-center space-x-1 text-xs text-success">
                      <Icon name="CheckCircle" size={14} />
                      <span>Completed</span>
                    </div>
                  }
                  {assessment?.status === 'pending' &&
                    <div className="flex items-center space-x-1 text-xs text-warning">
                      <Icon name="Clock" size={14} />
                      <span>Awaiting Assessment</span>
                    </div>
                  }
                </div>
                {assessment?.remarks &&
                  <Button
                    variant="outline"
                    size="sm"
                    iconName={selectedAssessment === assessment?.id ? "ChevronUp" : "ChevronDown"}
                    iconPosition="right"
                    iconSize={14}
                    onClick={() => setSelectedAssessment(
                      selectedAssessment === assessment?.id ? null : assessment?.id
                    )}>

                    {selectedAssessment === assessment?.id ? 'Hide Details' : 'View Details'}
                  </Button>
                }
              </div>

              {/* Expanded Details */}
              {selectedAssessment === assessment?.id && assessment?.remarks &&
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="space-y-4">
                    {/* Manager Info */}
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full overflow-hidden">
                        <img
                          src={assessment?.managerAvatar}
                          alt={assessment?.managerAvatarAlt}
                          className="w-full h-full object-cover" />

                      </div>
                      <div>
                        <p className="text-sm font-medium text-black">{assessment?.managerName}</p>
                        <p className="text-xs text-muted-foreground">Training Manager</p>
                      </div>
                    </div>


                    {syllabus?.[assessment.week - 1] && (
                      <div className="bg-primary/5 rounded-lg p-3">
                        <div className="flex items-start gap-2">

                          {/* LEFT: SYLLABUS */}
                          <div className="w-[28%] font-medium text-black text-sm whitespace-nowrap">
                            📘 Syllabus:
                            <span className="ml-1 font-normal">
                              {syllabus[assessment.week - 1]?.title}
                            </span>
                          </div>

                          {/* RIGHT: COMPLETED SUBTOPICS */}
                          <div className="w-[72%] flex items-center gap-1 overflow-x-auto whitespace-nowrap text-sm">
                            <span className="text-muted-foreground mr-1">
                              Subtopics:
                            </span>

                            {syllabus[assessment.week - 1]?.subTopics
                              ?.filter(sub =>
                                sub?.stepProgress?.some(
                                  p => p.complete === true && p.checker === true
                                )
                              )?.length > 0 ? (
                              syllabus[assessment.week - 1]?.subTopics
                                ?.filter(sub =>
                                  sub?.stepProgress?.some(
                                    p => p.complete === true && p.checker === true
                                  )
                                )
                                ?.map((sub, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-[2px] rounded-md
                bg-primary/10 text-primary border border-primary/30
                shrink-0"
                                  >
                                    {sub.name}
                                  </span>
                                ))
                            ) : (
                              <span className="text-muted-foreground">
                                No subtopics completed
                              </span>
                            )}
                          </div>

                        </div>
                      </div>
                    )}



                    {/* Full Remarks */}
                    <div className="bg-muted/30 rounded-lg p-4">
                      <h4 className="font-medium text-black mb-2">Manager Remarks:</h4>
                      <div className="text-sm text-black whitespace-pre-line">
                        {assessment?.remarks}
                      </div>
                    </div>

                    {/* Feedback */}
                    {assessment?.feedback &&
                      <div className="bg-primary/5 rounded-lg p-4">
                        <h4 className="font-medium text-black mb-2">Additional Feedback:</h4>
                        <p className="text-sm text-black">{assessment?.feedback}</p>
                      </div>
                    }
                  </div>
                </div>
              }
            </div>
          )}
        </div>

        {/* Summary Stats */}
        <div className="mt-6 pt-6 border-t border-border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-black">
                {assessments?.filter((a) => a?.status === 'completed')?.length}
              </div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-warning">
                {assessments?.filter((a) => a?.status === 'pending')?.length}
              </div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-primary">{calculateAverage()}%</div>
              <div className="text-sm text-muted-foreground">Average</div>
            </div>
          </div>
        </div>
      </div>
    </div>);

};

export default AssessmentHistory;