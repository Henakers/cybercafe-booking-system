/** Skriver ut text i en ruta på hemsidan för debugging.
 *  @param {String} text
 * @param {Boolean} noNewRow
 */
function debugPrint(text, validate){
    return;
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
    return;
    document.getElementById("print-area").innerHTML = "";
}