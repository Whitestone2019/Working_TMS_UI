// import React, { useState, useEffect } from "react";
// import Header from "../../../components/ui/Header";
// import { useNavigate } from 'react-router-dom';
// import NavigationBreadcrumb from "../../../components/ui/NavigationBreadcrumb";
// import Button from "../../../components/ui/Button";
// import Input from "../../../components/ui/Input";
// import Icon from "../../../components/AppIcon";
// import Select from "../../../components/ui/Select";
// import '../../../App.css'
// import { uploadSyllabusAPI, getAllSyllabusAPI, updateSyllabusAPI, getAllTrainers, deleteSubTopicAPI, deleteSyllabusAPI } from "../../../api_service";
// import { fetchAllDepartments } from "../../../api_service";



// const UploadSyllabus = ({ onCancel }) => {
//     const [formData, setFormData] = useState({
//         title: "",
//         topic: "",
//         durationInDays: "",
//         departmentIds: [],     // NEW
//         //trainerIds: [], 
//         trainerId: "",

//         subTopics: [{ name: "", description: "", file: null, managerId: "" }],
//     });
//     const navigate = useNavigate();
//     const [errors, setErrors] = useState({});
//     const [loading, setLoading] = useState(false);
//     const [syllabusList, setSyllabusList] = useState([]);
//     const [editingId, setEditingId] = useState(null);
//     const [trainerList, setTrainerList] = useState([]);
//     const [refreshKey, setRefreshKey] = useState(0);
//     const [departmentList, setDepartmentList] = useState([]);
//     const restrictedRoles = ["CEO", "CTO", "HR", "PM"];
//     const roleName = sessionStorage.getItem("roleName");
//     const isRestricted = restrictedRoles.includes(roleName);


//     useEffect(() => {
//         console.log("Updated Trainer List:", trainerList);
//     }, [trainerList]);
//     const loadAll = async () => {
//         try {
//             const res = await getAllSyllabusAPI();
//             setSyllabusList(res.data?.data || []);
//         } catch (err) {
//             console.error("Failed to fetch syllabus", err);
//         }
//     };

//     const loadTrainers = async () => {
//         try {
//             const res = await getAllTrainers();
//             console.log("Trainers", res.data);
//             setTrainerList(res.data || []);
//         } catch (err) {
//             console.error("Failed to fetch trainers", err);
//         }
//     };
//     // const trainerOptions = Array.isArray(trainerList)
//     //     ? trainerList.map((t) => ({ 
//     //         value: t.trngid,
//     //         label: `${t.firstname} ${t.lastname}`
//     //     }))
//     //     : [];
//     const trainerOptions = trainerList.map(t => ({
//         value: t.trngid,
//         label: `${t.firstname} ${t.lastname}`
//     }));



//     const loadDepartments = async () => {
//         try {
//             const managerId = sessionStorage.getItem("userId");
//             const res = await fetchAllDepartments();
//             setDepartmentList(res || []);
//         } catch (err) {
//             console.error("Failed to fetch departments", err);
//         }
//     };

//     useEffect(() => {
//         loadDepartments();
//     }, []);




//     useEffect(() => {
//         loadAll();
//     }, [refreshKey]);

//     useEffect(() => {
//         loadTrainers();
//     }, []);

//     useEffect(() => {
//         console.log("Updated Trainer List:", trainerList);
//     }, [trainerList]);

//     const triggerReload = () => {
//         setRefreshKey(prev => prev + 1);
//     };

//     const handleChange = (field, value) => {
//         setFormData((prev) => ({ ...prev, [field]: value }));
//         if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
//     };

//     const handleSubTopicChange = (index, field, value) => {
//         const updated = [...formData.subTopics];
//         updated[index][field] = value;
//         setFormData((prev) => ({ ...prev, subTopics: updated }));
//     };

//     const addSubTopic = () => {
//         setFormData((prev) => ({
//             ...prev,
//             subTopics: [...prev.subTopics, { name: "", description: "", file: null, managerId: "" }],
//         }));
//     };



//     const handleDeleteSyllabus = async (syllabusId) => {
//         if (!window.confirm("This will permanently delete this syllabus and all its subtopics. Continue?")) return;

//         try {
//             await deleteSyllabusAPI(syllabusId);
//             alert("Syllabus deleted successfully!");
//             triggerReload();

//         } catch (err) {
//             console.error(err);
//             alert("Failed to delete syllabus");

//         }
//     };



//     const deleteSubTopic = async (index, subTopicId) => {
//         if (!window.confirm("This will permanently delete this subtopic. Continue?")) return;

//         try {
//             if (subTopicId) {
//                 await deleteSubTopicAPI(subTopicId);
//                 alert("Subtopic deleted successfully from server!");
//                 triggerReload();
//             }
//             const updated = [...formData.subTopics];
//             updated.splice(index, 1);
//             setFormData(prev => ({ ...prev, subTopics: updated }));
//         } catch (err) {
//             console.error(err);
//             alert("Failed to delete subtopic");
//         }
//     }



//     console.log(trainerList)
//     const interviewerOptions = Array.isArray(trainerList)
//         ? (trainerList).map((t) => ({
//             value: t.trngid,
//             label: `${t.firstname} ${t.lastname}${t.role.roleName ? " - " + t.role.roleName : ""}`,
//         }))
//         : [];

//     const validateForm = () => {
//         const newErrors = {};
//         if (!formData.title.trim()) newErrors.title = "Title is required";
//         if (!formData.topic.trim()) newErrors.topic = "Topic is required";

//         formData.subTopics.forEach((sub, i) => {
//             if (!sub.name.trim()) newErrors[`subname${i}`] = "Subtopic name required";
//             if (!sub.description.trim()) newErrors[`subdesc${i}`] = "Description required";
//             if (!editingId && !sub.file) newErrors[`subfile${i}`] = "File required";
//         });

//         setErrors(newErrors);
//         return Object.keys(newErrors).length === 0;
//     };

//     const handleLogout = () => {
//         navigate('/');
//     };




//     const handleSubmit = async () => {
//         if (!validateForm()) return;
//         setLoading(true);

//         try {

//             // const syllabusJson = {
//             //     title: formData.title,
//             //     topic: formData.topic,
//             //     durationInDays: Number(formData.durationInDays),

//             //     subTopics: formData.subTopics.map(st => ({
//             //         id: st.id,
//             //         name: st.name,
//             //         description: st.description,
//             //         filePath: typeof st.file === "string" ? st.file : null,

//             //         manager: st.managerId ? { trngid: st.managerId } : null
//             //     }))

//             // };

//             const syllabusJson = {
//                 title: formData.title,
//                 topic: formData.topic,
//                 durationInDays: Number(formData.durationInDays),

//                 departments: formData.departmentIds.map(id => ({ id })),

//                 // trainers: formData.trainerIds.map(id => ({
//                 //     trngid: id
//                 // })),
//                 // trainers: formData.trainerId
//                 // ? [{ trngid: formData.trainerId }]
//                 // : [],
//                 manager: formData.trainerId
//                     ? { trngid: formData.trainerId }
//                     : null,


//                 subTopics: formData.subTopics.map(st => ({
//                     id: st.id,
//                     name: st.name,
//                     description: st.description,
//                     filePath: typeof st.file === "string" ? st.file : null
//                 }))
//             };

//             console.log("Prepared Syllabus JSON:", syllabusJson);


//             const fd = new FormData();
//             fd.append("syllabus", JSON.stringify(syllabusJson));


//             formData.subTopics.forEach((sub) => {
//                 if (sub.file instanceof File) {
//                     fd.append("files", sub.file);
//                 } else {
//                     fd.append("files", new Blob(), "empty.txt");
//                 }
//             });

//             console.log(fd)
//             // Send to backend
//             const res = editingId
//                 ? await updateSyllabusAPI(editingId, fd)
//                 : await uploadSyllabusAPI(fd);

//             if (editingId) {
//                 setSyllabusList(prev => prev.map(it => it.id === editingId ? res.data : it));
//                 alert("Updated Successfully!");

//             } else {
//                 setSyllabusList(prev => [...prev, res.data]);
//                 alert("Uploaded Successfully!");

//             }

//             triggerReload();



//             setEditingId(null);

//         } catch (err) {
//             console.error("Upload error", err);
//             alert(err?.response?.data || err.message || "Upload failed");
//         } finally {
//             setLoading(false);
//         }
//     };

//     console.log("Trainer List:", trainerList);



//     //  UPDATED EDIT LOGIC
//     const editSyllabus = (item) => {
//         setEditingId(item.id);

//         setFormData({
//             title: item.title,
//             topic: item.topic,
//             durationInDays: item.durationInDays,

//             //  FIX: Add these
//             departmentIds: item.departments
//                 ? item.departments.map(d => d.id)
//                 : [],

//             // trainerIds: item.trainers
//             //     ? item.trainers.map(t => t.trngid)
//             //     : [],
//             //     trainerId: item.trainers && item.trainers.length > 0
//             // ? item.trainers[0].trngid
//             // : "",

//             trainerId: item.manager ? item.manager.trngid : "",

//             subTopics: (item.subTopics && item.subTopics.length > 0)
//                 ? item.subTopics.map(sub => ({
//                     id: sub.id,
//                     name: sub.name,
//                     description: sub.description,
//                     file: sub.filePath || null,
//                     managerId: sub.manager ? sub.manager.trngid : ""
//                 }))
//                 : [{ name: "", description: "", file: null, managerId: "" }]
//         });
//     };


//     // ... inside your return statement ...

//     {/* RIGHT LIST - Updated with visible Date */ }
//     <div className="bg-white/70 p-6 shadow-xl rounded-2xl border border-blue-200 h-fit sticky top-24">
//         <h2 className="text-2xl font-bold text-blue-700 mb-4 flex items-center gap-2">
//             <Icon name="List" size={24} className="text-blue-700" />
//             Syllabus List
//         </h2>

//         {syllabusList.length === 0 ? (
//             <p className="text-gray-500">No syllabus uploaded yet.</p>
//         ) : (
//             <ul className="space-y-3">
//                 {syllabusList.map((item) => (
//                     <li
//                         key={item.id}
//                         className="p-4 bg-blue-50 rounded-lg border border-blue-100 cursor-pointer hover:bg-blue-100 relative group transition-all"
//                         onClick={() => {
//                             if (!isRestricted) editSyllabus(item);
//                         }}
//                     >
//                         <div className="pr-10">
//                             <h4 className="font-semibold text-blue-900">{item.title}</h4>
//                             <p className="text-sm text-gray-600">{item.topic}</p>

//                             {/* VISIBLE DATE */}
//                             <div className="flex items-center gap-1 mt-2 text-[11px] text-gray-400 font-medium">
//                                 <Icon name="Calendar" size={12} />
//                                 <span>
//                                     {item.createdAt
//                                         ? new Date(item.createdAt).toLocaleDateString('en-GB', {
//                                             day: '2-digit',
//                                             month: 'short',
//                                             year: 'numeric'
//                                         })
//                                         : "N/A"}
//                                 </span>
//                             </div>
//                         </div>
//                         {!isRestricted && (
//                             <button
//                                 onClick={(e) => {
//                                     e.stopPropagation();
//                                     handleDeleteSyllabus(item.id);
//                                 }}
//                                 className="absolute top-4 right-4 text-red-400 hover:text-red-600 transition-colors"
//                             >
//                                 <Icon name="Trash2" size={18} />
//                             </button>
//                         )}
//                     </li>
//                 ))}
//             </ul>
//         )}
//     </div>
//     return (
//         <div className="min-h-screen bg-blue-50">
//             <Header

//                 userName={sessionStorage.getItem("userName") || "User"}
//                 userRole="manager"
//                 onLogout={handleLogout}
//             />
//             <main className="pt-20 max-w-7xl mx-auto px-4">
//                 <NavigationBreadcrumb userRole="manager" />

//                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-10">

//                     <div className="bg-white/50 backdrop-blur-lg shadow-xl rounded-2xl border border-blue-200 sticky top-24 max-h-[calc(100vh-120px)] flex flex-col">


//                         <div className="p-8 border-b bg-blue-100 rounded-t-2xl flex-none">

//                             <h2 className="text-3xl font-bold text-black">
//                                 <Icon name="BookOpen" size={28} className="inline mr-2 text-blue-700" />
//                                 {editingId ? "Edit Syllabus" : "Upload Syllabus"}
//                             </h2>
//                         </div>


//                         <div className="custom-scrollbar p-8 space-y-8 flex-1 flex flex-col overflow-y-auto">

//                             <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
//                                 <Input
//                                     label="Title"
//                                     disabled={isRestricted}
//                                     placeholder="Enter syllabus title"
//                                     value={formData.title}
//                                     onChange={(e) => handleChange("title", e.target.value)}
//                                     error={errors.title}
//                                 />

//                                 <Input
//                                     label="Topic"
//                                     disabled={isRestricted}
//                                     placeholder="Enter main topic"
//                                     value={formData.topic}
//                                     onChange={(e) => handleChange("topic", e.target.value)}
//                                     error={errors.topic}
//                                 />
//                                 <Input
//                                     label="Duration (in Days)"
//                                     disabled={isRestricted}
//                                     placeholder="Enter number of days e.g. 1, 2, 3"
//                                     value={formData.durationInDays}
//                                     onChange={(e) => handleChange("durationInDays", e.target.value)}
//                                 />
//                                 {/* Department Multi Select */}
//                                 {/* <div>
//     <label className="block text-sm font-medium mb-2">
//         Syllabus Departments
//     </label>

//     <div className="grid grid-cols-2 gap-2 border p-3 rounded-xl bg-white">
//         {departmentList.map((dept) => (
//             <label key={dept.id} className="flex items-center gap-2 cursor-pointer">
//                 <input
//                     type="checkbox"
//                     checked={formData.departmentIds.includes(dept.id)}
//                     onChange={() => {
//                         if (formData.departmentIds.includes(dept.id)) {
//                             handleChange(
//                                 "departmentIds",
//                                 formData.departmentIds.filter(id => id !== dept.id)
//                             );
//                         } else {
//                             handleChange(
//                                 "departmentIds",
//                                 [...formData.departmentIds, dept.id]
//                             );
//                         }
//                     }}
//                     className="accent-blue-600"
//                 />
//                 {dept.name}
//             </label>
//         ))}
//     </div>
// </div> */}
//                                 <div>
//                                     <label className="block text-sm font-medium mb-2">
//                                         Select Departments
//                                     </label>

//                                     <Select
//                                         options={departmentList.map(d => ({
//                                             value: d.id,
//                                             label: d.name
//                                         }))}
//                                         disabled={isRestricted}
//                                         value={formData.departmentIds}
//                                         onChange={(value) => handleChange("departmentIds", value)}
//                                         multiple
//                                         searchable
//                                     />
//                                     {formData.departmentIds.length > 0 && (
//                                         <div className="flex flex-wrap gap-2 mt-2">
//                                             {departmentList
//                                                 .filter(d => formData.departmentIds.includes(d.id))
//                                                 .map(d => (
//                                                     <span
//                                                         key={d.id}
//                                                         className="px-3 py-1 text-xs bg-blue-200 text-blue-800 rounded-full"
//                                                     >
//                                                         {d.name}
//                                                     </span>
//                                                 ))}
//                                         </div>
//                                     )}

//                                 </div>


//                                 <div className="col-span-1 md:col-span-2 flex flex-col">
//                                     <Select
//                                         label="Select Trainers"
//                                         disabled={isRestricted}
//                                         options={trainerOptions}
//                                         value={formData.trainerId}
//                                         onChange={(value) => handleChange("trainerId", value)}
//                                         //multiple
//                                         searchable
//                                     />

//                                     {/* {formData.trainerIds.length > 0 && (
//     <div className="flex flex-wrap gap-2 mt-2">
//       {trainerList
//         .filter(t => formData.trainerIds.includes(t.trngid))
//         .map(t => (
//           <span
//             key={t.trngid}
//             className="inline-flex items-center px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full"
//           >
//             {t.firstname} {t.lastname}
//           </span>
//         ))}
//     </div>
//   )} */}
//                                 </div>


//                             </div>


//                             <div className="space-y-6 flex-1 overflow-y-auto pr-3 custom-scrollbar min-h-[200px]">




//                                 <h3 className="text-xl font-semibold text-blue-700">Subtopics</h3>

//                                 {formData.subTopics.map((sub, index) => (
//                                     <div key={index} className="border p-5 rounded-xl bg-white shadow relative">

//                                         {!isRestricted && (
//                                             <button
//                                                 onClick={() => deleteSubTopic(index, sub.id)}
//                                                 className="absolute top-3 right-3 text-red-500 hover:text-red-700"
//                                             >
//                                                 <Icon name="Trash2" size={22} />
//                                             </button>
//                                         )}


//                                         <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
//                                             <Input
//                                                 label={`Subtopic ${index + 1}`}
//                                                 placeholder="Enter subtopic name"
//                                                 disabled={isRestricted}
//                                                 value={sub.name}
//                                                 onChange={(e) =>
//                                                     handleSubTopicChange(index, "name", e.target.value)
//                                                 }
//                                                 error={errors[`subname${index}`]}
//                                             />

//                                             <div>
//                                                 <label className="text-sm font-medium text-gray-700 mb-1 block">
//                                                     Upload File {!editingId && "*"}
//                                                 </label>

//                                                 <label className="cursor-pointer block border border-dashed border-blue-400 rounded-xl p-5 bg-white hover:bg-blue-50 transition shadow-sm overflow-hidden">
//                                                     <div className="flex items-center gap-3">
//                                                         <Icon name="UploadCloud" size={24} className="text-blue-600" />
//                                                         <span className="text-gray-700 truncate block max-w-full">
//                                                             {sub.file instanceof File
//                                                                 ? sub.file.name
//                                                                 : sub.file
//                                                                     ? sub.file.split("/").pop()
//                                                                     : "Choose file"}
//                                                         </span>
//                                                     </div>

//                                                     <input
//                                                         type="file"
//                                                         disabled={isRestricted}
//                                                         className="hidden"
//                                                         onChange={(e) =>
//                                                             handleSubTopicChange(index, "file", e.target.files[0])
//                                                         }
//                                                     />
//                                                 </label>

//                                                 {errors[`subfile${index}`] && (
//                                                     <p className="text-sm text-red-500 mt-1">
//                                                         {errors[`subfile${index}`]}
//                                                     </p>
//                                                 )}
//                                             </div>


//                                         </div>

//                                         <div className="mt-5">
//                                             <label className="text-sm font-medium text-gray-700 mb-1 block">
//                                                 Description *
//                                             </label>

//                                             <textarea
//                                                 className="w-full h-24 px-4 py-3 rounded-xl border border-blue-300 bg-white shadow-sm"
//                                                 placeholder="Enter subtopic description..."
//                                                 disabled={isRestricted}
//                                                 value={sub.description}
//                                                 onChange={(e) =>
//                                                     handleSubTopicChange(index, "description", e.target.value)
//                                                 }
//                                             />
//                                             <div>
//                                                 <br></br>

//                                                 {/* <Select
//                                                     label="Select Interviewer"
//                                                     required
//                                                     options={interviewerOptions}
//                                                     value={sub.managerId}
//                                                     onChange={(value) => handleSubTopicChange(index, "managerId", value)}
//                                                     searchable
//                                                 /> */}

//                                             </div>





//                                             {errors[`subdesc${index}`] && (
//                                                 <p className="text-sm text-red-500 mt-1">
//                                                     {errors[`subdesc${index}`]}
//                                                 </p>
//                                             )}
//                                         </div>
//                                     </div>
//                                 ))}
//                                 {!isRestricted && (
//                                     <Button
//                                         variant="default"
//                                         onClick={addSubTopic}
//                                         iconName="Plus"
//                                         className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl"
//                                     >
//                                         Add Subtopic
//                                     </Button>
//                                 )}
//                             </div>


//                             <div className="pt-6 border-t flex flex-col sm:flex-row gap-4 flex-none">
//                                 {!isRestricted && (
//                                     <button
//                                         onClick={handleSubmit}
//                                         className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl"
//                                     >
//                                         {loading ? (editingId ? "Updating..." : "Uploading...") :
//                                             editingId ? "Update Syllabus" : "Upload Syllabus"}
//                                     </button>
//                                 )}
//                                 {!isRestricted && (
//                                     <Button
//                                         variant="ghost"
//                                         onClick={onCancel}
//                                         iconName="X"
//                                         className="flex-1 text-gray-600 hover:bg-gray-100 py-3 rounded-xl"
//                                     >
//                                         Cancel
//                                     </Button>
//                                 )}
//                             </div>
//                         </div>
//                     </div>


//                     <div className="bg-white/70 p-6 shadow-xl rounded-2xl border border-blue-200 h-fit sticky top-24">
//                         <h2 className="text-2xl font-bold text-blue-700 mb-4 flex items-center gap-2">
//                             <Icon name="List" size={24} className="text-blue-700" />
//                             Syllabus List
//                         </h2>

//                         {syllabusList.length === 0 ? (
//                             <p className="text-gray-500">No syllabus uploaded yet.</p>
//                         ) : (
//                             <ul className="space-y-3">
//                                 {syllabusList.map((item) => (
//                                     <li
//                                         key={item.id}
//                                         className="p-4 bg-blue-50 rounded-lg border border-blue-100 cursor-pointer hover:bg-blue-100 relative group transition-all"
//                                         onClick={() => editSyllabus(item)}
//                                     >
//                                         <div className="pr-10">
//                                             <h4 className="font-semibold text-blue-900">{item.title}</h4>
//                                             <p className="text-sm text-gray-600">{item.topic}</p>


//                                         </div>

//                                         <button
//                                             onClick={(e) => {
//                                                 e.stopPropagation();
//                                                 handleDeleteSyllabus(item.id);
//                                             }}
//                                             className="absolute top-4 right-4 text-red-400 hover:text-red-600 transition-colors"
//                                         >
//                                             <Icon name="Trash2" size={18} />
//                                         </button>
//                                     </li>
//                                 ))}
//                             </ul>
//                         )}
//                     </div>
//                 </div>
//             </main>
//         </div>
//     );
// };

// export default UploadSyllabus;
 import React, { useState, useEffect } from "react";
import Header from "../../../components/ui/Header";
import { useNavigate } from 'react-router-dom';
import NavigationBreadcrumb from "../../../components/ui/NavigationBreadcrumb";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Icon from "../../../components/AppIcon";
import Select from "../../../components/ui/Select";
import '../../../App.css'
import { uploadSyllabusAPI, getAllSyllabusAPI, updateSyllabusAPI, getAllTrainers, deleteSubTopicAPI, deleteSyllabusAPI } from "../../../api_service";
import { fetchAllDepartments } from "../../../api_service";



const UploadSyllabus = ({ onCancel }) => {
    const [formData, setFormData] = useState({
        title: "",
        topic: "",
        durationInDays: "",
        departmentIds: [],     
        trainerIds: [], 
        //trainerId: "",

        subTopics: [{ name: "", description: "", file: null, managerId: "" }],
    });
    const navigate = useNavigate();
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [syllabusList, setSyllabusList] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [trainerList, setTrainerList] = useState([]);
    const [refreshKey, setRefreshKey] = useState(0);
    const [departmentList, setDepartmentList] = useState([]);
    const restrictedRoles = ["CEO", "CTO", "HR", "PM"];
    const roleName = sessionStorage.getItem("roleName");
    const isRestricted = restrictedRoles.includes(roleName);


    useEffect(() => {
        console.log("Updated Trainer List:", trainerList);
    }, [trainerList]);
    const loadAll = async () => {
        try {
            const res = await getAllSyllabusAPI();
            setSyllabusList(res.data?.data || []);
        } catch (err) {
            console.error("Failed to fetch syllabus", err);
        }
    };

    const loadTrainers = async () => {
        try {
            const res = await getAllTrainers();
            console.log("Trainers", res.data);
            setTrainerList(res.data || []);
        } catch (err) {
            console.error("Failed to fetch trainers", err);
        }
    };
   
    const trainerOptions = trainerList.map(t => ({
        value: t.trngid,
        label: `${t.firstname} ${t.lastname}`
    }));



    const loadDepartments = async () => {
        try {
            const managerId = sessionStorage.getItem("userId");
            const res = await fetchAllDepartments();
            setDepartmentList(res || []);
        } catch (err) {
            console.error("Failed to fetch departments", err);
        }
    };

    useEffect(() => {
        loadDepartments();
    }, []);




    useEffect(() => {
        loadAll();
    }, [refreshKey]);

    useEffect(() => {
        loadTrainers();
    }, []);

    useEffect(() => {
        console.log("Updated Trainer List:", trainerList);
    }, [trainerList]);

    const triggerReload = () => {
        setRefreshKey(prev => prev + 1);
    };

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
    };

    const handleSubTopicChange = (index, field, value) => {
        const updated = [...formData.subTopics];
        updated[index][field] = value;
        setFormData((prev) => ({ ...prev, subTopics: updated }));
    };

    const addSubTopic = () => {
        setFormData((prev) => ({
            ...prev,
            subTopics: [...prev.subTopics, { name: "", description: "", file: null, managerId: "" }],
        }));
    };



    const handleDeleteSyllabus = async (syllabusId) => {
        if (!window.confirm("This will permanently delete this syllabus and all its subtopics. Continue?")) return;

        try {
            await deleteSyllabusAPI(syllabusId);
            alert("Syllabus deleted successfully!");
            triggerReload();

        } catch (err) {
            console.error(err);
            alert("Failed to delete syllabus");

        }
    };



    const deleteSubTopic = async (index, subTopicId) => {
        if (!window.confirm("This will permanently delete this subtopic. Continue?")) return;

        try {
            if (subTopicId) {
                await deleteSubTopicAPI(subTopicId);
                alert("Subtopic deleted successfully from server!");
                triggerReload();
            }
            const updated = [...formData.subTopics];
            updated.splice(index, 1);
            setFormData(prev => ({ ...prev, subTopics: updated }));
        } catch (err) {
            console.error(err);
            alert("Failed to delete subtopic");
        }
    }



    console.log(trainerList)
    const interviewerOptions = Array.isArray(trainerList)
        ? (trainerList).map((t) => ({
            value: t.trngid,
            label: `${t.firstname} ${t.lastname}${t.role.roleName ? " - " + t.role.roleName : ""}`,
        }))
        : [];

    const validateForm = () => {
        const newErrors = {};
        if (!formData.title.trim()) newErrors.title = "Title is required";
        if (!formData.topic.trim()) newErrors.topic = "Topic is required";

        if(!formData.durationInDays){
            newErrors.durationInDays="Duration is required";
        }
        else if(!/^\d+$/.test(formData.durationInDays)){
            newErrors.durationInDays="Only Number requried";
        }
        else if(Number(formData.durationInDays)<=0){
            newErrors.durationInDays="Must be greater than 0";
        }

        formData.subTopics.forEach((sub, i) => {
            if (!sub.name.trim()) newErrors[`subname${i}`] = "Subtopic name required";
            if (!sub.description.trim()) newErrors[`subdesc${i}`] = "Description required";
            if (!editingId && !sub.file) newErrors[`subfile${i}`] = "File required";
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogout = () => {
        navigate('/');
    };




    const handleSubmit = async () => {
        if (!validateForm()) return;
        setLoading(true);

        try {

           

            // const syllabusJson = {
            //     title: formData.title,
            //     topic: formData.topic,
            //     durationInDays: Number(formData.durationInDays),

            //     departments: formData.departmentIds.map(id => ({ id })),

            //     trainers: formData.trainerIds.map(id => ({
            //         trngid: id
            //     })),
            //     managers: formData.trainerId
            //     ? [{ trngid: formData.trainerId }]
            //     : [],
            //     // manager: formData.trainerId
            //     //     ? { trngid: formData.trainerId }
            //     //     : null,


            //     subTopics: formData.subTopics.map(st => ({
            //         id: st.id,
            //         name: st.name,
            //         description: st.description,
            //         filePath: typeof st.file === "string" ? st.file : null
            //     }))
            // };
const syllabusJson = {
    title: formData.title,
    topic: formData.topic,
    durationInDays: Number(formData.durationInDays),

    departments: formData.departmentIds.map(id => ({ id })),

    managers: formData.trainerIds.map(id => ({
        trngid: id
    })),

    subTopics: formData.subTopics.map(st => ({
        id: st.id,
        name: st.name,
        description: st.description,
        filePath: typeof st.file === "string" ? st.file : null
    }))
};
            console.log("Prepared Syllabus JSON:", syllabusJson);


            const fd = new FormData();
            fd.append("syllabus", JSON.stringify(syllabusJson));


            formData.subTopics.forEach((sub) => {
                if (sub.file instanceof File) {
                    fd.append("files", sub.file);
                } else {
                    fd.append("files", new Blob(), "empty.txt");
                }
            });

//             formData.subTopics.forEach((sub) => {
//     if (sub.file instanceof File) {
//         fd.append("files", sub.file);
//     }
// });
            console.log(fd)
            // Send to backend
            const res = editingId
                ? await updateSyllabusAPI(editingId, fd)
                : await uploadSyllabusAPI(fd);

            if (editingId) {
                setSyllabusList(prev => prev.map(it => it.id === editingId ? res.data : it));
                alert("Updated Successfully!");

            } else {
                setSyllabusList(prev => [...prev, res.data]);
                alert("Uploaded Successfully!");

            }

            triggerReload();



            setEditingId(null);

        } catch (err) {
            console.error("Upload error", err);
            alert(err?.response?.data || err.message || "Upload failed");
        } finally {
            setLoading(false);
        }
    };

    console.log("Trainer List:", trainerList);



    //  UPDATED EDIT LOGIC
    const editSyllabus = (item) => {
        setEditingId(item.id);

        // setFormData({
        //     title: item.title,
        //     topic: item.topic,
        //     durationInDays: item.durationInDays,

        //     //  FIX: Add these
        //     departmentIds: item.departments
        //         ? item.departments.map(d => d.id)
        //         : [],

        //     trainerIds: item.managers
        //         ? item.managers.map(t => t.trngid)
        //         : [],
        //         trainerId: item.managers && item.managers.length > 0
        //     ? item.managers[0].trngid
        //     : "",

        //    // trainerId: item.manager ? item.manager.trngid : "",

        //     subTopics: (item.subTopics && item.subTopics.length > 0)
        //         ? item.subTopics.map(sub => ({
        //             id: sub.id,
        //             name: sub.name,
        //             description: sub.description,
        //             file: sub.filePath || null,
        //             managerId: sub.manager ? sub.manager.trngid : ""
        //         }))
        //         : [{ name: "", description: "", file: null, managerId: "" }]
        // });
  
  setFormData({
    title: item.title,
    topic: item.topic,
    durationInDays: item.durationInDays,

    departmentIds: item.departments
        ? item.departments.map(d => d.id)
        : [],

    trainerIds: item.managers
        ? item.managers.map(t => t.trngid)
        : [],

    subTopics: item.subTopics?.length
        ? item.subTopics.map(sub => ({
            id: sub.id,
            name: sub.name,
            description: sub.description,
            file: sub.filePath || null,
            managerId: sub.manager ? sub.manager.trngid : ""
        }))
        : [{ name: "", description: "", file: null, managerId: "" }]
});
    };


    // ... inside your return statement ...

    {/* RIGHT LIST - Updated with visible Date */ }
    <div className="bg-white/70 p-6 shadow-xl rounded-2xl border border-blue-200 h-fit sticky top-24">
        <h2 className="text-2xl font-bold text-blue-700 mb-4 flex items-center gap-2">
            <Icon name="List" size={24} className="text-blue-700" />
            Syllabus List
        </h2>

        {syllabusList.length === 0 ? (
            <p className="text-gray-500">No syllabus uploaded yet.</p>
        ) : (
            <ul className="space-y-3">
                {syllabusList.map((item) => (
                    <li
                        key={item.id}
                        className="p-4 bg-blue-50 rounded-lg border border-blue-100 cursor-pointer hover:bg-blue-100 relative group transition-all"
                        onClick={() => {
                            if (!isRestricted) editSyllabus(item);
                        }}
                    >
                        <div className="pr-10">
                            <h4 className="font-semibold text-blue-900">{item.title}</h4>
                            <p className="text-sm text-gray-600">{item.topic}</p>

                            {/* VISIBLE DATE */}
                            <div className="flex items-center gap-1 mt-2 text-[11px] text-gray-400 font-medium">
                                <Icon name="Calendar" size={12} />
                                <span>
                                    {item.createdAt
                                        ? new Date(item.createdAt).toLocaleDateString('en-GB', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric'
                                        })
                                        : "N/A"}
                                </span>
                            </div>
                        </div>
                        {!isRestricted && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteSyllabus(item.id);
                                }}
                                className="absolute top-4 right-4 text-red-400 hover:text-red-600 transition-colors"
                            >
                                <Icon name="Trash2" size={18} />
                            </button>
                        )}
                    </li>
                ))}
            </ul>
        )}
    </div>
    return (
        <div className="min-h-screen bg-blue-50">
            <Header

                userName={sessionStorage.getItem("userName") || "User"}
                userRole="manager"
                onLogout={handleLogout}
            />
            <main className="pt-20 max-w-7xl mx-auto px-4">
                <NavigationBreadcrumb userRole="manager" />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-10">

                    <div className="bg-white/50 backdrop-blur-lg shadow-xl rounded-2xl border border-blue-200 sticky top-24 max-h-[calc(100vh-120px)] flex flex-col">


                        <div className="p-8 border-b bg-blue-100 rounded-t-2xl flex-none">

                            <h2 className="text-3xl font-bold text-black">
                                <Icon name="BookOpen" size={28} className="inline mr-2 text-blue-700" />
                                {editingId ? "Edit Syllabus" : "Upload Syllabus"}
                            </h2>
                        </div>


                        <div className="custom-scrollbar p-8 space-y-8 flex-1 flex flex-col overflow-y-auto">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                                <Input
                                    label="Title"
                                    disabled={isRestricted}
                                    placeholder="Enter syllabus title"
                                    value={formData.title}
                                    onChange={(e) => handleChange("title", e.target.value)}
                                    error={errors.title}
                                />

                                <Input
                                    label="Topic"
                                    disabled={isRestricted}
                                    placeholder="Enter main topic"
                                    value={formData.topic}
                                    onChange={(e) => handleChange("topic", e.target.value)}
                                    error={errors.topic}
                                />
                                <Input
                                    label="Duration (in Days)"
                                    disabled={isRestricted}
                                    placeholder="Enter number of days e.g. 1, 2, 3"
                                    value={formData.durationInDays}
                                    onChange={(e) => {
                                        const value=e.target.value;
                                        if(/^\d*$/.test(value))
                                        {
                                            handleChange("durationInDays",value);
                                        }

                                    }}
                                      error={errors.durationInDays}
                                    />
   
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Select Departments
                                    </label>

                                    <Select
                                        options={departmentList.map(d => ({
                                            value: d.id,
                                            label: d.name
                                        }))}
                                        disabled={isRestricted}
                                        value={formData.departmentIds}
                                        onChange={(value) => handleChange("departmentIds", value)}
                                        multiple
                                        searchable
                                    />
                                    {formData.departmentIds.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {departmentList
                                                .filter(d => formData.departmentIds.includes(d.id))
                                                .map(d => (
                                                    <span
                                                        key={d.id}
                                                        className="px-3 py-1 text-xs bg-blue-200 text-blue-800 rounded-full"
                                                    >
                                                        {d.name}
                                                    </span>
                                                ))}
                                        </div>
                                    )}

                                </div>


                                <div className="col-span-1 md:col-span-2 flex flex-col">
                                   <Select
    label="Select Trainers"
    disabled={isRestricted}
    options={trainerOptions}
    value={formData.trainerIds}
    onChange={(value) => handleChange("trainerIds", value)}
    multiple
    searchable
/>

                                </div>


                            </div>


                            <div className="space-y-6 flex-1 overflow-y-auto pr-3 custom-scrollbar min-h-[200px]">




                                <h3 className="text-xl font-semibold text-blue-700">Subtopics</h3>

                                {formData.subTopics.map((sub, index) => (
                                    <div key={index} className="border p-5 rounded-xl bg-white shadow relative">

                                        {!isRestricted && (
                                            <button
                                                onClick={() => deleteSubTopic(index, sub.id)}
                                                className="absolute top-3 right-3 text-red-500 hover:text-red-700"
                                            >
                                                <Icon name="Trash2" size={22} />
                                            </button>
                                        )}


                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                                            <Input
                                                label={`Subtopic ${index + 1}`}
                                                placeholder="Enter subtopic name"
                                                disabled={isRestricted}
                                                value={sub.name}
                                                onChange={(e) =>
                                                    handleSubTopicChange(index, "name", e.target.value)
                                                }
                                                error={errors[`subname${index}`]}
                                            />

                                            <div>
                                                <label className="text-sm font-medium text-gray-700 mb-1 block">
                                                    Upload File {!editingId && "*"}
                                                </label>

                                                <label className="cursor-pointer block border border-dashed border-blue-400 rounded-xl p-5 bg-white hover:bg-blue-50 transition shadow-sm overflow-hidden">
                                                    <div className="flex items-center gap-3">
                                                        <Icon name="UploadCloud" size={24} className="text-blue-600" />
                                                        <span className="text-gray-700 truncate block max-w-full">
                                                            {sub.file instanceof File
                                                                ? sub.file.name
                                                                : sub.file
                                                                    ? sub.file.split("/").pop()
                                                                    : "Choose file"}
                                                        </span>
                                                    </div>

                                                    <input
                                                        type="file"
                                                        disabled={isRestricted}
                                                        className="hidden"
                                                        onChange={(e) =>
                                                            handleSubTopicChange(index, "file", e.target.files[0])
                                                        }
                                                    />
                                                </label>

                                                {errors[`subfile${index}`] && (
                                                    <p className="text-sm text-red-500 mt-1">
                                                        {errors[`subfile${index}`]}
                                                    </p>
                                                )}
                                            </div>


                                        </div>

                                        <div className="mt-5">
                                            <label className="text-sm font-medium text-gray-700 mb-1 block">
                                                Description *
                                            </label>

                                            <textarea
                                                className="w-full h-24 px-4 py-3 rounded-xl border border-blue-300 bg-white shadow-sm"
                                                placeholder="Enter subtopic description..."
                                                disabled={isRestricted}
                                                value={sub.description}
                                                onChange={(e) =>
                                                    handleSubTopicChange(index, "description", e.target.value)
                                                }
                                            />
                                            <div>
                                                <br></br>

                                                {/* <Select
                                                    label="Select Interviewer"
                                                    required
                                                    options={interviewerOptions}
                                                    value={sub.managerId}
                                                    onChange={(value) => handleSubTopicChange(index, "managerId", value)}
                                                    searchable
                                                /> */}

                                            </div>





                                            {errors[`subdesc${index}`] && (
                                                <p className="text-sm text-red-500 mt-1">
                                                    {errors[`subdesc${index}`]}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {!isRestricted && (
                                    <Button
                                        variant="default"
                                        onClick={addSubTopic}
                                        iconName="Plus"
                                        className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl"
                                    >
                                        Add Subtopic
                                    </Button>
                                )}
                            </div>


                            <div className="pt-6 border-t flex flex-col sm:flex-row gap-4 flex-none">
                                {!isRestricted && (
                                    <button
                                        onClick={handleSubmit}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl"
                                    >
                                        {loading ? (editingId ? "Updating..." : "Uploading...") :
                                            editingId ? "Update Syllabus" : "Upload Syllabus"}
                                    </button>
                                )}
                                {!isRestricted && (
                                    <Button
                                        variant="ghost"
                                        onClick={onCancel}
                                        iconName="X"
                                        className="flex-1 text-gray-600 hover:bg-gray-100 py-3 rounded-xl"
                                    >
                                        Cancel
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>


                    <div className="bg-white/70 p-6 shadow-xl rounded-2xl border border-blue-200 h-fit sticky top-24">
                        <h2 className="text-2xl font-bold text-blue-700 mb-4 flex items-center gap-2">
                            <Icon name="List" size={24} className="text-blue-700" />
                            Syllabus List
                        </h2>

                        {syllabusList.length === 0 ? (
                            <p className="text-gray-500">No syllabus uploaded yet.</p>
                        ) : (
                            <ul className="space-y-3">
                                {syllabusList.map((item) => (
                                    <li
                                        key={item.id}
                                        className="p-4 bg-blue-50 rounded-lg border border-blue-100 cursor-pointer hover:bg-blue-100 relative group transition-all"
                                        onClick={() => editSyllabus(item)}
                                    >
                                        <div className="pr-10">
                                            <h4 className="font-semibold text-blue-900">{item.title}</h4>
                                            <p className="text-sm text-gray-600">{item.topic}</p>


                                        </div>

                                      {!isRestricted && (
  <button
    onClick={(e) => {
      e.stopPropagation();
      handleDeleteSyllabus(item.id);
    }}
    className="absolute top-4 right-4 text-red-400 hover:text-red-600 transition-colors"
  >
    <Icon name="Trash2" size={18} />
  </button>
)}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};



export default UploadSyllabus;