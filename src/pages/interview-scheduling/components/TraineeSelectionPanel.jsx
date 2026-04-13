import React, { useState, useMemo } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import '../../../App.css'
const TraineeSelectionPanel = ({
  trainees,
  selectedTrainees,
  onTraineeSelect,
  onBulkSelect,
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  console.log("trainees in panel", trainees);
  console.log("Trainee IDs:", trainees.map(t => t.id));
  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'due', label: 'Due for Interview' },
    { value: 'overdue', label: 'Overdue' },
    { value: 'scheduled', label: 'Already Scheduled' },
    { value: 'completed', label: 'Recently Completed' }
  ];

  const priorityOptions = [
    { value: 'all', label: 'All Priorities' },
    { value: 'high', label: 'High Priority' },
    { value: 'medium', label: 'Medium Prioritya' },
    { value: 'low', label: 'Low Priority' }
  ];

  const filteredTrainees = useMemo(() => {
    return trainees?.filter(trainee => {
      const matchesSearch = trainee?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
        trainee?.email?.toLowerCase()?.includes(searchTerm?.toLowerCase());

      const matchesStatus = statusFilter === 'all' || trainee?.interviewStatus === statusFilter;
      const matchesPriority = priorityFilter === 'all' || trainee?.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [trainees, searchTerm, statusFilter, priorityFilter]);

  const getStatusBadge = (status) => {
    const statusConfig = {
      due: { color: 'bg-warning/10 text-warning', label: 'Due' },
      overdue: { color: 'bg-error/10 text-error', label: 'Overdue' },
      scheduled: { color: 'bg-accent/10 text-accent', label: 'Scheduled' },
      completed: { color: 'bg-success/10 text-success', label: 'Completed' }
    };

    const config = statusConfig?.[status] || { color: 'bg-muted text-muted-foreground', label: status };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config?.color}`}>
        {config?.label}
      </span>
    );
  };

  const getPriorityIcon = (priority) => {
    const priorityConfig = {
      high: { icon: 'AlertTriangle', color: 'text-error' },
      medium: { icon: 'Clock', color: 'text-warning' },
      low: { icon: 'Minus', color: 'text-muted-foreground' }
    };

    const config = priorityConfig?.[priority] || { icon: 'Minus', color: 'text-muted-foreground' };

    return <Icon name={config?.icon} size={16} className={config?.color} />;
  };

  const getDaysSinceLastInterview = (lastInterviewDate) => {
    if (!lastInterviewDate) return 'Never';

    const today = new Date();
    const lastDate = new Date(lastInterviewDate);
    const diffTime = Math.abs(today - lastDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return `${diffDays} days ago`;
  };

  const handleSelectAll = () => {
    const allIds = filteredTrainees?.map(trainee => trainee?.id);
    onBulkSelect(allIds);
  };

  const handleClearSelection = () => {
    onBulkSelect([]);
  };

  const isTraineeSelected = (traineeId) => {
    return selectedTrainees?.includes(traineeId);
  };

  return (
    <div className={`bg-card rounded-lg border border-border ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Trainee Selection</h3>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              iconName="CheckSquare"
              iconSize={16}
            >
              Select All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearSelection}
              iconName="Square"
              iconSize={16}
            >
              Clear
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="space-y-4">
          <Input
            type="search"
            placeholder="Search trainees by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e?.target?.value)}
            className="w-full"
          />


        </div>

        {/* Selection Summary */}
        {selectedTrainees?.length > 0 && (
          <div className="mt-4 p-3 bg-primary/10 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-primary">
                {selectedTrainees?.length} trainee{selectedTrainees?.length > 1 ? 's' : ''} selected
              </span>

            </div>
          </div>
        )}
      </div>
      {/* Trainee List */}
      <div className="max-h-96 overflow-y-auto custom-scrollbar">
        {filteredTrainees?.length === 0 ? (
          <div className="p-6 text-center">
            <Icon name="Users" size={48} className="text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No trainees found matching your criteria</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredTrainees?.map(trainee => (
              <div
                key={trainee?.id}
                className={`p-4 hover:bg-muted/50 transition-colors duration-150 cursor-pointer ${isTraineeSelected(trainee?.id) ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                  }`}
                onClick={() => onTraineeSelect(trainee?.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    {/* Selection Checkbox */}
                    <div className="mt-1">
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${isTraineeSelected(trainee?.id)
                        ? 'bg-primary border-primary' : 'border-border'
                        }`}>
                        {isTraineeSelected(trainee?.id) && (
                          <Icon name="Check" size={12} className="text-primary-foreground" />
                        )}

                      </div>
                    </div>

                    {/* Trainee Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="text-sm font-medium text-foreground truncate">
                          {trainee?.name}
                        </h4>

                      </div>

                      <p className="text-xs text-muted-foreground mb-2 truncate">
                        {trainee?.email}
                      </p>

                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <span>Progress: {trainee?.progressPercentage}%</span>
                        <span>Last Interview: {getDaysSinceLastInterview(trainee?.lastInterviewDate)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="ml-2">
                    {getStatusBadge(trainee?.interviewStatus)}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-3 ml-7">
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${trainee?.progressPercentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Footer Stats */}
      <div className="p-4 border-t border-border bg-muted/30">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Showing {filteredTrainees?.length} of {trainees?.length} trainees</span>
          <span>{selectedTrainees?.length} selected</span>
        </div>
      </div>
    </div>
  );
};

export default TraineeSelectionPanel;