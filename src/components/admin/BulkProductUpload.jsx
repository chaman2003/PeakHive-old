import React, { useState } from 'react';
import { Button, Form, Alert, Card, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FaFileUpload, FaInfoCircle, FaFileCsv, FaDownload } from 'react-icons/fa';
import { createProductsBulk } from '../../api/adminApi';

function BulkProductUpload({ onUploadComplete }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    
    if (selectedFile) {
      // Read the file content
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const csvData = e.target.result;
          const lines = csvData.split('\\n');
          const headers = lines[0].split(',').map(header => header.trim());
          
          // Check required fields
          const requiredFields = ['name', 'price', 'category', 'description', 'stock'];
          const missingFields = requiredFields.filter(field => !headers.includes(field));
          
          if (missingFields.length > 0) {
            setError(`CSV file is missing required columns: ${missingFields.join(', ')}`);
            return;
          }
          
          // Generate preview (first 5 rows)
          const previewData = [];
          for (let i = 1; i < Math.min(6, lines.length); i++) {
            if (lines[i].trim() === '') continue;
            
            const values = lines[i].split(',');
            const product = {};
            
            headers.forEach((header, index) => {
              product[header] = values[index] ? values[index].trim() : '';
            });
            
            previewData.push(product);
          }
          
          setPreview(previewData);
          setShowPreview(true);
          setError(null);
        } catch (err) {
          console.error('CSV parsing error:', err);
          setError('Error parsing CSV file. Please make sure it is formatted correctly.');
        }
      };
      reader.readAsText(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const csvData = e.target.result;
          const lines = csvData.split('\\n');
          const headers = lines[0].split(',').map(header => header.trim());
          
          // Process each row into product objects
          const products = [];
          for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim() === '') continue;
            
            const values = lines[i].split(',');
            const product = {};
            
            headers.forEach((header, index) => {
              product[header] = values[index] ? values[index].trim() : '';
            });
            
            // Convert numeric values
            if (product.price) product.price = parseFloat(product.price);
            if (product.stock) product.stock = parseInt(product.stock);
            if (product.salePrice) product.salePrice = parseFloat(product.salePrice);
            
            // Convert boolean values
            if (product.featured) product.featured = product.featured.toLowerCase() === 'true';
            if (product.onSale) product.onSale = product.onSale.toLowerCase() === 'true';
            
            products.push(product);
          }
          
          // Send to API
          const results = await createProductsBulk(products);
          
          // Notify parent component
          if (onUploadComplete) {
            onUploadComplete(results);
          }
          
          setLoading(false);
          setFile(null);
          setShowPreview(false);
          
        } catch (err) {
          console.error('Processing error:', err);
          setError(err.message || 'Error processing CSV file');
          setLoading(false);
        }
      };
      reader.readAsText(file);
    } catch (err) {
      console.error('Upload error:', err);
      setError('Error during file upload');
      setLoading(false);
    }
  };

  const handleDownloadTemplate = () => {
    const headers = [
      'name',
      'price',
      'description',
      'category',
      'stock',
      'images',
      'brand',
      'tags',
      'sku',
      'weight',
      'dimensions',
      'featured',
      'onSale',
      'salePrice'
    ].join(',');
    
    const sampleRow = [
      'Sample Product',
      '29.99',
      'This is a sample product description',
      'Electronics',
      '100',
      'https://example.com/image1.jpg,https://example.com/image2.jpg',
      'Sample Brand',
      'tag1,tag2,tag3',
      'SKU123',
      '2.5kg',
      '10x15x5cm',
      'false',
      'false',
      ''
    ].join(',');
    
    const csvContent = `${headers}\\n${sampleRow}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'product_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="mb-4 shadow-sm">
      <Card.Header className="bg-white">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Bulk Product Upload</h5>
          <Button 
            variant="outline-primary" 
            size="sm"
            onClick={handleDownloadTemplate}
          >
            <FaDownload className="me-1" /> Download Template
          </Button>
        </div>
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        
        <p>Upload a CSV file with product information to add multiple products at once.</p>
        
        <div className="bg-light p-3 rounded mb-3">
          <div className="d-flex align-items-center mb-2">
            <FaInfoCircle className="text-primary me-2" />
            <h6 className="mb-0">Required Fields:</h6>
          </div>
          <div className="row">
            <div className="col-md-6">
              <ul className="small mb-0">
                <li><strong>name</strong> - Product name</li>
                <li><strong>price</strong> - Numeric value (e.g., 29.99)</li>
                <li><strong>description</strong> - Product description</li>
                <li><strong>category</strong> - Product category</li>
                <li><strong>stock</strong> - Numeric value (e.g., 100)</li>
              </ul>
            </div>
            <div className="col-md-6">
              <ul className="small mb-0">
                <li><strong>images</strong> - Comma-separated URLs (optional)</li>
                <li><strong>brand</strong> - Product brand (optional)</li>
                <li><strong>tags</strong> - Comma-separated values (optional)</li>
                <li><strong>featured/onSale</strong> - "true" or "false" (optional)</li>
                <li><strong>And more...</strong> <OverlayTrigger
                  placement="top"
                  overlay={
                    <Tooltip>
                      Other optional fields: sku, weight, dimensions, salePrice
                    </Tooltip>
                  }
                >
                  <FaInfoCircle className="text-muted" />
                </OverlayTrigger></li>
              </ul>
            </div>
          </div>
        </div>
        
        <Form.Group className="mb-3">
          <Form.Label>Upload CSV File</Form.Label>
          <div className="input-group">
            <Form.Control 
              type="file" 
              accept=".csv" 
              onChange={handleFileChange}
            />
            <Button
              variant="outline-secondary"
              onClick={handleDownloadTemplate}
            >
              <FaFileCsv className="me-1" /> Template
            </Button>
          </div>
          <Form.Text className="text-muted">
            Upload .csv file format only. First row must contain column headers.
          </Form.Text>
        </Form.Group>
        
        {showPreview && preview.length > 0 && (
          <div className="mt-3">
            <h6>Preview ({preview.length} products):</h6>
            <div className="table-responsive">
              <table className="table table-sm table-bordered">
                <thead>
                  <tr>
                    {Object.keys(preview[0]).map(key => (
                      <th key={key} className="small">{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.map((product, index) => (
                    <tr key={index}>
                      {Object.values(product).map((value, idx) => (
                        <td key={idx} className="small">{value?.toString() || ''}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        <Button
          variant="primary"
          onClick={handleUpload}
          disabled={loading || !file}
          className="mt-3"
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Uploading...
            </>
          ) : (
            <>
              <FaFileUpload className="me-2" /> Upload Products
            </>
          )}
        </Button>
      </Card.Body>
    </Card>
  );
}

export default BulkProductUpload; 