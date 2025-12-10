import { useState } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { X, XCircle } from 'lucide-react';
import '../styles/upload.css';

function UploadModal({ show, onHide }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [hashtagInput, setHashtagInput] = useState('');
  const [hashtags, setHashtags] = useState([]);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleHashtagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const tag = hashtagInput.trim().toLowerCase();
      
      // Remove # if user typed it
      const cleanTag = tag.startsWith('#') ? tag.substring(1) : tag;
      
      if (cleanTag && !hashtags.includes(cleanTag)) {
        setHashtags([...hashtags, cleanTag]);
        setHashtagInput('');
      }
    }
    
    // Remove last tag on backspace if input is empty
    if (e.key === 'Backspace' && !hashtagInput && hashtags.length > 0) {
      setHashtags(hashtags.slice(0, -1));
    }
  };

  const removeHashtag = (indexToRemove) => {
    setHashtags(hashtags.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title || !image) {
      alert('Title and image are required!');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('caption', description);
      formData.append('hashtags', hashtags.join(','));
      formData.append('image', image);
      formData.append('userId', localStorage.getItem('userId'));

      const response = await fetch('http://localhost:5000/api/artwork/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        alert('Artwork uploaded successfully!');
        setTitle('');
        setDescription('');
        setHashtagInput('');
        setHashtags([]);
        setImage(null);
        setImagePreview(null);
        onHide();
        // Refresh page to show new artwork
        window.location.reload();
      } else {
        alert(data.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Something went wrong!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header className="upload-modal-header border-0 position-relative">
        <Modal.Title className="upload-modal-title">Upload Artwork</Modal.Title>
        <Button 
          variant="link" 
          onClick={onHide}
          className="btn-close-custom p-0 border-0 bg-transparent"
          style={{ position: 'absolute', right: '20px', top: '20px' }}
        >
          <X size={24} color="#000" />
        </Button>
      </Modal.Header>
      
      <Modal.Body className="upload-modal-body">
        <p className="upload-subtitle">Upload your artwork to the gallery.</p>
        
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-4">
            <Form.Label className="upload-label">Title</Form.Label>
            <Form.Control
              type="text"
              placeholder="Give your artwork a title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="upload-input"
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label className="upload-label">Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Describe your artwork..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="upload-input"
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label className="upload-label">Hashtags</Form.Label>
            
            {/* Hashtags display area */}
            {hashtags.length > 0 && (
              <div className="hashtags-container mb-3">
                {hashtags.map((tag, index) => (
                  <div key={index} className="hashtag-item">
                    <span className="hashtag-text">#{tag}</span>
                    <button 
                      type="button"
                      className="hashtag-remove-btn"
                      onClick={() => removeHashtag(index)}
                    >
                      <XCircle size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <Form.Control
              type="text"
              placeholder="# digitalart landscape (type and press space/enter)"
              value={hashtagInput}
              onChange={(e) => setHashtagInput(e.target.value)}
              onKeyDown={handleHashtagKeyDown}
              className="upload-input"
            />
            <Form.Text className="text-muted">
              Type hashtags and press space or enter to add (e.g. digitalart landscape)
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label className="upload-label">Upload Image</Form.Label>
            <Form.Control
              type="file"
              accept="image/png,image/jpeg"
              onChange={handleImageChange}
              className="upload-input"
            />
            <Form.Text className="text-muted">
              Upload a PNG or JPG file (max 250MB)
            </Form.Text>
          </Form.Group>

          {imagePreview && (
            <div className="mb-4">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="upload-preview"
              />
            </div>
          )}

          <div className="d-flex gap-3 justify-content-end">
            <Button 
              variant="light" 
              onClick={onHide}
              className="upload-cancel-btn"
            >
              Cancel
            </Button>
            <Button 
              variant="dark" 
              type="submit"
              disabled={loading}
              className="upload-submit-btn"
            >
              {loading ? 'Uploading...' : 'Upload Artwork'}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default UploadModal;