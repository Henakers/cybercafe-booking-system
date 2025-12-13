// # DEKLARERA GLOBALA VARIABLER
let canvas = null;
/** @type {CanvasRenderingContext2D} */
let ctx = null;
// grid
const gridColumns = 10
const gridRows = 10
// Array som håller alla objekt
let objects = [];


// # KLASSER (Inspo från Godot)
class Vector2 {
    constructor(x, y) {
        this._x = x;
        this._y = y;
    }
    // getters
    get x() { return this._x; }
    get y() { return this._y; }
    get length() { return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2)); }
    // setters
    set x(v) { this._x = v; }
    set y(v) { this._y = v; }
    normalize() {
        const length = this.length;
        this.x = this.x / length;
        this.y = this.y / length;
    }
}

class Sprite2D {
    constructor(x, y, w, h, {localWidth = 10, localHeight = 10}) {
        // pos
        this._x = x;
        this._y = y;

        // size
        this._w = w;
        this._h = h;

        // local render
        this.localWidth = localWidth;
        this.localHeight = localHeight;

        // velocity
        this._vx = 0;
        this._vy = 0;
        // acceleration
        this._ax = 0;
        this._ay = 0;

        // style
        this._color = "black";
    }
    // * getters
    get x() { return this._x; }
    get y() { return this._y; }
    get w() { return this._w; }
    get h() { return this._h; }
    get vx() { return this._vx; }
    get vy() { return this._vy; }
    get ax() { return this._ax; }
    get ay() { return this._ay; }
    get color() { return this._color; }
    // * setters
    set x(v) { this._x = v; }
    set y(v) { this._y = v; }
    set w(v) { this._w = v; }
    set h(v) { this._h = v; }
    set vx(v) { this._vx = v; }
    set vy(v) { this._vy = v; }
    set ax(v) { this._ax = v; }
    set ay(v) { this._ay = v; }
    set color(v) { this._color = v; }

    // * klick detektering
    isPointInside(x, y) {
        const halfW = this.w / 2;
        const halfH = this.h / 2;

        return (
            x >= this.x - halfW &&
            x <= this.x + halfW &&
            y >= this.y - halfH &&
            y <= this.y + halfH
        );
    }
    clicked() {
        // tom
    }

    // * rendera
    localRender(ctx){
        ctx.rect(-this.localWidth/2, -this.localHeight/2, this.localWidth, this.localHeight);
        ctx.fill();
    }
    render(ctx) {
        ctx.save();

        ctx.beginPath();
        /** @type {CanvasRenderingContext2D} */
        ctx.fillStyle = this.color;
        ctx.translate(this.x, this.y);
        ctx.scale(this.w / this.localWidth, this.h / this.localHeight);
        
        this.localRender(ctx);

        ctx.restore();
    }

    update(dt) {
        // tom
    }
}

class Star extends Sprite2D {
    constructor(x, y, w, h, {localWidth = 10, localHeight = 10}, speed) {
        super(x, y, w, h, {localWidth, localHeight});
        this._speed = speed;
    }
    get speed() { return this._speed; }
    set speed(v) { this._speed = v; }

    clicked() {
        if (this.w > (canvas.width / 15) && this.h > (canvas.width / 15)) {
            // hämta index av objekt i array
            const index = objects.indexOf(this);
            // ta bort objekt från plats
            objects.splice(index, 1);
            console.log(`Exploded star with index: ${index}`);
            return;
        }

        // öka storleken
        const multiplier = 1.5 // öka med 50%
        this.w *= multiplier;
        this.h *= multiplier;
    }

    update(dt) {
        // out of bonds
        // höger
        if (this.x - (this.w / 2) > canvas.width) {
            this.x = 0 - this.w;
        }
        // ned
        if (this.y - (this.h / 2) > canvas.height) {
            this.x = canvas.width - this.x;
        }
        // upp
        if (this.y + (this.h / 2) < 0) {
            this.x = canvas.width - this.x;
        }
        // vänster (safety)
        if (this.x + (this.w / 2) < -10) {
            this.x = 0;
        }

        // hämta vector mot skärmens lägsta mittpunkt
        const focusPoint = new Vector2(canvas.width / 2, canvas.height * 1.2);
        const gVector = new Vector2(focusPoint.x - this.x, focusPoint.y - this.y);

        // normalisera vektorn
        gVector.normalize();

        // hämta vektorn till höger (star direction)
        const starDir = new Vector2(gVector.y, -gVector.x);

        // tilldela velocity x och y från star direction
        this.vx = starDir.x * this.speed;
        this.vy = starDir.y * this.speed;

        // acceleration
        this.vx += this.ax * dt;
        this.vy += this.ay * dt;

        // hastighet
        this.x += this._vx * dt;
        this.y += this._vy * dt;
    }
}

// # FUNKTIONER
function degToRad(deg) {
    return deg * (Math.PI / 180);
}

function createStars(amount) {
    const starMaxSize = 8;
    const PLDcurve = 5; // power-law distribution degree of curve e.g ju brantare kurva desto mer resultat nära noll.

    for (let index = 0; index < amount; index++) {
        // Potenslag för storlekar - fler mindre stjärnor, några få stora.
        const starSize = Math.ceil(Math.pow(Math.random(), PLDcurve) * starMaxSize);

        const speed = Math.max((Math.pow(Math.random(), 5) * 50), 5); // minst 10px/s
        const star = new Star(Math.random() * canvas.width, Math.random() * canvas.height, starSize, starSize, {localWidth: 100, localHeight: 100}, speed);
        star.color = "white";

        objects.push(star);
    }
}

function spaceBg() {
    const background = new Sprite2D(canvas.width / 2, canvas.height / 2, canvas.width, canvas.height, {localWidth: 100, localHeight: 100});

    // färger från CSS variabler
    const style = window.getComputedStyle(document.body);
    const bgColor = style.getPropertyValue("--grey-5");
    const sbgColor = style.getPropertyValue("--background-color");
    // skapa gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(50 / canvas.height, bgColor);
    gradient.addColorStop(1, sbgColor);
    background.color = gradient;

    objects.push(background);
}

function getMousePos(event) {
    // canvas position
    const canvasPos = canvas.getBoundingClientRect();
    // global mouse position
    const gMouseXPos = event.clientX;
    const gMouseYPos = event.clientY;
    // canvas mouse position
    const cMouseXPos = gMouseXPos - canvasPos.left;
    const cMouseYPos = gMouseYPos - canvasPos.top;

    const mousePos = {
        x: cMouseXPos,
        y: cMouseYPos
    };

    return mousePos;
}

/**
 * Handles the logic of the startup of the program.
 */
function ready() {
    /** @type {HTMLCanvasItem} */
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    // dynamisk canvas storlek
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    // dölj bakgrunder
    // document.body.classList.add("no-background");
    document.getElementById("header").classList.add("no-background");

    // background
    spaceBg();

    // klick detektering
    canvas.addEventListener("click", (e) => {

        const mousePos = getMousePos(e);
        //! debugPrint(`Canvas Mouse Pos: [x${mousePos.x}] - [y${mousePos.y}]`);

        // iterera alla objekt från sist renderade till först
        for (let i = objects.length - 1; i >= 0; i--) {
            // vilket element klickades på
            if (objects[i].isPointInside(mousePos.x, mousePos.y)) {
                objects[i].clicked();
                console.log(objects[i]);
                return;
            }
        }

    });

    createStars(200);
}

let firstFrame = Date.now();
let elapsedTime = 0;
let lastFrame = 0;

/**
 * handles the logic of the program. Updates x amount of times per second.
 */
function process(timestamp) {
    // hantering av tid
    if (!lastFrame) lastFrame = timestamp;

    // tid mellan varje frame
    const dt = (timestamp - lastFrame) / 1000;
    lastFrame = timestamp;

    elapsedTime += dt;

    // sudda canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);


    // hantera alla objekt
    for (const obj of objects) {
        // uppdatera element
        obj.update(dt);
        // rendera element
        obj.render(ctx);
    }

    window.requestAnimationFrame(process);
}



// # INITIERA PROGRAMMET (GODOT STYLE)
document.addEventListener("DOMContentLoaded", () => {

    // * initiera programmet
    ready();

    // * starta programmet (loop)
    window.requestAnimationFrame(process);
});




