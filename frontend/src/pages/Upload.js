import React from 'react';

const Upload = () => {
  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">📁 File Upload</h3>
        </div>
        <div className="card-body">
          <div className="text-center">
            <div style={{border: '2px dashed #ccc', padding: '3rem', borderRadius: '8px'}}>
              <h4>Drag & Drop Files Here</h4>
              <p>Or click to select files</p>
              <button className="btn btn-primary">Choose Files</button>
            </div>
            <div className="mt-3">
              <small>Supported formats: PDF, DOC, XLS, Images (JPG, PNG)</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upload;