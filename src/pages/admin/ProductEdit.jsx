import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaSave, FaTimes } from 'react-icons/fa';
import { fetchProductById, updateProduct } from '../../api/adminApi';
import { toast } from 'react-toastify';

function ProductEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [originalProduct, setOriginalProduct] = useState(null);
  
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

  // Load product data when component mounts
  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching product with ID:', id);
        const product = await fetchProductById(id);
        console.log('Loaded product:', product);
        
        setOriginalProduct(product);
        
        // Format data for the form
        setFormData({
          name: product.name || '',
          price: product.price || '',
          description: product.description || '',
          category: product.category || '',
          brand: product.brand || '',
          stock: product.stock || '',
          images: product.images && product.images.length > 0 ? product.images : [''],
          specifications: product.specifications && product.specifications.length > 0 ? product.specifications : [{ name: '', value: '' }],
          features: product.features && product.features.length > 0 ? product.features : [''],
          tags: product.tags && product.tags.length > 0 ? product.tags : [''],
          variants: product.variants && product.variants.length > 0 ? product.variants : [{ name: '', options: [''] }]
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading product:', err);
        setError('Failed to load product. Please try again later.');
        setLoading(false);
        toast.error('Failed to load product data');
      }
    };

    if (id) {
      loadProduct();
    } else {
      setError('No product ID provided');
      setLoading(false);
    }
  }, [id]);

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
      setSubmitLoading(true);
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
      
      console.log('Submitting updated product data:', productData);
      
      // Ensure we have the required fields
      if (!productData.name || !productData.price || !productData.category || !productData.brand) {
        setError('Please fill in all required fields');
        setSubmitLoading(false);
        toast.error('Please fill in all required fields');
        return;
      }
      
      // Check if images array is valid
      if (!productData.images || productData.images.length === 0) {
        setError('Please add at least one product image');
        setSubmitLoading(false);
        toast.error('Please add at least one product image');
        return;
      }
      
      // Ensure we're sending valid data types
      const validatedData = {
        ...productData,
        price: typeof productData.price === 'number' ? productData.price : parseFloat(productData.price) || 0,
        stock: typeof productData.stock === 'number' ? productData.stock : parseInt(productData.stock) || 0
      };
      
      // Get token from localStorage to ensure we're authenticated
      const userInfo = localStorage.getItem('userInfo');
      let token = null;
      
      if (userInfo) {
        const parsedUser = JSON.parse(userInfo);
        token = parsedUser.token;
        
        if (!token) {
          setError('Authentication token is missing. Please log in again.');
          setSubmitLoading(false);
          toast.error('Authentication error. Please log in again.');
          setTimeout(() => navigate('/login'), 1500);
          return;
        }
      } else {
        setError('Not logged in. Please log in again.');
        setSubmitLoading(false);
        toast.error('Not logged in. Please log in again.');
        setTimeout(() => navigate('/login'), 1500);
        return;
      }
      
      const updatedProduct = await updateProduct(id, validatedData);
      console.log('Update success:', updatedProduct);
      
      setSubmitLoading(false);
      toast.success('Product updated successfully');
      navigate('/admin/products');
    } catch (err) {
      console.error('Error updating product:', err);
      const errorMessage = err.response?.data?.message || 'Failed to update product. Please try again.';
      setError(errorMessage);
      setSubmitLoading(false);
      toast.error(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading product data...</p>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Edit Product</h2>
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

            {/* Specifications */}
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
                      placeholder="Name (e.g., Weight, Dimensions)"
                      value={spec.name}
                      onChange={(e) => handleSpecificationChange(index, 'name', e.target.value)}
                    />
                  </div>
                  <div className="col-md-5">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Value (e.g., 500g, 10x5x2 cm)"
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

            {/* Features */}
            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <label className="form-label mb-0">Features</label>
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

            {/* Submit button */}
            <div className="d-grid gap-2 d-md-flex justify-content-md-end mt-4">
              <button 
                type="button" 
                className="btn btn-outline-secondary me-md-2"
                onClick={() => navigate('/admin/products')}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={submitLoading}
              >
                {submitLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <FaSave className="me-2" />
                    Save Changes
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

export default ProductEdit; 