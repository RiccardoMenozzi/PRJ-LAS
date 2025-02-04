const fs = require("fs")
const bcrypt = require("bcrypt")
const { generateToken, hashPassword, notFound } = require("./utils")
class UsersComponent {
    constructor(statePath) {
        this.users = []
        this.statePath = statePath
        try {
            this.users = JSON.parse(fs.readFileSync(statePath, "utf-8"))
        } catch(err) {
            console.log(err.message)
            this.serialize()
        }
    }

    serialize() {
        fs.writeFileSync(this.statePath, JSON.stringify(this.users, null, 2))
    }

    getUser(email) {
        return this.users.find(u => u.email === email)
    }

    setToken(email) {
        const user = this.getUser(email)
        if (!user) return notFound

        user.token = generateToken(email)
        this.serialize()

        return { success: true, message: "Token set successfully" }
    }

    invalidateUserToken(email) {
        const user = this.getUser(email)
        if (!user) return notFound

        user.token = null
        this.serialize()

        return { success: true, message: "Token invalidated successfully" }
    }

    async updateUserPassword(email, password) {
        const user = this.getUser(email)
        if (!user) return notFound

        user.password = await hashPassword(password)
        this.invalidateUserToken(email)
        this.serialize()
        
        return { success: true, message: "Reset password successful" }
    }
    
    updateVerificationStatus(email, verified) {
        const user = this.getUser(email)
        if (!user) return notFound

        user.verified = verified
        user.token = null
        this.serialize()

        return { success: true, message: "Verification status updated" }
    }

    async create(data) {
        const { email, password } = data
        if (this.getUser(email)) {
            return { success: false, message: "Email already in use"}
        }

        const user = {
            email, 
            password: await hashPassword(password),
            token : null,
            verified: false
        }
        this.users.push(user)
        this.serialize()
        
        return { success: true, user, message: "User created successfully. Check your email for confirmation." }
    }

    async login(email, password) {
        const user = this.getUser(email)
        if (!user) return notFound

        if (!user.verified) {
            return { success: false, user, message: "Non verified email. Check your inbox or spam." }
        }

        if (await bcrypt.compare(password, Buffer.from(user.password, 'base64').toString('utf-8'))) {
            return { success: true, user, message: "Login successful" }
        }

        return { success: false, user, message: "wrong password" }
    }

}

module.exports = UsersComponent
