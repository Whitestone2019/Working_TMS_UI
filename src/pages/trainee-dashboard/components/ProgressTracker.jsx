

import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { useNavigate } from 'react-router-dom';

const ProgressTracker = ({
  onStepClick,
  className = '',
  stepsStatus = []
}) => {
  const navigate = useNavigate();

  const totalSteps = stepsStatus.length;
  const completedSteps = stepsStatus.filter(s => s.completed).length;

  const currentStep =
    stepsStatus.find(s => !s.completed && !s.locked)?.stepNumber ||
    stepsStatus[stepsStatus.length - 1]?.stepNumber ||
    1;

  const progressPercentage =
    totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  const getStepStatus = (stepNumber) => {
    const step = stepsStatus.find(s => s.stepNumber === stepNumber);

    if (!step) return 'locked';
    if (step.completed) return 'completed';
    if (!step.locked) return 'current';
    return 'locked';
  };

  const getStepIcon = (status) => {
    if (status === 'completed') return 'CheckCircle';
    if (status === 'current') return 'PlayCircle';
    return 'Lock';
  };

  return (
    <div className={`bg-card rounded-lg border border-border p-6 ${className}`}>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-black">
            Learning Progress
          </h2>
          <p className="text-sm text-muted-foreground">
            Step {currentStep} of {totalSteps} • {Math.round(progressPercentage)}% Complete
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">
            {completedSteps}/{totalSteps}
          </div>
          <div className="text-xs text-muted-foreground">
            Steps Completed
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-black">
            Overall Progress
          </span>
          <span className="text-sm text-muted-foreground">
            {Math.round(progressPercentage)}%
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-3">
          <div
            className="bg-primary rounded-full h-3 transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Steps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stepsStatus.map((step) => {
          const status = getStepStatus(step.stepNumber);
          const isClickable = status !== 'locked';

          return (
            <div
              key={step.stepNumber}
              className={`relative p-4 rounded-lg border transition-all duration-200
                ${status === 'current'
                  ? 'border-primary bg-primary/5'
                  : status === 'completed'
                    ? 'border-success bg-success/5'
                    : 'border-border bg-muted/30'}
                ${isClickable ? 'cursor-pointer hover:shadow-sm' : 'cursor-not-allowed'}
              `}
              onClick={() =>
                isClickable && onStepClick && onStepClick(step.stepNumber)
              }
            >

              {/* Step Number & Icon */}
              <div className="flex items-center space-x-3 mb-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center
                    ${status === 'current'
                      ? 'bg-primary text-primary-foreground'
                      : status === 'completed'
                        ? 'bg-success text-success-foreground'
                        : 'bg-muted text-muted-foreground'}
                  `}
                >
                  <Icon
                    name={getStepIcon(status)}
                    size={16}
                    className="text-current"
                  />
                </div>

                <span className="text-xs font-medium text-muted-foreground">
                  Step {step.stepNumber}
                </span>
              </div>

              {/* Content */}
              <h3 className={`font-medium ${status === 'locked'
                ? 'text-muted-foreground'
                : 'text-black'}`}
              >
                {step.title}
              </h3>

              <p className={`text-sm ${status === 'locked'
                ? 'text-muted-foreground/70'
                : 'text-muted-foreground'}`}
              >
                {step.description}
              </p>

              {/* Buttons */}
              {status === 'current' && (
                <div className="mt-3">
                  <Button
                    fullWidth
                    size="sm"
                    iconName="Play"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/syllabus-content-viewer`, {
                        state: step.stepNumber
                      });
                    }}
                  >
                    Continue Learning
                  </Button>
                </div>
              )}

              {status === 'completed' && (
                <div className="mt-3">
                  <Button
                    fullWidth
                    size="sm"
                    variant="default"
                    iconName="Eye"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/syllabus-content-viewer`, {
                        state: step.stepNumber
                      });
                    }}
                  >
                    Review Content
                  </Button>
                </div>
              )}

              {/* Lock Overlay */}
              {status === 'locked' && (
                <div className="absolute inset-0 bg-muted/50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Icon name="Lock" size={24} className="mx-auto mb-1" />
                    <p className="text-xs text-muted-foreground">
                      Complete previous steps
                    </p>
                  </div>
                </div>
              )}

            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressTracker;
