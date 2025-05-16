import React, { useState, useEffect } from "react";
import axios from "axios";

const UserProfile = () => {
  const [profile, setProfile] = useState({
    first_name: "",
    last_name: "",
    address: "",
    contact_number: "",
  });

  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    re_new_password: "",
  });

  const [message, setMessage] = useState("");

  // Load user profile
  useEffect(() => {
    axios
      .get("http://localhost:8000/auth/users/me/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
      })
      .then((res) => {
        const { first_name, last_name, address, contact_number } = res.data;
        setProfile({ first_name, last_name, address, contact_number }); // Set profile data
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  // Handle profile update
  const handleProfileSubmit = (e) => {
    e.preventDefault();
    axios
      .put("http://localhost:8000/auth/users/me/", profile, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
      })
      .then(() => {
        setMessage("Profile updated successfully.");
      })
      .catch((err) => {
        setMessage("Failed to update profile.");
      });
  };

  // Handle password change
  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    axios
      .post("http://localhost:8000/auth/users/set_password/", passwordData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
      })
      .then(() => {
        setMessage("Password changed successfully.");
      })
      .catch((err) => {
        setMessage("Failed to change password.");
      });
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow-md mt-6">
      <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
      
      <form onSubmit={handleProfileSubmit}>
        {/* Current Profile Details */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-right">
            <label className="block">First Name:</label>
            <label className="block">Last Name:</label>
            <label className="block">Contact Number:</label>
            <label className="block">Address:</label>
          </div>

          {/* Editable Fields */}
          <div>
            <div className="mb-4">
              <input
                type="text"
                placeholder="First Name"
                value={profile.first_name || ""}
                onChange={(e) =>
                  setProfile({ ...profile, first_name: e.target.value })
                }
                className="input w-full p-3 border rounded-lg shadow-sm"
              />
            </div>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Last Name"
                value={profile.last_name || ""}
                onChange={(e) =>
                  setProfile({ ...profile, last_name: e.target.value })
                }
                className="input w-full p-3 border rounded-lg shadow-sm"
              />
            </div>

          </div>
        </div>

        <button
          type="submit"
          className="btn w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200"
        >
          Save Changes
        </button>
      </form>

      <h2 className="text-xl font-bold mt-8 mb-4">Change Password</h2>
      <form onSubmit={handlePasswordSubmit}>
        <div className="mb-4">
          <input
            type="password"
            placeholder="Current Password"
            onChange={(e) =>
              setPasswordData({ ...passwordData, current_password: e.target.value })
            }
            className="input w-full p-3 border rounded-lg shadow-sm"
          />
        </div>
        <div className="mb-4">
          <input
            type="password"
            placeholder="New Password"
            onChange={(e) =>
              setPasswordData({ ...passwordData, new_password: e.target.value })
            }
            className="input w-full p-3 border rounded-lg shadow-sm"
          />
        </div>
        <div className="mb-6">
          <input
            type="password"
            placeholder="Confirm New Password"
            onChange={(e) =>
              setPasswordData({ ...passwordData, re_new_password: e.target.value })
            }
            className="input w-full p-3 border rounded-lg shadow-sm"
          />
        </div>
        <button
          type="submit"
          className="btn w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200"
        >
          Update Password
        </button>
      </form>

      {message && (
        <p className="mt-4 text-center text-sm text-gray-700">{message}</p>
      )}
    </div>
  );
};

export default UserProfile;
