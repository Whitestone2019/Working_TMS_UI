import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const NavigationBreadcrumb = ({
  userRole = 'trainee',
  customBreadcrumbs = null,
  showHomeIcon = true,
  className = ''
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Route configuration with breadcrumb information
  const routeConfig = {
    '/manager-dashboard': {
      label: 'Manager Dashboard',
      parent: null,
      roles: ['manager']
    },
    '/trainee-dashboard': {
      label: 'Trainee Dashboard',
      parent: null,
      roles: ['trainee']
    },
    '/assessment-entry': {
      label: 'Assessment Entry',
      parent: '/manager-dashboard',
      roles: ['manager']
    },
    '/interview-scheduling': {
      label: 'Interview Scheduling',
      parent: '/manager-dashboard',
      roles: ['manager']
    },
    '/upload-syllabus': {
      label: 'Syllabus',
      parent: '/manager-dashboard',
      roles: ['manager']
    },

    '/trainee-steps': {
      label: 'Approval',
      parent: '/manager-dashboard',
      roles: ['manager']
    },
    '/department': {
      label: 'Department',
      parent: '/manager-dashboard',
      roles: ['manager']
    },
    '/assign-trainee': {
      label: 'Assign-Trainee',
      parent: '/manager-dashboard',
      roles: ['manager']
    },
    '/create-question': {
      label: 'Assessment Test',
      parent: '/manager-dashboard',
      roles: ['manager']
    },
    '/check-page': {
      label: 'Test Check',
      parent: '/manager-dashboard',
      roles: ['manager']
    },
    
    '/trainee-report': {
      label: 'Trainee Report',
      parent: '/manager-dashboard',
      roles: ['manager']
    },
    
    
    
    '/syllabus-content-viewer': {
      label: 'Syllabus Content',
      parent: '/trainee-dashboard',
      roles: ['trainee']
    },

       
'/trainee-assessment-list': {
      label: 'Test',
      parent: '/trainee-dashboard',
      roles: ['trainee']
    },

    // '/progress-reports': {
    //   label: 'Progress Reports',
    //   parent: userRole === 'manager' ? '/manager-dashboard' : '/trainee-dashboard',
    //   roles: ['trainee', 'manager']
    // }
  };

  // Generate breadcrumb trail
  const generateBreadcrumbs = () => {
    if (customBreadcrumbs) {
      return customBreadcrumbs;
    }

    const currentPath = location?.pathname;
    const currentRoute = routeConfig?.[currentPath];

    if (!currentRoute || !currentRoute?.roles?.includes(userRole)) {
      return [];
    }

    const breadcrumbs = [];
    let path = currentPath;

    // Build breadcrumb chain by following parent relationships
    while (path && routeConfig?.[path]) {
      const route = routeConfig?.[path];
      breadcrumbs?.unshift({
        label: route?.label,
        path: path,
        isActive: path === currentPath
      });
      path = route?.parent;
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Don't render if no breadcrumbs or only one item (current page)
  if (!breadcrumbs?.length || breadcrumbs?.length === 1) {
    return null;
  }

  const handleNavigation = (path) => {
    if (path && path !== location?.pathname) {
      navigate(path);
    }
  };

  const getHomeRoute = () => {
    return userRole === 'manager' ? '/manager-dashboard' : '/trainee-dashboard';
  };

  return (
    <nav className={`flex items-center space-x-2 text-sm ${className}`} aria-label="Breadcrumb">
      {/* Home Icon */}
      {showHomeIcon && (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleNavigation(getHomeRoute())}
            iconName="Home"
            iconSize={16}
            className="h-8 px-2 text-muted-foreground hover:text-card-foreground"
            title="Go to Dashboard"
          >
          </Button>
          {breadcrumbs?.length > 0 && (
            <Icon name="ChevronRight" size={14} className="text-muted-foreground" />
          )}
        </>
      )}
      {/* Breadcrumb Items */}
      <ol className="flex items-center space-x-2">
        {breadcrumbs?.map((crumb, index) => (
          <li key={crumb?.path} className="flex items-center space-x-2">
            {/* Separator */}
            {index > 0 && (
              <Icon name="ChevronRight" size={14} className="text-muted-foreground" />
            )}

            {/* Breadcrumb Link/Text */}
            {crumb?.isActive ? (
              <span className="font-medium text-muted-foreground px-2 py-1">
                {crumb?.label}
              </span>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleNavigation(crumb?.path)}
                className="h-8 px-2 text-muted-foreground hover:text-foreground font-normal"
              >
                {crumb?.label}
              </Button>
            )}
          </li>
        ))}
      </ol>
      {/* Mobile Responsive - Show only current page on small screens */}
      <div className="sm:hidden ml-auto">
        <span className="text-sm font-medium text-muted-foreground">
          {breadcrumbs?.[breadcrumbs?.length - 1]?.label}
        </span>
      </div>
    </nav>
  );
};

export default NavigationBreadcrumb;