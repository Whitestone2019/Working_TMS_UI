
import React from 'react';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';

const FilterToolbar = ({
  filters,
  syllabusOptions,
  departmentOptions,
  onFilterChange,
  onExportReports,
  onScheduleInterview,
  onAddAssessment,
  resultsCount
}) => {

  const completionStatusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'not-started', label: 'Not Started' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' }
  ];


   const restrictedRoles = ["CEO", "CTO", "HR", "PM"];
  const roleName = sessionStorage.getItem("roleName");
  const isRestricted = restrictedRoles.includes(roleName);

  const handleInputChange = (field, value) => {
    onFilterChange({ ...filters, [field]: value });
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-end gap-4">

        {/* Filters */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

          <Input
            label="Search Trainee"
            type="search"
            placeholder="Enter trainee name..."
            value={filters?.searchName}
            onChange={(e) => handleInputChange('searchName', e.target.value)}
          />


          {/* <Select
            label="Syllabus Step"
            options={[...syllabusOptions].sort((a, b) => a.stepNo - b.stepNo)} // ascending
            value={filters.syllabusStep}
            onChange={(value) => handleInputChange('syllabusStep', value)}
          /> */}

<Select
  label="Department"
  options={departmentOptions}
  value={filters?.departmentId}
  onChange={(value) => handleInputChange('departmentId', value)}
/>

          <Select
            label="Completion Status"
            options={completionStatusOptions}
            value={filters?.completionStatus}
            onChange={(value) => handleInputChange('completionStatus', value)}
          />

          <div className="space-y-2">
            <Input
              label="Date From"
              className="bg-white text-black" 
              type="date"
              value={filters?.dateFrom}
              onChange={(e) => handleInputChange('dateFrom', e.target.value)}
            />
            <Input
              label="Date To"
              className="bg-white text-black" 
              type="date"
              value={filters?.dateTo}
              onChange={(e) => handleInputChange('dateTo', e.target.value)}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-1 lg:ml-6">
          <Button variant="default" onClick={onExportReports} iconName="Download" size="sm">
            Export Reports
          </Button>

          <Button variant="default" onClick={onScheduleInterview} iconName="Calendar" size="sm">
            Schedule Interview
          </Button>

 {!isRestricted && (
          <Button variant="default" onClick={onAddAssessment} iconName="Plus" size="sm">
            Add Assessment
          </Button>
 )}
        </div>
      </div>

      {/* Results Count */}
      <div className="mt-4 pt-4 border-t border-border">
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-medium text-card-foreground">{resultsCount}</span> trainees
        </p>
      </div>
    </div>
  );
};

export default FilterToolbar;
