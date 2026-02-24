import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Checkbox from '../../../components/ui/Checkbox';

const TraineeDataTable = ({
  trainees,
  selectedTrainees,
  onSelectTrainee,
  onSelectAll,
  onViewProfile,
  onAddAssessment,
  onScheduleInterview,
  onSort,
  onViewSyllabus
}) => {
  console.log("trainees:", trainees);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig?.key === key && sortConfig?.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    onSort(key, direction);
  };

  const [selectedTraineeId, setSelectedTraineeId] = useState(null);

  // const sortedTrainees = React.useMemo(() => {
  //   if (!sortConfig.key) return trainees;
  //   return [...trainees].sort((a, b) => {
  //     let valA = a[sortConfig.key];
  //     let valB = b[sortConfig.key];

  //     // Agar string hai to lowercase karke compare karo
  //     if (typeof valA === 'string') valA = valA.toLowerCase();
  //     if (typeof valB === 'string') valB = valB.toLowerCase();

  //     if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
  //     if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
  //     return 0;
  //   });
  // }, [trainees, sortConfig]);

  const navigate = useNavigate();

  const sortedTrainees = React.useMemo(() => {
    if (!sortConfig.key) return trainees;
    return [...trainees].sort((a, b) => {
      let valA = a[sortConfig.key];
      let valB = b[sortConfig.key];

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [trainees, sortConfig]);

  const getSortIcon = (key) => {
    if (sortConfig?.key !== key) {
      return <Icon name="ArrowUpDown" size={16} className="text-muted-foreground" />;
    }
    return sortConfig?.direction === 'asc'
      ? <Icon name="ArrowUp" size={16} className="text-foreground" />
      : <Icon name="ArrowDown" size={16} className="text-foreground" />;
  };

  const getStatusBadge = (percentage) => {
    const statusConfig = {
      'not-started': { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Not Started' },
      'in-progress': { bg: 'bg-blue-100', text: 'text-blue-700', label: 'In Progress' },
      'completed': { bg: 'bg-green-100', text: 'text-green-700', label: 'Completed' }
    };

    // const config = statusConfig?.[status] || statusConfig?.['not-started'];

    let config;
    // console.log("percentage in badge", percentage);
    if (percentage >= 85) {
      config = statusConfig['completed'];
    } else if (percentage > 0 && percentage < 85) {
      config = statusConfig['in-progress'];
    } else {
      config = statusConfig['not-started'];
    }
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config?.bg} ${config?.text}`}>
        {config?.label}
      </span>
    );
  };

  const getInterviewStatusBadge = (interviewDone) => {

    const statusConfig = {
      'pending': { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Assessment Score' },
      'completed': { bg: 'bg-green-100', text: 'text-green-700', label: 'Interview Score' },
      'error': { bg: 'bg-red-100', text: 'text-red-700', label: 'N/A' }
    };
    let config;
    if (interviewDone === true) {
      config = statusConfig.completed;
    } else if (interviewDone === false) {
      config = statusConfig.pending;
    } else {
      config = statusConfig.error;
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium ${config?.bg} ${config?.text}`}>
        {config?.label}
      </span>
    );
  };

  console.log("selectedTrainees:", selectedTrainees);

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="w-12 px-6 py-4">
                <Checkbox
                  checked={selectedTrainees?.length === trainees?.length && trainees?.length > 0}
                  onChange={(e) => onSelectAll(e?.target?.checked)}
                />
              </th>
              <th className="px-6 py-4 text-left">
                <button
                  onClick={() => handleSort('name')}
                  className="flex items-center space-x-2 text-sm font-medium text-foreground hover:text-primary"
                >
                  <span>Trainee Name</span>
                  {getSortIcon('name')}
                </button>
              </th>
              <th className="px-6 py-4 text-left">
                <button
                  onClick={() => handleSort('currentStep')}
                  className="flex items-center space-x-2 text-sm font-medium text-foreground hover:text-primary"
                >
                  <span>Current Syllabus</span>
                  {getSortIcon('currentStep')}
                </button>
              </th>
              <th className="px-6 py-4 text-left">
                <button
                  onClick={() => handleSort('completion')}
                  className="flex items-center space-x-2 text-sm font-medium text-foreground hover:text-primary"
                >
                  <span>Completion</span>
                  {getSortIcon('completion')}
                </button>
              </th>
              <th className="px-6 py-4 text-left">
                <button
                  onClick={() => handleSort('lastAssessment')}
                  className="flex items-center space-x-2 text-sm font-medium text-foreground hover:text-primary"
                >
                  <span>Last Assessment</span>
                  {getSortIcon('lastAssessment')}
                </button>
              </th>
              <th className="px-6 py-4 text-left">Score Status</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">

            {sortedTrainees.map((trainee) => (
              <tr key={trainee?.traineeId} className="hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4">
                  <Checkbox
                    checked={selectedTrainees?.includes(trainee?.traineeId)}
                    onChange={(e) => onSelectTrainee(trainee?.traineeId, e?.target?.checked)}
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {trainee?.name?.split(' ')?.map(n => n?.[0])?.join('')}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{trainee?.name}</p>
                      <p className="text-xs text-muted-foreground">{trainee?.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    {/* <p className="text-sm font-medium text-foreground">
                      {trainee?.subtopics && trainee.subtopics.length > 0
                        ? `Step ${trainee.subtopics.length} :${trainee.subtopics[trainee.subtopics.length - 1]} `
                        : "No Assessment Yet"}</p> */}

                    <p className="text-sm font-medium text-foreground">{trainee?.currentStep}</p>
                    <p className="text-xs text-muted-foreground">{trainee?.stepDescription}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${trainee?.completionPercentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {trainee?.completionPercentage}%
                    </span>
                  </div>
                  {getStatusBadge(trainee?.completionPercentage)}
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm text-foreground">{trainee?.lastAssessmentDate}</p>
                    <p className="text-xs text-muted-foreground">Score: {trainee?.lastAssessmentScore}/100</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-[10px]">
                  {getInterviewStatusBadge(trainee?.interviewStatus)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center space-x-2">
                    {/* <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onViewProfile(trainee?.id)}
                      iconName="Eye"
                      iconSize={16}
                      title="View Profile"
                    /> */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onAddAssessment(trainee?.traineeId)}
                      iconName="ClipboardCheck"
                      iconSize={16}
                      title="Add Assessment"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onScheduleInterview(trainee?.id)}
                      iconName="Calendar"
                      iconSize={16}
                      title="Schedule Interview"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onViewSyllabus(trainee?.traineeId)}

                      //onClick={() => navigate(`/trainee-syllabus/${trainee?.traineeId}`)}
                      iconName="BookOpen"
                      iconSize={16}
                      title="View Syllabus"
                    />

                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4 p-4">
        {trainees?.map((trainee) => (
          <div key={trainee?.id} className="border border-border rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <Checkbox
                  checked={selectedTrainees?.includes(trainee?.id)}
                  onChange={(e) => onSelectTrainee(trainee?.id, e?.target?.checked)}
                />
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-primary">
                    {trainee?.name?.split(' ')?.map(n => n?.[0])?.join('')}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{trainee?.name}</p>
                  <p className="text-xs text-muted-foreground">{trainee?.email}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Current Step</p>
                <p className="text-sm font-medium text-foreground">{trainee?.currentStep}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1">Progress</p>
                <div className="flex items-center space-x-3">
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${trainee?.completionPercentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {trainee?.completionPercentage}%
                  </span>
                </div>
                <div className="mt-2">
                  {getStatusBadge(trainee?.completionPercentage)}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs text-muted-foreground">Last Assessment</p>
                  <p className="text-sm text-foreground">{trainee?.lastAssessmentDate}</p>
                </div>
                <div>
                  {getInterviewStatusBadge(trainee?.interviewStatus)}
                </div>
              </div>

              <div className="flex space-x-2 pt-2 border-t border-border">
                {/* <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewProfile(trainee?.id)}
                  iconName="Eye"
                  iconPosition="left"
                  iconSize={16}
                  className="flex-1"
                >
                  View
                </Button> */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onAddAssessment(trainee?.id)}
                  iconName="ClipboardCheck"
                  iconPosition="left"
                  iconSize={16}
                  className="flex-1"
                >
                  Assess
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onScheduleInterview(trainee?.id)}
                  iconName="Calendar"
                  iconPosition="left"
                  iconSize={16}
                  className="flex-1"
                >
                  Interview
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onViewSyllabus(trainee?.traineeId)}


                  iconName="BookOpen"
                  iconSize={16}
                  title="View Syllabus"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TraineeDataTable;