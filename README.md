# Weather Notify Service

## About

This is a repository for weather notification service that allows users to subscribe to weather updates
for their cities and receive notifications via email.

## Steps to run

Build and run docker container:
`docker-compose up`

## Deployment

The application is deployed and available at: **[https://weather-notify-idch.onrender.com/](https://weather-notify-idch.onrender.com/)**

### API Documentation

Interactive API documentation (Swagger): [API Docs](https://weather-notify-idch.onrender.com/api)

## Application

RESTful API

### Routes:

- Subscribe to weather notifications: POST /api/subscribe
- Confirm subscription: GET /api/confirm/{token}
- Unsubscribe: POST /api/unsubscribe/{token}
- Get weather data: GET /api/weather?city={city}
- OpenAPI Specification: GET /api

### Email Notifications

The service sends:

- Confirmation emails when users subscribe
- Regular weather notifications based on subscription frequency (hourly/daily)

### Error Codes

The API returns standard HTTP status codes:

**Success:**

- `200` - OK

**Client Errors:**

- `400` - Bad Request
- `404` - Not Found
- `409` - Conflict (email or tokenal ready exists)

**Server Errors:**

- `500` - Internal Server Error
- `503` - Service Unavailable

## Technologies

**Framework:** NestJS <br>
**Database:** PostgreSQL with TypeORM <br>
**Email:** Nodemailer <br>
**API:** [WeatherAPI.com](https://www.weatherapi.com/) <br>
**Containerization:** Docker <br>
**Language:** TypeScript <br>
