// kör funktioner endast om DOM är laddat
document.addEventListener("DOMContentLoaded", () => {
    // # LOCAL STORAGE
    // öppnar sök utan animation och fokus
    if (localStorage.getItem("search-state") == "open") {
        const noAnimation = true
        openSearchField(noAnimation);
    }

    // # VARIABLER
    const searchInputElement = document.getElementById("search-input");
    const searchButtonElement = document.getElementById("search");
    const searchClearButtonElement = document.getElementById("search-clear");

    // # SÖK EVENTS
    // [Event] knapp tryckning - sök med "enter"-knappen
    searchInputElement.addEventListener("keydown", event => {
        if (!event.repeat && event.key === "Enter") {
            submitSearch();
        }
    });
    // [Event] tappar fokus på sök-input (blur) - göm sökreslutat
    // TODO sätt blur på search-wrapper (parent) elementet istället - för att man inte ska dölja sökresultat om man klickar på det.
    searchInputElement.addEventListener("blur", () => {
        hideSearchResult();
    });
    // [Event] fokus på sök-input - visa sökresultat
    searchInputElement.addEventListener("focus", (e) => {
        if (e.currentTarget.value === "") {
            // göm sökresultat
            hideSearchResult();
        }else{
            // genomför sökning
            submitSearch();
        }
    });
    // [Event] klick på sök-knapp - genomför sök / öppna sök
    searchButtonElement.addEventListener("click", event => {
        if(event.currentTarget.classList.contains("active")){
            // genomför sök
            submitSearch();
        }else{
            // öppna sök
            openSearchField();
        }
    });
    // [Event] klick på clear-knappen i sökfältet - rensa sökfältet / stäng sökfältet
    searchClearButtonElement.addEventListener("click", () => {
        if(searchInputElement.value){
            // rensa sökfältet och local storage
            searchInputElement.value = "";
            localStorage.removeItem("search-input");
        }else{
            // stäng sökfältet
            closeSearchField();
        }
        hideSearchResult();
    });

    // [Event] ändring i sökfältet - göm resultat om tomt
    searchInputElement.addEventListener("input", (e) => {
        if (e.currentTarget.value === "") {
            // göm sökresultat
            hideSearchResult();
        }else{
            // genomför sökning
            submitSearch();
        }
    });
    
});


/**
 * Handles opening of the search field
 * @param {boolean} noAnimationOpening
 */
function openSearchField(noAnimationOpening) {
    // elements
    const searchBtn = document.getElementById("search");
    const inputElement = document.getElementById("search-input");
    const closeBtn = document.getElementById("search-clear");
    
    // öppna utan animation
    if (noAnimationOpening) {
        searchBtn.classList.remove("closing");
        inputElement.classList.remove("closing");
        closeBtn.classList.remove("closing");
        // inputElement
        inputElement.classList.add("active");
        // searchBtn
        searchBtn.classList.add("active");
        // closeBtn
        closeBtn.classList.add("active");

        debugPrint(`search field opened from local storage`);
        return;
    }

    // Namngivna funktioner som med temporära event lyssnare kollar när animationen är klar och tar sedan bort sig själva: https://stackoverflow.com/questions/4402287/how-can-i-remove-a-javascript-event-listener.
    const handleOpeningAnimation = () => {
        // inputElement
        inputElement.classList.remove("opening");
        inputElement.classList.add("active");
        // searchBtn
        searchBtn.classList.remove("opening");
        searchBtn.classList.add("active");
        // closeBtn
        closeBtn.classList.remove("opening");
        closeBtn.classList.add("active");

        inputElement.removeEventListener("animationend", handleOpeningAnimation);
    };

    searchBtn.classList.remove("closing");
    inputElement.classList.remove("closing");
    closeBtn.classList.remove("closing");
    // öppnar sök elementen
    searchBtn.classList.add("opening");
    inputElement.classList.add("opening");
    closeBtn.classList.add("opening");
    // väntar på att animationen är klar
    inputElement.addEventListener("animationend", handleOpeningAnimation);

    // Sätter fokus på sök inputen
    inputElement.focus();

    // lägger  till i localstorage att sökfältet är öppet
    localStorage.setItem("search-state", "open");
}

function closeSearchField(){
    // elements
    const searchBtn = document.getElementById("search");
    const inputElement = document.getElementById("search-input");
    const closeBtn = document.getElementById("search-clear");
    
    // Namngivna funktioner som med temporära event lyssnare kollar när animationen är klar och tar sedan bort sig själva: https://stackoverflow.com/questions/4402287/how-can-i-remove-a-javascript-event-listener.
    const handleClosingAnimation = () => {
        // inputElement
        inputElement.classList.remove("closing");
        inputElement.classList.remove("active");
        // searchBtn
        searchBtn.classList.remove("closing");
        searchBtn.classList.remove("active");
        // closeBtn
        closeBtn.classList.remove("closing");
        closeBtn.classList.remove("active");

        inputElement.removeEventListener("animationend", handleClosingAnimation);
    };

    searchBtn.classList.remove("opening");
    inputElement.classList.remove("opening");
    closeBtn.classList.remove("opening");

    // Starta stängningsanimationer endast om elementen är aktiva
    inputElement.classList.add("closing");
    searchBtn.classList.add("closing");
    closeBtn.classList.add("closing");
    inputElement.addEventListener("animationend", handleClosingAnimation);

    // tar bort sökvärdet ur local storage
    localStorage.removeItem("search-state");
    localStorage.removeItem("search-input");

    // ! Debug/info
    debugPrint("Stängde sökfältet");
}

function addDividerToParent(parent) {
    // lägg till divider
    const div = document.createElement("div");
    div.classList.add("search-wrapper__divider");
    parent.appendChild(div);
}

function submitSearch(){
    const searchInput = document.getElementById("search-input");
    const searchString = searchInput.value;

    // om tom -> genomför ej sökning
    if (!searchString) {return}

    // hämtar sökresultat från API
    fetchResources(searchString).then(searchResult => {
        // visar sökresultat
        showSearchResult(searchResult);
    });

    // spara sökterm i local storage
    localStorage.setItem(searchInput.id, searchString);
}

/**
 * Shows the search result only when there is text in the search input.
 * @param {*} searchResult 
 */
function showSearchResult(searchResult) {
    const searchResultElement = document.getElementById("search-result");
    const inputField = document.getElementById("search-input");

    // återställ sökresultat fältet
    searchResultElement.innerHTML = "";

    // styla element för resultat
    searchResultElement.classList.add("result");
    inputField.classList.add("result");

    // om resultat är tom eller falsy
    if (Object.keys(searchResult).length === 0 || !searchResult) {
        // divider
        addDividerToParent(searchResultElement);

        // ingen träff
        const div = document.createElement("div");
        div.classList.add("search-wrapper__no-result");
        div.textContent = "ingen träff";
        searchResultElement.appendChild(div);
        console.log("ingen träff");
        return;
    }

    // divider
    addDividerToParent(searchResultElement);

    // * visa sökresultat i en table
    // table
    const table = document.createElement("table");
    table.classList.add("table");
    table.classList.add("table--search-result");
    // lägg till table som child i result
    searchResultElement.appendChild(table);

    for (const [resourceId, attributes] of Object.entries(searchResult)) {
        // table row - en för varje resurs
        const tableRow = document.createElement("tr");
        tableRow.classList.add("table__row--search-result");
        // lägg till tr i table
        table.appendChild(tableRow);
        
        // table cell - håller info för respektive resurs
        const tdEmpty = document.createElement("td");
        // lägg till cell i tr
        tableRow.appendChild(tdEmpty);

        // vertical table
        const verticalTable = document.createElement("table");
        verticalTable.classList.add("table");
        verticalTable.classList.add("table--vertical");
        // lägg till vtable i cell
        tdEmpty.appendChild(verticalTable);

        // # id row
        // vertical table row - en för respektive attribut
        const vTableRow = document.createElement("tr");
        // lägg till row i vtable
        verticalTable.appendChild(vTableRow);

        // vertical table cell header
        const tdHeader = document.createElement("th");
        tdHeader.classList.add("table__cell");
        tdHeader.classList.add("table__cell--vertical");
        tdHeader.classList.add("table__cell--vertical-header");
        tdHeader.textContent = "resourceID";
        // lägg till header i row
        vTableRow.appendChild(tdHeader);

        // vetical table cell
        const tdCell = document.createElement("td");
        tdCell.classList.add("table__cell");
        tdCell.classList.add("table__cell--vertical");
        tdCell.textContent = resourceId;
        // lägg till cell i row
        vTableRow.appendChild(tdCell);

        // # resten av alla rader

        for (const [key, value] of Object.entries(attributes)) {
            // vertical table row - en för respektive attribut
            const vTableRow = document.createElement("tr");
            // lägg till row i vtable
            verticalTable.appendChild(vTableRow);

            // vertical table cell header
            const tdHeader = document.createElement("th");
            tdHeader.classList.add("table__cell");
            tdHeader.classList.add("table__cell--vertical");
            tdHeader.classList.add("table__cell--vertical-header");
            tdHeader.textContent = key;
            // lägg till header i row
            vTableRow.appendChild(tdHeader);

            // vetical table cell
            const tdCell = document.createElement("td");
            tdCell.classList.add("table__cell");
            tdCell.classList.add("table__cell--vertical");
            tdCell.textContent = value;
            // lägg till cell i row
            vTableRow.appendChild(tdCell);
        }
    }
}

/**
 * Hides the search result when closing or out of focus
 */
function hideSearchResult() {
    const searchResult = document.getElementById("search-result");
    const inputField = document.getElementById("search-input");

    searchResult.classList.remove("result");
    inputField.classList.remove("result");
}