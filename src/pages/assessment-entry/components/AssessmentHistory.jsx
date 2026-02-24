

import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const AssessmentHistory = ({
  trainee,
  assessments = [],
  onViewDetails,
  className = ''
}) => {

  // Ensure assessments is always an array
  const safeAssessments = Array.isArray(assessments) ? assessments : [];

  console.log('Safe assessments:', safeAssessments, assessments, trainee);
  const [sortBy, setSortBy] = useState('date');
  const [filterType, setFilterType] = useState('');

  const sortOptions = [
    { value: 'date', label: 'Sort by Date' },
    { value: 'marks', label: 'Sort by Marks' },
    { value: 'type', label: 'Sort by Type' }
  ];

  const typeOptions = [
    { value: '', label: 'All Types' },
    { value: 'weekly', label: 'Weekly Assessment' },
    { value: 'monthly', label: 'Monthly Review' },
    { value: 'milestone', label: 'Milestone Assessment' },
    { value: 'final', label: 'Final Evaluation' }
  ];

  const sortedAssessments = [...safeAssessments]
    // .filter(a => !filterType || a?.type === filterType)
    .filter(a => !filterType || a?.type === filterType || a?.assessmentType === filterType)

    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b?.date) - new Date(a?.date);
        case 'marks':
          return b?.percentage - a?.percentage;
        case 'type':
          return a?.type?.localeCompare(b?.type);
        default:
          return 0;
      }
    });

  const getGradeColor = (percentage) => {
    if (percentage >= 90) return 'text-success bg-success/10';
    if (percentage >= 80) return 'text-primary bg-primary/10';
    if (percentage >= 70) return 'text-warning bg-warning/10';
    return 'text-error bg-error/10';
  };

  const getGradeLetter = (percentage) => {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  };

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateAverage = () => {
    if (safeAssessments.length === 0) return 0;
    const total = safeAssessments.reduce((sum, a) => sum + a?.percentage, 0);
    return Math.round(total / safeAssessments.length);
  };

  if (!trainee) {
    return (
      <div className={`bg-card border border-border rounded-lg p-8 text-center ${className}`}>
        <Icon name="History" size={48} className="text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">No Trainee Selected</h3>
        <p className="text-muted-foreground">Select a trainee to view assessment history.</p>
      </div>
    );
  }



  return (
    <div className={`bg-card border border-border rounded-lg ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Assessment History</h2>
            <p className="text-sm text-muted-foreground">
              {trainee?.username} - {safeAssessments?.length} assessments
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-foreground">{calculateAverage()}%</div>
            <div className="text-xs text-muted-foreground">Average Score</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select options={sortOptions} value={sortBy} onChange={setSortBy} />
          <Select options={typeOptions} value={filterType} onChange={setFilterType} />
        </div>
      </div>

      {/* Assessment List */}
      <div className="p-6">
        {sortedAssessments.length === 0 ? (
          <div className="text-center py-8">
            <Icon name="FileX" size={48} className="text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">
              {filterType ? 'No assessments found for selected filter' : 'No assessments recorded yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {sortedAssessments.map((assessment) => (
              <div key={assessment?.assessmentId} className="border border-border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${getGradeColor(assessment?.percentage)}`}>
                      {getGradeLetter(assessment?.percentage)}
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground capitalize">
                        {assessment?.type} Assessment
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(assessment?.date)} • {assessment?.marks}/{assessment?.maxMarks} marks
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewDetails && onViewDetails(assessment)}
                    iconName="Eye"
                    iconPosition="left"
                  >
                    View Details
                  </Button>
                </div>

                {assessment?.remarks && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      <span className="font-medium">Remarks:</span> {assessment?.remarks}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {safeAssessments.length > 0 && (
        <div className="p-6 border-t border-border">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-foreground">{safeAssessments.length}</div>
              <div className="text-xs text-muted-foreground">Total Assessments</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-success">
                {Math.max(...safeAssessments.map(a => a?.percentage))}%
              </div>
              <div className="text-xs text-muted-foreground">Highest Score</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-error">
                {Math.min(...safeAssessments.map(a => a?.percentage))}%
              </div>
              <div className="text-xs text-muted-foreground">Lowest Score</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-primary">
                {safeAssessments.filter(a => a?.percentage >= 80).length}
              </div>
              <div className="text-xs text-muted-foreground">Above 80%</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssessmentHistory;
