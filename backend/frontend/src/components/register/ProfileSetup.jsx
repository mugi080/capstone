import React, { useState, useEffect } from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";

const ProfileSetup = () => {
  const [profileData, setProfileData] = useState({
    profile: "",
    address: "",
    contact_number: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const history = useHistory();

  useEffect(() => {
    // Fetch current user's profile data
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("access_token"); // Or from cookies
        const response = await axios.get("http://127.0.0.1:8000/auth/users/me/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setProfileData(response.data);  // Assuming response includes profile data
      } catch (error) {
        console.error("Error fetching profile data", error);
      }
    };

    fetchUserProfile();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("access_token"); // Or from cookies
      await axios.put(
        "http://127.0.0.1:8000/auth/users/me/",
        profileData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      history.push("/dashboard"); // Redirect to dashboard or main page
    } catch (error) {
      console.error("Error updating profile", error);
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h2>Complete Your Profile</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Profile:
          <input
            type="text"
            value={profileData.profile}
            onChange={(e) => setProfileData({ ...profileData, profile: e.target.value })}
            required
          />
        </label>
        <br />
        <label>
          Address:
          <input
            type="text"
            value={profileData.address}
            onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
            required
          />
        </label>
        <br />
        <label>
          Contact Number:
          <input
            type="text"
            value={profileData.contact_number}
            onChange={(e) => setProfileData({ ...profileData, contact_number: e.target.value })}
            required
          />
        </label>
        <br />
        <button type="submit" disabled={isSubmitting}>Submit</button>
      </form>
    </div>
  );
};

export default ProfileSetup;
