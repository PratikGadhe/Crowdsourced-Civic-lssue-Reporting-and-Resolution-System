# Civic Reporter Backend

## Setup Instructions

1. **Fix npm permissions (run in terminal):**
   ```bash
   sudo chown -R $(whoami) ~/.npm
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start MongoDB:**
   - Open MongoDB Compass
   - Connect to: `mongodb://localhost:27017`
   - Create database: `civic-reporter`

4. **Start server:**
   ```bash
   npm run dev
   ```

## API Endpoints

- `POST /api/reports` - Submit new report
- `GET /api/reports` - Get all reports
- `PUT /api/reports/:id` - Update report status

## Database Schema

Reports collection with fields:
- title, description, category, priority
- location (lat, lng, address)
- images, status, timestamps