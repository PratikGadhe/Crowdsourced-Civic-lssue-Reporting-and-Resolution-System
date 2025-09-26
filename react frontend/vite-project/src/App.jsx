import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [groupByLocation, setGroupByLocation] = useState(false)

  const normalizeLocation = (address) => {
    if (!address) return 'Unknown'
    const parts = address.split(',').map(part => part.trim())
    return parts.slice(-3).join(', ')
  }

  const groupReportsByLocation = (reports) => {
    const grouped = {}
    reports.forEach(report => {
      const normalizedLocation = normalizeLocation(report.location?.address)
      if (!grouped[normalizedLocation]) {
        grouped[normalizedLocation] = []
      }
      grouped[normalizedLocation].push(report)
    })
    return grouped
  }

  useEffect(() => {
    fetch('http://localhost:9000/api/reports')
      .then(res => res.json())
      .then(data => {
        setReports(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error:', err)
        setLoading(false)
      })
  }, [])

  if (loading) return <div>Loading...</div>

  const groupedReports = groupByLocation ? groupReportsByLocation(reports) : null

  return (
    <div>
      <h1>Civic Reports</h1>
      <button onClick={() => setGroupByLocation(!groupByLocation)} style={{margin: '10px', padding: '10px'}}>
        {groupByLocation ? 'Show All Reports' : 'Group by Location'}
      </button>
      
      {groupByLocation ? (
        Object.entries(groupedReports).map(([location, locationReports]) => (
          <div key={location} style={{margin: '20px 0', border: '2px solid #007bff', borderRadius: '8px'}}>
            <h2 style={{background: '#007bff', color: 'white', margin: '0', padding: '15px'}}>
              📍 {location} ({locationReports.length} reports)
            </h2>
            {locationReports.map((report, index) => (
              <div key={index} style={{border: '1px solid #ccc', margin: '10px', padding: '15px'}}>
                <h3>{report.title}</h3>
                <p><strong>Category:</strong> {report.category}</p>
                <p><strong>Priority:</strong> {report.priority}</p>
                <p><strong>Status:</strong> {report.status}</p>
                <p><strong>Description:</strong> {report.description}</p>
                <p><strong>Full Address:</strong> {report.location?.address}</p>
                <p><strong>Created:</strong> {new Date(report.createdAt?.$date || report.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        ))
      ) : (
        reports.map((report, index) => (
          <div key={index} style={{border: '1px solid #ccc', margin: '10px', padding: '15px'}}>
            <h3>{report.title}</h3>
            <p><strong>Category:</strong> {report.category}</p>
            <p><strong>Priority:</strong> {report.priority}</p>
            <p><strong>Status:</strong> {report.status}</p>
            <p><strong>Description:</strong> {report.description}</p>
            <p><strong>Location:</strong> {report.location?.address}</p>
            <p><strong>Created:</strong> {new Date(report.createdAt?.$date || report.createdAt).toLocaleDateString()}</p>
          </div>
        ))
      )}
    </div>
  )
}

export default App
