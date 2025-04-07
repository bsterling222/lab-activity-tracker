document.addEventListener('DOMContentLoaded', () => {

// References to DOM elements
    const loginForm = document.getElementById('login-form');
    const userInput = document.getElementById('user-initials');
    const loginSection = document.getElementById('login-section');
    const mainMenu = document.getElementById('main-menu');
    const logoutButton = document.getElementById('logout-button');
    const solutionsSection = document.getElementById('solutions')
    const RuHexSection = document.getElementById('RuHex-button')
    const FerriSection = document.getElementById('Ferri-button')
    const DASection = document.getElementById('DA-button')
    const NESection = document.getElementById('NE-button')
    const EPSection = document.getElementById('EP-button')
    const AASection = document.getElementById('AA-button')
    const newSolutionSection = document.getElementById('makeSolutionButton')
    const backToMenuButton = document.getElementById("backToMenuButton")

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

// Hide Login Menu and Show Main Menu
        loginSection.style.display = "none";
        mainMenu.style.display = "block";  
    });

// Logout Button Listener
    logoutButton.addEventListener('click', () => {

// Clears the stored initials
        sessionStorage.removeItem('userinitials');

// Hide Main Menu and Show Login Form
        mainMenu.style.display = "none";
        loginSection.style.display = "block";
        
// Clear Input
        userInput.value = "";
    });

// Solutions Section 
    solutionsButton.addEventListener('click',() => {
        solutions.style.display = "block";
        mainMenu.style.display = 'none';
    });
    
// RuHex Section 
    RuHexSection.addEventListener('click',() => {
        RuHexSection.style.display = "block";
        solutionsSection.style.display = 'none';
    });

// Ferricyanide Section 
    FerriSection.addEventListener('click',() => {
        FerriSection.style.display = "block";
        solutionsSection.style.display = 'none';
    });

// Dopamine Section 
    DASection.addEventListener('click',() => {
        DASection.style.display = "block";
        solutionsSection.style.display = 'none';
    });

// Norepinephrine Section 
    NESection.addEventListener('click',() => {
        NESection.style.display = "block";
        solutionsSection.style.display = 'none';
    });

// Epinephrine Section 
    EPSection.addEventListener('click',() => {
        EPSection.style.display = "block";
        solutionsSection.style.display = 'none';
    });

// Ascorbic Acid Section 
    AASection.addEventListener('click',() => {
        AASection.style.display = "block";
        solutionsSection.style.display = 'none';
    });

// New Solutions Section 
    newSolutionSection.addEventListener('click',() => {
        mainMenu.style.display = "block";
        solutionsSection.style.display = 'none';
    });
// Back to Main Menu Button 
    backToMenuButton.addEventListener('click',() => {
        mainMenu.style.display = "block";
        solutionsSection.style.display = 'none';
    });
});