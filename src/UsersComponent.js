const fs = require("fs")
const bcrypt = require("bcrypt")
const { generateToken, hashPassword } = require("./utils")
const {
    tokenInvalidated,
    resettedPassword,
    verifiedPassword,
    wrongPassword,
    userCreated,
    notVerified,
    usedEmail,
    notFound,
    loggedIn,
    tokenSet            
    } = require("./errMess")

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

        return tokenSet
    }

    invalidateUserToken(email) {
        const user = this.getUser(email)
        if (!user) return notFound

        user.token = null
        this.serialize()

        return tokenInvalidated
    }

    async updateUserPassword(email, password) {
        const user = this.getUser(email)
        if (!user) return notFound

        user.password = await hashPassword(password)
        this.invalidateUserToken(email)
        this.serialize()
        
        return resettedPassword
    }
    
    updateVerificationStatus(email, verified) {
        const user = this.getUser(email)
        if (!user) return notFound

        user.verified = verified
        user.token = null
        this.serialize()

        return verifiedPassword
    }

    async create(data) {
        const { email, password } = data
        if (this.getUser(email)) {
            return usedEmail
        }

        const user = {
            email, 
            password: await hashPassword(password),
            token : null,
            verified: false
        }
        userCreated.user = user
        this.users.push(user)
        this.serialize()
        
        return userCreated
    }

    async login(email, password) {
        const user = this.getUser(email)
        wrongPassword.user = user
        notVerified.user = user
        loggedIn.user = user

        if (!user) return notFound

        if (!user.verified) return notVerified

        if (await bcrypt.compare(password, Buffer.from(user.password, 'base64').toString('utf-8'))) {
            return loggedIn
        }

        return wrongPassword
    }

}

module.exports = UsersComponent
