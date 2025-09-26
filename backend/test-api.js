// Test script to verify API endpoints
const testReport = {
  title: "Test streetlight issue",
  description: "Street light not working",
  category: "electricity",
  priority: "medium",
  location: {
    latitude: 19.0760,
    longitude: 72.8777,
    address: "Mumbai, Maharashtra"
  },
  images: []
};

// Test POST request
fetch('http://localhost:9000/api/reports', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(testReport)
})
.then(res => res.json())
.then(data => console.log('POST Result:', data))
.catch(err => console.error('POST Error:', err));

// Test GET request
fetch('http://localhost:9000/api/reports')
.then(res => res.json())
.then(data => console.log('GET Result:', data))
.catch(err => console.error('GET Error:', err));