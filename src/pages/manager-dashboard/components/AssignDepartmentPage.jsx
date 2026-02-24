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
  const privilegedRoles = ["CEO", "CTO", "HR", "PM"];


  const restrictedRoles = ["CEO", "CTO", "HR", "PM"];
  const roleName = sessionStorage.getItem("roleName");
  const isRestricted = restrictedRoles.includes(roleName);

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

      if (privilegedRoles.includes(roleName)) {

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

  const privilegeRoles = ["CEO", "CTO", "HR"];

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


  const handleSaveTrainee = async () => {
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

      <main className="pt-16 p-6">
        <NavigationBreadcrumb className="mb-6" />

        <h1 className="text-2xl font-bold mb-6 text-blue-700">
          Assign Departments
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <div className="bg-white p-5 rounded-2xl shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-lg">Trainees</h2>


              {!privilegeRoles.includes(roleName) && (   //  CEO ko hide kar diya
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

            {trainees?.map((t) => (
              <div
                key={t.traineeId}
                onClick={() => selectTrainee(t)}
                className={`p-3 mb-2 rounded-xl cursor-pointer transition flex justify-between items-center
                    ${selectedTrainee?.traineeId === t.traineeId
                    ? "bg-blue-600 text-white"
                    : "hover:bg-blue-100"
                  }`}
              >
                <span>{t.name}</span>

                {/* ICONS */}
                {!isRestricted && (
                  <div className="flex gap-3 text-lg">
                    <FiEdit
                      className="cursor-pointer hover:text-yellow-500"
                      onClick={(e) => handleEdit(t, e)}
                    />
                    <FiTrash2
                      className="cursor-pointer hover:text-red-500"
                      onClick={(e) => handleDelete(t.traineeId, e)}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>


          {/* Department Section */}
          <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-md">

            {!selectedTrainee ? (
              <p className="text-gray-500">
                Please select a trainee from left side.
              </p>
            ) : (
              <>
                <h2 className="font-semibold mb-4 text-lg text-blue-700">
                  Assign Departments to {selectedTrainee.name}
                </h2>

                {/* Select All Buttons */}
                <div className="flex gap-3 mb-4">
                  <Button
                    onClick={handleSelectAll}
                    className="bg-gray-200 text-gray-700 hover:bg-gray-300"
                  >
                    Select All
                  </Button>

                  <Button
                    onClick={handleUnselectAll}
                    className="bg-gray-200 text-gray-700 hover:bg-gray-300"
                  >
                    Unselect All
                  </Button>
                </div>

                {/* Checkbox Grid */}
                {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    {departments.map((dept) => (
                      <label
                        key={dept.id}
                        className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-blue-50"
                      >
                        <input
                          type="checkbox"
                          checked={selectedDeptIds.includes(dept.id)}
                          onChange={() => handleCheckboxChange(dept.id)}
                          className="w-4 h-4 accent-blue-600"
                        />
                        <span>{dept.name}</span>
                      </label>
                    ))}
                  </div> */}

                {/* Custom Multi Select Dropdown */}
                <div className="relative mb-4">
                  <div
                    //onClick={() => setIsEditMode(!isEditMode)}
                    // onClick={() => setIsDeptDropdownOpen(!isDeptDropdownOpen)}
                    onClick={() => {
                      if (!isRestricted) {
                        setIsDeptDropdownOpen(!isDeptDropdownOpen);
                      }
                    }}

                    className="w-full border-2 border-gray-300 rounded-xl p-3 bg-white cursor-pointer flex justify-between items-center hover:border-blue-500 transition"
                  >
                    <span className="text-gray-700">
                      {selectedDeptIds.length > 0
                        ? `${selectedDeptIds.length} department(s) selected`
                        : "Select Departments"}
                    </span>
                    <span className="text-gray-500 text-sm">▼</span>
                  </div>

                  {isDeptDropdownOpen && (

                    <div className="absolute z-20 mt-2 w-full bg-white border rounded-xl shadow-lg max-h-60 overflow-y-auto">
                      {departments?.map((dept) => (
                        <label
                          key={dept.id}
                          className="flex items-center gap-3 px-4 py-2 hover:bg-blue-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            disabled={isRestricted}
                            checked={selectedDeptIds.includes(dept.id)}
                            onChange={() => handleCheckboxChange(dept.id)}
                            className="w-4 h-4 accent-blue-600"
                          />
                          <span>{dept.name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Selected Departments Preview */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {selectedDeptIds.map((id) => {
                    const dept = departments.find((d) => d.id === id);
                    return (
                      <div
                        key={id}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                      >
                        {dept?.name}
                        {!isRestricted && (
                          <button
                            onClick={() =>
                              setSelectedDeptIds(selectedDeptIds.filter((d) => d !== id))
                            }
                            className="text-red-500 font-bold"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>


                {/* Save Button */}
                {!isRestricted && (
                  <Button
                    onClick={handleAssign}
                    disabled={!hasChanges || loading}
                    className={`text-white ${!hasChanges
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                      }`}
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                )}

                {/* Success Message */}
                {successMsg && (
                  <div className="mt-4 text-blue-600 font-medium">
                    {successMsg}
                  </div>
                )}

                {/* Assigned Departments */}
                <div className="mt-6">
                  <h3 className="font-semibold mb-2">Currently Assigned</h3>

                  {assignedDepartments.length === 0 ? (
                    <p className="text-gray-500">No departments assigned.</p>
                  ) : (
                    assignedDepartments.map((d) => (
                      <div
                        key={d.id}
                        className="bg-blue-100 text-blue-800 px-3 py-2 rounded-lg mb-2"
                      >
                        {d.name}
                      </div>
                    ))
                  )}
                </div>
              </>
            )}

          </div>
        </div>
      </main>{/* ADD TRAINEE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white w-96 p-6 rounded-2xl shadow-xl">
            <h2 className="text-xl font-bold mb-4 text-blue-700">
              Add New Trainee
            </h2>

            <div className="flex flex-col gap-3">
              <input
                name="trngid"
                placeholder="Trainee ID"
                value={newTrainee.trngid}
                onChange={handleNewTraineeChange}
                className="border p-2 rounded"
              />
              <input
                name="firstname"
                placeholder="First Name"
                value={newTrainee.firstname}
                onChange={handleNewTraineeChange}
                className="border p-2 rounded"
              />
              <input
                name="lastname"
                placeholder="Last Name"
                value={newTrainee.lastname}
                onChange={handleNewTraineeChange}
                className="border p-2 rounded"
              />
              <input
                name="username"
                placeholder="Username"
                value={newTrainee.username}
                onChange={handleNewTraineeChange}
                className="border p-2 rounded"
              />
              <input
                name="emailid"
                placeholder="Email"
                value={newTrainee.emailid}
                onChange={handleNewTraineeChange}
                className="border p-2 rounded"
              />
              <input
                name="phonenumber"
                placeholder="Phone Number"
                value={newTrainee.phonenumber}
                onChange={handleNewTraineeChange}
                className="border p-2 rounded"
              />
              <input
                name="managerId"
                placeholder="Manager ID"
                value={newTrainee.managerId}
                readOnly
                className="border p-2 rounded bg-gray-100"
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={newTrainee.password}
                onChange={handleNewTraineeChange}
                className="border p-2 rounded"
              />


              <input
                name="designation"
                placeholder="Designation"
                value={newTrainee.designation}
                onChange={handleNewTraineeChange}
                className="border p-2 rounded"
              />

              <select
                name="roleId"
                value={newTrainee.roleId}
                onChange={handleNewTraineeChange}
                className="border p-2 rounded"
              >
                <option value="">Select Role</option>
                {roles?.map((role) => (
                  <option key={role.roleId} value={role.roleId}>
                    {role.roleName}
                  </option>
                ))}
              </select>

            </div>

            <div className="flex justify-end gap-3 mt-5">
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
