# User Service - Hospital Bed Tracker System

A Spring Boot microservice that handles user authentication and authorization using JWT tokens and MySQL database. This service registers with Eureka Server for service discovery.

## Features

- JWT-based authentication and authorization
- Three user roles: ADMIN, STAFF, USER
- BCrypt password encoding
- MySQL database integration
- Eureka client registration
- Comprehensive logging
- Global exception handling

## Configuration

### Application Properties
- **Port**: 8082
- **Database**: MySQL (localhost:3306/MediTrackDB)
- **Eureka Server**: http://localhost:8761/eureka
- **JWT Secret**: Configured in application.properties
- **JWT Expiration**: 24 hours (86400000 ms)

## API Endpoints

### Authentication Endpoints

#### Register User
```
POST /api/auth/register
Content-Type: application/json

{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
    "username": "john_doe",
    "password": "password123"
}
```

#### Validate Token
```
GET /api/auth/validate
Authorization: Bearer <jwt_token>
```

### User Management Endpoints

#### Get All Users (ADMIN only)
```
GET /api/users
Authorization: Bearer <jwt_token>
```

#### Get User by ID
```
GET /api/users/{id}
Authorization: Bearer <jwt_token>
```

#### Delete User (ADMIN only)
```
DELETE /api/users/{id}
Authorization: Bearer <jwt_token>
```

## User Roles

- **ADMIN**: Full access to all endpoints, can delete users
- **STAFF**: Access to user management endpoints
- **USER**: Basic access, can view own profile

## Prerequisites

1. Java 17+
2. MySQL Server running on localhost:3306
3. Eureka Server running on localhost:8761
4. Create database: `MediTrackDB`

## Database Setup

```sql
CREATE DATABASE MediTrackDB;
```

The service will automatically create the required tables using JPA auto-ddl.

## Running the Service

1. Ensure MySQL is running and create the `MediTrackDB` database
2. Ensure Eureka Server is running on port 8761
3. Run the application:
   ```bash
   mvn spring-boot:run
   ```

## Testing with Postman

1. **Register a user**: POST to `/api/auth/register`
2. **Login**: POST to `/api/auth/login` - copy the token from response
3. **Validate token**: GET `/api/auth/validate` with `Authorization: Bearer <token>`
4. **Access protected endpoints**: Include the token in Authorization header

## Response Examples

### Successful Login Response
```json
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "type": "Bearer",
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "USER"
}
```

### Token Validation Response
```json
{
    "valid": true,
    "username": "john_doe",
    "userId": 1,
    "role": "USER",
    "message": "Token is valid"
}
```

## Logging

The service includes comprehensive logging for:
- User registration attempts
- Login attempts (successful and failed)
- Token validation
- User management operations
- Security events

Log levels are configured for DEBUG on the service package and Spring Security.
