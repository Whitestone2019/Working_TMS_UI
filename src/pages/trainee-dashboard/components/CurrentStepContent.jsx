import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import SecureContentWrapper from '../../../components/ui/SecureContentWrapper';

const CurrentStepContent = ({
  currentStep = 1,
  onStepComplete,
  className = '',
  syllabus = [],
  stepsStatus = []

}) => {
  const [isCompleting, setIsCompleting] = useState(false);



  const currentContent = syllabus[currentStep - 1];


  const handleCompleteStep = async () => {
    setIsCompleting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    if (onStepComplete) {
      onStepComplete(currentStep);
    }

    setIsCompleting(false);
  };

  const handleSessionExpired = () => {
    // Handle session expiry
    console.log('Session expired - redirecting to login');
  };

  return (

    <div className="bg-card rounded-lg border border-border overflow-hidden">
      {/* Content Header */}
      <div className="bg-primary/5 border-b border-border p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Icon name="BookOpen" size={24} color="white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-black">{currentContent?.title}</h2>
              <div className="flex items-center space-x-4 mt-1">
                <span className="text-sm text-muted-foreground flex items-center">
                  <Icon name="Clock" size={14} className="mr-1" />
                  {currentContent?.duration}
                </span>
                <span className="text-sm text-muted-foreground flex items-center">
                  <Icon name="User" size={14} className="mr-1" />
                  Step {currentStep}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="px-3 py-1 bg-primary text-black text-sm rounded-full">
              In Progress
            </div>
          </div>
        </div>
      </div>

      {/* Content Body */}
      <div className="p-6">
        {/* Main Content */}
        <div className="prose max-w-none mb-8">
          <div className="text-black leading-relaxed whitespace-pre-line">
            {currentContent?.content}
          </div>
          {currentContent?.subTopics?.map((topic, index) => (
            <div key={index} className="bg-muted/30 p-4 rounded border mb-3">
              <h4 className="font-medium">{topic.name}</h4>
              <p className="text-sm text-muted-foreground">{topic.description}</p>

              <a href={`http://localhost:8080/${topic.filePath}`} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="xs">Open File</Button>
              </a>
            </div>
          ))}
        </div>

        {/* Resources Section */}
        <div className="border-t border-border pt-6">
          <h3 className="text-lg font-semibold text-black mb-4 flex items-center">
            <Icon name="FileText" size={20} className="mr-2" />
            Learning Resources
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {currentContent?.resources?.map((resource, index) => (
              <div key={index} className="bg-muted/30 rounded-lg p-4 border border-border">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon
                      name={
                        resource?.type === 'PDF' ? 'FileText' :
                          resource?.type === 'Video' ? 'Play' :
                            resource?.type === 'Interactive' ? 'Monitor' : 'Book'
                      }
                      size={18}
                      className="text-black"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-black text-sm mb-1">{resource?.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {resource?.size || resource?.duration || `${resource?.items}`}
                    </p>
                    <div className="mt-2">
                      <Button
                        variant="outline"
                        size="xs"
                        iconName="ExternalLink"
                        iconPosition="right"
                        iconSize={12}
                        className="text-xs"
                      >
                        Access
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Progress Actions */}
        <div className="border-t border-border pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                iconName="BookmarkPlus"
                iconPosition="left"
                iconSize={16}
              >
                Bookmark
              </Button>
              <Button
                variant="outline"
                iconName="MessageSquare"
                iconPosition="left"
                iconSize={16}
              >
                Ask Question
              </Button>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                iconName="ChevronLeft"
                iconPosition="left"
                iconSize={16}
                disabled={currentStep === 1}
              >
                Previous
              </Button>
              <Button
                variant="default"
                iconName="CheckCircle"
                iconPosition="left"
                iconSize={16}
                loading={isCompleting}
                onClick={handleCompleteStep}
              >
                {isCompleting ? 'Completing...' : 'Mark as Complete'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>

  );
};

export default CurrentStepContent;