import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Alert, Card, Spinner } from 'react-bootstrap';
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';
import AdminBreadcrumb from '../../components/AdminBreadcrumb';
import { createProductsBulk } from '../../api/adminApi';

const BulkProductUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const [previewData, setPreviewData] = useState([]);
  const [step, setStep] = useState(1); // 1: Upload, 2: Review, 3: Submit

  const navigate = useNavigate();

  const fileInputHandler = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls')) {
      setError('Please upload an Excel file (.xlsx or .xls)');
      return;
    }

    setError(null);

    // Read Excel file
    const reader = new FileReader();
    reader.readAsBinaryString(selectedFile);
    reader.onload = (event) => {
      try {
        const data = event.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const parsedData = XLSX.utils.sheet_to_json(sheet);

        // Validate required fields
        const validatedData = parsedData.map((item, index) => {
          const isValid = item.name && item.price && item.category;
          return { ...item, id: index + 1, isValid };
        });

        setProducts(validatedData);
        setPreviewData(validatedData.slice(0, 10)); // Show first 10 items for preview
        setStep(2);
      } catch (error) {
        setError('Error parsing Excel file. Please make sure the file is valid.');
        console.error('Excel parsing error:', error);
      }
    };
  };

  const submitBulkUpload = async () => {
    try {
      setUploading(true);
      setError(null);

      // Format products for upload
      const formattedProducts = products.map(product => ({
        name: product.name,
        price: parseFloat(product.price),
        description: product.description || '',
        category: product.category,
        brand: product.brand || '',
        countInStock: parseInt(product.countInStock) || 0,
        isFeatured: Boolean(product.isFeatured),
        images: product.images ? product.images.split(',').map(url => url.trim()) : []
      }));

      const response = await createProductsBulk(formattedProducts);

      setUploading(false);
      toast.success(`Successfully uploaded ${response.count} products`);
      setStep(3);
    } catch (error) {
      setUploading(false);
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Failed to upload products. Please try again.'
      );
      console.error('Bulk upload error:', error);
    }
  };

  const renderInvalidProductsWarning = () => {
    const invalidProducts = products.filter(p => !p.isValid);
    if (invalidProducts.length === 0) return null;

    return (
      <Alert variant="warning">
        <h5>Warning: {invalidProducts.length} product(s) have missing required fields</h5>
        <p>
          Rows with missing required fields (name, price, or category) will be skipped.
          Please fix these issues in your Excel file and re-upload for complete data import.
        </p>
        <ul className="mb-0">
          {invalidProducts.slice(0, 5).map((p, idx) => (
            <li key={idx}>
              Row {p.id}: Missing {!p.name ? 'name' : ''} {!p.price ? 'price' : ''}{' '}
              {!p.category ? 'category' : ''}
            </li>
          ))}
          {invalidProducts.length > 5 && <li>... and {invalidProducts.length - 5} more</li>}
        </ul>
      </Alert>
    );
  };

  const resetForm = () => {
    setProducts([]);
    setPreviewData([]);
    setError(null);
    setStep(1);
  };

  const downloadTemplate = () => {
    const template = [
      {
        name: 'Example Product 1',
        price: 19.99,
        description: 'This is a sample product description',
        category: 'Electronics',
        brand: 'Brand Name',
        countInStock: 100,
        isFeatured: true,
        images: 'https://example.com/image1.jpg,https://example.com/image2.jpg'
      },
      {
        name: 'Example Product 2',
        price: 29.99, 
        description: 'Another sample product description',
        category: 'Clothing',
        brand: 'Another Brand',
        countInStock: 50,
        isFeatured: false,
        images: 'https://example.com/image3.jpg'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Products');
    XLSX.writeFile(wb, 'bulk_product_template.xlsx');
  };

  return (
    <Container>
      <AdminBreadcrumb entity="Bulk Product Upload" />
      <h1 className="my-4">Bulk Product Upload</h1>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Card className="mb-4">
        <Card.Body>
          {step === 1 && (
            <>
              <h4 className="mb-3">Upload Product Excel File</h4>
              <p>
                Upload an Excel file (.xlsx or .xls) containing product data. The file must include
                columns for name, price, and category (required fields).
              </p>
              
              <Row className="mb-3">
                <Col md={6}>
                  <Button 
                    variant="outline-primary" 
                    className="mb-3"
                    onClick={downloadTemplate}
                  >
                    Download Template
                  </Button>
                  
                  <Form.Group controlId="formFile" className="mb-3">
                    <Form.Label>Select Excel File</Form.Label>
                    <Form.Control
                      type="file"
                      onChange={fileInputHandler}
                      accept=".xlsx, .xls"
                      isInvalid={!!error}
                    />
                  </Form.Group>
                </Col>
                
                <Col md={6}>
                  <h5>Instructions:</h5>
                  <ol>
                    <li>Download the template or create your own Excel file</li>
                    <li>Fill in the product details (name, price, and category are required)</li>
                    <li>For multiple images, separate URLs with commas</li>
                    <li>Save your Excel file and upload it here</li>
                    <li>Review the data before final submission</li>
                  </ol>
                </Col>
              </Row>
            </>
          )}

          {step === 2 && (
            <>
              <h4 className="mb-3">Review Product Data</h4>
              <p>
                Found {products.length} products in the Excel file. Please review the data below before
                submitting.
              </p>
              
              {renderInvalidProductsWarning()}
              
              <div className="table-responsive">
                <table className="table table-striped table-sm">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Price</th>
                      <th>Category</th>
                      <th>Stock</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((product, index) => (
                      <tr key={index} className={!product.isValid ? 'table-danger' : ''}>
                        <td>{product.id}</td>
                        <td>{product.name || <span className="text-danger">Missing</span>}</td>
                        <td>
                          {product.price ? (
                            `$${parseFloat(product.price).toFixed(2)}`
                          ) : (
                            <span className="text-danger">Missing</span>
                          )}
                        </td>
                        <td>{product.category || <span className="text-danger">Missing</span>}</td>
                        <td>{product.countInStock || 0}</td>
                        <td>
                          {product.isValid ? (
                            <span className="text-success">Valid</span>
                          ) : (
                            <span className="text-danger">Invalid</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {products.length > 10 && (
                <p className="text-muted">
                  Showing 10 of {products.length} products. All valid products will be uploaded.
                </p>
              )}
              
              <div className="d-flex justify-content-between mt-3">
                <Button variant="outline-secondary" onClick={resetForm}>
                  Back
                </Button>
                <Button
                  variant="primary"
                  onClick={submitBulkUpload}
                  disabled={uploading || products.length === 0 || products.filter(p => p.isValid).length === 0}
                >
                  {uploading ? (
                    <>
                      <Spinner animation="border" size="sm" /> Uploading...
                    </>
                  ) : (
                    `Upload ${products.filter(p => p.isValid).length} Products`
                  )}
                </Button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h4 className="mb-3 text-success">Upload Complete!</h4>
              <p>
                Successfully uploaded {products.filter(p => p.isValid).length} products to your store.
              </p>
              <div className="d-flex justify-content-between">
                <Button variant="outline-primary" onClick={resetForm}>
                  Upload More Products
                </Button>
                <Button variant="primary" onClick={() => navigate('/admin/products')}>
                  Go to Product List
                </Button>
              </div>
            </>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default BulkProductUpload; 