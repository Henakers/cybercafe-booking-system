var appType = "b23marhe_cyberkafe";
var apiUrl = "../API/booking/";

document.addEventListener("DOMContentLoaded", fetchUserBookings);

/**
 * Creates a customer. Adds a loading animation to the submit button.
 * @param {HTMLButtonElement} submitButton 
 * @returns {Promise<Boolean>} true/false
 */
async function createCustomer(submitButton) {
    // * inputs i "registreringsfomuläret"
    const fName = document.getElementById("register-firstname").value;
    const lName = document.getElementById("register-lastname").value;
    const email = document.getElementById("register-email").value;
    const address = document.getElementById("register-address").value;
    const zip = document.getElementById("register-zip").value;
    const terms = document.getElementById("register-terms").checked;
    const newsletter = document.getElementById("register-newsletter").checked;

    // * sparar i ett objekt
    const input = {
        ID: `0.b23marhe.${fName}.${lName}`,
        firstname: fName,
        lastname: lName,
        email: email,
        address: `${address},${zip}`,
        auxdata: `terms:${terms},newsletter:${newsletter}`,
    }

    // TODO Starta loading animation
    // submitButton -> add loading
    // * koppla mot API
    submitButton && submitButton.classList.add("btn--loading");
    try {
        // efterfrågan till API
        const response = await fetch(`${apiUrl}makecustomer_XML.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(input)
        });

        // hantera resultatet av efterfrågan
        if (!response.ok) throw new Error(response.statusText);
    
        // hämta data i textformat
        const textData = await response.text();
        // parsa till XML
        const xmlData = new DOMParser().parseFromString(textData, "text/xml");
        // hantera XML
        const resultNode = xmlData.querySelector("created");
        if (!resultNode) throw new Error("Fel i XML"); // om nod inte finns
        const statusAttr = resultNode.getAttribute("status");
        console.log("Status: "+statusAttr);
        return statusAttr === "OK";
    } catch (error) {
        console.log(error);
        return false;
    } finally {
        // TODO Avbryt loading animation
        // submitButton -> remove loading
        submitButton && submitButton.classList.remove("btn--loading");
    }
}

/**
 * Handles the login of the customer by checking if the customer's ID is stored in the server.
 * @param {HTMLButtonElement} submitButton
 */
async function fetchUser(submitButton) {
    // * inputs i login form
    const fName = document.getElementById("login-firstname").value;
    const lName = document.getElementById("login-lastname").value;

    // * sparar i ett objekt
    const input = {
        customerID: `0.b23marhe.${fName}.${lName}`
    }

    // TODO Starta loading animation
    // submitButton -> add loading
    // * koppla mot API
    submitButton && submitButton.classList.add("btn--loading");
    try {
        const response = await fetch(`${apiUrl}getcustomer_XML.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(input)
        });

        // hantera resultatet av efterfrågan
        if (!response.ok) throw new Error(response.statusText);
    
        // hämta data i textformat
        const textData = await response.text();
        // parsa till XML
        const xmlData = new DOMParser().parseFromString(textData, "text/xml");
        // hantera XML
        const resultNode = xmlData.querySelector("customer");
        console.log(resultNode);
        if (!resultNode) throw new Error("Fel i XML"); // om nod inte finns
        const customerId = resultNode.getAttribute("id");
        console.log("Customer ID: "+customerId);
        return customerId;
        
    } catch (error) {
        console.log(error);
        return false;

    } finally {
        // TODO Avbryt loading animation
        // submitButton -> remove loading
        submitButton && submitButton.classList.remove("btn--loading");
    }
}

/**
 * Fetches resources from the API using search terms.
 * @param {String} searchString 
 */
async function fetchResources(searchString) {
    if (!searchString) {return false}


    // * matcha mot resources i API
    const input = {
        type: appType,
        resID: searchString,
        name: searchString,
        location: searchString,
        company: searchString,
        category: searchString,
    }

    // TODO Starta loading animation

    // * koppla mot API
    try {
        const response = await fetch(`${apiUrl}getresources_XML.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(input)
        });

        // hantera resultatet av efterfrågan
        if (!response.ok) throw new Error(response.statusText);
    
        // hämta data i textformat
        const textData = await response.text();
        // parsa till XML
        const xmlData = new DOMParser().parseFromString(textData, "text/xml");

        // * hantera XML
        const resultNodes = xmlData.querySelectorAll("resource");
        if (!resultNodes[0]) throw new Error("Fel i XML"); // om nod inte finns

        // objekt som lagrar sökresultat per id
        let searchResult = {}

        // loopa igenom alla hämtade noder
        for (const node of resultNodes) {
            // lagra attribut i ett objekt
            let searchResultAttr = {}
            for (const attr of node.attributes) {
                if (attr.name === "id") continue;
                searchResultAttr[attr.name] = attr.value;
            }
            // lagrar sökresultat i objekt indexerat på resurs-id
            searchResult[node.getAttribute("id")] = searchResultAttr;
        }

        return searchResult;
        
    } catch (error) {
        console.log(error);
        return false;

    } finally {
        // TODO Avbryt loading animation
    }
}

/**
 * Creates a booking for the logged in user, chosen date and chosen resource.
 */
async function createBooking(submitButton) {
    // * inputs i login form
    const date = document.getElementById("booking-date").value;
    const resourceId = document.getElementById("booking-resource-options").value;
    const userId = localStorage.getItem("user-id");
    if (!userId) {return false}
    const status = "2"; // 1 (prel. bokning) eller 2 (betald bokning)
    const position = "1"; // TODO : användaren ska kunna välja plats

    // * matcha mot resources i API
    const input = {
        type: appType,
        resourceID: resourceId,
        date: date,
        dateto: date,
        customerID: userId,
        status : status,
        position : position,
    }

    // TODO Starta loading animation
    submitButton && submitButton.classList.add("btn--loading");
    // * koppla mot API
    try {
        const response = await fetch(`${apiUrl}makebooking_XML.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(input)
        });

        // hantera resultatet av efterfrågan
        if (!response.ok) throw new Error(response.statusText);
    
        // hämta data i textformat
        const textData = await response.text();
        // parsa till XML
        const xmlData = new DOMParser().parseFromString(textData, "text/xml");

        // * hantera XML
        const resultNode = xmlData.querySelector("result");
        if (!resultNode) throw new Error("Fel i XML"); // om nod inte finns

        // om attribut remaining är mindre eller lika med 0
        if (resultNode.getAttribute("remaining") <= 0) throw new Error(`Alla [${resultNode.getAttribute("size")}] platser bokade`);

        alertMsg("Bokade resursen", "success");
        return resultNode.getAttribute("bookingcost") || false;
        
    } catch (error) {
        console.log(error);
        alertMsg("Något gick fel vid bokningen", "error");
        return false;

    } finally {
        // TODO Avbryt loading animation
        submitButton && submitButton.classList.remove("btn--loading");
    }
}


async function fetchUserBookings() {
    // * customerId
    const userId = localStorage.getItem("user-id");
    if (!userId) {return false}

    // * parameters i API
    const input = {
        type: appType,
        customerID: userId,
    }

    // * koppla mot API
    try {
        const response = await fetch(`${apiUrl}getcustomerbookings_XML.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(input)
        });

        // hantera resultatet av efterfrågan
        if (!response.ok) throw new Error(response.statusText);
    
        // hämta data i textformat
        const textData = await response.text();
        // parsa till XML
        const xmlData = new DOMParser().parseFromString(textData, "text/xml");

        // * hantera XML
        const resultNodes = xmlData.querySelectorAll("booking");
        if (!resultNodes[0]) throw new Error("Fel i XML"); // om nod inte finns

        // array som lagrar sökresultat 
        let searchResult = []
        let key = 0;

        // loopa igenom alla hämtade noder
        for (const node of resultNodes) {
            // lagra attribut i ett objekt
            let searchResultAttr = {}
            searchResultAttr["key"] = key;
            for (const attr of node.attributes) {
                searchResultAttr[attr.name] = attr.value;
            }
            searchResult.push(searchResultAttr);
            key++;
        }

        renderUserBookings(searchResult);
        return true;
        
    } catch (error) {
        console.log(error);
        return false;

    } finally {
    }
}
