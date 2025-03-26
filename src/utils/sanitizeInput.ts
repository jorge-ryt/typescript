//@ts-nocheck
// Sanitize text input against XSS
export function sanitizeInput(input) {
    return input.replace(/[^a-zA-Z0-9 ]/g, "");
}

export function validateEmail(email) {
    return email.replace(/[^a-zA-Z0-9@._]/g, "");
}