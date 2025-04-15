import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSave, FaTimes } from 'react-icons/fa';
import { createProduct } from '../../api/adminApi';

function ProductCreate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
    brand: '',
    stock: '',
    images: [''],
    specifications: [{ name: '', value: '' }],
    features: [''],
    tags: [''],
    variants: [{ name: '', options: [''] }]
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (index, value) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData({ ...formData, images: newImages });
  };

  const addImageField = () => {
    setFormData({ ...formData, images: [...formData.images, ''] });
  };

  const removeImageField = (index) => {
    const newImages = [...formData.images];
    newImages.splice(index, 1);
    setFormData({ ...formData, images: newImages });
  };

  const handleSpecificationChange = (index, field, value) => {
    const newSpecs = [...formData.specifications];
    newSpecs[index][field] = value;
    setFormData({ ...formData, specifications: newSpecs });
  };

  const addSpecificationField = () => {
    setFormData({ 
      ...formData, 
      specifications: [...formData.specifications, { name: '', value: '' }] 
    });
  };

  const removeSpecificationField = (index) => {
    const newSpecs = [...formData.specifications];
    newSpecs.splice(index, 1);
    setFormData({ ...formData, specifications: newSpecs });
  };

  const handleFeatureChange = (index, value) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const addFeatureField = () => {
    setFormData({ ...formData, features: [...formData.features, ''] });
  };

  const removeFeatureField = (index) => {
    const newFeatures = [...formData.features];
    newFeatures.splice(index, 1);
    setFormData({ ...formData, features: newFeatures });
  };

  const handleTagChange = (index, value) => {
    const newTags = [...formData.tags];
    newTags[index] = value;
    setFormData({ ...formData, tags: newTags });
  };

  const addTagField = () => {
    setFormData({ ...formData, tags: [...formData.tags, ''] });
  };

  const removeTagField = (index) => {
    const newTags = [...formData.tags];
    newTags.splice(index, 1);
    setFormData({ ...formData, tags: newTags });
  };

  const handleVariantChange = (index, field, value) => {
    const newVariants = [...formData.variants];
    if (field === 'name') {
      newVariants[index].name = value;
    }
    setFormData({ ...formData, variants: newVariants });
  };

  const handleVariantOptionChange = (variantIndex, optionIndex, value) => {
    const newVariants = [...formData.variants];
    newVariants[variantIndex].options[optionIndex] = value;
    setFormData({ ...formData, variants: newVariants });
  };

  const addVariantField = () => {
    setFormData({ 
      ...formData, 
      variants: [...formData.variants, { name: '', options: [''] }] 
    });
  };

  const removeVariantField = (index) => {
    const newVariants = [...formData.variants];
    newVariants.splice(index, 1);
    setFormData({ ...formData, variants: newVariants });
  };

  const addVariantOptionField = (variantIndex) => {
    const newVariants = [...formData.variants];
    newVariants[variantIndex].options.push('');
    setFormData({ ...formData, variants: newVariants });
  };

  const removeVariantOptionField = (variantIndex, optionIndex) => {
    const newVariants = [...formData.variants];
    newVariants[variantIndex].options.splice(optionIndex, 1);
    setFormData({ ...formData, variants: newVariants });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      // Format data properly
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        // Filter out empty values
        images: formData.images.filter(img => img.trim() !== ''),
        specifications: formData.specifications.filter(spec => spec.name.trim() !== '' && spec.value.trim() !== ''),
        features: formData.features.filter(feature => feature.trim() !== ''),
        tags: formData.tags.filter(tag => tag.trim() !== ''),
        variants: formData.variants
          .filter(variant => variant.name.trim() !== '')
          .map(variant => ({
            ...variant,
            options: variant.options.filter(option => option.trim() !== '')
          }))
      };
      
      await createProduct(productData);
      setLoading(false);
      navigate('/admin/products');
    } catch (err) {
      console.error('Error creating product:', err);
      setError('Failed to create product. Please check all fields and try again.');
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Create New Product</h2>
        <button 
          className="btn btn-outline-secondary"
          onClick={() => navigate('/admin/products')}
        >
          <FaTimes className="me-2" />
          Cancel
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row mb-4">
              <div className="col-md-6 mb-3">
                <label htmlFor="name" className="form-label">Product Name</label>
                <input
                  type="text"
                  className="form-control"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-3 mb-3">
                <label htmlFor="price" className="form-label">Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="form-control"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-3 mb-3">
                <label htmlFor="stock" className="form-label">Stock</label>
                <input
                  type="number"
                  min="0"
                  className="form-control"
                  id="stock"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="row mb-4">
              <div className="col-md-6 mb-3">
                <label htmlFor="category" className="form-label">Category</label>
                <select
                  className="form-select"
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Category</option>
                  <option value="laptops">Laptops</option>
                  <option value="smartphones">Smartphones</option>
                  <option value="audio">Audio</option>
                  <option value="gaming">Gaming</option>
                  <option value="wearables">Wearables</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="brand" className="form-label">Brand</label>
                <input
                  type="text"
                  className="form-control"
                  id="brand"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="description" className="form-label">Description</label>
              <textarea
                className="form-control"
                id="description"
                name="description"
                rows="5"
                value={formData.description}
                onChange={handleChange}
                required
              ></textarea>
            </div>

            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <label className="form-label mb-0">Images (URLs)</label>
                <button 
                  type="button" 
                  className="btn btn-sm btn-outline-primary"
                  onClick={addImageField}
                >
                  + Add Image
                </button>
              </div>
              {formData.images.map((image, index) => (
                <div key={`image-${index}`} className="input-group mb-2">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Image URL"
                    value={image}
                    onChange={(e) => handleImageChange(index, e.target.value)}
                  />
                  {formData.images.length > 1 && (
                    <button 
                      type="button" 
                      className="btn btn-outline-danger"
                      onClick={() => removeImageField(index)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <label className="form-label mb-0">Specifications</label>
                <button 
                  type="button" 
                  className="btn btn-sm btn-outline-primary"
                  onClick={addSpecificationField}
                >
                  + Add Specification
                </button>
              </div>
              {formData.specifications.map((spec, index) => (
                <div key={`spec-${index}`} className="row mb-2">
                  <div className="col-md-5">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Name (e.g., CPU)"
                      value={spec.name}
                      onChange={(e) => handleSpecificationChange(index, 'name', e.target.value)}
                    />
                  </div>
                  <div className="col-md-5">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Value (e.g., Intel i7)"
                      value={spec.value}
                      onChange={(e) => handleSpecificationChange(index, 'value', e.target.value)}
                    />
                  </div>
                  <div className="col-md-2">
                    {formData.specifications.length > 1 && (
                      <button 
                        type="button" 
                        className="btn btn-outline-danger w-100"
                        onClick={() => removeSpecificationField(index)}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <label className="form-label mb-0">Key Features</label>
                <button 
                  type="button" 
                  className="btn btn-sm btn-outline-primary"
                  onClick={addFeatureField}
                >
                  + Add Feature
                </button>
              </div>
              {formData.features.map((feature, index) => (
                <div key={`feature-${index}`} className="input-group mb-2">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Feature description"
                    value={feature}
                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                  />
                  {formData.features.length > 1 && (
                    <button 
                      type="button" 
                      className="btn btn-outline-danger"
                      onClick={() => removeFeatureField(index)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <label className="form-label mb-0">Tags</label>
                <button 
                  type="button" 
                  className="btn btn-sm btn-outline-primary"
                  onClick={addTagField}
                >
                  + Add Tag
                </button>
              </div>
              {formData.tags.map((tag, index) => (
                <div key={`tag-${index}`} className="input-group mb-2">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Tag"
                    value={tag}
                    onChange={(e) => handleTagChange(index, e.target.value)}
                  />
                  {formData.tags.length > 1 && (
                    <button 
                      type="button" 
                      className="btn btn-outline-danger"
                      onClick={() => removeTagField(index)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="mb-5">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <label className="form-label mb-0">Variants</label>
                <button 
                  type="button" 
                  className="btn btn-sm btn-outline-primary"
                  onClick={addVariantField}
                >
                  + Add Variant
                </button>
              </div>
              {formData.variants.map((variant, variantIndex) => (
                <div key={`variant-${variantIndex}`} className="card mb-3 border">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Variant name (e.g., Color, Size)"
                        value={variant.name}
                        onChange={(e) => handleVariantChange(variantIndex, 'name', e.target.value)}
                      />
                      {formData.variants.length > 1 && (
                        <button 
                          type="button" 
                          className="btn btn-outline-danger ms-2"
                          onClick={() => removeVariantField(variantIndex)}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    
                    <div className="ms-3">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <label className="form-label mb-0">Options</label>
                        <button 
                          type="button" 
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => addVariantOptionField(variantIndex)}
                        >
                          + Add Option
                        </button>
                      </div>
                      {variant.options.map((option, optionIndex) => (
                        <div key={`option-${variantIndex}-${optionIndex}`} className="input-group mb-2">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Option value (e.g., Red, XL)"
                            value={option}
                            onChange={(e) => handleVariantOptionChange(variantIndex, optionIndex, e.target.value)}
                          />
                          {variant.options.length > 1 && (
                            <button 
                              type="button" 
                              className="btn btn-outline-danger"
                              onClick={() => removeVariantOptionField(variantIndex, optionIndex)}
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="d-grid">
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Creating...
                  </>
                ) : (
                  <>
                    <FaSave className="me-2" />
                    Create Product
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ProductCreate; 