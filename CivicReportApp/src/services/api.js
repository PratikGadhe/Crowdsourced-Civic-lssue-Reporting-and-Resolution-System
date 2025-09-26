const API_BASE_URL = 'http://192.168.214.228:9000/api';

export const submitReport = async (reportData) => {
  try {
    console.log('Submitting to:', `${API_BASE_URL}/reports`);
    console.log('Report data:', reportData);
    
    // Create FormData for image upload
    const formData = new FormData();
    
    // Add text fields
    formData.append('title', reportData.title);
    formData.append('description', reportData.description);
    formData.append('category', reportData.category);
    formData.append('priority', reportData.priority);
    formData.append('location', JSON.stringify(reportData.location));
    
    // Add images
    if (reportData.images && reportData.images.length > 0) {
      reportData.images.forEach((imageUri, index) => {
        formData.append('images', {
          uri: imageUri,
          type: 'image/jpeg',
          name: `image_${index}.jpg`,
        });
      });
    }
    
    const response = await fetch(`${API_BASE_URL}/reports`, {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });
    
    console.log('Response status:', response.status);
    const result = await response.json();
    console.log('Response data:', result);
    return result;
  } catch (error) {
    console.error('API Error:', error);
    throw new Error('Failed to submit report: ' + error.message);
  }
};

export const getReports = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/reports`);
    const result = await response.json();
    return result.data;
  } catch (error) {
    throw new Error('Failed to fetch reports: ' + error.message);
  }
};