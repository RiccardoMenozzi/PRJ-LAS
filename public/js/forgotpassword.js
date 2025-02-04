const form = document.getElementById('forgot-password-form')
const messageP = document.getElementById('messageP')
const resendEmailP = document.getElementById('resendEmailP')
const resend = document.getElementById('resend')
const newEmailP = document.getElementById('newEmailP')
const title = document.getElementById('title')

async function sendEmail (event) {
    event.preventDefault() // Previene il refresh della pagina

    const email = document.getElementById("email").value

    if (!email) {
        toastr.error("Inserisci un'email valida.")
        return
    }

    try {
        const response = await fetch("/forgot-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
        })

        const text = await response.text()
        const data = JSON.parse(text)

        if (data.success) {
            form.style.display = 'none'
            resendEmailP.style.display = 'block'
            newEmailP.style.display = 'block'
            title.innerText = "Email di ripristino inviata"
            messageP.innerHTML = `Utilizza il link inviato all'indirizzo <br><a href="mailto:${email}">${email}</a><br> per impostare una nuova password`
            toastr.success(data.message || "Email inviata con successo!")
        } else {
            toastr.error(data.message || "Errore nell'invio dell'email.")
        }
    } catch (error) {
        toastr.error("Errore di connessione. Riprova.")
    }
}

form.addEventListener("submit", sendEmail)

resendEmailP.addEventListener("click", (event) => {
    if (resend.style.pointerEvents == "none") {
        return
    }
    sendEmail(event)
    resend.style.pointerEvents = "none"
    resend.textContent = "Attendi..."

    setTimeout(() => {
        resend.style.pointerEvents = "auto"
        resend.textContent = "Rimanda Email"
    }, 7000)
})