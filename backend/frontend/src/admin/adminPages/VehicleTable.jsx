import React, { useState, useEffect } from 'react';
import axios from 'axios';

const VehicleTable = () => {
  const [vehicles, setVehicles] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    plate_number: '',
    capacity: '',
    is_available: true,  // Default value is true when creating a new vehicle
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  // Function to get the token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('admin_token');
  };

  // Set the Authorization header for Axios
  const axiosInstance = axios.create({
    baseURL: 'http://localhost:8000/api/', // Your API base URL
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`,
      'Content-Type': 'application/json',
    }
  });

  const fetchVehicles = async () => {
    try {
      const response = await axiosInstance.get('vehicles/');
      setVehicles(response.data);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      if (error.response && error.response.status === 401) {
        console.log('Unauthorized access. Please log in again.');
      }
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Always set is_available to true when creating a new vehicle
    if (!isEditing) {
      formData.is_available = true;
    }

    if (isEditing) {
      // Update vehicle
      try {
        await axiosInstance.put(`vehicles/${editId}/`, formData);
        setIsEditing(false);
        setEditId(null);
        fetchVehicles();
      } catch (error) {
        console.error('Error updating vehicle:', error);
      }
    } else {
      // Create new vehicle
      try {
        await axiosInstance.post('vehicles/', formData);
        fetchVehicles();
      } catch (error) {
        console.error('Error creating vehicle:', error);
      }
    }

    // Reset the form data after submission
    setFormData({
      name: '',
      plate_number: '',
      capacity: '',
      is_available: true,  // Keep default value as true for new vehicles
    });
  };

  const handleEdit = (vehicle) => {
    setFormData({
      name: vehicle.name,
      plate_number: vehicle.plate_number,
      capacity: vehicle.capacity,
      is_available: vehicle.is_available, // Maintain availability status during edit
    });
    setIsEditing(true);
    setEditId(vehicle.id);
  };

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`vehicles/${id}/`);
      fetchVehicles();
    } catch (error) {
      console.error('Error deleting vehicle:', error);
    }
  };

  return (
    <div>
      <h2>{isEditing ? 'Edit Vehicle' : 'Add Vehicle'}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Vehicle Name"
          required
        />
        <input
          type="text"
          name="plate_number"
          value={formData.plate_number}
          onChange={handleChange}
          placeholder="Plate Number"
          required
        />
        <input
          type="number"
          name="capacity"
          value={formData.capacity}
          onChange={handleChange}
          placeholder="Capacity"
          required
        />
        {/* Removed the checkbox for availability */}
        <button type="submit">{isEditing ? 'Update' : 'Add'}</button>
      </form>

      <h3>Vehicles</h3>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Plate Number</th>
            <th>Capacity</th>
            <th>Available</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {vehicles.map((vehicle) => (
            <tr key={vehicle.id}>
              <td>{vehicle.name}</td>
              <td>{vehicle.plate_number}</td>
              <td>{vehicle.capacity}</td>
              <td>{vehicle.is_available ? 'Yes' : 'No'}</td>
              <td>
                <button onClick={() => handleEdit(vehicle)}>Edit</button>
                <button onClick={() => handleDelete(vehicle.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VehicleTable;
