import React from 'react';
import Icon from '../../../components/AppIcon';

const TraineeMetricsPanel = ({ metrics }) => {
  const metricCards = [
    {
      id: 'total',
      title: 'Total Trainees',
      value: metrics?.totalTrainees,
      icon: 'Users',
      color: 'bg-blue-50 text-blue-600',
      iconBg: 'bg-blue-100'
    },
    {
      id: 'completion',
      title: 'Avg Completion',
      value: `${metrics?.avgCompletion}%`,
      icon: 'TrendingUp',
      color: 'bg-green-50 text-green-600',
      iconBg: 'bg-green-100'
    },
    {
      id: 'assessments',
      title: 'Pending Assessments',
      value: metrics?.pendingAssessments,
      icon: 'ClipboardCheck',
      color: 'bg-orange-50 text-orange-600',
      iconBg: 'bg-orange-100'
    },
    {
      id: 'interviews',
      title: 'Upcoming Interviews',
      value: metrics?.upcomingInterviews,
      icon: 'Calendar',
      color: 'bg-purple-50 text-purple-600',
      iconBg: 'bg-purple-100'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {metricCards?.map((metric) => (
        <div key={metric?.id} className="bg-card border border-border rounded-lg p-6 elevation-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                {metric?.title}
              </p>
              <p className="text-2xl font-bold text-card-foreground">
                {metric?.value}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-lg ${metric?.iconBg} flex items-center justify-center`}>
              <Icon name={metric?.icon} size={24} className={metric?.color?.split(' ')?.[1]} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TraineeMetricsPanel;