

// import React, { useState, useEffect } from "react";
// import Button from "../../components/ui/Button";
// import Input from "../../components/ui/Input";
// import Select from "../../components/ui/Select";
// import Header from "../../components/ui/Header";
// import { Trash2 } from "lucide-react";

// import {
//   createAssessmentforTest,
//   getAllAssessmentsforTest,
//   deleteAssessmentApiforTest,
//   getDepartmentsWithSyllabus
// } from "../../api_service";

// function CreateQuestion() {

//   const [departments, setDepartments] = useState([]);
//   const [syllabus, setSyllabus] = useState([]);
//   const [selectedSyllabus, setSelectedSyllabus] = useState([]);

//   const [title, setTitle] = useState("");
//   const [time, setTime] = useState("");
//   const [department, setDepartment] = useState([]);

//   const [section, setSection] = useState("");
//   const [globalType, setGlobalType] = useState("MCQ");

//   const [uploadedAssessments, setUploadedAssessments] = useState([]);
//   const [previewData, setPreviewData] = useState(null);

//   const [questions, setQuestions] = useState([
//     {
//       question: "",
//       type: "MCQ",
//       options: ["", "", "", ""],
//       correctAnswer: ""
//     }
//   ]);

//   useEffect(() => {
//     fetchDepartments();
//     fetchAssessments();
//   }, []);

//   const fetchDepartments = async () => {
//     const res = await getDepartmentsWithSyllabus();
//     setDepartments(res);

//     const all = res.flatMap(d =>
//       d.syllabus.map(s => ({
//         label: `${d.departmentName} - ${s.title}`,
//         value: s.id
//       }))
//     );

//     setSyllabus([...new Map(all.map(i => [i.value, i])).values()]);
//   };

//   const fetchAssessments = async () => {
//     const res = await getAllAssessmentsforTest();
//     setUploadedAssessments(res);
//   };

//   /* ---------------- QUESTION ---------------- */

//   const handleQuestionChange = (value, index) => {
//     const updated = [...questions];
//     updated[index].question = value;
//     setQuestions(updated);
//   };

//   const handleOptionChange = (value, qIndex, optIndex) => {
//     const updated = [...questions];
//     updated[qIndex].options[optIndex] = value;
//     setQuestions(updated);
//   };

//   const handleCorrectAnswer = (value, index) => {
//     const updated = [...questions];
//     updated[index].correctAnswer = value;
//     setQuestions(updated);
//   };

//   const addQuestion = () => {
//     let newQ = {
//       question: "",
//       type: globalType,
//       options: globalType === "MCQ" ? ["", "", "", ""] : [],
//       correctAnswer: ""
//     };
//     setQuestions([...questions, newQ]);
//   };

//   /* ---------------- SAVE ---------------- */

//   const saveQuestions = async () => {
//     const data = {
//       departmentIds: department,
//       syllabusIds: selectedSyllabus,
//       title,
//       time,
//       section,
//       questions
//     };

//     await createAssessmentforTest(data);
//     alert("Saved!");
//     fetchAssessments();
//   };

//   return (
//     <div className="min-h-screen bg-gray-100">
//       <Header userName="User" userRole="manager" />

//       {/* CENTER CONTAINER */}
//       <div className="pt-24 px-10 flex justify-center">
//         <div className="grid lg:grid-cols-2 gap-6 w-full max-w-6xl">

//           {/* FORM CARD */}
//           <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 space-y-5">

//             <h2 className="text-xl font-bold">Create Assessment</h2>

//             {/* ROW 1 */}
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <label className="text-sm">Title</label>
//                 <Input placeholder="Enter title"
//                   value={title}
//                   onChange={(e) => setTitle(e.target.value)} />
//               </div>

//               <div>
//                 <label className="text-sm">Time</label>
//                 <Input type="number" placeholder="Minutes"
//                   value={time}
//                   onChange={(e) => setTime(e.target.value)} />
//               </div>
//             </div>

//             {/* ROW 2 */}
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <label className="text-sm">Department</label>
//                 <Select multiple value={department}
//                   onChange={setDepartment}
//                   options={departments.map(d => ({
//                     label: d.departmentName,
//                     value: d.departmentId
//                   }))} />
//               </div>

//               <div>
//                 <label className="text-sm">Syllabus</label>
//                 <Select multiple value={selectedSyllabus}
//                   onChange={setSelectedSyllabus}
//                   options={syllabus} />
//               </div>
//             </div>

//             {/* ROW 3 */}
//             <div className="grid grid-cols-2 gap-4">
//               <Select label="Section" value={section}
//                 onChange={setSection}
//                 options={[
//                   { label: "Quant", value: "Quant" },
//                   { label: "Verbal", value: "Verbal" }
//                 ]} />

//               <Select label="Type" value={globalType}
//                 onChange={setGlobalType}
//                 options={[
//                   { label: "MCQ", value: "MCQ" },
//                   { label: "Text", value: "TEXT" },
//                   { label: "Coding", value: "CODING" }
//                 ]} />
//             </div>

//             {/* QUESTIONS */}
//             {questions.map((q, index) => (
//               <div key={index} className="bg-gray-50 p-4 rounded-xl">

//                 <textarea
//                   className="w-full border p-3 rounded-lg resize-none"
//                   rows={3}
//                   placeholder={`Question ${index + 1}`}
//                   value={q.question}
//                   onChange={(e) =>
//                     handleQuestionChange(e.target.value, index)}
//                 />

//                 {/* MCQ */}
//                 {globalType === "MCQ" && (
//                   <div className="grid grid-cols-2 gap-3 mt-3">
//                     {q.options.map((opt, i) => (
//                       <div key={i} className="flex gap-2">
//                         <input type="radio"
//                           checked={q.correctAnswer === String(i)}
//                           onChange={() =>
//                             handleCorrectAnswer(String(i), index)}
//                         />
//                         <Input placeholder={`Option ${i + 1}`}
//                           value={opt}
//                           onChange={(e) =>
//                             handleOptionChange(e.target.value, index, i)} />
//                       </div>
//                     ))}
//                   </div>
//                 )}

//                 {/* TEXT / CODING */}
//                 {globalType !== "MCQ" && (
//                   <textarea
//                     className="w-full border p-3 mt-3 rounded-lg"
//                     placeholder="Answer"
//                     value={q.correctAnswer}
//                     onChange={(e) =>
//                       handleCorrectAnswer(e.target.value, index)}
//                   />
//                 )}

//               </div>
//             ))}

//             <div className="flex gap-3">
//               <Button onClick={addQuestion}>+ Add</Button>
//               <Button onClick={saveQuestions}>Save</Button>
//             </div>

//           </div>

//           {/* RIGHT CARD */}
//           <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100">

//             <h2 className="font-bold mb-4">Assessments</h2>

//             {uploadedAssessments.map((item, i) => (
//               <div key={i} className="border p-4 rounded-xl mb-3">

//                 <h3 className="font-semibold">{item.title}</h3>

//                 <div className="flex gap-2 mt-3">

//                   <Button
//                     className="bg-blue-500 text-white hover:bg-blue-600"
//                     onClick={() => setPreviewData(item)}
//                   >
//                     Preview
//                   </Button>

//                   <Button className="bg-green-500 text-white hover:bg-green-600">
//                     Edit
//                   </Button>

//                   <Button
//                     className="bg-red-500 text-white hover:bg-red-600 flex items-center gap-1"
//                     onClick={() => deleteAssessmentApiforTest(item.id)}
//                   >
//                     <Trash2 size={16} />
//                     Delete
//                   </Button>

//                 </div>

//               </div>
//             ))}

//           </div>

//         </div>
//       </div>

//       {/* PREVIEW MODAL */}
//       {previewData && (
//         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">

//           <div className="bg-white p-6 rounded-2xl w-[520px] max-h-[80vh] overflow-y-auto shadow-2xl">

//             <h2 className="text-xl font-bold mb-4 text-blue-600">
//               {previewData.title}
//             </h2>

//             {previewData.questions?.map((q, i) => (
//               <div key={i} className="mb-4 p-3 bg-gray-50 rounded-lg">
//                 <p className="font-medium">{q.question}</p>
//               </div>
//             ))}

//             <Button
//               className="mt-4 bg-gray-800 text-white"
//               onClick={() => setPreviewData(null)}
//             >
//               Close
//             </Button>

//           </div>

//         </div>
//       )}

//     </div>
//   );
// }

// export default CreateQuestion;
// Working

import React, { useState, useEffect } from "react";
import {useNavigate} from "react-router-dom";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Header from "../../components/ui/Header";
import { Trash2 } from "lucide-react";


import {
  createAssessmentforTest,
  getAllAssessmentsforTest,
  deleteAssessmentApiforTest,
  getDepartmentsWithSyllabus,
  updateAssessmentApiforTest
} from "../../api_service";

function CreateQuestion() {

  const [departments, setDepartments] = useState([]);
  const [syllabus, setSyllabus] = useState([]);

  const [selectedSyllabus, setSelectedSyllabus] = useState([]);
  const [department, setDepartment] = useState([]);

  const [title, setTitle] = useState("");
  const [errors, setErrors] = useState({});

  const [uploadedAssessments, setUploadedAssessments] = useState([]);
  const [previewData, setPreviewData] = useState(null);
const navigate = useNavigate();
  const [editingId, setEditingId] = useState(null);
const restrictedRoles = ["HR", "TM", "CEO", "CTO"];
const roleName = sessionStorage.getItem("roleName");
const isRestricted = restrictedRoles.includes(roleName);
  const [sections, setSections] = useState([
    {
      sectionName: "",
      time: "",
      type: "MCQ",
      questions: [
        {
          question: "",
          options: ["", "", "", ""],
          correctAnswer: ""
        }
      ]
    }
  ]);

  useEffect(() => {
    fetchDepartments();
    fetchAssessments();
  }, []);

  const fetchDepartments = async () => {
    const res = await getDepartmentsWithSyllabus();
    setDepartments(res);
  };


const removeQuestion = (sIndex, qIndex) => {
  const updated = [...sections];

  // agar sirf 1 question hai to remove mat hone do (optional safety)
  if (updated[sIndex].questions.length === 1) return;

  updated[sIndex].questions.splice(qIndex, 1);
  setSections(updated);
};

const removeSection = (sIndex) => {
  if (sections.length === 1) return; // optional safety

  const updated = sections.filter((_, i) => i !== sIndex);
  setSections(updated);
};


  const fetchAssessments = async () => {
    const res = await getAllAssessmentsforTest();
    setUploadedAssessments(res);
  };

  useEffect(() => {
    if (department.length === 0) {
      setSyllabus([]);
      return;
    }

    const filtered = departments
      .filter(d => department.includes(d.departmentId))
      .flatMap(d =>
        d.syllabus
          .filter(s => s.assigned)
          .map(s => ({
            label: `${d.departmentName} - ${s.title}`,
            value: s.id
          }))
      );

    setSyllabus(filtered);
  }, [department, departments]);

  /* ---------------- VALIDATION ---------------- */

  const validateForm = () => {
    let newErrors = {};

    if (!title) newErrors.title = "Title is required";
    if (department.length === 0) newErrors.department = "Select department";
    if (selectedSyllabus.length === 0) newErrors.syllabus = "Select syllabus";

    sections.forEach((sec, sIndex) => {
      if (!sec.sectionName)
        newErrors[`sectionName-${sIndex}`] = "Select section";

      if (!sec.time)
        newErrors[`time-${sIndex}`] = "Enter time";

      sec.questions.forEach((q, qIndex) => {
        if (!q.question)
          newErrors[`question-${sIndex}-${qIndex}`] = "Enter question";

        if (sec.type === "MCQ") {
          q.options.forEach((opt, i) => {
            if (!opt)
              newErrors[`option-${sIndex}-${qIndex}-${i}`] = "Required";
          });

          if (q.correctAnswer === "")
            newErrors[`correct-${sIndex}-${qIndex}`] = "Select answer";
        } else {
          if (!q.correctAnswer)
            newErrors[`answer-${sIndex}-${qIndex}`] = "Enter answer";
        }
      });
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ---------------- SECTION ---------------- */

const handleDelete = async (id) => {
  const confirmDelete = window.confirm("Are you sure you want to delete?");

  if (!confirmDelete) return;

  await deleteAssessmentApiforTest(id);

  setUploadedAssessments(prev =>
    prev.filter(a => a.id !== id)
  );
};

  const addSection = () => {
    setSections([
      ...sections,
      {
        sectionName: "",
        time: "",
        type: "MCQ",
        questions: [
          {
            question: "",
            options: ["", "", "", ""],
            correctAnswer: ""
          }
        ]
      }
    ]);
  };

  const updateSectionField = (index, field, value) => {
    const updated = [...sections];
    updated[index][field] = value;
    setSections(updated);
  };

  /* ---------------- QUESTIONS ---------------- */

  const addQuestion = (sectionIndex) => {
    const updated = [...sections];
    updated[sectionIndex].questions.push({
      question: "",
      options: updated[sectionIndex].type === "MCQ" ? ["", "", "", ""] : [],
      correctAnswer: ""
    });
    setSections(updated);
  };

  const handleQuestionChange = (value, sIndex, qIndex) => {
    const updated = [...sections];
    updated[sIndex].questions[qIndex].question = value;
    setSections(updated);
  };

  const handleOptionChange = (value, sIndex, qIndex, optIndex) => {
    const updated = [...sections];
    updated[sIndex].questions[qIndex].options[optIndex] = value;
    setSections(updated);
  };

  const handleCorrectAnswer = (value, sIndex, qIndex) => {
    const updated = [...sections];
    updated[sIndex].questions[qIndex].correctAnswer = value;
    setSections(updated);
  };

  
    const handleLogout = () => {
        navigate('/');
    };




  /* ---------------- SAVE ---------------- */

  const saveQuestions = async () => {
  if (!validateForm()) return;

  const data = {
    departmentIds: department,
    syllabusIds: selectedSyllabus,
    title,
    sections
  };

  if (editingId) {
    await updateAssessmentApiforTest(editingId, data); // 🔥 UPDATE
    alert("Updated Successfully!");
  } else {
    await createAssessmentforTest(data); // CREATE
    alert("Created Successfully!");
  }

  fetchAssessments();
  setEditingId(null);

  // reset form (optional but good)
  setTitle("");
  setDepartment([]);
  setSelectedSyllabus([]);
  setSections([
    {
      sectionName: "",
      time: "",
      type: "MCQ",
      questions: [
        {
          question: "",
          options: ["", "", "", ""],
          correctAnswer: ""
        }
      ]
    }
  ]);
};


//   const saveQuestions = async () => {
//     if (!validateForm()) return;

//     const data = {
//       departmentIds: department,
//       syllabusIds: selectedSyllabus,
//       title,
//       sections
//     };

//     await createAssessmentforTest(data);
//     alert("Saved Successfully!");
//     fetchAssessments();
//   };


//   const saveQuestions = async () => {
//   if (!validateForm()) return;

//   const data = {
//     departmentIds: department,
//     syllabusIds: selectedSyllabus,
//     title,
//     sections
//   };

//   console.log("FINAL DATA 👉", data);

//   // local preview ke liye add karo
//   setUploadedAssessments(prev => [...prev, data]);

//   alert("Saved Locally ✅");
// };
  return (
    <div className="min-h-screen bg-gray-100">
      <Header

                userName={sessionStorage.getItem("userName") || "User"}
                userRole="manager"
                onLogout={handleLogout}
            />

      <div className="pt-24 px-10 flex justify-center">
        <div className="grid lg:grid-cols-2 gap-6 w-full max-w-6xl">

          {/* LEFT CARD */}
          <div className="bg-white p-6 rounded-3xl shadow-xl space-y-6 h-[80vh] overflow-y-auto">

           <h2 className="text-xl font-bold">
  {editingId ? "Edit Assessment" : "Create Assessment"}
</h2>

            {/* TITLE */}
            <div>
              <label className="font-semibold">Assessment Title</label>
              <Input value={title} placeholder="Enter Title" onChange={(e) => setTitle(e.target.value)} />
              {errors.title && <p className="text-red-500 text-xs">{errors.title}</p>}
            </div>

            {/* DEPARTMENT */}
            <div>
              <label className="font-semibold">Department</label>
              <Select multiple value={department} onChange={setDepartment}
                options={departments.map(d => ({
                  label: d.departmentName,
                  value: d.departmentId
                }))}
              />
              {errors.department && <p className="text-red-500 text-xs">{errors.department}</p>}
            </div>

            {/* SYLLABUS */}
            <div>
              <label className="font-semibold">Syllabus</label>
              <Select multiple value={selectedSyllabus} onChange={setSelectedSyllabus} options={syllabus} />
              {errors.syllabus && <p className="text-red-500 text-xs">{errors.syllabus}</p>}
            </div>

            {/* SECTIONS */}
            {sections.map((sec, sIndex) => (
              //<div key={sIndex} className="border p-4 rounded-xl space-y-3">
<div key={sIndex} className="border p-4 rounded-xl space-y-3 relative">


  {/* ❌ DELETE SECTION */}
  {!isRestricted && (
  <Trash2
    className="absolute top-2 right-2 text-red-600 cursor-pointer"
    size={20}
    onClick={() => removeSection(sIndex)}
  />
  )}
                <div className="grid grid-cols-3 gap-3">

                  <div>
                    <label className="font-semibold text-sm">Section</label>
                    <Select
                      value={sec.sectionName}
                      onChange={(val) =>
                        updateSectionField(sIndex, "sectionName", val)
                      }
                      options={[
                        { label: "Maths", value: "Maths" },
                        { label: "English", value: "English" },
                        { label: "Reasoning", value: "Reasoning" },
                        { label: "Coding", value: "Coding" }
                      ]}
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-sm">Time (min)</label>
                    <Input
                      type="number"
                      value={sec.time}
                      disabled={isRestricted}
                      onChange={(e) =>
                        updateSectionField(sIndex, "time", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-sm">Type</label>
                    <Select
                      value={sec.type}
                      onChange={(val) =>
                        updateSectionField(sIndex, "type", val)
                      }
                      options={[
                        { label: "MCQ", value: "MCQ" },
                        { label: "Text", value: "TEXT" },
                        { label: "Coding", value: "CODING" }
                      ]}
                    />
                  </div>
                </div>

                {sec.questions.map((q, qIndex) => (
                  //<div key={qIndex} className="bg-gray-50 p-3 rounded space-y-2">
                  <div key={qIndex} className="bg-gray-50 p-3 rounded space-y-2 relative">

  {/* ❌ DELETE QUESTION */}
  {!isRestricted && (
  <Trash2
    className="absolute top-2 right-2 text-red-500 cursor-pointer"
    size={18}
    onClick={() => removeQuestion(sIndex, qIndex)}
  />
  )}

                    <label className="font-semibold">Question</label>
                    {/* <textarea
                      className="w-full border p-2 rounded"
                      value={q.question}
                       onChange={(e) =>
                        handleQuestionChange(e.target.value, sIndex, qIndex)
                      }
                    /> */}
                    <textarea
  className="w-full border p-2 rounded resize-none overflow-hidden"
  rows={1}
  value={q.question}
  onChange={(e) => {
    handleQuestionChange(e.target.value, sIndex, qIndex);

    e.target.style.height = "auto";
    e.target.style.height = e.target.scrollHeight + "px";
  }}
/>  
                    {/* OPTIONS */}
                      {sec.type === "MCQ" && (
                      <>
                        <label className="font-semibold text-sm">Options</label>
                       <div className="grid grid-cols-2 gap-3">
  {q.options.map((opt, i) => (   
    <div key={i} className="flex gap-2 items-center">
                            <input
                              type="radio"
                              checked={q.correctAnswer === String(i)}
                              onChange={() =>
                                handleCorrectAnswer(String(i), sIndex, qIndex)
                              }
                            />
                            {/* <Input
                              placeholder={`Option ${i + 1}`}
                              value={opt}
                              onChange={(e) =>
                                handleOptionChange(e.target.value, sIndex, qIndex, i)
                              }
                            /> */}
                            <textarea
  className="w-full border p-2 rounded resize-none overflow-hidden"
  rows={1}
  placeholder={`Option ${i + 1}`}
  value={opt}
  onChange={(e) => {
    handleOptionChange(e.target.value, sIndex, qIndex, i);

    // auto height grow
    e.target.style.height = "auto";
    e.target.style.height = e.target.scrollHeight + "px";
  }}
/>
                          </div>
                        ))}
                        </div>
                      </>
                    )}

                    {/* TEXT */}
{sec.type === "TEXT" && (
  <>
    <label className="font-semibold text-sm">Answer</label>
    <textarea
      className="w-full border p-2 rounded resize-none overflow-hidden"
      rows={2}
      value={q.correctAnswer}
      onChange={(e) => {
        handleCorrectAnswer(e.target.value, sIndex, qIndex);

        e.target.style.height = "auto";
        e.target.style.height = e.target.scrollHeight + "px";
      }}
    />
  </>
)}

{/* CODING */}
{sec.type === "CODING" && (
  <>
    <label className="font-semibold text-sm">Code Answer</label>
    <textarea
      className="w-full p-3 rounded bg-black text-green-400 font-mono text-sm resize-none overflow-auto"
      rows={6}
      value={q.correctAnswer}
      onChange={(e) =>
        handleCorrectAnswer(e.target.value, sIndex, qIndex)
      }
      placeholder="// Write your code here..."
    />
  </>
)}

                  </div>
                ))}
{!isRestricted && (
                <Button onClick={() => addQuestion(sIndex)}>+ Add Question</Button>
)}
              </div>
            ))}

            <div className="flex gap-3">
              {!isRestricted && (
              <Button onClick={addSection}>+ Add Section</Button>
              )}
              {!isRestricted && (
             <Button onClick={saveQuestions}>
  {editingId ? "Update" : "Save"}
</Button>
              )}
            </div>

          </div>

          {/* RIGHT CARD */}
          <div className="bg-white p-6 rounded-3xl shadow-xl h-[80vh] overflow-y-auto">

            <h2 className="font-bold mb-4">Assessments</h2>

            {uploadedAssessments.map((item, i) => (
              <div key={i} className="border p-4 rounded-xl mb-3">

                <div className="flex justify-between">
                  <h3>{item.title}</h3>
                  {!isRestricted && (
                <Trash2
  className="text-red-500 cursor-pointer"
  onClick={() => handleDelete(item.id)}
/>
                  )}
                </div>

                <div className="flex gap-3 mt-3">
                  <Button className="bg-blue-500 text-white"
                    onClick={() => setPreviewData(item)}>
                    Preview
                  </Button>

                  {/* <Button className="bg-green-500 text-white">
                    Edit
                  </Button> */}
                  {!isRestricted && (
                  <Button
  className="bg-green-500 text-white"
  onClick={() => {
    setEditingId(item.id);
    setTitle(item.title);
    setDepartment(item.departmentIds);
    setSelectedSyllabus(item.syllabusIds);
    setSections(item.sections);
  }}
>
  Edit
</Button>
                  )}
                </div>

              </div>
            ))}

          </div>

        </div>
      </div>

      {/* ✅ PREVIEW MODAL FIX */}
      {previewData && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">

          <div className="bg-white p-6 rounded-xl w-[600px] max-h-[80vh] overflow-y-auto">

            <h2 className="text-xl font-bold mb-4">{previewData.title}</h2>

            {previewData.sections?.map((sec, i) => (
              <div key={i} className="mb-4">
                <h3 className="font-semibold text-blue-600">
                  {sec.sectionName} (Time: {sec.time} min)
                </h3>

                {sec.questions?.map((q, j) => (
                  <p key={j}>{j + 1}. {q.question}</p>
                ))}
              </div>
            ))}

            <div className="flex justify-end">
              <Button onClick={() => setPreviewData(null)}>Close</Button>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default CreateQuestion;