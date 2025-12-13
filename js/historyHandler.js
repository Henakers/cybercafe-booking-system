// Hantering av historik
window.addEventListener("popstate", (event) => {
    if (!event) {return}

    historyChange(event);
});

/**
 * Handles the change in history made by the user history.
 * @param {PopStateEvent} event 
 */
function historyChange(event) {
    if (!event.state) {
        return;
    }

    const isPopStateEvent = true;
    const stateObject = event.state

    showPage(stateObject.page, isPopStateEvent, stateObject.modal);
}