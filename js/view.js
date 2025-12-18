// kör funktioner endast om DOM är laddat
document.addEventListener("DOMContentLoaded", () => {

    // # LADDA IN SIDA & MODAL FRÅN LOCAL STORAGE
    const savedPage = localStorage.getItem("user-current-page") || "page-home";
    const savedModal = localStorage.getItem("user-current-modal") || null;
    showPage(savedPage, false, savedModal);

    // # LADDA IN CUSTOMERID FRÅN LOCALSTORAGE
    const customerId = localStorage.getItem("user-id");
    customerId ? loggedInView() : loggedOutView();

    // # MODAL EVENTS
    // [Event] klicka på knapp - öppna modal
    let modalOpenBtns = document.getElementsByClassName("modal-open");
    for (let modalOpenBtn of modalOpenBtns) {
        // lägger till en event listener på alla knappar
        modalOpenBtn.addEventListener("click", event => {
            // visar aktuell sida med modal
            let currentPage = localStorage.getItem("user-current-page") || "page-home";
            showPage(currentPage, false, event.currentTarget.value);
        });
    }
    // [Event] klicka på knapp - stäng modal
    let modalCloseBtns = document.getElementsByClassName("modal__close");
    for (let modalCloseBtn of modalCloseBtns) {
        // lägger till en event listener på alla knappar
        modalCloseBtn.addEventListener("click", event => {
            // visar aktuell sida utan någon modal
            let currentPage = localStorage.getItem("user-current-page") || "page-home";
            showPage(currentPage, false, null);
        });
    }

    // # LOGOUT
    document.getElementById("logout-button").addEventListener("click", () => {
        localStorage.removeItem("user-id");
        loggedOutView();
    });

});

/**
 * Hides all elements with the class "page" and only shows the page which has the corresponding id sent in the parameter.
 * @param {String} pageid
 * @param {Boolean} isPopStateEvent
 * @param {String} modalId
 */
function showPage(pageid, isPopStateEvent = false, modalId = null) {
    // hämtar alla element med klassen "page"
    let pages = document.getElementsByClassName("page");
    // Sätter alla till display none
    for (let page of pages) {
        page.style.display = "none";
    }

    // styla aktiv nav-knapp
    let ghostBtns = document.getElementsByClassName("btn--ghost");
    for (let ghostBtn of ghostBtns) {
        if (ghostBtn.value === pageid){
            ghostBtn.classList.add("active");
        }else{
            ghostBtn.classList.remove("active");
        }
    }
    
    // Visa vald sida
    const currentPage = document.getElementById(pageid);
    currentPage.style.display = "flex";

    // hantera modaler
    closeAllOpenModals();
    if (modalId) {
        openModal(modalId);
    }

    // spara den aktuella sidan i local storage
    localStorage.setItem("user-current-page", pageid);

    // historik hantering
    if (!isPopStateEvent) {
        history.pushState({ page: pageid, modal: modalId }, "Titel: "+pageid, "");
        // // debugPrint(`Sparade state för sida: [${pageid}] och modal: [${modalId}]`);
    }
}

/**
 * Opens the modal with the matching id.
 * @param {String} modalId
 */
function openModal(modalId) {
    // om modalId är tomt, returnera
    if (!modalId) {return}

    // hämtar modal med id
    const modal = document.getElementById(modalId);
    modal.showModal();

    // spara i local storage vilken modal som är öppnad
    localStorage.setItem("user-current-modal", modalId);
}

/**
 * Closes the modal with the matching id
 * @param {String} modalId
 */
function closeModal(modalId){
    // om modalId är tomt, returnera
    if (!modalId) {
        return;
    }

    // hämtar modal
    const modal = document.getElementById(modalId);
    modal.close();

    // ta bort modal från local storage
    localStorage.removeItem("user-current-modal");
}

function closeAllOpenModals() {
    const modals = document.getElementsByClassName("modal");
    for (const modal of modals) {
        modal.open && modal.close();
    }
    // ta bort modal från local storage
    localStorage.removeItem("user-current-modal");
}

/**
 * Handles the functions for displaying elements shown for a customer that has logged in. Hides those that are for a registering customer.
 */
function loggedInView() {
    // * ska visas
    const profileBtn = document.getElementById("profile-button");
    profileBtn.style.display = "flex";
    const logoutBtn = document.getElementById("logout-button");
    logoutBtn.style.display = "flex";

    // * ska döljas
    const authButtons = document.getElementById("auth-buttons");
    authButtons.style.display = "none";
}

/**
 * Display the elements for a customer not logged in and hides those for a logged in customer.
 */
function loggedOutView() {
    // * ska visas
    const profileBtn = document.getElementById("profile-button");
    profileBtn.style.display = "none";
    const logoutBtn = document.getElementById("logout-button");
    logoutBtn.style.display = "none";

    // * ska döljas
    const authButtons = document.getElementById("auth-buttons");
    authButtons.style.display = "flex";
}

/**
 * Displays an alert message.
 * @param {*} msg 
 * @param {*} status 
 */
function alertMsg(msg = "något gick fel!", status = "error") {
    // alert element
    const alert = document.createElement("div");
    alert.classList.add("alert");
    // status: error, success, warning
    alert.classList.add(`alert--${status}`);
    
    // alert icon
    const alertIcon = document.createElement("div");
    alertIcon.classList.add("material-icons");
    alertIcon.classList.add("alert__icon");
    alertIcon.textContent = status === "success" ? "check" : status;
    alert.appendChild(alertIcon);

    // alert message
    const alertMsg = document.createElement("div");
    alertMsg.classList.add("alert__message");
    alertMsg.textContent = msg;
    alert.appendChild(alertMsg);

    // alert close btn
    const closeBtn = document.createElement("div");
    closeBtn.classList.add("material-icons");
    closeBtn.classList.add("alert__close");
    closeBtn.textContent = "close";
    closeBtn.addEventListener("click", () => {
        closeAllAlerts();
    });
    alert.appendChild(closeBtn);

    
    document.body.appendChild(alert);

    setTimeout(() => {
        alert.remove();
    }, 3000);
}

function closeAllAlerts() {
    // hämta alla alerts i en array
    const alertElements = Array.from(document.getElementsByClassName("alert"));
    alertElements.forEach(element => {
        element.remove();
    });
}

// hack hitmarker click
// document.addEventListener("click", () => {
//     document.documentElement.style.cursor = 'url("../assets/images/hitmarker.png") 16 16, crosshair';
//     var audio = new Audio('../assets/audio/hitmarker_audio.mp3');
//     audio.volume = 0.1;
//     audio.play();

//     window.setTimeout(() => {document.documentElement.style.cursor = "default"}, 100);
// });