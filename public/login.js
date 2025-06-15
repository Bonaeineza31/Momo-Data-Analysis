document.addEventListener("DOMContentLoaded", () => {
  const API_BASE_URL = "http://localhost:3000/api/auth" // Base URL for auth endpoints

  const loginForm = document.getElementById("login-form")
  const registerForm = document.getElementById("register-form")
  const toggleAuthModeLink = document.getElementById("toggle-auth-mode")
  const toggleText = document.getElementById("toggle-text")
  const messageDiv = document.getElementById("message")

  let isLoginFormActive = true // State to track which form is active

  // Function to display messages
  function showMessage(msg, type) {
    messageDiv.textContent = msg
    messageDiv.className = `message ${type}`
    messageDiv.style.display = "block"
    setTimeout(() => {
      messageDiv.style.display = "none"
    }, 5000) // Hide after 5 seconds
  }

  // Function to toggle between login and register forms
  toggleAuthModeLink.addEventListener("click", (e) => {
    e.preventDefault()
    if (isLoginFormActive) {
      loginForm.classList.remove("active")
      registerForm.classList.add("active")
      toggleText.textContent = "Already have an account?"
      toggleAuthModeLink.textContent = "Login here"
    } else {
      registerForm.classList.remove("active")
      loginForm.classList.add("active")
      toggleText.textContent = "Don't have an account?"
      toggleAuthModeLink.textContent = "Register here"
    }
    isLoginFormActive = !isLoginFormActive
    messageDiv.style.display = "none" // Hide messages on toggle
  })

  // Handle Login Form Submission
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault()
    const phoneNumber = document.getElementById("login-phone").value.trim()
    const password = document.getElementById("login-password").value.trim()

    if (!phoneNumber || !password) {
      showMessage("Please enter both phone number and password.", "error")
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phoneNumber, password }),
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem("jwtToken", data.token)
        localStorage.setItem("userId", data.userId) // Store userId
        showMessage("Login successful! Redirecting...", "success")
        setTimeout(() => {
          window.location.href = "index.html" // Redirect to dashboard
        }, 1500)
      } else {
        showMessage(data.message || "Login failed. Please check your credentials.", "error")
      }
    } catch (error) {
      console.error("Login error:", error)
      showMessage("An error occurred during login. Please try again.", "error")
    }
  })

  // Handle Register Form Submission
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault()
    const phoneNumber = document.getElementById("register-phone").value.trim()
    const password = document.getElementById("register-password").value.trim()
    const confirmPassword = document.getElementById("confirm-password").value.trim()

    if (!phoneNumber || !password || !confirmPassword) {
      showMessage("All fields are required.", "error")
      return
    }

    if (password !== confirmPassword) {
      showMessage("Passwords do not match.", "error")
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phoneNumber, password }),
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem("jwtToken", data.token)
        localStorage.setItem("userId", data.userId) // Store userId
        showMessage("Registration successful! Redirecting...", "success")
        setTimeout(() => {
          window.location.href = "index.html" // Redirect to dashboard
        }, 1500)
      } else {
        showMessage(data.message || "Registration failed. Phone number might already be in use.", "error")
      }
    } catch (error) {
      console.error("Registration error:", error)
      showMessage("An error occurred during registration. Please try again.", "error")
    }
  })

  // Initial check: if a token exists, redirect to dashboard
  // This prevents showing the login page if already authenticated
  const token = localStorage.getItem("jwtToken")
  if (token) {
    // Optionally, you could verify the token with the backend here
    // For simplicity, we'll just redirect
    window.location.href = "index.html"
  }
})
