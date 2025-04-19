# ChatApp Server API Documentation

This document provides an overview of the API endpoints available in the ChatApp server.

## Base URL
```
http://<your-server-domain>/api
```

---

## Authentication Routes

### POST `/auth/signup`
- **Description**: Register a new user.
- **Request Body**:
  ```json
  {
    "name": "string",
    "email": "string",
    "password": "string",
    "profilePic": "base64-encoded string (optional)"
  }
  ```
- **Response**:
  - `201 Created`: Returns the user object (excluding the password).
  - `400 Bad Request`: Validation errors.
  - `500 Internal Server Error`: Server error.

---

### POST `/auth/signin`
- **Description**: Log in an existing user.
- **Request Body**:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response**:
  - `200 OK`: Returns the user object (excluding the password).
  - `400 Bad Request`: Invalid credentials.
  - `500 Internal Server Error`: Server error.

---

### GET `/auth/signout`
- **Description**: Log out the current user.
- **Response**:
  - `200 OK`: Logout successful.
  - `500 Internal Server Error`: Server error.

---

### PUT `/auth/update-profile`
- **Description**: Update the user's profile picture.
- **Headers**:
  - `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "profilePic": "base64-encoded string"
  }
  ```
- **Response**:
  - `200 OK`: Returns the updated user object.
  - `400 Bad Request`: Validation errors.
  - `500 Internal Server Error`: Server error.

---

### GET `/auth/profile`
- **Description**: Get the current user's profile.
- **Headers**:
  - `Authorization: Bearer <token>`
- **Response**:
  - `200 OK`: Returns the user object.
  - `500 Internal Server Error`: Server error.

---

## Message Routes

### GET `/message/users`
- **Description**: Get a list of users for the sidebar (excluding the logged-in user).
- **Headers**:
  - `Authorization: Bearer <token>`
- **Response**:
  - `200 OK`: Returns an array of user objects (excluding passwords).
  - `500 Internal Server Error`: Server error.

---

### GET `/message/:id`
- **Description**: Get messages between the logged-in user and another user.
- **Headers**:
  - `Authorization: Bearer <token>`
- **Response**:
  - `200 OK`: Returns an array of message objects.
  - `500 Internal Server Error`: Server error.

---

### POST `/message/send/:id`
- **Description**: Send a message to another user.
- **Headers**:
  - `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "text": "string",
    "image": "base64-encoded string (optional)"
  }
  ```
- **Response**:
  - `201 Created`: Returns the created message object.
  - `500 Internal Server Error`: Server error.

---

## Notes
- All protected routes require a valid JWT token in the `Authorization` header.
- Ensure the `CLIENT_URL` and `JWT_SECRET` environment variables are properly configured in the `.env` file.
