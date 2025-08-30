import React, { useState, useEffect } from 'react';
import { useApi } from '../contexts/ApiContext';

const Materials = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    unit: '',
    current_stock: 0,
    minimum_stock: 0,
    unit_price: 0,
    supplier_name: '',
    supplier_contact: '',
    lead_time_days: 7
  });
  const api = useApi();

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    try {
      setLoading(true);
      const data = await api.materials.getAll();
      setMaterials(data);
    } catch (err) {
      setError('Failed to load materials');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingMaterial) {
        await api.materials.update(editingMaterial.id, formData);
      } else {
        await api.materials.create(formData);
      }
      setShowForm(false);
      setEditingMaterial(null);
      resetForm();
      loadMaterials();
    } catch (err) {
      setError('Failed to save material');
      console.error(err);
    }
  };

  const handleEdit = (material) => {
    setEditingMaterial(material);
    setFormData(material);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this material?')) {
      try {
        await api.materials.delete(id);
        loadMaterials();
      } catch (err) {
        setError('Failed to delete material');
        console.error(err);
      }
    }
  };

  const handleReorder = async (id, quantity) => {
    try {
      await api.materials.reorder(id, quantity);
      alert('Reorder request created successfully');
    } catch (err) {
      setError('Failed to create reorder');
      console.error(err);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      unit: '',
      current_stock: 0,
      minimum_stock: 0,
      unit_price: 0,
      supplier_name: '',
      supplier_contact: '',
      lead_time_days: 7
    });
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  if (loading) {
    return <div className="loading">Loading materials...</div>;
  }

  return (
    <div>
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Materials Inventory</h3>
          <button
            className="btn btn-primary"
            onClick={() => {
              setShowForm(true);
              setEditingMaterial(null);
              resetForm();
            }}
          >
            Add Material
          </button>
        </div>
        <div className="card-body">
          {showForm && (
            <div className="mb-4 p-3" style={{ border: '1px solid #ddd', borderRadius: '4px' }}>
              <h4>{editingMaterial ? 'Edit Material' : 'Add New Material'}</h4>
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label className="form-label">Name</label>
                      <input
                        type="text"
                        name="name"
                        className="form-control"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label className="form-label">Category</label>
                      <input
                        type="text"
                        name="category"
                        className="form-control"
                        value={formData.category}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-4">
                    <div className="form-group">
                      <label className="form-label">Unit</label>
                      <input
                        type="text"
                        name="unit"
                        className="form-control"
                        value={formData.unit}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="form-group">
                      <label className="form-label">Current Stock</label>
                      <input
                        type="number"
                        name="current_stock"
                        className="form-control"
                        value={formData.current_stock}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="form-group">
                      <label className="form-label">Minimum Stock</label>
                      <input
                        type="number"
                        name="minimum_stock"
                        className="form-control"
                        value={formData.minimum_stock}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-4">
                    <div className="form-group">
                      <label className="form-label">Unit Price ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        name="unit_price"
                        className="form-control"
                        value={formData.unit_price}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="form-group">
                      <label className="form-label">Supplier Name</label>
                      <input
                        type="text"
                        name="supplier_name"
                        className="form-control"
                        value={formData.supplier_name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="form-group">
                      <label className="form-label">Lead Time (days)</label>
                      <input
                        type="number"
                        name="lead_time_days"
                        className="form-control"
                        value={formData.lead_time_days}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Supplier Contact</label>
                  <input
                    type="text"
                    name="supplier_contact"
                    className="form-control"
                    value={formData.supplier_contact}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-success">
                    {editingMaterial ? 'Update' : 'Add'} Material
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowForm(false);
                      setEditingMaterial(null);
                      resetForm();
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Current Stock</th>
                <th>Status</th>
                <th>Unit Price</th>
                <th>Supplier</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {materials.map((material) => (
                <tr key={material.id}>
                  <td>{material.name}</td>
                  <td>{material.category}</td>
                  <td>
                    {material.current_stock} {material.unit}
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        material.current_stock <= material.minimum_stock
                          ? 'bg-warning'
                          : 'bg-success'
                      }`}
                    >
                      {material.current_stock <= material.minimum_stock
                        ? 'Low Stock'
                        : 'In Stock'}
                    </span>
                  </td>
                  <td>${material.unit_price}</td>
                  <td>{material.supplier_name}</td>
                  <td>
                    <div className="d-flex gap-1">
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => handleEdit(material)}
                      >
                        Edit
                      </button>
                      {material.current_stock <= material.minimum_stock && (
                        <button
                          className="btn btn-sm btn-warning"
                          onClick={() => {
                            const quantity = prompt('Enter quantity to reorder:');
                            if (quantity) handleReorder(material.id, parseFloat(quantity));
                          }}
                        >
                          Reorder
                        </button>
                      )}
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(material.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Materials;
