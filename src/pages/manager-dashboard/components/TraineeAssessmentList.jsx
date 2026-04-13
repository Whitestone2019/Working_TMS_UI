import React,{useEffect,useState} from "react";
import Header from "../../../components/ui/Header";
import NavigationBreadcrumb from "../../../components/ui/NavigationBreadcrumb";
import Icon from "../../../components/ui/../AppIcon";
import { useNavigate } from "react-router-dom";
import {getTraineeAssessmentsforTestTrainee,checkAssessmentAttempt} from "../../../api_service";
import axios from "axios";

function TraineeAssessmentList(){

const [assessments,setAssessments] = useState([]);
const [submittedMap, setSubmittedMap] = useState({});
const navigate = useNavigate();

const departmentIds = JSON.parse(sessionStorage.getItem("departmentIds")) || [];

useEffect(()=>{
fetchAssessments();
},[]);

const fetchAssessments = async () => {
  try {

    const traineeId = sessionStorage.getItem("userId");
    const departmentIds = JSON.parse(sessionStorage.getItem("departmentIds")) || [];

    const res = await getTraineeAssessmentsforTestTrainee(traineeId, departmentIds);
    console.log("API RESPONSE:", res);

    setAssessments(res);

    // check submitted
    checkSubmittedStatus(res);

  } catch (err) {
    console.log(err);
  }
};

const handleLogout = () => {
navigate("/");
};

// const checkSubmittedStatus = async (assessmentsList) => {
//   const empId = sessionStorage.getItem("empid");

//   let statusMap = {};

//   for (let a of assessmentsList) {
//     try {
//       const res = await axios.get(
//         `http://localhost:8080/api/assessment/is-submitted`,
//         {
//           params: {
//             assessmentId: a.id,
//             traineeId: empId
//           }
//         }
//       );

//       statusMap[a.id] = res.data;

//     } catch (err) {
//       console.log(err);
//     }
//   }

//   setSubmittedMap(statusMap);
// };

// const checkSubmittedStatus = async (assessmentsList) => {

//   const empId = sessionStorage.getItem("empid");

//   let statusMap = {};

//   await Promise.all(
//     assessmentsList.map(async (a) => {
//       try {
//         const res = await checkAssessmentSubmitted(a.id, empId);

//         // ✅ FIX HERE
//         statusMap[a.id] = res;

//       } catch (err) {
//         console.log(err);
//       }
//     })
//   );

//   setSubmittedMap(statusMap);
// };

const checkSubmittedStatus = async (assessmentsList) => {
  const empId = sessionStorage.getItem("empid"); // use same trainee ID

  let statusMap = {};

  await Promise.all(
    assessmentsList.map(async (a) => {
      try {
        const res = await checkAssessmentAttempt(a.id, empId);
        statusMap[a.id] = res.data; // true or false
      } catch (err) {
        console.log(err);
        statusMap[a.id] = false; // default to not submitted
      }
    })
  );

  setSubmittedMap(statusMap);
};
return(

<div className="min-h-screen bg-blue-50">

<Header
userName={sessionStorage.getItem("userName") || "Trainee"}
userRole="trainee"
onLogout={handleLogout}
/>

<main className="pt-20 max-w-7xl mx-auto px-4">

<NavigationBreadcrumb userRole="trainee" />

<div className="mt-10">

<h2 className="text-3xl font-bold text-blue-700 flex items-center gap-2 mb-6">
<Icon name="FileText" size={26}/>
Available Assessments
</h2>

{assessments.length===0 && (
<p className="text-gray-500">No assessment available</p>
)}

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

{assessments.map((a)=>(
<div key={a.id}
className="bg-white shadow-lg rounded-xl border border-blue-200 p-6 hover:shadow-xl transition"
>

<h3 className="text-xl font-semibold text-blue-900">
{a.title}
</h3>
<p className="text-gray-600 mt-2">
Time : {
  a.sections?.reduce((total, s) => total + Number(s.time || 0), 0)
} minutes
</p>

<p className="text-gray-600">
Questions : {
  a.sections?.reduce((total, s) => total + (s.questions?.length || 0), 0)
}
</p>

{/* <button
  onClick={() => navigate(`/trainee-test/${a.id}`)}
  disabled={submittedMap[a.id] === true}
  className={`mt-4 px-4 py-2 rounded-lg text-white 
    ${submittedMap[a.id]
      ? "bg-gray-400 cursor-not-allowed"
      : "bg-blue-600 hover:bg-blue-700"}`}
>
  {submittedMap[a.id] ? "Already Submitted" : "Start Test"}
</button> */}

<button
  onClick={() => {
    if (submittedMap[a.id]) {
      navigate(`/trainee-result/${a.id}`);
    } else {
      if (window.confirm("Do you want to start the test?")) {
        navigate(`/trainee-test/${a.id}`);
      }
    }
  }}
  className={`mt-4 px-4 py-2 rounded-lg text-white 
    ${submittedMap[a.id]
      ? "bg-green-600 hover:bg-green-700"
      : "bg-blue-600 hover:bg-blue-700"}`}
>
  {submittedMap[a.id] ? "View Result" : "Start Test"}
</button>

</div>
))}

</div>

</div>

</main>

</div>

);

}

export default TraineeAssessmentList;