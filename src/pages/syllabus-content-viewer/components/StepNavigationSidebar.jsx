import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const StepNavigationSidebar = ({
  steps,
  currentStepId,
  onStepSelect,
  isCollapsed = false,
  onToggleCollapse
}) => {
  const getStepStatus = (step) => {
    if (step?.isCompleted) return 'completed';
    if (step?.id === currentStepId) return 'current';
    if (step?.isLocked) return 'locked';
    return 'available';
  };

  const getStepIcon = (step) => {
    const status = getStepStatus(step);
    switch (status) {
      case 'completed':
        return 'CheckCircle';
      case 'current':
        return 'PlayCircle';
      case 'locked':
        return 'Lock';
      default:
        return 'Circle';
    }
  };

  const getStepIconColor = (step) => {
    const status = getStepStatus(step);
    switch (status) {
      case 'completed':
        return 'text-success';
      case 'current':
        return 'text-primary';
      case 'locked':
        return 'text-muted-foreground';
      default:
        return 'text-muted-foreground';
    }
  };

  const handleStepClick = (step) => {
    if (!step?.isLocked && onStepSelect) {
      onStepSelect(step?.id);
    }
  };



  return (
    <div className={`bg-background border-r border-border transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-80'
      }`}>
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        {!isCollapsed && (
          <div>
            <h2 className="text-lg font-semibold text-black">Syllabus Steps</h2>
            <p className="text-sm text-muted-foreground">Training Progress</p>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          iconName={isCollapsed ? "ChevronRight" : "ChevronLeft"}
          iconSize={16}
          className="h-8 w-8"
        />
      </div>
      {/* Steps List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {steps?.map((step, index) => {
            const status = getStepStatus(step);
            const isClickable = !step?.isLocked;

            return (
              <div
                key={step?.id}
                className={`relative ${!isCollapsed ? 'pl-8' : ''}`}
              >
                {/* Step Connection Line */}
                {!isCollapsed && index < steps?.length - 1 && (
                  <div className="absolute left-4 top-8 w-px h-8 bg-border" />
                )}
                {/* Step Item */}
                <div
                  onClick={() => handleStepClick(step)}
                  className={`flex items-center p-3 rounded-lg transition-all duration-150 ${isClickable
                    ? 'cursor-pointer hover:bg-muted' : 'cursor-not-allowed opacity-60'
                    } ${status === 'current' ? 'bg-primary/10 border border-primary/20' : 'border border-transparent'
                    }`}
                >
                  {/* Step Icon */}
                  <div className={`flex-shrink-0 ${!isCollapsed ? 'mr-3' : ''}`}>
                    <Icon
                      name={getStepIcon(step)}
                      size={20}
                      className={getStepIconColor(step)}
                    />
                  </div>

                  {/* Step Content */}
                  {!isCollapsed && (
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className={`text-sm font-medium truncate ${status === 'current' ? 'text-primary' : 'text-black'
                          }`}>
                          Step {step?.stepNumber}: {step?.title}
                        </h3>
                        {step?.isLocked && (
                          <Icon name="Lock" size={14} className="text-muted-foreground ml-2" />
                        )}
                      </div>

                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {step?.description}
                      </p>

                      {/* Step Progress */}
                      {status === 'current' && step?.progress !== undefined && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                            <span>Progress</span>
                            <span>{step?.progress}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-1.5">
                            <div
                              className="bg-primary h-1.5 rounded-full transition-all duration-300"
                              style={{ width: `${step?.progress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Completion Info */}
                      {step?.isCompleted && step?.completedAt && (
                        <div className="mt-2 text-xs text-success">
                          <Icon name="Check" size={12} className="inline mr-1" />
                          Completed {new Date(step.completedAt)?.toLocaleDateString()}
                        </div>
                      )}

                      {/* Lock Reason */}
                      {step?.isLocked && step?.lockReason && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          <Icon name="Info" size={12} className="inline mr-1" />
                          {step?.lockReason}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Sidebar Footer */}
      {!isCollapsed && (
        <div className="border-t border-border p-4">
          <div className="text-center">
            <div className="text-sm font-medium text-black mb-1">
              Overall Progress
            </div>
            <div className="text-2xl font-bold text-primary mb-2">
              {Math.round((steps?.filter(s => s?.isCompleted)?.length / steps?.length) * 100)}%
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${(steps?.filter(s => s?.isCompleted)?.length / steps?.length) * 100}%`
                }}
              />
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              {steps?.filter(s => s?.isCompleted)?.length} of {steps?.length} steps completed
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StepNavigationSidebar;