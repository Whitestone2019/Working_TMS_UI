import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route, Navigate ,useLocation} from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import ErrorBoundary from "./components/ErrorBoundary";
import NotFound from "./pages/NotFound";
import LoginScreen from './pages/login-screen';
import ResetPassword from "./pages/login-screen/ResetPassword";
import ManagerDashboard from './pages/manager-dashboard';
import ProgressReports from './pages/progress-reports';
import SyllabusContentViewer from './pages/syllabus-content-viewer';
import InterviewScheduling from './pages/interview-scheduling';
import TraineeDashboard from './pages/trainee-dashboard';
import AssessmentEntry from './pages/assessment-entry';
import UploadSyllabus from "./pages/manager-dashboard/components/UploadSyllabus";
import TraineeStepsPage from "./pages/manager-dashboard/components/TraineeStepsPage";
import DepartmentPage from "./pages/manager-dashboard/components/DepartmentPage";
import AssignDepartmentPage from "./pages/manager-dashboard/components/AssignDepartmentPage";
import TraineeSyllabusPage from "./pages/manager-dashboard/components/TraineeSyllabusPage";
import CreateQuestion from "./pages/manager-dashboard/CreateQuestion";
import TraineeTestPage from "./pages/manager-dashboard/components/TraineeTestPage";
import TraineeAssessmentList from "./pages/manager-dashboard/components/TraineeAssessmentList";
import TrainerEvaluationPage from "./pages/manager-dashboard/components/TrainerEvaluationPage";
import EvaluationDetailsPage from "./pages/manager-dashboard/components/EvaluationDetailsPage";
import TraineeResult from "./pages/trainee-dashboard/components/TraineeResult";


// const ProtectedRoute = ({ allowedRoles, children }) => {
//   const role = sessionStorage.getItem("userRole");

//   if (!role) {
//     console.log("sd", role)
//     return <Navigate to="/login-screen" replace />;
//   }

//   if (!allowedRoles.includes(role)) {
//     return <Navigate to="/*" replace />;
//   }

//   return children;
// };



const ProtectedRoute = ({ allowedRoles, children }) => {
  const role = sessionStorage.getItem("userRole");
  const location = useLocation(); // 🔥 important

  // 🔴 Not logged in
  if (!role) {
    return (
      <Navigate
        to={`/login-screen?redirect=${location.pathname}`}
        replace
      />
    );
  }
  

  // 🔴 Role mismatch
  if (!allowedRoles.includes(role)) {
    return <Navigate to="/not-authorized" replace />;
  }

  return children;
};

const NotAuthorized = () => (
  <div className="h-screen flex items-center justify-center text-xl font-semibold">
    ❌ You are not authorized to access this page
  </div>
);

const Routes = () => {
  return (
    <BrowserRouter>
      <RouterRoutes>

        {/* Public Routes */}
        <Route path="/" element={<LoginScreen />} />
        <Route path="/login-screen" element={<LoginScreen />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Manager Only */}
        <Route
          path="/manager-dashboard"
          element={
            <ProtectedRoute allowedRoles={["MANAGER"]}>
              <ManagerDashboard />
            </ProtectedRoute>
          }
        />

         <Route
          path="/check-page"
          element={
            <ProtectedRoute allowedRoles={["MANAGER"]}>
              <TrainerEvaluationPage />
            </ProtectedRoute>
          }
        />

        

        <Route
          path="/evaluation/:attemptId"
          element={
            <ProtectedRoute allowedRoles={["MANAGER"]}>
              <EvaluationDetailsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/upload-syllabus"
          element={
            <ProtectedRoute allowedRoles={["MANAGER"]}>
              <UploadSyllabus />
            </ProtectedRoute>
          }
        />

        <Route
          path="/trainee-steps"
          element={
            <ProtectedRoute allowedRoles={["MANAGER"]}>
              <TraineeStepsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/interview-scheduling"
          element={
            <ProtectedRoute allowedRoles={["MANAGER"]}>
              <InterviewScheduling />
            </ProtectedRoute>
          }
        />



<Route
          path="/department"
          element={
            <ProtectedRoute allowedRoles={["MANAGER"]}>
              <DepartmentPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/assign-trainee"
          element={
            <ProtectedRoute allowedRoles={["MANAGER"]}>
              <AssignDepartmentPage/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/assessment-entry"
          element={
            <ProtectedRoute allowedRoles={["MANAGER"]}>
              <AssessmentEntry />
            </ProtectedRoute>
          }
        />
        <Route
        
          path="/trainee-syllabus/:traineeId"
          element={
             <ProtectedRoute allowedRoles={["MANAGER"]}>
          <TraineeSyllabusPage />
          </ProtectedRoute>
        }
        />
         <Route
          path="/create-question"
          element={
            <ProtectedRoute allowedRoles={["MANAGER"]}>
              <CreateQuestion />
            </ProtectedRoute>
          }
        />

        {/* Trainee Only */}
        <Route
          path="/trainee-dashboard"
          element={
            <ProtectedRoute allowedRoles={["TRAINEE"]}>
              <TraineeDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/syllabus-content-viewer"
          element={
            <ProtectedRoute allowedRoles={["TRAINEE"]}>
              <SyllabusContentViewer />
            </ProtectedRoute>
          }
        />
        
         <Route
          path="/trainee-assessment-list"
          element={
             <ProtectedRoute allowedRoles={["TRAINEE"]}>
          <TraineeAssessmentList />
          </ProtectedRoute>
        }
        />


 <Route
          path="/trainee-result/:id"
          element={
             <ProtectedRoute allowedRoles={["TRAINEE"]}>
          <TraineeResult />
          </ProtectedRoute>
        }
        />
        <Route
          path="/trainee-test/:assessmentId"
          element={
            <ProtectedRoute allowedRoles={["TRAINEE"]}>
          <TraineeTestPage />
          </ProtectedRoute>
        }
        />

        {/* System Routes */}
        <Route path="/not-authorized" element={<NotAuthorized />} />
        <Route path="*" element={<NotFound />} />

      </RouterRoutes>
    </BrowserRouter>
  );
};

// const Routes = () => {
//   return (
//     <BrowserRouter>
//       {/* <ErrorBoundary> */}
//       {/* <ScrollToTop /> */}
//       <RouterRoutes>
//         {/* Define your route here */}
//         <Route path="/" element={<LoginScreen />} />
//         <Route path="/login-screen" element={<LoginScreen />} />
//         <Route path="/manager-dashboard" element={<ManagerDashboard />} />
//         <Route path="/progress-reports" element={<ProgressReports />} />
//         <Route path="/syllabus-content-viewer" element={<SyllabusContentViewer />} />
//         <Route path="/interview-scheduling" element={<InterviewScheduling />} />
//         <Route path="/trainee-dashboard" element={<TraineeDashboard />} />
//         <Route path="/assessment-entry" element={<AssessmentEntry />} />
//         <Route path="/upload-syllabus" element={<UploadSyllabus />} />
//         <Route path="/trainee-steps" element={<TraineeStepsPage />} />
//         <Route path="/reset-password" element={<ResetPassword />} />


//         <Route path="/progress-reports/:traineeId" element={<ProgressReports />} />
//         <Route path="*" element={<NotFound />} />
//       </RouterRoutes>
//       {/* </ErrorBoundary> */}
//     </BrowserRouter>
//   );
// };

export default Routes;
