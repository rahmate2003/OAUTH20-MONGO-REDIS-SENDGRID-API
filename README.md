# API Documentation

This API provides user authentication functionality, including registration, login, and Google OAuth2 authentication.

## Technologies Used

- **OAuth2** for Google authentication
- **JWT (JSON Web Tokens)** for token-based authentication
- **bcrypt** for hashing passwords
- **Redis** for OTP and token storage
- **MongoDB** for user data storage
- **Sendgrid** for Email OTP SMTP
- **Passport** for handling Google OAuth2 and JWT authentication

## Routes

### Authentication Routes

#### POST api/auth/register

- Register a new user by providing `name`, `email`, and `password`.
- Sends an OTP for email verification.
- Returns a token to verify OTP.

##### Request Body

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

#### POST api/auth/register/verify

- Verifies the OTP sent to the user's email.
- Finalizes user registration and saves the user to the database.

##### Request Body

```json
{
  "token": "temporary-jwt-token",
  "type": "register",
  "otp": "123456"
}
```

#### POST api/auth/login

- Log in an existing user by providing `email` and `password`.
- Sends an OTP for email verification.
- Returns a token to verify OTP.

##### Request Body

```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

#### POST api/auth/login/verify

- Verifies the OTP sent to the user's email.
- If successful, returns an access token and refresh token.

##### Request Body

```json
{
  "token": "temporary-jwt-token",
  "type": "login",
  "otp": "123456"
}
```

#### POST api/auth/refresh-token

- Refreshes the access token using the provided refresh token.

##### Request Body

```json
{
  "refreshToken": "refresh-token"
}
```

### Google Authentication Routes

#### GET api/auth/google

- Initiates Google OAuth2 login.

#### GET api/auth/google/callback

- Handles the callback from Google after user authentication.
- Returns access and refresh tokens for the authenticated user.

### User Profile Routes

#### GET api/user/profile

- Fetches the profile of the authenticated user.

#### PUT api/user/profile

- Updates the profile of the authenticated user.
- Allows updates to `name`, `phone`, and `address`.

##### Request Body

```json
{
  "name": "John Doe",
  "phone": "1234567890",
  "address": "123 Street, City, Country"
}
```

## Authentication Flow

1. **Registration**: The user registers with an email and password, and receives an OTP to verify their email.
2. **Login**: The user logs in with their email and password, then verifies their email via OTP.
3. **Google OAuth2**: The user can log in via Google OAuth2, which generates access and refresh tokens.
4. **Access Tokens**: Used for authenticating API requests for a short period (15 minutes).
5. **Refresh Tokens**: Used to refresh access tokens after expiration (valid for 7 days).

## Middleware

- **authMiddleware**: Ensures the user is authenticated by verifying the JWT.
- **roleMiddleware**: Checks the user's role before allowing access to certain routes.

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/rahmate2003/OAUTH20-MONGO-REDIS-SENDGRID-API.git
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file and set the necessary environment variables:

   ```bash
    # Sendgrid API
    SENDGRID_API_KEY=
    EMAIL_FROM=

    # MongoDB Connection
    MONGO_URI=

    # JWT Secret Key
    JWT_OTP_SECRET=
    JWT_SECRET=
    REFRESH_TOKEN_SECRET=

    # Redis URL
    REDIS_URL=

    # Google Oauth2.0
    GOOGLE_CLIENT_ID=
    GOOGLE_CLIENT_SECRET=
    GOOGLE_CALLBACK_URL=
    CLIENT_URL=
    SESSION_SECRET=

    # Server Port
    PORT=

    # Environment Mode
    NODE_ENV=

   ```

4. Start the server:
   ```bash
   npm run dev
   ```
