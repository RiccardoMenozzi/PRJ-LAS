require("dotenv").config()

const {
    
    EMAIL_PASSWORD,
    SALT_ROUNDS,
    JWT_SECRET,
    SITE_HOST,
    EMAIL,
    PORT
} = process.env

module.exports = { 
    EMAIL_PASSWORD, 
    SALT_ROUNDS,
    JWT_SECRET, 
    SITE_HOST,
    EMAIL,
    PORT
}