import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/client";
import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createAppSchema, updateAppSchema } from "../validation/appValidation";
import Loader from '../components/Loader';
import "./adminApps.css";

export default function AdminApps() {
  const queryClient = useQueryClient();

  const [editingApp, setEditingApp] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const [editLogoPreview, setEditLogoPreview] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const createLogoRef = useRef();
  const editLogoRef = useRef();

  // Form for creating new app
  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm({
    resolver: zodResolver(createAppSchema),
    defaultValues: {
      name: "",
      category: "",
      launchUrl: "",
      webhookUrl: "",
      description: "",
      requiredPermissions: ""
    },
  });

  // Form for updating existing app
  const { register: registerEdit, handleSubmit: handleSubmitEdit, formState: { errors: errorsEdit }, reset: resetEdit, watch: watchEdit, setValue: setEditValue } = useForm({
    resolver: zodResolver(updateAppSchema),
  });

  useEffect(() => {
    if (editingApp) {
        resetEdit({
            name: editingApp.name,
            category: editingApp.category,
            launchUrl: editingApp.launchUrl,
            webhookUrl: editingApp.webhookUrl || "",
            description: editingApp.description,
            requiredPermissions: editingApp.requiredPermissions ? JSON.stringify(editingApp.requiredPermissions, null, 2) : "",
        });
        setEditLogoPreview(`${import.meta.env.VITE_BASE_URL}${editingApp.logoUrl}`);
    }
  }, [editingApp, resetEdit]);

  // Watch for logo changes to update preview
  const watchedLogo = watch('logo');
  const watchedEditLogo = watchEdit('logo');

  useEffect(() => {
    if (watchedLogo && watchedLogo[0]) {
      const file = watchedLogo[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  }, [watchedLogo]);

  useEffect(() => {
    if (watchedEditLogo && watchedEditLogo[0]) {
      const file = watchedEditLogo[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  }, [watchedEditLogo]);

  // Handle file input change directly for better compatibility
  const handleCreateLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const { data: apps = [], isLoading } = useQuery({
    queryKey: ["adminApps"],
    queryFn: async () => (await api.get("/admin/apps")).data,
  });

  // Calculate stats
  const totalApps = apps.length;
  const categories = [...new Set(apps.map(app => app.category))];
  const appsByCategory = {};
  categories.forEach(cat => {
    appsByCategory[cat] = apps.filter(app => app.category === cat).length;
  });

  // Filter apps based on search and category
  const filteredApps = apps.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          app.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || app.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const createAppMutation = useMutation({
    mutationFn: (data) => {
      const formData = new FormData();

      // Append non-logo fields
      Object.keys(data).forEach(key => {
        if (key !== 'logo') {
          if (key === 'requiredPermissions') {
            formData.append(key, data[key]);
          } else {
            formData.append(key, data[key]);
          }
        }
      });

      // Append the logo file if selected via form data (from react-hook-form)
      if (data.logo && data.logo[0]) {
        formData.append('logo', data.logo[0]);
      } 
      // Also check if file was selected via input ref (fallback)
      else if (createLogoRef.current && createLogoRef.current.files && createLogoRef.current.files[0]) {
        formData.append('logo', createLogoRef.current.files[0]);
      }

      return api.post("/admin/apps", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["adminApps"]);
      reset(); // Reset form fields
      setLogoPreview(null); // Clear logo preview
      if (createLogoRef.current) createLogoRef.current.value = ""; // Clear file input
      setShowCreateModal(false); // Close modal on success
      toast.success("App created successfully!");
    },
    onError: (error) => {
      toast.error("Error creating app: " + (error.response?.data?.message || error.message));
    }
  });

  const updateAppMutation = useMutation({
    mutationFn: ({ id, data }) => {
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        if (key !== 'logo') {
          if (key === 'requiredPermissions') {
            formData.append(key, data[key]);
          } else {
            formData.append(key, data[key]);
          }
        }
      });

      // Append the logo file if selected via form data (from react-hook-form)
      if (data.logo && data.logo[0]) {
        formData.append('logo', data.logo[0]);
      } 
      // Also check if file was selected via input ref (fallback)
      else if (editLogoRef.current && editLogoRef.current.files && editLogoRef.current.files[0]) {
        formData.append('logo', editLogoRef.current.files[0]);
      }

      return api.put(`/admin/apps/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["adminApps"]);
      setEditingApp(null);
      resetEdit(); // Reset edit form
      setEditLogoPreview(null); // Clear edit logo preview
      if (editLogoRef.current) editLogoRef.current.value = ""; // Clear file input
      toast.success("App updated successfully!");
    },
    onError: (error) => {
      toast.error("Error updating app: " + (error.response?.data?.message || error.message));
    }
  });

  const deleteAppMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/apps/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["adminApps"]);
      toast.success("App deleted successfully!");
    },
    onError: (error) => {
      toast.error("Error deleting app: " + (error.response?.data?.message || error.message));
    }
  });

  const onSubmitCreate = (data) => {
    createAppMutation.mutate(data);
  };

  const onSubmitEdit = (data) => {
    // Only include logo in the update if a new one was selected
    const updateData = { ...data };
    if (!data.logo || !data.logo[0]) {
      // If no new logo was selected, remove the logo field so backend preserves existing logo
      delete updateData.logo;
    }
    updateAppMutation.mutate({ id: editingApp.id, data: updateData });
  };

  // Handle logo removal
  const handleRemoveCreateLogo = () => {
    setLogoPreview(null);
    if (createLogoRef.current) createLogoRef.current.value = "";
    setValue('logo', null);
  };

  const handleRemoveEditLogo = () => {
    setEditLogoPreview(null);
    if (editLogoRef.current) editLogoRef.current.value = "";
    setEditValue('logo', null);
  };



  if (isLoading) return <Loader message="Loading apps..." />;

  return (
    <div className="admin-apps-container">
      <div className="admin-apps-header">
        <div className="header-content">
          <h2>
            App Management Dashboard
          </h2>
          <p className="subtitle">Manage all applications in your platform</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="create-app-button">
          Add New App
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-container">
        <div className="stat-card">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="32" height="32">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
          </svg>
          <div className="stat-number">{totalApps}</div>
          <div className="stat-label">Total Apps</div>
        </div>
        <div className="stat-card">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="32" height="32">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <div className="stat-number">{categories.length}</div>
          <div className="stat-label">Categories</div>
        </div>
        <div className="stat-card">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="32" height="32">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <div className="stat-number">{apps.filter(app => app.webhookUrl).length}</div>
          <div className="stat-label">With Webhooks</div>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="controls-container">
        <input
          type="text"
          placeholder="Search apps by name or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="category-select"
        >
          <option value="all">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal create-app-modal">
            <div className="modal-content">
              <div className="modal-header">
                <h2>Create New App</h2>
                <button
                  className="close-button"
                  onClick={() => {
                    setShowCreateModal(false);
                    reset();
                    setLogoPreview(null);
                    if (createLogoRef.current) createLogoRef.current.value = "";
                  }}
                >
                  ×
                </button>
              </div>

              <form className="admin-apps-form" onSubmit={handleSubmit(onSubmitCreate)}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">
                      App Name *
                    </label>
                    <input
                      id="name"
                      placeholder="Enter app name"
                      {...register("name")}
                      className={errors.name ? "error-border" : ""}
                    />
                    {errors.name && <p className="error">{errors.name.message}</p>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="category">
                      Category *
                    </label>
                    <select
                      id="category"
                      {...register("category")}
                      className={errors.category ? "error-border" : ""}
                    >
                      <option value="">Select a category</option>
                      <option value="Education">Education</option>
                      <option value="Finance">Finance</option>
                      <option value="HR">HR</option>
                      <option value="Student">Student</option>
                      <option value="Attendance">Attendance</option>
                      <option value="Communication">Communication</option>
                    </select>
                    {errors.category && <p className="error">{errors.category.message}</p>}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="description">
                    Description *
                  </label>
                  <textarea
                    id="description"
                    placeholder="Enter app description"
                    {...register("description")}
                    className={errors.description ? "error-border" : ""}
                    rows="3"
                  />
                  {errors.description && <p className="error">{errors.description.message}</p>}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="launchUrl">
                      Launch URL *
                    </label>
                    <input
                      id="launchUrl"
                      placeholder="https://example.com/app"
                      {...register("launchUrl")}
                      className={errors.launchUrl ? "error-border" : ""}
                    />
                    {errors.launchUrl && <p className="error">{errors.launchUrl.message}</p>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="webhookUrl">
                      Webhook URL
                    </label>
                    <input
                      id="webhookUrl"
                      placeholder="https://example.com/webhook"
                      {...register("webhookUrl")}
                      className={errors.webhookUrl ? "error-border" : ""}
                    />
                    {errors.webhookUrl && <p className="error">{errors.webhookUrl.message}</p>}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="requiredPermissions">
                    Required Permissions (JSON)
                  </label>
                  <textarea
                    id="requiredPermissions"
                    placeholder='{"canViewStudents": true, "canEditGrades": false}'
                    {...register("requiredPermissions")}
                    className={`json-editor ${errors.requiredPermissions ? "error-border" : ""}`}
                    rows="5"
                  />
                  {errors.requiredPermissions && <p className="error">{errors.requiredPermissions.message}</p>}
                  <p className="helper-text">Define the permissions required by this app in JSON format</p>
                </div>

                <div className="form-group">
                  <label>
                    App Logo
                  </label>
                  <div 
                    className="file-upload-area"
                    onClick={() => createLogoRef.current?.click()}
                  >
                    <input
                      type="file"
                      {...register("logo")}
                      ref={createLogoRef}
                      accept="image/*"
                      className="file-input"
                      onChange={handleCreateLogoChange}
                    />
                    <div className="file-upload-content">
                      {logoPreview ? (
                        <div className="logo-preview-container">
                          <img src={logoPreview} alt="Logo preview" className="logo-preview" />
                          <button type="button" className="remove-logo-btn" onClick={handleRemoveCreateLogo}>
                            Remove
                          </button>
                        </div>
                      ) : (
                        <div className="upload-placeholder">
                          <p>Drag & drop your logo here, or click to browse</p>
                          <p className="helper-text">Supports JPG, PNG, SVG. Max size: 2MB</p>
                        </div>
                      )}
                    </div>
                  </div>
                  {errors.logo && <p className="error">{errors.logo.message}</p>}
                </div>

                <div className="form-actions">
                  <button
                    type="submit"
                    disabled={createAppMutation.isLoading}
                    className="submit-btn"
                  >
                    {createAppMutation.isLoading ? "Creating App..." : "Create App"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      reset();
                      setLogoPreview(null);
                      if (createLogoRef.current) createLogoRef.current.value = "";
                    }}
                    disabled={createAppMutation.isLoading}
                    className="cancel-btn"
                  >
                    Cancel
                  </button>
                </div>


              </form>
            </div>
          </div>
        </div>
      )}

      {filteredApps.length === 0 ? (
        <div className="empty-state">
          <h3>No apps found</h3>
          <p>{searchTerm || selectedCategory !== "all" ? "Try adjusting your search or filter criteria" : "Get started by creating your first app"}</p>
          {!searchTerm && selectedCategory === "all" && (
            <button onClick={() => setShowCreateModal(true)} className="create-app-button">
              Create New App
            </button>
          )}
        </div>
      ) : (
        <div className="admin-apps-grid">
          {filteredApps.map((a) => (
            <div key={a.id} className="admin-app-card">
              <div className="app-card-header">
                {a.logoUrl ? (
                  <img src={`${import.meta.env.VITE_BASE_URL}${a.logoUrl}`} alt={a.name} className="app-logo" />
                ) : (
                  <div className="app-logo-placeholder">
                    {a.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="app-info">
                  <h3>{a.name}</h3>
                  <span className="app-category">{a.category}</span>
                </div>
              </div>

              <div className="app-details">
                <p className="app-description">{a.description}</p>
                <div className="app-links">
                  <p>
                    <strong>
                      Launch URL:
                    </strong>
                    <a href={a.launchUrl} target="_blank" rel="noopener noreferrer">{a.launchUrl}</a>
                  </p>
                  {a.webhookUrl && (
                    <p>
                      <strong>
                        Webhook URL:
                      </strong>
                      <a href={a.webhookUrl} target="_blank" rel="noopener noreferrer">{a.webhookUrl}</a>
                    </p>
                  )}
                </div>
              </div>

              <div className="admin-app-actions">
                <button
                  onClick={() => setEditingApp(a)}
                  className="edit-btn"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteAppMutation.mutate(a.id)}
                  disabled={deleteAppMutation.isLoading}
                  className="delete-btn"
                >
                  {deleteAppMutation.isLoading ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingApp && (
        <div className="modal-overlay">
          <div className="modal edit-app-modal">
            <div className="modal-content">
              <div className="modal-header">
                <h2>Edit App: {editingApp.name}</h2>
                <button
                  className="close-button"
                  onClick={() => {
                    setEditingApp(null);
                    resetEdit();
                    setEditLogoPreview(null);
                    if (editLogoRef.current) editLogoRef.current.value = "";
                  }}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmitEdit(onSubmitEdit)}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="editName">
                      App Name *
                    </label>
                    <input
                      id="editName"
                      placeholder="Enter app name"
                      {...registerEdit("name")}
                      className={errorsEdit.name ? "error-border" : ""}
                    />
                    {errorsEdit.name && <p className="error">{errorsEdit.name.message}</p>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="editCategory">
                      Category *
                    </label>
                    <select
                      id="editCategory"
                      {...registerEdit("category")}
                      className={errorsEdit.category ? "error-border" : ""}
                    >
                      <option value="">Select a category</option>
                      <option value="Education">Education</option>
                      <option value="Finance">Finance</option>
                      <option value="HR">HR</option>
                      <option value="Student">Student</option>
                      <option value="Attendance">Attendance</option>
                      <option value="Communication">Communication</option>
                    </select>
                    {errorsEdit.category && <p className="error">{errorsEdit.category.message}</p>}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="editDescription">
                    Description *
                  </label>
                  <textarea
                    id="editDescription"
                    placeholder="Enter app description"
                    {...registerEdit("description")}
                    className={errorsEdit.description ? "error-border" : ""}
                    rows="3"
                  />
                  {errorsEdit.description && <p className="error">{errorsEdit.description.message}</p>}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="editLaunchUrl">
                      Launch URL *
                    </label>
                    <input
                      id="editLaunchUrl"
                      placeholder="https://example.com/app"
                      {...registerEdit("launchUrl")}
                      className={errorsEdit.launchUrl ? "error-border" : ""}
                    />
                    {errorsEdit.launchUrl && <p className="error">{errorsEdit.launchUrl.message}</p>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="editWebhookUrl">
                      Webhook URL
                    </label>
                    <input
                      id="editWebhookUrl"
                      placeholder="https://example.com/webhook"
                      {...registerEdit("webhookUrl")}
                      className={errorsEdit.webhookUrl ? "error-border" : ""}
                    />
                    {errorsEdit.webhookUrl && <p className="error">{errorsEdit.webhookUrl.message}</p>}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="editRequiredPermissions">
                    Required Permissions (JSON)
                  </label>
                  <textarea
                    id="editRequiredPermissions"
                    placeholder='{"canViewStudents": true, "canEditGrades": false}'
                    {...registerEdit("requiredPermissions")}
                    className={`json-editor ${errorsEdit.requiredPermissions ? "error-border" : ""}`}
                    rows="5"
                  />
                  {errorsEdit.requiredPermissions && <p className="error">{errorsEdit.requiredPermissions.message}</p>}
                  <p className="helper-text">Define the permissions required by this app in JSON format</p>
                </div>

                <div className="form-group">
                  <label>
                    App Logo
                  </label>
                  <div 
                    className="file-upload-area"
                    onClick={() => editLogoRef.current?.click()}
                  >
                    <input
                      type="file"
                      {...registerEdit("logo")}
                      ref={editLogoRef}
                      accept="image/*"
                      className="file-input"
                      onChange={handleEditLogoChange}
                    />
                    <div className="file-upload-content">
                      {editLogoPreview ? (
                        <div className="logo-preview-container">
                          <img src={editLogoPreview} alt="Logo preview" className="logo-preview" />
                          <button type="button" className="remove-logo-btn" onClick={handleRemoveEditLogo}>
                            Remove
                          </button>
                        </div>
                      ) : (
                        <div className="upload-placeholder">
                          <p>Drag & drop your logo here, or click to browse</p>
                          <p className="helper-text">Supports JPG, PNG, SVG. Max size: 2MB</p>
                        </div>
                      )}
                    </div>
                  </div>
                  {errorsEdit.logo && <p className="error">{errorsEdit.logo.message}</p>}
                </div>

                <div className="form-actions">
                  <button
                    type="submit"
                    disabled={updateAppMutation.isLoading}
                    className="submit-btn"
                  >
                    {updateAppMutation.isLoading ? "Updating App..." : "Update App"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingApp(null);
                      resetEdit();
                      setEditLogoPreview(null);
                      if (editLogoRef.current) editLogoRef.current.value = "";
                    }}
                    disabled={updateAppMutation.isLoading}
                    className="cancel-btn"
                  >
                    Cancel
                  </button>
                </div>


              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}