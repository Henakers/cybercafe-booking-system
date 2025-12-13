/** Skriver ut text i en ruta på hemsidan för debugging.
 *  @param {String} text
 * @param {Boolean} noNewRow
 */
function debugPrint(text, validate){
    const printerElement = document.getElementById("print-area")
    switch (validate) {
        case "success":
            printerElement.innerHTML += `<span style='color: var(--success);'>${text}</span>`;
            break;
        case "error":
            printerElement.innerHTML += `<span style='color: var(--error);'>${text}</span>`;
            break;
        default:
            printerElement.innerHTML += `${text}`;
            break;
    }
    printerElement.innerHTML += `<br>`;
}
function clearPrinter(){
    document.getElementById("print-area").innerHTML = "";
}

function openDate(){
    const e = document.getElementById("date-picker");
    e.showPicker();
}