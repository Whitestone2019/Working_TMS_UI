
import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const TraineeSelector = ({
  selectedTrainee,
  onTraineeSelect,
  trainees = [],
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTrainees = trainees.filter(t => {
    const search = searchTerm.toLowerCase();
    return (
      t?.name?.toLowerCase().includes(search) ||
      t?.traineeId?.toLowerCase().includes(search)
    );
  });

  const getSubtopicInfo = (trainee, options = { type: 'last' }) => {
    const allSubTopics = trainee.syllabusProgress.flatMap(sp => sp.subTopics || []);
    if (!allSubTopics.length) return 'N/A';

    if (options.type === 'all') {
      // Return array of subtopic names
      return allSubTopics.map(st => st.name).join(', ');
    }
    // Default: last subtopic
    const lastSubTopic = allSubTopics.reduce((prev, current) =>
      prev.stepNumber > current.stepNumber ? prev : current
    );
    return lastSubTopic ? `Step  ${lastSubTopic.name}` : 'N/A';
    //  return lastSubTopic ? `Step ${lastSubTopic.stepNumber}: ${lastSubTopic.name}` : 'N/A';
  };


  const getInterviewStatusColor = (status) =>
    status ? 'text-success bg-success/10' : 'text-warning bg-warning/10';

  const extractStepNumber = (step) => {
    if (!step) return 0;
    const match = step.match(/\d+/);
    return match ? Number(match[0]) : 0;
  };

  return (
    <div className={`bg-card border border-border rounded-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-muted-foreground">Select Trainee</h2>
          <p className="text-sm text-muted-foreground">Choose a trainee to assess</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Icon name="Users" size={16} />
          <span>{filteredTrainees.length} trainees</span>
        </div>
      </div>

      {/* Search */}
      <Input
        type="search"
        placeholder="Search by name or trainee ID..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-6"
      />

      {/* Trainee List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredTrainees.length === 0 ? (
          <div className="text-center py-8">
            <Icon name="UserX" size={48} className="text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No trainees found</p>
          </div>
        ) : (
          filteredTrainees.map(trainee => {
            const stepNumber = extractStepNumber(trainee.currentStep);

            return (
              <div
                key={trainee.trngid || trainee.traineeId}
                onClick={() => onTraineeSelect(trainee)}
                className={`border rounded-lg p-4 cursor-pointer transition-all
                  ${selectedTrainee?.trngid === trainee?.trngid
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                  }`}
              >
                <div className="flex items-center justify-between">
                  {/* Left */}
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Icon name="User" size={20} className="text-primary" />
                    </div>

                    <div>
                      <h3 className="font-medium text-black">{trainee.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        ID: {trainee.traineeId}
                      </p>

                      {/* Progress */}
                      <div className="flex items-center space-x-2 mt-1">
                        {/* <span className="text-xs text-muted-foreground">
                          {trainee.currentStep}
                        </span> */}
                        <span className="text-xs text-muted-foreground">
                          {getSubtopicInfo(trainee)}
                        </span>

                        <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${trainee.completionPercentage || 0}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {trainee.completionPercentage || 0}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right */}
                  <div className="text-right">
                    {/* <span
                      className={`inline-flex px-2 py-1 rounded-full text-xs font-medium
                      ${getInterviewStatusColor(trainee.interviewStatus)}`}
                    >
                      {trainee.interviewStatus ? 'Interview Done' : 'Interview Pending'}
                    </span> */}
                    <p className="text-xs text-muted-foreground mt-1">
                      Last Assessment: {trainee.lastAssessmentDate || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Selected Trainee */}
      {selectedTrainee && (
        <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-black">
                Selected: {selectedTrainee.name}
              </h4>
              <p className="text-sm text-muted-foreground">
                {selectedTrainee.currentStep} • {selectedTrainee.completionPercentage}%
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              iconName="X"
              onClick={() => onTraineeSelect(null)}
            >
              Clear
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TraineeSelector;
