toastr.options = {
    "positionClass": "toast-bottom-right",
    "closeButton": true,
    "progressBar": true,
    "timeOut": "5000",
    "extendedTimeOut": "2000",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut"
}


function togglePasswordVisibility(inputField, toggleIcon) {
    const type = inputField.getAttribute('type') === 'password' ? 'text' : 'password'
    inputField.setAttribute('type', type)
    toggleIcon.classList.toggle('fa-eye-slash')
}

function checkPasswords(passwordField, confirmPasswordField, messageElement, submitButton) {
    if (passwordField.value !== confirmPasswordField.value && confirmPasswordField.value != "") {
        messageElement.style.display = 'block'
        submitButton.disabled = true
        passwordField.classList.add('input-error')
        confirmPasswordField.classList.add('input-error')
    } else {
        messageElement.style.display = 'none'
        submitButton.disabled = false
        passwordField.classList.remove('input-error')
        confirmPasswordField.classList.remove('input-error')
    }
}