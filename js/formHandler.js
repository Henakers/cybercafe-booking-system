// kör funktioner endast om DOM är laddat
document.addEventListener("DOMContentLoaded", () => {

    // # LOCAL STORAGE
    const inputs = document.querySelectorAll("input");
    for (const input of inputs) {
        
        // spara och ladda in local storage för varje input per typ
        switch (input.getAttribute("type")) {
            case "checkbox":
                // [Event] input - spara i local storage
                input.addEventListener("input", (e) => {
                    localStorage.setItem(e.currentTarget.id, e.currentTarget.checked);
                });

                // hämta local storage
                localStorage.getItem(input.id) === "true" ? input.checked = true : input.checked = false;
                break;

            case "range":
                // [Event] ändring - spara i local storage (input event överbelastade hemsidan med local storage sparning)
                input.addEventListener("change", (e) => {
                    localStorage.setItem(e.currentTarget.id, e.currentTarget.value);
                });

                // hämta local storage
                input.value = localStorage.getItem(input.id);
                displayZipValue(localStorage.getItem(input.id));
                break;

            case "date":
                // [Event] input - spara i local storage
                input.addEventListener("input", (e) => {
                    // om värdet är tomt i input så ta bort local storage platsen
                    e.currentTarget.value ? localStorage.setItem(e.currentTarget.id, e.currentTarget.value) : localStorage.removeItem(e.currentTarget.id); 
                });

                // hämta local storage
                input.value = localStorage.getItem(input.id);
                // om tom i local storage - välj dagens datum
                if (!input.value){
                    input.valueAsNumber = new Date();
                }
                break;
        
            default:
                // [Event] input - spara i local storage
                input.addEventListener("input", (e) => {
                    // om värdet är tomt i input så ta bort local storage platsen
                    e.currentTarget.value ? localStorage.setItem(e.currentTarget.id, e.currentTarget.value) : localStorage.removeItem(e.currentTarget.id); 
                });

                // hämta local storage
                input.value = localStorage.getItem(input.id);
                break;
        }
    }

    // # VALIDERING
    for (const input of inputs) {
        // tilldela inte en validering på sökfältet
        if (input.id === "search-input") {
            continue;
        }

        // tilldela inte validering på checkbox
        if (input.getAttribute("type") === "checkbox") {
            continue;
        }

        // [Event] vid användarinput - validera value
        input.addEventListener("input", validate);
        // [Event] vid fokus av element - validera value
        input.addEventListener("focus", validate);
    }

    // # REGISTER-FORM INPUTS
    // register-zip
    const zipInput = document.getElementById("register-zip");
    if (zipInput) {
        zipInput.addEventListener("input", (e) => {
            displayZipValue(e.currentTarget.value)
        });
    }
    // # REGISTER-FORM SUBMIT
    document.getElementById("register-submit").addEventListener("click", e => {
        // error message element
        const errorMsgElement = document.getElementById("register-form-error-message");
        // form element
        const formElement = e.currentTarget.parentNode;
        // submit button
        const submitButton = e.currentTarget;
        
        // om inputs är korrekt
        if (validateForm(formElement, errorMsgElement)) {
            // skapa användare
            createCustomer(submitButton).then(result => {
                // om success
                if (result) {
                    // tömmer och stänger registerformulär
                    resetForm(inputs);
                    closeAllOpenModals();
                    alertMsg("Registrerade användare", "success");
                }else{
                    alertMsg("Något gick fel", "error");
                }
            });
        }
    });

    // # LOGIN-FORM SUBMIT
    document.getElementById("login-submit").addEventListener("click", e => {
        // error message element
        const errorMsgElement = document.getElementById("login-form-error-message");
        // form element
        const formElement = e.currentTarget.parentNode;
        // submit button
        const submitButton = e.currentTarget;

        // om inputs är ok
        if (validateForm(formElement, errorMsgElement)) {
            // logga in
            fetchUser(submitButton).then(userId => {
                // om success
                if (userId) {
                    // Sparar inloggade användaren i local storage
                    localStorage.setItem("user-id", userId);
                    // ändrar vyn för inloggning
                    loggedInView();
                    // tömmer och stänger inloggningsformulär
                    resetForm(inputs);
                    closeAllOpenModals();
                    alertMsg("Loggade in", "success");
                }else{
                    alertMsg("Något gick fel", "error");
                }

            });
        }

    });

    // # BOOK-FORM
    // ladda in resurser i dropdown
    displayResourceOptions();
    const bookingSelectElement = document.getElementById("booking-resource-options");
    bookingSelectElement.addEventListener("change", (event) => {
        console.log(event.target.value);
    });
    // skicka bokningen till API
    document.getElementById("booking-submit").addEventListener("click", (event) => {
        createBooking();
    });


});

/**
 * Checks if all inputs with the attribute "required" is filled. Returns false if at least one is empty.
 * @param {*} params 
 */
function isRequiredInputEmpty(input) {
    // om någon input är tom returnera false
    if (input.hasAttribute("required")) {
        if (input.getAttribute("type") === "checkbox" && !input.checked) {
            return true;
        }else if (!input.value){
            return true;
        }
    }

    // alla inputs med required är ifyllda
    return false;
}

/**
 * Fetches the regexp pattern and error message for the id of the inserted input element
 * @param {string} elementId 
 * @returns {Object}
 */
function getValidateSettings(elementId) {
    let regexpPattern = /.+/;
    let errorMessage = "något gick fel";

    // fyll på med regexp patterns för respektive input
    // använder https://regexr.com/ för att testa regexp patterns
    switch (elementId) {
        case "register-firstname":
            regexpPattern = /^[a-zåäö]{2,15}$/i;
            errorMessage = "Endast bokstäver (minst 2, max 15)";
            break;
        case "login-firstname":
            regexpPattern = /^[a-zåäö]{2,15}$/i;
            errorMessage = "Endast bokstäver (minst 2, max 15)";
            break;

        case "register-lastname":
            regexpPattern = /^[a-zåäö]{2,15}$/i;
            errorMessage = "Endast bokstäver (minst 2, max 15)";
            break;
        case "login-lastname":
            regexpPattern = /^[a-zåäö]{2,15}$/i;
            errorMessage = "Endast bokstäver (minst 2, max 15)";
            break;

        case "register-email":
            // använder en look-ahead group för att kolla inga dubbel-punkter (..)
            regexpPattern = /^(?!.*\.\.)(?!.*\.@)[a-z][a-z\d.]{2,30}@[a-z\d]{1,15}\.[a-z]{2,4}$/;
            errorMessage = "Endast bokstäver (a-z), siffror (0-9) och punkt (.) är tillåtna.";
            break;

        case "register-address":
            // gatuadress + husnummer + ev. lgh nummer
            regexpPattern = /^[a-zåäö]{2,25} [a-zåäö\d]{1,5}(?: [\d]{1,5})?$/i;
            errorMessage = "Rätt format: gatuadress husnummer ev. lgh nummer";
            break;


        case "register-zip":
            regexpPattern = /^(?:[1-8][0-9]{4})$/;
            errorMessage = "Fel: endast mellan 100 00 - 900 00";
            break;
        default:
            break;
    }
    
    return {
        regexpPattern: regexpPattern,
        errorMessage: errorMessage,
    }
}

/**
 * Validates the input according to the validate settings and returns true if value is valid, false if not valid.
 * @param {*} eventOrElement
 * @returns {Boolean}
 */
function validate(eventOrElement) {
    // om parametern är ett event, hämta dess element
    const inputElement = eventOrElement instanceof Event ? eventOrElement.currentTarget : eventOrElement;
    
    // om tom, validera ej
    if (!inputElement.value) {
        removeErrorMessage(inputElement);
        return true;
    }

    // hämta regex och felmeddelande för input id
    const validateSettings = getValidateSettings(inputElement.id);
    const regexpPattern = validateSettings.regexpPattern;
    const errorMessage = validateSettings.errorMessage;

    // avbryt om värdet uppfyller valideringen
    if (inputElement.value.match(regexpPattern) != null) {
        removeErrorMessage(inputElement);
        return true;
    }

    // visa error meddelande
    displayErrorMessage(inputElement, errorMessage);
    return false;
}

function displayZipValue(value) {
    if (!value) {
        return;
    }
    let newValue = value.slice(0, 3) + " " + value.slice(3, 5);

    const valueElement = document.getElementById("register-zip-value");
    if (valueElement) {
        valueElement.textContent = newValue;
    }
}

/**
 * Displays an error message below the parent of the input element
 * @param {HTMLInputElement} inputElement
 * @param {string} [errorMessage="Fel inmatning"] 
 */
function displayErrorMessage(inputElement, errorMessage="Fel inmatning") {
    const parent = inputElement.parentNode;

    // ta bort error message om det finns - risk för duplicering annars
    removeErrorMessage(inputElement);

    // Skapa error message elementet
    const errorMessageElement = document.createElement("div");
    errorMessageElement.textContent = errorMessage;
    errorMessageElement.classList.add("modal__error-message");

    parent.insertBefore(errorMessageElement, inputElement);

    // visa error på range inputs
    if (inputElement.getAttribute("type") === "range") {
        document.getElementById("register-zip-value").classList.add("error");
        return;
    }
    // visa outline error på "text" fält
    inputElement.classList.add("error");
}

/**
 * Remove an error message below the parent of the input element
 * @param {HTMLInputElement} inputElement
 */
function removeErrorMessage(inputElement) {
    const parent = inputElement.parentNode;

    const errorMessageElement = parent.querySelectorAll(".modal__error-message");
    for (const element of errorMessageElement) {
        element.remove();
    }

    // visa error på range inputs
    if (inputElement.getAttribute("type") === "range") {
        document.getElementById("register-zip-value").classList.remove("error");
        return;
    }
    // ta bort outline error på alla inputs
    inputElement.classList.remove("error");
}

/**
 * Validates input fields in a parent element.
 * @param {HTMLElement} formElement 
 * @param {HTMLElement} errorMsgElement 
 */
function validateForm(formElement, errorMsgElement) {
    // hämta alla inputs i form
    let registerInputs = formElement.querySelectorAll("input");
    // konvertera NodeList till array
    registerInputs = Array.from(registerInputs);

    // * använder "some()" för att hämta första instansen av en inputs validering
    // om minst ett required input är tomt
    let isReqEmpty = registerInputs.some(input => isRequiredInputEmpty(input));
    // om minst ett input innehåller fel
    let isInputInvalid = registerInputs.some(input => !validate(input));
    
    if (isReqEmpty && isInputInvalid) {
        errorMsgElement.innerHTML = "<p>Fel: Alla fält med asterisk (*) måste fyllas i.</p>";
        errorMsgElement.innerHTML += "<p>Fel: Minst ett fält som inte uppfyller valideringen.</p>";
        return false;
    }

    if (isReqEmpty){
        errorMsgElement.innerHTML = "<p>Fel: Alla fält med asterisk (*) måste fyllas i.</p>";
        return false;
    } 
    
    if (isInputInvalid){
        errorMsgElement.innerHTML = "<p>Fel: Minst ett fält som inte uppfyller valideringen.</p>";
        return false;
    }
    
    errorMsgElement.innerHTML = "";
    return true;
}

/**
 * Resets the form and triggers the input events input and change.
 * @param {Array} inputs 
 */
function resetForm(inputs) {
    for (const input of inputs) {        
        // reset för alla olika typer av inputs range/checkbox/etc
        switch (input.getAttribute("type")) {
            case "checkbox":
                input.checked = false;
                input.dispatchEvent(new Event("input"));
                break;

            case "range":
                input.value = "50000";
                displayZipValue(localStorage.getItem(input.id));
                input.dispatchEvent(new Event("change"));
                break;
        
            default:
                input.value = "";
                input.dispatchEvent(new Event("input"));
                break;
        }
    }
}

/**
 * Displays all resources with id containing "CK" (hopefully all recources) in a dropdown.
 */
function displayResourceOptions() {
    const selectElement = document.getElementById("booking-resource-options");

    // hämtar alla resurser med id -> CK
    fetchResources("CK").then((result) => {
        // om resultat är tom eller falsy
        if (Object.keys(result).length === 0 || !result) {
            // inga resurser att välja
            const optionElement = document.createElement("option");
            optionElement.textContent = "Inga resurser tillgängliga";
            optionElement.disabled = true;
            selectElement.appendChild(optionElement)
            return;
        }

        // lägger till en option för varje resurs
        for (const [key, attributes] of Object.entries(result)) {
            const optionElement = document.createElement("option");
            optionElement.value = key;
            optionElement.textContent = `<${attributes.name}> ${attributes.company} - ${attributes.location}`;
            selectElement.appendChild(optionElement)
        }
    });
}

/**
 * Renders a loading animation (GIF) inside the button.
 * @param {HTMLButtonElement} button 
 */
function renderLoadingAnimation(button) {
    // TODO
    // sparar text i till value attribut

    // rensar text i

    // visar loading animation
}


function openDate(){
    const e = document.getElementById("date-picker");
    e.showPicker();
}