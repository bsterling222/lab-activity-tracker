document.addEventListener('DOMContentLoaded', () => {

// References to DOM elements
    const loginForm = document.getElementById('login-form');
    const userInput = document.getElementById('user-initials');
    const loginSection = document.getElementById('login-section');
    const mainMenu = document.getElementById('main-menu');
    const logoutButton = document.getElementById('logout-button')

// Login form Submission Handling
    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const initials = userInput.value.trim().toUpperCase();

        if (initials === ""){
            alert("Please enter your initals.");
            return;
        }
        
// Save Initials to sessionStorage for now
        sessionStorage.setItem('userInitials', initials);

//Hide Login Menu and Show Main Menu
        loginSection.style.display = "none";
        mainMenu.style.display = "block";  
    });

//Logout Button Listener
    logoutButton.addEventListener('click', () => {

// Clears the stored initials
        sessionStorage.removeItem('userinitials');

// Hide Main Menu and Show Login Form
        mainMenu.style.display = "none";
        loginSection.style.display = "block";
        
// Clear Input
        userInput.value = "";
    });
});