
import React, { useEffect, useState, useRef } from "react";
import { fetchTraineeReport, getAssessmentSummary,getTraineeAttendance } from "../../../api_service";
import Header from "../../../components/ui/Header";
import NavigationBreadcrumb from "../../../components/ui/NavigationBreadcrumb";
import { useLocation, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const TraineeDetailReport = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const pdfRef = useRef();
  const [report, setReport] = useState(null);
  const handleLogout = () => navigate("/");
  const trainee = state;
  const [assessmentSummary, setAssessmentSummary] = useState({});
  const [attendance, setAttendance] = useState(null);
  const [attendanceError, setAttendanceError] = useState("");

  // const report = {
  //   training: {
  //     total: 10,
  //     completed: 7,
  //     week: 2,
  //     percent: 70,
  //     topics: "React, APIs"
  //   },
  //   assessments: [
  //     {
  //       date: "12 Apr",
  //       name: "React Test",
  //       marks: 40,
  //       total: 50,
  //       result: "Pass",
  //       remarks: "Good"
  //     }
  //   ],
  //   attendance: {
  //     total: 5,
  //     attended: 4,
  //     leaves: 1,
  //     percent: 80
  //   },
  //   tasks: {
  //     given: 3,
  //     completed: 2,
  //     pending: 1
  //   }
  // };


  //   useEffect(() => {
  //   const loadReport = async () => {
  //     if (!trainee?.trngid) return;

  //     const data = await fetchTraineeReport(trainee.trngid);
  //     setReport(data);
  //   };

  //   loadReport();
  // }, [trainee]);


  // useEffect(() => {
  //   const loadReport = async () => {
  //     if (!trainee?.trngid) return;

  //     const reportData = await fetchTraineeReport(trainee.trngid);
  //     setReport(reportData);

  //     const userId = trainee.userid;
  //     console.log("hii", userId);

  //     const deptIds = trainee.departmentIds?.length
  //       ? trainee.departmentIds
  //       : trainee.assignedDepartments?.map(d => d.departmentId) || [1];

  //     console.log("deptIds:", deptIds);

  //     const summary = await getAssessmentSummary(userId, deptIds);

  //     setAssessmentSummary(summary);
  //   };

  //   loadReport();
  // }, [trainee]);


  useEffect(() => {
  const loadReport = async () => {
    if (!trainee?.trngid) return;

    const reportData = await fetchTraineeReport(trainee.trngid);
    setReport(reportData);

    const userId = trainee.userid;

    const deptIds = trainee.departmentIds?.length
      ? trainee.departmentIds
      : trainee.assignedDepartments?.map(d => d.departmentId) || [1];

    const summary = await getAssessmentSummary(userId, deptIds);
    setAssessmentSummary(summary);

//     try {
//   const attendanceRes = await getTraineeAttendance(trainee.trngid);

//   if (!attendanceRes || attendanceRes.success === false) {
//     setAttendanceError("Attendance data not available");
//     setAttendance(null);
//   } else {
//     setAttendance(attendanceRes);
//     setAttendanceError("");
//   }
// } catch (err) {
//   setAttendanceError("Unable to fetch attendance. Please try again later.");
//   setAttendance(null);
// }

try {
  const attendanceRes = await getTraineeAttendance(trainee.trngid);

  if (!attendanceRes || attendanceRes.success === false) {
    setAttendanceError("Attendance data not available");
    setAttendance(null);
  } else {
    // ✅ Proper mapping
    setAttendance({
      totalWorkingDays: attendanceRes.totalWorkingDays || 0,
      daysAttended: attendanceRes.daysAttended || 0,
      leavesTaken: attendanceRes.leavesTaken || 0,
      absentDays: attendanceRes.absentDays || 0,
      attendancePercentage: attendanceRes.attendancePercentage || 0,
    });

    setAttendanceError("");
  }
} catch (err) {
  setAttendanceError("Unable to fetch attendance. Please try again later.");
  setAttendance(null);
}
  };

  loadReport();
}, [trainee]);

  //  PDF DOWNLOAD WITH WATERMARK + LOGO
  //   const handleDownload = async () => {
  //     const element = pdfRef.current;

  //     const canvas = await html2canvas(element, { scale: 2 });
  //     const imgData = canvas.toDataURL("image/png");

  //     const pdf = new jsPDF("p", "mm", "a4");

  //     const imgWidth = 210;
  //     const pageHeight = 295;
  //     const imgHeight = (canvas.height * imgWidth) / canvas.width;

  //     let heightLeft = imgHeight;
  //     let position = 0;

  //     // 🔥 Add main content
  //     pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);

  //     // 🔥 WATERMARK
  //     pdf.setTextColor(200);
  //     pdf.setFontSize(40);
  //     pdf.text("CONFIDENTIAL", 50, 150, { angle: 45 });

  //     // 🔥 LOGO (top right)
  //    // const logo = "/logo.png"; // 👉 apna logo path yaha daalo
  //     //pdf.addImage(logo, "PNG", 160, 10, 30, 15);

  //     heightLeft -= pageHeight;

  //     while (heightLeft > 0) {
  //       position = heightLeft - imgHeight;
  //       pdf.addPage();

  //       pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);

  //       // watermark on every page
  //       pdf.setTextColor(200);
  //       pdf.setFontSize(40);
  //       pdf.text("CONFIDENTIAL", 50, 150, { angle: 45 });

  //      // pdf.addImage(logo, "PNG", 160, 10, 30, 15);

  //       heightLeft -= pageHeight;
  //     }

  //      const fileName = trainee?.name
  //     ? trainee.name.replace(/\s+/g, "_") + "_Report.pdf"
  //     : "Trainee_Report.pdf";

  //   pdf.save(fileName);
  //   };

  const handleDownload = async () => {
    const element = pdfRef.current;

    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");

    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    const validAssessments = report?.assessments?.filter(
      a => a.marks > 0
    );

    let heightLeft = imgHeight;
    let position = 0;

    //  Add main content
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);

    //  WATERMARK
    pdf.setTextColor(200);
    pdf.setFontSize(40);
    pdf.text("Whitestone Software Solution", 50, 150, { angle: 45 });

    // LOGO temporarily disabled
    // const logo = "/logo.png";
    // pdf.addImage(logo, "PNG", 160, 10, 30, 15);

    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);

      pdf.setTextColor(200);
      pdf.setFontSize(40);
      pdf.text("Whitestone Software Solution", 50, 150, { angle: 45 });

      // pdf.addImage(logo, "PNG", 160, 10, 30, 15);

      heightLeft -= pageHeight;
    }

    //  SAFE FILE NAME
    const fileName = trainee?.name
      ? trainee.name.replace(/\s+/g, "_") + "_Report.pdf"
      : "Trainee_Report.pdf";

    pdf.save(fileName);
  };

  if (!report) {
    return <div className="p-6 text-center">Loading...</div>;
  }
  //const syllabus = report?.syllabus || [];
  const syllabus = report.syllabus || [];

  //  Total Modules
  const totalModules = syllabus.length;
  const completedModules = syllabus.filter(s =>
    s.subTopics.some(st =>
      Array.isArray(st.stepProgress) &&
      st.stepProgress.some(p => p.complete === true)
    )
  ).length;

  const now = new Date();

  const startOfWeek = new Date();
  const day = startOfWeek.getDay();
  const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);

  startOfWeek.setDate(diff);
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfNow = new Date();
  endOfNow.setHours(23, 59, 59, 999);

  const completedThisWeek = syllabus.filter(s =>
    s.subTopics.some(st =>
      st.stepProgress?.some(p => {
        if (!p.endDateTime || !p.complete) return false;

        const d = new Date(p.endDateTime);

        return d >= startOfWeek && d <= endOfNow;
      })
    )
  ).length;

  //  Percentage
  const percentage = totalModules
    ? Math.floor((completedModules / totalModules) * 100)
    : 0;

  //  Topics Covered
  const topicsCovered = syllabus.map(s => s.title).join(", ");


  //  Total Tasks (subTopics count)
  const totalTasks = syllabus.reduce((acc, s) => {
    return acc + (s.subTopics?.length || 0);
  }, 0);

  //  Completed Tasks
  const completedTasks = syllabus.reduce((acc, s) => {
    const completed = s.subTopics?.filter(st =>
      st.stepProgress?.some(p => p.complete === true)
    ).length || 0;

    return acc + completed;
  }, 0);

  //  Pending Tasks
  const pendingTasks = totalTasks - completedTasks;

  const validAssessments = report?.assessments?.filter(a =>
    a.answers?.some(ans =>
      ans.questions?.some(q => q.evaluated === true)
    )
  );
  return (
    <div className="min-h-screen bg-background">

      <Header
        userName={sessionStorage.getItem("userName")}
        userRole="manager"
        onLogout={handleLogout}
      />

      <main className="pt-20 max-w-6xl mx-auto px-4">
        <NavigationBreadcrumb userRole="manager" />

        {/* HEADER */}
        {/* <div className="flex justify-between items-center mt-6">
          <h1 className="text-2xl font-bold text-black-700">
            {trainee?.name} - Trainee Report
          </h1>

          <button
            onClick={handleDownload}
            className="bg-purple-600 text-white px-4 py-2 rounded-xl"
          >
            Download Report
          </button>
        </div> */}
        <div className="flex justify-between items-center mt-6">
  <h1 className="text-2xl font-bold text-black-700">
    {trainee?.name} - Trainee Report
  </h1>

  <div className="flex gap-3">
    
    {/* Back Button */}
    <button
      onClick={() => navigate("/trainee-report")}
      className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-xl"
    >
      Back
    </button>

    {/* Download Button */}
    <button
      onClick={handleDownload}
      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl"
    >
      Download Report
    </button>

  </div>
</div>

        {/*  PDF CONTENT */}
        <div ref={pdfRef} className="bg-white p-4 mt-6">

          <div className="text-center border-b pb-4 mb-4">
            <h1 className="text-2xl font-bold text-purple-700">
              Trainee Detail Report
            </h1>

            <p className="text-lg mt-2">
              Name: <span className="font-semibold">{trainee?.name || "N/A"}</span>
            </p>

            <p className="text-sm text-gray-500">
              Date: {new Date().toLocaleDateString()}
            </p>
          </div>

          {/* TRAINING */}
          <div className="rounded-xl shadow overflow-hidden mb-6">
            <h3 className="bg-purple-100 text-purple-700 font-semibold p-3">
              Training Progress
            </h3>

            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b">
                  <td className="p-2 font-medium">Total Syllabus Modules</td>
                  {/* <td className="p-2">{report.training.total}</td> */}
                  <td className="p-2">{totalModules}</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-medium">Modules Completed (till date)</td>
                  {/* <td className="p-2">{report.training.completed}</td> */}
                  <td className="p-2">{completedModules}</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-medium">Modules Completed (this week)</td>
                  {/* <td className="p-2">{report.training.week}</td> */}
                  <td className="p-2">{completedThisWeek}</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-medium">Overall Completion %</td>
                  {/* <td className="p-2">{report.training.percent}%</td> */}
                  <td className="p-2">{percentage}%</td>
                </tr>
                <tr>
                  <td className="p-2 font-medium">Topics Covered</td>
                  <td className="p-2">{topicsCovered}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ASSESSMENT */}
          <div className="rounded-xl shadow overflow-hidden mb-6">
            <h3 className="bg-purple-100 text-purple-700 font-semibold p-3">
              Assessment Details
            </h3>

            {validAssessments?.length > 0 ? (
              <table className="w-full text-sm text-center">
                <thead className="bg-purple-50">
                  <tr>
                    <th className="p-2">Date</th>
                    <th className="p-2">Name</th>
                    <th className="p-2">Marks</th>
                    <th className="p-2">Total</th>
                    <th className="p-2">Result</th>
                    <th className="p-2">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {validAssessments.map((a, i) => {
                    const percent = a.overallMarks
                      ? (a.marks / a.overallMarks) * 100
                      : 0;

                    const result = percent < 35 ? "Fail" : "Pass";

                    return (
                      <tr key={i} className="border-b">
                        <td className="p-2">
                          {new Date(a.submittedAt).toLocaleDateString()}
                        </td>
                        <td className="p-2">{a.assessmentName}</td>
                        <td className="p-2">{a.marks}</td>
                        <td className="p-2">{a.overallMarks}</td>
                        <td className="p-2">
                          <span className={result === "Pass" ? "text-green-600" : "text-red-600"}>
                            {result}
                          </span>
                        </td>
                        <td className="p-2">{a.remarks}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <p className="text-center p-4 text-gray-500">
                No assessment data available
              </p>
            )}
          </div>

          {/* ATTENDANCE */}
          {/* <div className="rounded-xl shadow overflow-hidden mb-6">
            <h3 className="bg-purple-100 text-purple-700 font-semibold p-3">
              Attendance Details
            </h3>

            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b">
                  <td className="p-2 font-medium">Total Working Days</td>
                  <td className="p-2">-</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-medium">Days Attended</td>
                  <td className="p-2">-</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-medium">Leaves Taken</td>
                  <td className="p-2">-</td>
                </tr>
                <tr>
                  <td className="p-2 font-medium">Attendance %</td>
                  <td className="p-2">-</td>
                </tr>
              </tbody>
            </table>
          </div> */}
          <div className="rounded-xl shadow overflow-hidden mb-6">
  <h3 className="bg-purple-100 text-purple-700 font-semibold p-3">
    Attendance Details
  </h3>

  {attendanceError ? (
    <p className="p-4 text-center text-red-500">
      {attendanceError}
    </p>
  ) : attendance ? (
    <table className="w-full text-sm">
      <tbody>
        <tr className="border-b">
          <td className="p-2 font-medium">Total Working Days</td>
          <td className="p-2">{attendance.totalWorkingDays}</td>
        </tr>

        <tr className="border-b">
          <td className="p-2 font-medium">Days Attended</td>
          <td className="p-2">{attendance.daysAttended}</td>
        </tr>

        <tr className="border-b">
          <td className="p-2 font-medium">Leaves Taken</td>
          <td className="p-2">{attendance.leavesTaken}</td>
        </tr>

        <tr className="border-b">
          <td className="p-2 font-medium">Absent Days</td>
          <td className="p-2">{attendance.absentDays}</td>
        </tr>

        <tr>
          <td className="p-2 font-medium">Attendance %</td>
          <td className="p-2 text-purple-600 font-semibold">
           {attendance.attendancePercentage.toFixed(1)}%

          </td>
        </tr>
      </tbody>
    </table>
  ) : (
    <p className="p-4 text-center text-gray-400">
      Loading attendance...
    </p>
  )}
</div>

          {/* TASKS */}
          <div className="rounded-xl shadow overflow-hidden">
            <h3 className="bg-purple-100 text-purple-700 font-semibold p-3">
              Tasks / Assignments
            </h3>

            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b">
                  <td className="p-2 font-medium">Tasks Given</td>
                  <td className="p-2">{assessmentSummary.totalAssigned} </td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-medium">Completed</td>
                  <td className="p-2">{assessmentSummary.completed}</td>
                </tr>
                <tr>
                  <td className="p-2 font-medium">Pending</td>
                  <td className="p-2">{assessmentSummary.pending}</td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>

      </main>
    </div>
  );
};

export default TraineeDetailReport;