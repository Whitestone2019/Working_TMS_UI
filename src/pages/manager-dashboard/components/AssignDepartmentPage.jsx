import { useEffect, useState } from "react";
import Header from "../../../components/ui/Header";
import { useNavigate } from "react-router-dom";
import NavigationBreadcrumb from "../../../components/ui/NavigationBreadcrumb";
import Button from "../../../components/ui/Button";
import axios from "axios";
import { FiEdit, FiTrash2 } from "react-icons/fi";


import {
  fetchTraineeSummaryByManager,
  fetchAllTraineeSummaryAdmin,
  fetchAllDepartments,
  getTraineeDepartments,
  fetchAllRoles,
  addTrainee,
  updateTrainee,
  deleteTraineeById,
  getTraineeById,
  updateTraineeDepartments
} from "../../../api_service";


export default function AssignDepartmentPage() {
  const navigate = useNavigate();
  const managerId = sessionStorage.getItem("userId");

  const [trainees, setTrainees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedTrainee, setSelectedTrainee] = useState(null);
  const [assignedDepartments, setAssignedDepartments] = useState([]);
  const [selectedDeptIds, setSelectedDeptIds] = useState([]);
  const [originalDeptIds, setOriginalDeptIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [roles, setRoles] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeptDropdownOpen, setIsDeptDropdownOpen] = useState(false);
  //const privilegeRoles = ["CEO", "CTO", "HR", "PM"];
const [errors, setErrors] = useState({});

  const restrictedRoles = ["CEO", "CTO", "HR", "PM"];
  const roleName = sessionStorage.getItem("roleName");
  const isRestricted = restrictedRoles.includes(roleName);
const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTrainee, setNewTrainee] = useState({
    trngid: "",
    firstname: "",
    lastname: "",
    username: "",
    emailid: "",
    phonenumber: "",
    designation: "",
    password: "",
    roleId: "",
    managerId: "",

  });

  const resetForm = () => {
    setNewTrainee({
      trngid: "",
      firstname: "",
      lastname: "",
      username: "",
      emailid: "",
      phonenumber: "",
      designation: "",
      password: "",
      roleId: "",
      managerId: managerId,
    });
    setIsEditMode(false);
  };
  // const loadTrainees = async () => {
  //   try {
  //     const res = await fetchTraineeSummaryByManager(managerId);
  //     setTrainees(res?.data || []);   // 👈 safe fallback
  //   } catch (error) {
  //     console.error(error);
  //     setTrainees([]); // 👈 fallback
  //   }
  // };
  const loadTrainees = async () => {
    try {
      const roleName = sessionStorage.getItem("roleName");   //  get role
      let res;

      if (privilegeRoles.includes(roleName)) {

        res = await fetchAllTraineeSummaryAdmin();
      } else {
        //  Manager case
        res = await fetchTraineeSummaryByManager(managerId);
      }

      setTrainees(res?.data || []);
    } catch (error) {
      console.error(error);
      setTrainees([]);
    }
  };

  const loadDepartments = async () => {
    try {
      const res = await fetchAllDepartments();
      setDepartments(res?.data || res || []);
    } catch (error) {
      console.error(error);
      setDepartments([]);
    }
  };
  const loadRoles = async () => {
    try {
      const res = await fetchAllRoles();
      setRoles(res?.data || []);
    } catch (error) {
      console.error(error);
      setRoles([]);
    }
  };


  // useEffect(() => {
  //   loadTrainees();
  //   loadDepartments();
  // }, []);

  // const loadTrainees = async () => {
  //   const res = await fetchTraineeSummaryByManager(managerId);
  //   setTrainees(res.data);
  // };

  // const loadDepartments = async () => {
  //   const res = await fetchAllDepartments();
  //   setDepartments(res);
  // };
  useEffect(() => {
    loadTrainees();
    loadDepartments();
    loadRoles();
  }, []);
  // const loadRoles = async () => {
  //   const res = await fetchAllRoles();
  //   setRoles(res.data);
  // };


  const selectTrainee = async (trainee) => {
    setSelectedTrainee(trainee);
    setSuccessMsg("");
    const res = await getTraineeDepartments(trainee.traineeId);

    const assignedIds = res.data.map((d) => d.id);
    setAssignedDepartments(res.data);
    setSelectedDeptIds(assignedIds);
    setOriginalDeptIds(assignedIds);
  };

  const handleCheckboxChange = (deptId) => {
    if (selectedDeptIds.includes(deptId)) {
      setSelectedDeptIds(selectedDeptIds.filter((id) => id !== deptId));
    } else {
      setSelectedDeptIds([...selectedDeptIds, deptId]);
    }
  };

  const handleSelectAll = () => {
    setSelectedDeptIds(departments.map((d) => d.id));
  };

  const handleUnselectAll = () => {
    setSelectedDeptIds([]);
  };

  const hasChanges =
    JSON.stringify([...selectedDeptIds].sort()) !==
    JSON.stringify([...originalDeptIds].sort());

  const handleAssign = async () => {
    if (!selectedTrainee) return;

    try {
      setLoading(true);

      await updateTraineeDepartments(
        selectedTrainee.traineeId,
        selectedDeptIds
      );

      const res = await getTraineeDepartments(selectedTrainee.traineeId);

      const assignedIds = res.data.map((d) => d.id);
      setAssignedDepartments(res.data);
      setSelectedDeptIds(assignedIds);
      setOriginalDeptIds(assignedIds);

      setSuccessMsg("Departments updated successfully ");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewTraineeChange = (e) => {
    setNewTrainee({
      ...newTrainee,
      [e.target.name]: e.target.value,
    });
  };
  const handleDelete = async (trngid) => {
    if (!window.confirm("Are you sure you want to delete this trainee?")) return;

    try {
      await deleteTraineeById(trngid);
      loadTrainees();
      alert("Trainee deleted successfully");
    } catch (error) {
      console.error(error);
      alert("Something went wrong ");
    }
  };

  const filteredTrainees = trainees.filter(t =>
  t.name?.toLowerCase().includes(searchTerm.toLowerCase())
);

  const privilegeRoles = ["CEO", "CTO", "HR","TM"];

  const handleEdit = async (trainee, e) => {
    e.stopPropagation();

    setIsEditMode(true);
    setShowAddModal(true);

    const res = await getTraineeById(trainee.traineeId);
    const data = res.data;

    setNewTrainee({
      trngid: data.trngid || "",
      firstname: data.firstname || "",
      lastname: data.lastname || "",
      username: data.username || "",
      emailid: data.emailid || "",
      phonenumber: data.phonenumber || "",
      designation: data.designation || "",
      password: "",
      roleId: data.role?.roleId || "",
      managerId: data.managerData?.userid || "",
    });
  };

const validateForm = () => {
  let newErrors = {};

  if (!newTrainee.trngid.trim()) {
    newErrors.trngid = "Trainee ID is required";
  }

  if (!newTrainee.firstname.trim()) {
    newErrors.firstname = "First name is required";
  }

  if (!newTrainee.lastname.trim()) {
    newErrors.lastname = "Last name is required";
  }

  if (!newTrainee.username.trim()) {
    newErrors.username = "Username is required";
  }

  if (!newTrainee.emailid.trim()) {
    newErrors.emailid = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newTrainee.emailid)) {
    newErrors.emailid = "Invalid email format";
  }

  if (!newTrainee.phonenumber.trim()) {
    newErrors.phonenumber = "Phone number is required";
  } else if (!/^\d{10}$/.test(newTrainee.phonenumber)) {
    newErrors.phonenumber = "Phone must be 10 digits";
  }

 if (!newTrainee.designation.trim()) {
    newErrors.designation = "Designation is required";
  } else if (newTrainee.designation.length < 2) {
    newErrors.designation = "Designation must be at least 2 characters";
  }

  if (!isEditMode && !newTrainee.password) {
    newErrors.password = "Password is required";
  } else if (newTrainee.password && newTrainee.password.length < 6) {
    newErrors.password = "Password must be at least 6 characters";
  }

  if (!newTrainee.roleId) {
    newErrors.roleId = "Role is required";
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

  const handleSaveTrainee = async () => {
if (!validateForm()) return;

    try {

      // const payload = {
      //   ...newTrainee,
      //   role: { roleId: newTrainee.roleId },
      //   managerData: { userid: managerId }
      // };
      const payload = {
        ...newTrainee,
        role: { roleId: newTrainee.roleId },
        managerData: { userid: newTrainee.managerId || managerId }
      };


      if (isEditMode) {
        await updateTrainee(newTrainee.trngid, payload);
        alert("Trainee updated successfully ");
      } else {
        await addTrainee(payload);
        alert("Trainee added successfully ");
      }

      setShowAddModal(false);
      setIsEditMode(false);

      setNewTrainee({
        trngid: "",
        firstname: "",
        lastname: "",
        username: "",
        emailid: "",
        phonenumber: "",
        designation: "",
        password: "",
        roleId: "",
        managerId: "",
      });

      loadTrainees();

    } catch (error) {
      console.error(error);
    }
  };



  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        userName={sessionStorage.getItem("userName") || "Manager"}
        userRole="manager"
        onLogout={() => navigate("/")}
      />
<main className="pt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  <NavigationBreadcrumb className="mb-6" />

  <h1 className="text-2xl font-bold mb-6 text-blue-700">
    Assign Departments
  </h1>

  {/* 🔥 GRID START */}
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

    {/* ================= LEFT SECTION ================= */}
    <div className="lg:col-span-1">
      <div className="bg-white p-5 rounded-2xl shadow-md">

        {/* <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-lg">Trainees</h2>
<input
  type="text"
  placeholder="Search trainee..."
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  className="w-full mb-3 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
/>
          {!privilegeRoles.includes(roleName) && (
            <Button
              onClick={() => {
                resetForm();
                setNewTrainee(prev => ({ ...prev, managerId: managerId }));
                setIsDeptDropdownOpen(false);
                setShowAddModal(true);
              }}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              + Add
            </Button>
          )}
        </div> */}
        <div className="mb-4">
  <div className="flex justify-between items-center">
    <h2 className="font-semibold text-lg">Trainees</h2>

    {!privilegeRoles.includes(roleName) && (
      <Button
        onClick={() => {
          resetForm();
          setNewTrainee(prev => ({ ...prev, managerId: managerId }));
          setIsDeptDropdownOpen(false);
          setShowAddModal(true);
        }}
        className="bg-blue-600 text-white hover:bg-blue-700"
      >
        + Add
      </Button>
    )}
  </div>

  {/* ✅ SEARCH FIELD BELOW HEADING */}
  <input
    type="text"
    placeholder="Search trainee..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="w-full mt-3 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
  />
</div>

        {filteredTrainees?.map((t) => (
          <div
            key={t.traineeId}
            onClick={() => selectTrainee(t)}
            className={`p-3 mb-2 rounded-xl cursor-pointer flex justify-between items-center
              ${selectedTrainee?.traineeId === t.traineeId
                ? "bg-blue-600 text-white"
                : "hover:bg-blue-100"
              }`}
          >
            <span>{t.name}</span>

            {!isRestricted && (
              <div className="flex gap-3 text-lg">
                <FiEdit
                  className="cursor-pointer hover:text-yellow-500"
                  onClick={(e) => handleEdit(t, e)}
                />
                <FiTrash2
                  className="cursor-pointer hover:text-red-500"
                  onClick={(e) => handleDelete(t.traineeId)}
                />
              </div>
            )}
          </div>
        ))}

      </div>
    </div>

    {/* ================= RIGHT SECTION ================= */}
    <div className="lg:col-span-2">
      <div className="bg-white p-6 rounded-2xl shadow-md">

        {!selectedTrainee ? (
          <p className="text-gray-500">
            Please select a trainee from left side.
          </p>
        ) : (
          <>
            <h2 className="font-semibold mb-4 text-lg text-blue-700">
              Assign Departments to {selectedTrainee.name}
            </h2>

            {/* Buttons */}
            <div className="flex gap-3 mb-4">
              <Button
                onClick={handleSelectAll}
                className="bg-gray-200"
              >
                Select All
              </Button>

              <Button
                onClick={handleUnselectAll}
                className="bg-gray-200"
              >
                Unselect All
              </Button>
            </div>

            {/* Dropdown */}
            <div className="relative mb-4">
              <div
                onClick={() => {
                  if (!isRestricted) {
                    setIsDeptDropdownOpen(!isDeptDropdownOpen);
                  }
                }}
                className="w-full border p-3 rounded-xl cursor-pointer flex justify-between"
              >
                <span>
                  {selectedDeptIds.length > 0
                    ? `${selectedDeptIds.length} selected`
                    : "Select Departments"}
                </span>
                ▼
              </div>

              {isDeptDropdownOpen && (
                <div className="absolute z-20 w-full bg-white border rounded-xl max-h-60 overflow-y-auto">
                  {departments?.map((dept) => (
                    <label key={dept.id} className="flex gap-2 p-2">
                      <input
                        type="checkbox"
                        disabled={isRestricted}
                        checked={selectedDeptIds.includes(dept.id)}
                        onChange={() => handleCheckboxChange(dept.id)}
                      />
                      {dept.name}
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Selected */}
            <div className="flex flex-wrap gap-2 mb-6">
              {selectedDeptIds.map((id) => {
                const dept = departments.find((d) => d.id === id);
                return (
                  <div key={id} className="bg-blue-100 px-3 py-1 rounded-full">
                    {dept?.name}
                  </div>
                );
              })}
            </div>

            {/* Save */}
            {!isRestricted && (
              <Button
                onClick={handleAssign}
                disabled={!hasChanges || loading}
                className="bg-blue-600 text-white"
              >
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            )}

            {successMsg && (
              <p className="text-blue-600 mt-3">{successMsg}</p>
            )}
          </>
        )}

      </div>
    </div>

  </div>
</main>
   {showAddModal && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 p-4">

    <div className="bg-white w-full max-w-2xl p-6 rounded-2xl shadow-xl">

      <h2 className="text-xl font-bold mb-4 text-blue-700">
        {isEditMode ? "Edit Trainee" : "Add New Trainee"}
      </h2>

      {/* 🔥 2 COLUMN GRID */}
      <div className="grid grid-cols-2 gap-4">

        {/* Trainee ID */}
        <div>
          <input
            name="trngid"
            placeholder="Trainee ID"
            value={newTrainee.trngid}
            onChange={handleNewTraineeChange}
            className="border p-2 rounded-lg w-full"
          />
          {errors.trngid && <p className="text-red-500 text-sm">{errors.trngid}</p>}
        </div>

        {/* First Name */}
        <div>
          <input
            name="firstname"
            placeholder="First Name"
            value={newTrainee.firstname}
            onChange={handleNewTraineeChange}
            className="border p-2 rounded-lg w-full"
          />
          {errors.firstname && <p className="text-red-500 text-sm">{errors.firstname}</p>}
        </div>

        {/* Last Name */}
        <div>
          <input
            name="lastname"
            placeholder="Last Name"
            value={newTrainee.lastname}
            onChange={handleNewTraineeChange}
            className="border p-2 rounded-lg w-full"
          />
          {errors.lastname && <p className="text-red-500 text-sm">{errors.lastname}</p>}
        </div>

        {/* Username */}
        <div>
          <input
            name="username"
            placeholder="Username"
            value={newTrainee.username}
            onChange={handleNewTraineeChange}
            className="border p-2 rounded-lg w-full"
          />
          {errors.username && <p className="text-red-500 text-sm">{errors.username}</p>}
        </div>

        {/* Email */}
        <div>
          <input
            name="emailid"
            placeholder="Email"
            value={newTrainee.emailid}
            onChange={handleNewTraineeChange}
            className="border p-2 rounded-lg w-full"
          />
          {errors.emailid && <p className="text-red-500 text-sm">{errors.emailid}</p>}
        </div>

        {/* Phone */}
        <div>
          <input
            name="phonenumber"
            placeholder="Phone Number"
            value={newTrainee.phonenumber}
            onChange={handleNewTraineeChange}
            className="border p-2 rounded-lg w-full"
          />
          {errors.phonenumber && <p className="text-red-500 text-sm">{errors.phonenumber}</p>}
        </div>

        {/* Manager ID */}
        <div>
          <input
            name="managerId"
            placeholder="Manager ID"
            value={newTrainee.managerId}
            readOnly
            className="border p-2 rounded bg-gray-100 w-full"
          />
        </div>

        {/* Password */}
        <div>
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={newTrainee.password}
            onChange={handleNewTraineeChange}
            className="border p-2 rounded-lg w-full"
          />
          {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
        </div>

        {/* Designation */}
        <div>
          <input
            name="designation"
            placeholder="Designation"
            value={newTrainee.designation}
            onChange={handleNewTraineeChange}
            className="border p-2 rounded-lg w-full"
          />
          {errors.designation && <p className="text-red-500 text-sm">{errors.designation}</p>}
        </div>

        {/* Role */}
        <div>
          <select
            name="roleId"
            value={newTrainee.roleId}
            onChange={handleNewTraineeChange}
            className="border p-2 rounded-lg w-full"
          >
            <option value="">Select Role</option>
            {roles?.map((role) => (
              <option key={role.roleId} value={role.roleId}>
                {role.roleName}
              </option>
            ))}
          </select>
          {errors.roleId && <p className="text-red-500 text-sm">{errors.roleId}</p>}
        </div>

      </div>

      {/* BUTTONS */}
      <div className="flex justify-end gap-3 mt-6">
        <Button
          onClick={() => {
            resetForm();
            setShowAddModal(false);
          }}
          className="bg-gray-400 text-white"
        >
          Cancel
        </Button>

        <Button
          onClick={handleSaveTrainee}
          className="bg-blue-600 text-white hover:bg-blue-700"
        >
          {isEditMode ? "Update" : "Save"}
        </Button>
      </div>

    </div>
  </div>
)}


    </div>
  );
}
