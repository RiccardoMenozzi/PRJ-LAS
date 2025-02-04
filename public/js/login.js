const loginForm = document.getElementById("loginForm")
const toggleLoginPassword = document.getElementById('toggleLoginPassword')
const loginPasswordField = document.getElementById('loginPassword')
const loginEmailField = document.getElementById('loginEmail')
const errorMessage = document.getElementById('errorMessage')

function togglePassword() {
    let passwordField = document.getElementById("password")
    let toggleIcon = document.querySelector(".toggle-password i")

    if (passwordField.type === "password") {
        passwordField.type = "text"
        toggleIcon.classList.remove("fa-eye")
        toggleIcon.classList.add("fa-eye-slash")
    } else {
        passwordField.type = "password"
        toggleIcon.classList.remove("fa-eye-slash")
        toggleIcon.classList.add("fa-eye")
    }
}

loginForm.addEventListener("submit", async function (event) {
    event.preventDefault()

    const email = loginEmailField.value
    const password = loginEmailField.value

    try {
        const response = await fetch("/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        })

        const data = await response.json()

        if (data.success) {
            sessionStorage.setItem("loggedUserEmail", data.user.email)
            window.location.href = "/welcome"
        } else {
            errorMessage.style.display = "inline-block"
            if (!data.user || data.user?.verified) {
                errorMessage.textContent = "Wrong email or password"
                loginPasswordField.classList.add('input-error')
                loginEmailField.classList.add('input-error')
            } else {
                errorMessage.textContent = "Non veriified email"
                loginEmailField.classList.add('input-error')
            }
        }
    } catch (error) {
        console.error("Errore durante il login:", error)
        toastr.error("Errore inaspettato")
    }
})

toggleLoginPassword.addEventListener('click', () => 
    togglePasswordVisibility(loginPasswordField, toggleLoginPassword)
)

loginPasswordField.addEventListener('input', () => {
    loginEmailField.classList.remove('input-error')
    loginPasswordField.classList.remove('input-error')
    errorMessage.style.display = "none"
})

loginEmailField.addEventListener('input', () => {
    loginEmailField.classList.remove('input-error')
    loginPasswordField.classList.remove('input-error')
    errorMessage.style.display = "none"
})
