// Category.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Category = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [editCategory, setEditCategory] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const token = localStorage.getItem('admin_token');

  useEffect(() => {
    const verifyAndFetch = async () => {
      if (!token) return alert('Admin token missing');

      try {
        const res = await axios.get('http://localhost:8000/auth/users/me/', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.data.is_staff || res.data.is_superuser) {
          setIsAdmin(true);
          const cats = await axios.get('http://localhost:8000/api/categories/', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setCategories(cats.data);
        } else {
          alert('Not authorized');
        }
      } catch (err) {
        console.error(err);
      }
    };

    verifyAndFetch();
  }, [token]);

  const addCategory = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:8000/api/categories/', { name: newCategory }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories([...categories, res.data]);
      setNewCategory('');
    } catch (err) {
      console.error('Add category failed:', err);
    }
  };

  const deleteCategory = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/api/categories/${id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(categories.filter(c => c.id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const editCategoryHandler = (category) => {
    setEditCategory(category);
    setNewCategory(category.name); // Preload the category name in the input field for editing
  };

  const updateCategory = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`http://localhost:8000/api/categories/${editCategory.id}/`, { name: newCategory }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(categories.map(cat => (cat.id === editCategory.id ? res.data : cat)));
      setEditCategory(null);
      setNewCategory('');
    } catch (err) {
      console.error('Update category failed:', err);
    }
  };

  if (!isAdmin) return <p>Only admins can manage categories.</p>;

  return (
    <div>
      <h2>{editCategory ? 'Edit Category' : 'Add Category'}</h2>
      <form onSubmit={editCategory ? updateCategory : addCategory}>
        <input
          type="text"
          placeholder="Category name"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          required
        />
        <button type="submit">{editCategory ? 'Update' : 'Add'}</button>
      </form>

      <h3>Category List</h3>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map(cat => (
            <tr key={cat.id}>
              <td>{cat.name}</td>
              <td>
                <button onClick={() => editCategoryHandler(cat)}>Edit</button>
                <button onClick={() => deleteCategory(cat.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Category;
