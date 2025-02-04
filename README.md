# Login and signup flow

This repository contains a basic user system for a web application.
## Installation

1. Install the dependencies:

    ```bash
    npm install
    ```
2. Fill in your own .env with a Gmail and it's specific app password:
    EMAIL = "YourEmail@gmail.com"
    EMAIL_PASSWORD = **** **** **** ****

3. You will also need:
    JWT_SECRET = random alphanumeric string 
    SITE_HOST = localhost (probably)
    PORT = 8080 (probably)
    SALT_ROUNDS = a number (usually grater than 10)

  * note that the DB (state.json) and node_modules will
    create themselves 
## How to Use the code

1. Run the server:

    ```bash
    npm run dev
    ```

2. Open your browser and search for `http://localhost:8080`.

3. Make sure to have your WI-FI on to experience the full 2FA
