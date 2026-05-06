import React, { useState, useMemo } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';


const InterviewStatusTracker = ({
  interviews,
  onStatusUpdate,
  onViewDetails,
  onComplete,
  onReschedule,
  className = ''
}) => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');

   const userRole = sessionStorage.getItem("roleName");
  const restrictedRoles = ["HR", "CEO", "CTO", "TM"];
  const isRestricted = restrictedRoles.includes(userRole);

  console.log('Interviews:', interviews);


  const data = interviews || [];

  const grouped = {};

  data.forEach(item => {
    const scheduleId = item?.interviewSchedule?.scheduleId;
    if (!scheduleId) return;

    if (!grouped[scheduleId]) {
      grouped[scheduleId] = {
        id: scheduleId,
        scheduleId,
        interviewSchedule: item.interviewSchedule,
        trainees: [],
        manager: [],
        status: "",
      };
    }

    if (item?.user && item?.roleRvsp?.toLowerCase() === 'trainee') {
      grouped[scheduleId].trainees.push({
        firstname: item.user?.firstname,
        lastname: item.user?.lastname,
        status: item?.rsvpStatus?.trim().toLowerCase() || 'pending',
        trngid: item.user?.trngid
      });
    }

    if (item?.user && item?.roleRvsp?.toLowerCase() === 'manager') {
      const managerStatus = item?.rsvpStatus?.trim().toLowerCase() || 'pending';

      grouped[scheduleId].manager.push({
        firstname: item.user?.firstname,
        lastname: item.user?.lastname,
        status: item?.rsvpStatus?.trim().toLowerCase() || 'pending',
        trngid: item.user?.trngid
      });
      grouped[scheduleId].status = managerStatus;
    }

  });

  const transformedSchedules = Object.values(grouped).map(group => {
    const trainees = group.trainees.filter(Boolean);
    const manager = group.manager?.filter(Boolean) || [];
    return {
      id: group.scheduleId,
      scheduleId: group.scheduleId,
      traineeName: trainees
        .map(t =>
          `${t?.firstname || "Trainee"} ${t?.lastname || ""}`
        )
        .join(", "),
      trainees,
      manager,
      interviewerName: group.interviewSchedule?.managerId?.firstname || "N/A",
      scheduledDate: group.interviewSchedule?.date,
      time: group.interviewSchedule?.time,
      duration: group.interviewSchedule?.duration,
      type: group.interviewSchedule?.interviewType,
      location: group.interviewSchedule?.location,
      notes: group.interviewSchedule?.notes || "",
      status: group.status,

      //  IMPORTANT: keeps all users for reschedule
      // rawItems: data.filter(
      //   i => i?.interviewSchedule?.scheduleId === group.scheduleId && i?.roleRvsp?.toLowerCase() === 'trainee'
      // )
      rawItems: data.filter(
  i =>
    String(i?.interviewSchedule?.scheduleId) === String(group.scheduleId)
)

    };
  });

  interviews = transformedSchedules;

  console.log('Transformed Interviews:', interviews);

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'needsaction', label: 'Pending Confirmation' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'declined', label: 'Declined' },
    { value: 'tentative', label: 'Tentative' }
  ];

  const sortOptions = [
    { value: 'date', label: 'Sort by Date' },
    { value: 'status', label: 'Sort by Status' },
    { value: 'trainee', label: 'Sort by Trainee' },
    { value: 'interviewer', label: 'Sort by Interviewer' }
  ];

  const getStatusConfig = (status) => {
    const statusMap = {
      pending: {
        color: 'text-warning',
        bgColor: 'bg-warning/10',
        borderColor: 'border-warning/20',
        icon: 'Clock',
        label: 'Pending'
      },
      accepted: {
        color: 'text-black',
        bgColor: 'bg-accent/10',
        borderColor: 'border-accent/20',
        icon: 'CheckCircle',
        label: 'Accepted'
      },
      completed: {
        color: 'text-success',
        bgColor: 'bg-success/10',
        borderColor: 'border-success/20',
        icon: 'Check',
        label: 'Completed'
      },
      declined: {
        color: 'text-error',
        bgColor: 'bg-error/10',
        borderColor: 'border-error/20',
        icon: 'X',
        label: 'Declined'
      },
      tentative: {
        color: 'text-primary',
        bgColor: 'bg-primary/10',
        borderColor: 'border-primary/20',
        icon: 'Calendar',
        label: 'Tentative'
      }
    };
    return statusMap?.[status];
  };

  const filteredAndSortedInterviews = React.useMemo(() => {
    let filtered = interviews?.filter(interview => {
      const matchesStatus = statusFilter === 'all' || interview?.status === statusFilter;

      const matchesSearch =
        interview?.traineeName?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
        interview?.interviewerName?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
        interview?.type?.toLowerCase()?.includes(searchTerm?.toLowerCase());

      return matchesStatus && matchesSearch;
    });

    // Sort interviews
    filtered?.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(a.scheduledDate) - new Date(b.scheduledDate);
        case 'status':
          return a?.status?.localeCompare(b?.status);
        case 'trainee':
          return a?.traineeName?.localeCompare(b?.traineeName);
        case 'interviewer':
          return a?.interviewerName?.localeCompare(b?.interviewerName);
        default:
          return 0;
      }
    });

    return filtered;
  }, [interviews, statusFilter, searchTerm, sortBy]);

  // const getStatusActions = (interview) => {
  //   const actions = [];
  //   const anyAccepted = interview?.trainees?.length > 1 && interview?.trainees?.some(t => t.status === 'accepted');

  //   if (anyAccepted) {
  //     // If any trainee accepted, show Complete + Reschedule + Cancel
  //     actions.push(
  //       { label: 'Complete', action: 'complete', variant: 'default', icon: 'CheckCircle' },
  //       { label: 'Reschedule', action: 'reschedule', variant: 'default', icon: 'Calendar' },
  //       { label: 'Cancel', action: 'cancel', variant: 'outline', icon: 'X' }
  //     );
  //   } else {

  //     switch (interview?.status.toLowerCase()) {
  //       case 'pending':
  //       case 'tentative':
  //       case 'declined':
  //       case 'needsaction':
  //         actions?.push(
  //           { label: 'Reschedule', action: 'reschedule', variant: 'default', icon: 'Calendar' },
  //           { label: 'Cancel', action: 'cancel', variant: 'outline', icon: 'X' },

  //         );
  //         break;
  //       case 'accepted':
  //         actions?.push(
  //           { label: 'Complete', action: 'complete', variant: 'default', icon: 'CheckCircle' },
  //           { label: 'Cancel', action: 'cancel', variant: 'outline', icon: 'X' }
  //         );
  //         break;
  //       case 'cancelled':
  //         actions?.push(
  //           { label: 'Reschedule', action: 'reschedule', variant: 'default', icon: 'Calendar' }
  //         );
  //         break;
  //       default:
  //         actions?.push(
  //           { label: 'Cancel', action: 'cancel', variant: 'outline', icon: 'X' }
  //         );
  //     }
  //   }
  //   return actions;

  // };

const getStatusActions = (interview) => {
  const actions = [];
  const anyAccepted = interview?.trainees?.length > 1 && interview?.trainees?.some(t => t.status === 'accepted');

  if (anyAccepted) {

    if (!isRestricted) {
      actions.push(
        { label: 'Complete', action: 'complete', variant: 'default', icon: 'CheckCircle' },
        { label: 'Reschedule', action: 'reschedule', variant: 'default', icon: 'Calendar' },
        { label: 'Cancel', action: 'cancel', variant: 'outline', icon: 'X' }
      );
    }

  } else {

    switch (interview?.status.toLowerCase()) {

      case 'pending':
      case 'tentative':
      case 'declined':
      case 'needsaction':

        if (!isRestricted) {
          actions.push(
            { label: 'Reschedule', action: 'reschedule', variant: 'default', icon: 'Calendar' },
            { label: 'Cancel', action: 'cancel', variant: 'outline', icon: 'X' }
          );
        }

        break;

      case 'accepted':

        if (!isRestricted) {
          actions.push(
            { label: 'Complete', action: 'complete', variant: 'default', icon: 'CheckCircle' },
            { label: 'Cancel', action: 'cancel', variant: 'outline', icon: 'X' }
          );
        }

        break;

      case 'cancelled':

        if (!isRestricted) {
          actions.push(
            { label: 'Reschedule', action: 'reschedule', variant: 'default', icon: 'Calendar' }
          );
        }

        break;

      default:

        if (!isRestricted) {
          actions.push(
            { label: 'Cancel', action: 'cancel', variant: 'outline', icon: 'X' }
          );
        }
    }
  }

  return actions;
};

  const handleActionClick = (interview, action) => {

    if (isRestricted) {
    alert("You are not authorized for this action");
    return;
  }


    switch (action) {

      case 'reschedule':

        //console.log('Rescheduling Interview ID:', interview?.interviewSchedule?.scheduleId);
        console.log('Rescheduling Interview ID:', interview?.scheduleId);
        // const selected = data.filter(
        //   item => {
        //     console.log('Comparing:', item.interviewSchedule?.scheduleId, interview?.scheduleId);
        //     return item.interviewSchedule?.scheduleId === interview?.scheduleId
        //   }
        // );
        const selected = data.filter(item => {
  console.log('Comparing:', item.interviewSchedule?.scheduleId, interview?.scheduleId);

  return String(item.interviewSchedule?.scheduleId) === String(interview?.scheduleId);
});
        // if (!selected) {
        //   console.warn('No matching interview found for reschedule');
        //   return;
        // }
        // onReschedule(selected);

        if (!selected || selected.length === 0) {
  console.warn('No matching interview found for reschedule');
  return;
}

onReschedule(selected);

        break;

      case 'cancel':
        onStatusUpdate(interview?.id, action);
        break;

      case 'complete':
        console.log(`Action: ${action} for Interview ID: ${interview}`);
        // onComplete(interview?.scheduleId, action);
        onStatusUpdate(interview, action);
        // console.log('Completing Interview ID:', filteredAndSortedInterviews);
        break;
      case 'feedback':
        onViewDetails(interview?.id, 'feedback');
        break;
      default:
        onViewDetails(interview?.id);
    }
  };

  const formatDateTime = (date, time) => {
    const interviewDate = new Date(date);
    return `${interviewDate?.toLocaleDateString()} at ${time}`;
  };

  const getTimeUntilInterview = (date, time) => {
    const interviewDateTime = new Date(`${date} ${time}`);
    const now = new Date();
    const diffMs = interviewDateTime - now;
    const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));

    if (diffHours < 0) return 'Past due';
    if (diffHours < 24) return `In ${diffHours} hour${diffHours > 1 ? 's' : ''}`;

    const diffDays = Math.ceil(diffHours / 24);
    return `In ${diffDays} day${diffDays > 1 ? 's' : ''}`;
  };

  return (
    <div className={`bg-card rounded-lg border border-border ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-card-foreground">Interview Status Tracker</h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">
              {filteredAndSortedInterviews?.length} of {interviews?.length} interviews
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            type="search"
            placeholder="Search interviews..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e?.target?.value)}
          />

          <Select
            options={statusOptions}
            value={statusFilter}
            onChange={setStatusFilter}
            placeholder="Filter by status"
          />

          <Select
            options={sortOptions}
            value={sortBy}
            onChange={setSortBy}
            placeholder="Sort interviews"
          />
        </div>
      </div>
      {/* Interview List */}
      <div className="max-h-96 overflow-y-auto">
        {filteredAndSortedInterviews?.length === 0 ? (
          <div className="p-6 text-center">
            <Icon name="Calendar" size={48} className="text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No interviews found matching your criteria</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredAndSortedInterviews?.map(interview => {
              const statusConfig = getStatusConfig(interview?.status);
              const actions = getStatusActions(interview);
              // console.log('Interview Actions:', interview);
              return (
                <div key={interview?.id} className="p-4 hover:bg-muted/50 transition-colors duration-150">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      {/* Interview Header */}
                      <div className="flex items-center space-x-3 mb-2">
                        <div className={`w-8 h-8 rounded-full ${statusConfig?.bgColor} flex items-center justify-center`}>
                          <Icon name={statusConfig?.icon} size={16} className={statusConfig?.color} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-card-foreground truncate">
                            {interview?.traineeName} - {interview?.type}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            with {interview?.interviewerName}
                          </p>
                        </div>

                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-medium text-muted-foreground">Interviewer:</span>
                          {interview?.manager?.map((t, idx) => {
                            const tStatusConfig = getStatusConfig(t.status);
                            return (
                              <span
                                key={idx}
                                className={`px-2 py-1 text-xs font-medium rounded-full ${tStatusConfig?.bgColor} ${tStatusConfig?.color}`}
                              >
                                <p> {t.firstname || "Trainee"} ({t.status}) {interview?.scheduleId}</p>
                              </span>
                            );
                          })}
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-medium text-muted-foreground">Trainees:</span>
                          {interview?.trainees?.map((t, idx) => {
                            const tStatusConfig = getStatusConfig(t.status);
                            return (
                              <span
                                key={idx}
                                className={`px-2 py-1 text-xs font-medium rounded-full ${tStatusConfig?.bgColor} ${tStatusConfig?.color}`}
                              >
                                <p> {t.firstname || "Trainee"} ({t.status}) {interview?.scheduleId}</p>
                              </span>
                            );
                          })}
                        </div>



                      </div>

                      {/* Interview Details */}
                      <div className="ml-11 space-y-1">
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span className="flex items-center space-x-1">
                            <Icon name="Calendar" size={12} />
                            <span>{formatDateTime(interview?.scheduledDate, interview?.time)}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Icon name="Clock" size={12} />
                            <span>{interview?.duration} min</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Icon name="MapPin" size={12} />
                            <span>{interview?.location || 'Virtual'}</span>
                          </span>
                        </div>

                        {interview?.status !== 'completed' && interview?.status !== 'cancelled' && (
                          <div className="text-xs text-primary font-medium">
                            {getTimeUntilInterview(interview?.scheduledDate, interview?.time)}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2 ml-4">
                      {actions?.map((action, index) => (
                        <Button
                          key={index}
                          variant={action?.variant}
                          size="sm"
                          onClick={() => handleActionClick(interview, action?.action)}
                          iconName={action?.icon}
                          iconSize={14}
                          className="h-8 px-3"
                        >
                          {action?.label}
                        </Button>
                      ))}

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewDetails(interview?.id)}
                        iconName="MoreHorizontal"
                        iconSize={14}
                        className="h-8 w-8"
                      >
                      </Button>
                    </div>
                  </div>
                  {/* Additional Info for Pending/Confirmed */}
                  {(interview?.status === 'pending' || interview?.status === 'confirmed') && interview?.notes && (
                    <div className="ml-11 mt-2 p-2 bg-muted/50 rounded text-xs text-muted-foreground">
                      <Icon name="MessageSquare" size={12} className="inline mr-1" />
                      {interview?.notes}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      {/* Status Summary */}
      <div className="p-4 border-t border-border bg-muted/30">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
          {statusOptions?.slice(1)?.map(status => {
            const count = interviews?.filter(i => i?.status === status?.value)?.length;
            const config = getStatusConfig(status?.value);

            return (
              <div key={status?.value} className="flex flex-col items-center space-y-1">
                <div className={`w-8 h-8 rounded-full ${config?.bgColor} flex items-center justify-center`}>
                  <Icon name={config?.icon} size={16} className={config?.color} />
                </div>
                <span className="text-sm font-medium text-muted-foreground">{count}</span>
                <span className="text-xs text-muted-foreground">{config?.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default InterviewStatusTracker;