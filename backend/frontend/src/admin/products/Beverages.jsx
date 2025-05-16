import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Beverages = () => {
  const [beverages, setBeverages] = useState([]);
  const [filteredBeverages, setFilteredBeverages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    volume: '',
    units_per_case: '', // Changed from "unit" to "units_per_case"
    price: '',
    stock: '',
    category: '',
    image: null,
  });
  const [editId, setEditId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);

  const token = localStorage.getItem('admin_token');
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    const init = async () => {
      if (!token) return alert('Admin login required');
      try {
        const me = await axios.get('http://localhost:8000/auth/users/me/', authHeader);
        if (me.data.is_staff || me.data.is_superuser) {
          setIsAdmin(true);
          const [bev, cat] = await Promise.all([
            axios.get('http://localhost:8000/api/beverages/', authHeader),
            axios.get('http://localhost:8000/api/categories/', authHeader),
          ]);
          setBeverages(bev.data);
          setCategories(cat.data);
          setFilteredBeverages(bev.data);
        } else {
          alert('Not authorized');
        }
      } catch (err) {
        console.error(err);
      }
    };

    init();
  }, [token]);

  const handleInput = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      const file = files[0];
      if (file) {
        const fileExtension = file.name.split('.').pop().toLowerCase();
        const validExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'jfif'];
        if (!validExtensions.includes(fileExtension)) {
          alert('Invalid file format! Please upload an image with .jpg, .jpeg, .png, .webp, .gif, or .jfif extension.');
          return;
        }
        setFormData({ ...formData, image: file });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      volume: '',
      units_per_case: '', // Updated
      price: '',
      stock: '',
      category: '',
      image: null,
    });
    setEditId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(formData).forEach(([key, val]) => {
      if (val) data.append(key, val);
    });

    try {
      if (editId) {
        await axios.put(`http://localhost:8000/api/beverages/${editId}/`, data, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        await axios.post('http://localhost:8000/api/beverages/', data, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      resetForm();
      setShowModal(false);
      const bev = await axios.get('http://localhost:8000/api/beverages/', authHeader);
      setBeverages(bev.data);
      setFilteredBeverages(bev.data);
    } catch (err) {
      console.error('Submit error:', err);
    }
  };

  const deleteBeverage = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/api/beverages/${id}/`, authHeader);
      setBeverages(beverages.filter(b => b.id !== id));
      setFilteredBeverages(filteredBeverages.filter(b => b.id !== id));
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const editBeverage = (b) => {
    setEditId(b.id);
    setFormData({
      name: b.name,
      volume: b.volume,
      units_per_case: b.units_per_case || '', // Updated
      price: b.price,
      stock: b.stock,
      category: b.category,
      image: null,
    });
    setShowModal(true);
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    filterBeverages(value, formData.category);
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, category: value });
    filterBeverages(searchQuery, value);
  };

  const filterBeverages = (search, category) => {
    let filtered = beverages;
    if (category) {
      filtered = filtered.filter(b => b.category === parseInt(category));
    }
    if (search) {
      filtered = filtered.filter(b => b.name.toLowerCase().includes(search.toLowerCase()));
    }
    setFilteredBeverages(filtered);
  };

  // Modal styles
  const modalStyle = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    },
    modal: {
      background: '#fff',
      padding: '20px',
      borderRadius: '8px',
      width: '400px',
      boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
    },
  };

  if (!isAdmin) return <p>Only admins can manage beverages.</p>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>Beverages Management</h2>
      <button onClick={() => { resetForm(); setShowModal(true); }}>Add New Beverage</button>

      <div style={{ marginBottom: '10px', marginTop: '10px' }}>
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Search by name"
        />
      </div>

      {/* Modal */}
      {showModal && (
        <div style={modalStyle.overlay}>
          <div style={modalStyle.modal}>
            <h3>{editId ? 'Edit Beverage' : 'Add Beverage'}</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '10px' }}>
                <label>Name:</label><br />
                <input name="name" value={formData.name} onChange={handleInput} required style={{ width: '100%' }} />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label>Volume:</label><br />
                <input name="volume" value={formData.volume} onChange={handleInput} required style={{ width: '100%' }} />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label>Units per case:</label><br /> {/* Updated label */}
                <input name="units_per_case" value={formData.units_per_case} onChange={handleInput} required style={{ width: '100%' }} />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label>Price:</label><br />
                <input name="price" value={formData.price} onChange={handleInput} required style={{ width: '100%' }} />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label>Stock:</label><br />
                <input name="stock" value={formData.stock} onChange={handleInput} required style={{ width: '100%' }} />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label>Category:</label><br />
                <select name="category" value={formData.category} onChange={handleCategoryChange} required style={{ width: '100%' }}>
                  <option value="">Select Category</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label>Image:</label><br />
                <input type="file" name="image" accept="image/*" onChange={handleInput} />
              </div>
              <div>
                <button type="submit">{editId ? 'Save Changes' : 'Add Beverage'}</button>
                <button type="button" onClick={() => { resetForm(); setShowModal(false); }} style={{ marginLeft: '10px' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <table border="1" cellPadding="5" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Volume</th>
            <th>Unit</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Available</th>
            <th>Category</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredBeverages.map(b => (
            <tr key={b.id}>
              <td>
                {b.image ? (
                  <img src={b.image} alt={b.name} width="50" height="50" style={{ objectFit: 'cover' }} />
                ) : 'No Image'}
              </td>
              <td>{b.name}</td>
              <td>{b.volume}</td>
              <td>{b.units_per_case || '-'}</td> {/* Updated */}
              <td>{b.price}</td>
              <td>{b.stock}</td>
              <td>{b.stock > 0 ? 'Yes' : 'No'}</td>
              <td>{categories.find(c => c.id === b.category)?.name || 'N/A'}</td>
              <td>
                <button onClick={() => editBeverage(b)}>Edit</button>{' '}
                <button onClick={() => deleteBeverage(b.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Beverages;