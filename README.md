# URL Shortener - R22EH176

Full-stack URL shortener with React frontend and Node.js backend.

## Setup

**Backend:**

```bash
cd backend
npm install
npm start
```

**Frontend:**

```bash
cd frontend
npm install
npm start
```

## Usage

- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## API

- `POST /shorturls` - Create short URL
- `GET /shorturls/{code}` - Get statistics
- `GET /{code}` - Redirect to original URL

## Screenshots

### Frontend

![URL Shortener](frontend/public/screenshots/01-url-shortener-page.png)
![Concurrent-Url-Processing](frontend/public/screenshots/03-concurrent-url-processing.png)
![Statistics](frontend/public/screenshots/02-statistics-page.png)

### Backend API Testing

#### POST - Create Short URL
![POST Create URL](backend/screenshots/01-post-create-shorturl.png)

#### GET - Statistics
![GET Statistics](backend/screenshots/02-get-statistics.png)

#### GET - Redirect
![GET Redirect](backend/screenshots/03-get-redirect.png)

#### API Response Details
![API Response Details](backend/screenshots/04-api-response-details.png)


**Student**: R22EH176 - Vennapusa Srinath Reddy
