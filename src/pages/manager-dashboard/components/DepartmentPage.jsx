
import { useEffect, useState } from "react";
import Header from "../../../components/ui/Header";
import { useNavigate } from "react-router-dom";
import NavigationBreadcrumb from "../../../components/ui/NavigationBreadcrumb";
import Button from "../../../components/ui/Button";
import Icon from "../../../components/AppIcon";
import {
  createDepartment,
  fetchAllDepartments,
  deleteDepartment,
  updateDepartment, // Add this API call for update
} from "../../../api_service";
import "../../../App.css";

export default function DepartmentPage() {
  const navigate = useNavigate();

  const [departments, setDepartments] = useState([]);
  const [name, setName] = useState("");
  const [editId, setEditId] = useState(null);

  const managerId = sessionStorage.getItem("userId");
  const restrictedRoles = ["CEO", "CTO", "HR", "PM"];
  const roleName = sessionStorage.getItem("roleName");
  const isRestricted = restrictedRoles.includes(roleName);

  //  Load departments on page load
  useEffect(() => {
    if (managerId) {
      loadDepartments();
    }
  }, [managerId]);

  const loadDepartments = async () => {
    try {
      const res = await fetchAllDepartments();
      setDepartments(res);
    } catch (err) {
      console.error("Error loading departments", err);
    }
  };

  // Add / Update Department
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      if (editId) {
        // Update the department via API
        const payload = {
          name,
          manager: {
            userid: managerId,
          },
        };

        await updateDepartment(editId, payload); // Call update API

        // Update the departments state after the successful update
        setDepartments(
          departments.map((d) => (d.id === editId ? { ...d, name } : d))
        );
        alert("Department updated successfully ");

        setEditId(null);
      } else {
        const payload = {
          name,
          manager: {
            userid: managerId,
          },
        };

        await createDepartment(payload);
        await loadDepartments();
        alert("Department added successfully ");
      }

      setName("");
    } catch (err) {
      console.error("Error saving department", err);
    }
  };

  const handleEdit = (dept) => {
    setName(dept.name);
    setEditId(dept.id);
  };

  //  Delete Department
  const handleDelete = async (id) => {
    try {
      await deleteDepartment(id);
      setDepartments(departments.filter((d) => d.id !== id));
      alert("Department deleted successfully ");
    } catch (err) {
      console.error("Error deleting department", err);
    }
  };

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        userName={sessionStorage.getItem("userName") || "User"}
        userRole="manager"
        onLogout={handleLogout}
      />

      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <NavigationBreadcrumb className="mb-6" />

          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-foreground">
              Department Management
            </h1>

            <Button
              variant="outline"
              iconName="ArrowLeft"
              iconPosition="left"
              onClick={() => navigate(-1)}
            >
              Back
            </Button>
          </div>

          {/* Add / Edit */}
          <div className="bg-card border border-border p-6 rounded-xl mb-10">
            <h2 className="text-lg font-semibold mb-4">
              {editId ? "Edit Department" : "Add Department"}
            </h2>

            <form onSubmit={handleSubmit} className="flex gap-4">
              <input
                type="text"
                disabled={isRestricted}
                placeholder="Department Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 border rounded-lg px-4 py-2"
              />
              {!isRestricted && (
                <Button type="submit" iconName="Plus">
                  {editId ? "Update" : "Add"}
                </Button>
              )}
            </form>
          </div>

          {/* Department Widgets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {departments.map((dept) => (
              <div
                key={dept.id}
                className="bg-card border border-border rounded-xl p-5 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Icon name="Building2" size={22} className="text-primary" />
                  <h3 className="font-semibold text-foreground">{dept.name}</h3>
                </div>
                {!isRestricted && (
                  <div className="flex gap-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(dept)}
                    >
                      Edit
                    </Button>

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(dept.id)}
                    >
                      Delete
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {departments.length === 0 && (
            <p className="text-center text-muted-foreground mt-10">
              No departments added yet.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
