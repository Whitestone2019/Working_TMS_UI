import React from 'react';
import Icon from '../../../components/AppIcon';

const ProgressTracker = ({ 
  currentStep, 
  totalSteps, 
  completedSteps, 
  timeSpent, 
  estimatedTimeRemaining,
  className = '' 
}) => {
  const progressPercentage = Math.round((completedSteps / totalSteps) * 100);
  
  const formatTime = (minutes) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  return (
    <div className={`bg-surface border border-border rounded-lg p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-black">Learning Progress</h3>
        <div className="text-2xl font-bold text-primary">
          {progressPercentage}%
        </div>
      </div>
      {/* Overall Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
          <span>Overall Completion</span>
          <span>{completedSteps} of {totalSteps} steps</span>
        </div>
        <div className="w-full bg-muted rounded-full h-3">
          <div 
            className="bg-primary h-3 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
      {/* Progress Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-3 bg-muted rounded-lg">
          <div className="flex items-center justify-center mb-2">
            <Icon name="CheckCircle" size={20} className="text-success" />
          </div>
          <div className="text-lg font-semibold text-black">{completedSteps}</div>
          <div className="text-xs text-muted-foreground">Completed</div>
        </div>
        
        <div className="text-center p-3 bg-muted rounded-lg">
          <div className="flex items-center justify-center mb-2">
            <Icon name="Clock" size={20} className="text-warning" />
          </div>
          <div className="text-lg font-semibold text-black">{totalSteps - completedSteps}</div>
          <div className="text-xs text-muted-foreground">Remaining</div>
        </div>
      </div>
      {/* Time Tracking */}
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div className="flex items-center space-x-2">
            <Icon name="Timer" size={16} className="text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Time Spent Today</span>
          </div>
          <span className="text-sm font-medium text-black">
            {formatTime(timeSpent)}
          </span>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div className="flex items-center space-x-2">
            <Icon name="TrendingUp" size={16} className="text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Est. Remaining</span>
          </div>
          <span className="text-sm font-medium text-black">
            {formatTime(estimatedTimeRemaining)}
          </span>
        </div>
      </div>
      {/* Current Step Info */}
      {currentStep && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="text-sm text-muted-foreground mb-2">Current Step</div>
          <div className="flex items-center space-x-2">
            <Icon name="PlayCircle" size={16} className="text-primary" />
            <span className="text-sm font-medium text-black truncate">
              Step {currentStep?.stepNumber}: {currentStep?.title}
            </span>
          </div>
          
          {currentStep?.progress !== undefined && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Step Progress</span>
                <span>{currentStep?.progress}%</span>
              </div>
              <div className="w-full bg-border rounded-full h-1.5">
                <div 
                  className="bg-primary h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${currentStep?.progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}
      {/* Achievement Badge */}
      {progressPercentage >= 25 && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center space-x-2 p-2 bg-success/10 rounded-lg">
            <Icon name="Award" size={16} className="text-success" />
            <div>
              <div className="text-sm font-medium text-success">
                {progressPercentage >= 75 ? 'Almost There!' : 
                 progressPercentage >= 50 ? 'Halfway Champion!': 'Getting Started!'}
              </div>
              <div className="text-xs text-success/80">
                Keep up the great work!
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressTracker;