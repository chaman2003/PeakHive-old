import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { fetchCategories } from '../../api/adminApi';

function CategoryList() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchCategories();
        setCategories(data || []);
        setLoading(false);
      } catch (err) {
        console.error('Error loading categories:', err);
        setError('Failed to load categories. Please try again later.');
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  const handleAddCategory = (e) => {
    e.preventDefault();
    
    // In a real app, we would make an API call to add the category
    // For now, just update the UI with mock data
    const newCategory = {
      _id: `temp-${Date.now()}`,
      name: newCategoryName,
      description: newCategoryDescription,
      productCount: 0
    };
    
    setCategories([...categories, newCategory]);
    setNewCategoryName('');
    setNewCategoryDescription('');
  };

  const handleEditCategory = (category) => {
    setSelectedCategory(category);
    setNewCategoryName(category.name);
    setNewCategoryDescription(category.description || '');
    setEditMode(true);
  };

  const handleUpdateCategory = (e) => {
    e.preventDefault();
    
    // In a real app, we would make an API call to update the category
    // For now, just update the UI
    const updatedCategories = categories.map(cat => 
      cat._id === selectedCategory._id 
        ? {...cat, name: newCategoryName, description: newCategoryDescription} 
        : cat
    );
    
    setCategories(updatedCategories);
    setEditMode(false);
    setSelectedCategory(null);
    setNewCategoryName('');
    setNewCategoryDescription('');
  };

  const handleDeleteCategory = (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      // In a real app, we would make an API call to delete the category
      // For now, just update the UI
      const updatedCategories = categories.filter(cat => cat._id !== categoryId);
      setCategories(updatedCategories);
    }
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setSelectedCategory(null);
    setNewCategoryName('');
    setNewCategoryDescription('');
  };

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Category Management</h2>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row">
        <div className="col-md-8">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-3">Loading categories...</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Products</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.length > 0 ? (
                        categories.map((category) => (
                          <tr key={category._id}>
                            <td>{category.name}</td>
                            <td>{category.description || 'No description'}</td>
                            <td>{category.productCount || 0}</td>
                            <td>
                              <div className="btn-group">
                                <button
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => handleEditCategory(category)}
                                  title="Edit Category"
                                >
                                  <FaEdit />
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleDeleteCategory(category._id)}
                                  title="Delete Category"
                                >
                                  <FaTrash />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="text-center py-4">
                            No categories found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0">{editMode ? 'Edit Category' : 'Add New Category'}</h5>
            </div>
            <div className="card-body">
              <form onSubmit={editMode ? handleUpdateCategory : handleAddCategory}>
                <div className="mb-3">
                  <label htmlFor="categoryName" className="form-label">Category Name</label>
                  <input
                    type="text"
                    className="form-control"
                    id="categoryName"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="categoryDescription" className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    id="categoryDescription"
                    rows="3"
                    value={newCategoryDescription}
                    onChange={(e) => setNewCategoryDescription(e.target.value)}
                  ></textarea>
                </div>
                <div className="d-grid gap-2">
                  <button type="submit" className="btn btn-primary">
                    {editMode ? (
                      <>Update Category</>
                    ) : (
                      <><FaPlus className="me-2" />Add Category</>
                    )}
                  </button>
                  {editMode && (
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={handleCancelEdit}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CategoryList; 