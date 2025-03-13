import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  Building2,
  Lock,
  Upload,
  Save,
  X,
  School,
  GraduationCap
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { z } from 'zod';

// Zod validation schemas
const generalFormSchema = z.object({
  first_name: z.string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters'),
  middle_initial: z.string()
    .max(10, 'Middle initial must be less than 10 characters')
    .optional(),
  last_name: z.string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters'),
  email: z.string().email('Invalid email format'),
  phone: z.string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(20, 'Phone number must be less than 20 digits')
    .regex(/^[0-9+\-\s()]*$/, 'Invalid phone number format')
});

const securityFormSchema = z.object({
  current_password: z.string()
    .min(1, 'Current password is required when changing password'),
  new_password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirm_password: z.string()
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
});

function ProfileManager({ open, onClose }) {
  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    middle_initial: '',
    last_name: '',
    email: '',
    phone: '',
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      fetchProfileData();
    }
  }, [open]);

  const fetchProfileData = async () => {
    try {
      const response = await axios.get('/profile/user-profile');
      setProfileData(response.data.data);
      setFormData({
        first_name: response.data.data.first_name || '',
        middle_initial: response.data.data.middle_initial || '',
        last_name: response.data.data.last_name || '',
        email: response.data.data.email || '',
        phone: response.data.data.phone || '',
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile data');
      setLoading(false);
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size should be less than 5MB');
        return;
      }
      if (!file.type.match('image.*')) {
        toast.error('Please select an image file');
        return;
      }
      setSelectedImage(file);
    }
  };

  const validateForm = () => {
    try {
      if (activeTab === "general") {
        generalFormSchema.parse(formData);
      } else if (activeTab === "security" && (formData.new_password || formData.current_password)) {
        securityFormSchema.parse(formData);
      }
      setErrors({});
      return true;
    } catch (error) {
      const formattedErrors = {};
      error.errors.forEach((err) => {
        formattedErrors[err.path[0]] = err.message;
      });
      setErrors(formattedErrors);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    try {
      const formDataToSend = new FormData();

      // Only send fields that have changed
      Object.keys(formData).forEach(key => {
        if (formData[key] && (key !== 'email' || !profileData)) {
          formDataToSend.append(key, formData[key]);
        }
      });

      if (selectedImage) {
        formDataToSend.append('profileImage', selectedImage);
      }

      console.log({ formDataToSend });

      await axios.put('/profile/update-profile', formDataToSend);
      toast.success('Profile updated successfully');
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Profile Settings</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <div>
              <div className="flex space-x-4 mb-6">
                <button
                  className={`px-4 py-2 rounded-lg ${activeTab === "general"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700"
                    }`}
                  onClick={() => setActiveTab("general")}
                >
                  General
                </button>
                <button
                  className={`px-4 py-2 rounded-lg ${activeTab === "security"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700"
                    }`}
                  onClick={() => setActiveTab("security")}
                >
                  Security
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {activeTab === "general" && (
                  <div>
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="relative">
                        <img
                          src={
                            selectedImage
                              ? URL.createObjectURL(selectedImage)
                              : profileData?.proof_identity || "/default-avatar.png"
                          }
                          alt="Profile"
                          className="w-24 h-24 rounded-full object-cover"
                        />
                        <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer">
                          <Upload className="w-4 h-4" />
                          <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={handleImageChange}
                          />
                        </label>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium">{`${profileData?.first_name} ${profileData?.last_name}`}</h3>
                        <p className="text-gray-500">{profileData?.role}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          First Name
                        </label>
                        <input
                          type="text"
                          value={formData.first_name}
                          onChange={(e) =>
                            setFormData({ ...formData, first_name: e.target.value })
                          }
                          className={`w-full p-2 border rounded-lg ${errors.first_name ? 'border-red-500' : 'border-gray-300'
                            }`}
                        />
                        {errors.first_name && (
                          <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Middle Initial
                        </label>
                        <input
                          type="text"
                          value={formData.middle_initial}
                          onChange={(e) =>
                            setFormData({ ...formData, middle_initial: e.target.value })
                          }
                          className="w-full p-2 border border-gray-300 rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Last Name
                        </label>
                        <input
                          type="text"
                          value={formData.last_name}
                          onChange={(e) =>
                            setFormData({ ...formData, last_name: e.target.value })
                          }
                          className={`w-full p-2 border rounded-lg ${errors.last_name ? 'border-red-500' : 'border-gray-300'
                            }`}
                        />
                        {errors.last_name && (
                          <p className="text-red-500 text-sm mt-1">{errors.last_name}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          disabled
                          className="w-full p-2 border border-gray-300 rounded-lg bg-gray-100"
                        />
                        {errors.email && (
                          <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                          className={`w-full p-2 border rounded-lg ${errors.phone ? 'border-red-500' : 'border-gray-300'
                            }`}
                        />
                        {errors.phone && (
                          <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                        )}
                      </div>
                    </div>

                    {/* Role-specific information */}
                    {profileData?.role === 'ojt-coordinator' && (
                      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                        <h3 className="font-medium flex items-center mb-4">
                          <School className="w-4 h-4 mr-2" />
                          Coordinator Details
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              College
                            </label>
                            <p className="text-gray-600">{profileData.collegeName}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Program
                            </label>
                            <p className="text-gray-600">{profileData.programName}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {profileData?.role === 'hte-supervisor' && (
                      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                        <h3 className="font-medium flex items-center mb-4">
                          <Building2 className="w-4 h-4 mr-2" />
                          Company Details
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Company
                            </label>
                            <p className="text-gray-600">{profileData.companyName}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Address
                            </label>
                            <p className="text-gray-600">{profileData.companyAddress}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "security" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={formData.current_password}
                        onChange={(e) =>
                          setFormData({ ...formData, current_password: e.target.value })
                        }
                        className={`w-full p-2 border rounded-lg ${errors.current_password ? 'border-red-500' : 'border-gray-300'
                          }`}
                      />
                      {errors.current_password && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.current_password}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={formData.new_password}
                        onChange={(e) =>
                          setFormData({ ...formData, new_password: e.target.value })
                        }
                        className="w-full p-2 border border-gray-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        value={formData.confirm_password}
                        onChange={(e) =>
                          setFormData({ ...formData, confirm_password: e.target.value })
                        }
                        className={`w-full p-2 border rounded-lg ${errors.confirm_password ? 'border-red-500' : 'border-gray-300'
                          }`}
                      />
                      {errors.confirm_password && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.confirm_password}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-2 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={saving}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfileManager; 