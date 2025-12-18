// # DEKLARERA GLOBALA VARIABLER
let canvas = null;
/** @type {CanvasRenderingContext2D} */
let ctx = null;
// grid
const gridColumns = 10
const gridRows = 10
// Array som håller alla objekt
let objects = [];
// bilder
const starImage = new Image();
starImage.src = "assets/images/star100px.png";


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
    constructor(x, y, w, h, frames, { localWidth = 10, localHeight = 10 }) {
        // pos
        this._x = x;
        this._y = y;

        // size
        this._w = w;
        this._h = h;

        // local render
        this.frames = frames;
        this._frame = 0;
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
        // animation
        this.framesPerSecond = 12;
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
    get frame() { return this._frame; }
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
    set frame(v) {
        // om frame är större än antal frames, wrappa runt
        this._frame = v % this.frames.length;
    }

    // * rendera
    localRender(ctx) {
        // om frames tom -> ingen rendering
        if (!this.frames) {return}
        if (this.frames.length === 0) {return}

        // skydda så inte frame blir större än antal frames
        this.frames[Math.floor(this.frame) % this.frames.length](ctx, this, elapsedTime);
    }
    render(ctx, elapsedTime) {
        ctx.save();

        /** @type {CanvasRenderingContext2D} */
        ctx.beginPath();
        ctx.translate(this.x, this.y);
        ctx.scale(this.w / this.localWidth, this.h / this.localHeight);

        this.localRender(ctx, elapsedTime);

        ctx.restore();
    }
}

class Node {
    constructor(sprite) {
        this.sprite = sprite;
        this.state = "idle";
    }
    // * klick detektering
    isPointInside(x, y) {
        const halfW = this.sprite.w / 2;
        const halfH = this.sprite.h / 2;

        return (
            x >= this.sprite.x - halfW &&
            x <= this.sprite.x + halfW &&
            y >= this.sprite.y - halfH &&
            y <= this.sprite.y + halfH
        );
    }
    clicked(){
        // tom
    }
    update(dt) {
        // tom
    }
    render(ctx, elapsedTime) {
        this.sprite.render(ctx, elapsedTime);
    }
}

class CelestialBody extends Node {
    constructor(sprite) {
        super(sprite);
        // update
        this.vx = 0;
        this.vy = 0;
        this._speed = 0;
    }
    get speed() { return this._speed; }
    set speed(v) { this._speed = v; }

    clicked() {
        if (this.sprite.w > 80 && this.sprite.h > 80) {
            // krymp sprite
            this.sprite.w = 50;
            this.sprite.h = 50;

            this.sprite.frame = 1;
            this.state = "explode";
            return;
        }

        // öka storleken
        const multiplier = 1.5 // öka med 50%
        this.sprite.w *= multiplier;
        this.sprite.h *= multiplier;
    }

    update(dt) {
        // out of bonds
        // höger
        if (this.sprite.x - (this.sprite.w / 2) > canvas.width) {
            this.sprite.x = 0 - this.sprite.w;
        }
        // ned
        if (this.sprite.y - (this.sprite.h / 2) > canvas.height) {
            this.sprite.x = canvas.width - this.sprite.x;
        }
        // upp
        if (this.sprite.y + (this.sprite.h / 2) < 0) {
            this.sprite.x = canvas.width - this.sprite.x;
        }
        // vänster (safety)
        if (this.sprite.x + (this.sprite.w / 2) < -10) {
            this.sprite.x = 0;
        }

        // hämta vector mot skärmens lägsta mittpunkt
        const focusPoint = new Vector2(canvas.width / 2, canvas.height * 1.2);
        const gVector = new Vector2(focusPoint.x - this.sprite.x, focusPoint.y - this.sprite.y);

        // normalisera vektorn
        gVector.normalize();

        // hämta vektorn till höger (star direction)
        const starDir = new Vector2(gVector.y, -gVector.x);

        // tilldela velocity x och y från star direction
        this.vx = starDir.x * this.speed;
        this.vy = starDir.y * this.speed;

        // acceleration
        // //this.vx += this.ax * dt;
        // //this.vy += this.ay * dt;

        // hastighet
        this.sprite.x += this.vx * dt;
        this.sprite.y += this.vy * dt;

        if (this.state === "explode") {
            // öka frame
            const prevFrame = this.sprite.frame;
            this.sprite.frame += dt * this.sprite.framesPerSecond;

            // Animation har utfört sin första cykel
            if (prevFrame > this.sprite.frame) {
                this.sprite.frame = this.sprite.frames.length - 1;
                // hämta index av objekt i array
                const index = objects.indexOf(this);
                // ta bort objekt från plats
                objects.splice(index, 1);
                console.log(`Exploded star with index: ${index}`);
            }
        }
    }
}

// # FUNKTIONER
function degToRad(deg) {
    return deg * (Math.PI / 180);
}

function createStars(amount) {
    // stjärnornas storlek
    const starMaxSize = 30;
    const PLDcurve = 5; // power-law distribution degree of curve e.g ju brantare kurva desto mer resultat nära noll.

    const starFrames = [
        (ctx, sprite) => {
            ctx.fillStyle = sprite.color;
            // ctx.rect(-sprite.localWidth / 2, -sprite.localHeight / 2, sprite.localWidth, sprite.localHeight);
            if (starImage.complete){
                ctx.drawImage(starImage, -sprite.localWidth / 2, -sprite.localHeight / 2, sprite.localWidth, sprite.localHeight);
            }
        },
        (ctx, sprite) => {
            ExplosionAnimFrame1(ctx);
        },
        (ctx, sprite) => {
            ExplosionAnimFrame2(ctx);
        },
        (ctx, sprite) => {
            ExplosionAnimFrame3(ctx);
        },
        (ctx, sprite) => {
            ExplosionAnimFrame4(ctx);
        }
    ]


    for (let index = 0; index < amount; index++) {
        // Potenslag för storlekar - fler mindre stjärnor, några få stora.
        const starSize = Math.max(Math.ceil(Math.pow(Math.random(), PLDcurve) * starMaxSize), 5); // minst 5px
        const speed = Math.max((Math.pow(Math.random(), 5) * 50), 5); // minst 5px/s

        // sprite
        const starSprite = new Sprite2D(Math.random() * canvas.width, Math.random() * canvas.height, starSize, starSize, starFrames, { localWidth: starImage.width, localHeight: starImage.height});
        starSprite.color = "white";
        // logic
        const star = new CelestialBody(starSprite);
        star.speed = speed;

        objects.push(star);
    }
}

function createMoon() {
    const moonFrames = [
        (ctx, sprite, elapsedTime) => {
            elapsedTime *= 0.6; // anim speed
            ctx.save();
            // offset animeringen av clip
            ctx.translate((-sprite.localWidth / 2) - (Math.cos(elapsedTime)*5), (-sprite.localHeight / 2) - (Math.sin(elapsedTime)*5));

            ctx.beginPath();
            // clip area animeras snurrandes medsols
            ctx.arc(25+(Math.cos(elapsedTime)*5), 25+(Math.sin(elapsedTime)*5), 20, 0, Math.PI * 2);
            
            ctx.clip();
            MoonFrame(ctx);

            ctx.restore();
        }
    ]

    const moonSprite = new Sprite2D(200, canvas.height/3, 100, 100, moonFrames, {localWidth: 50, localHeight: 50});

    const moon = new CelestialBody(moonSprite);
    moon.speed = 10;

    objects.push(moon);
}

function spaceBg() {
    // färger från CSS variabler
    const style = window.getComputedStyle(document.body);
    const bgColor = style.getPropertyValue("--grey-5");
    const sbgColor = style.getPropertyValue("--background-color");

    const backgroundFrames = [
        (ctx) => {
            ctx.beginPath();
            // skapa gradient
            const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(50 / canvas.height, bgColor);
            gradient.addColorStop(1, sbgColor);
            ctx.fillStyle = gradient;
            // skapa rektangel
            ctx.rect(0, 0, canvas.width, canvas.height);
            ctx.fill();
        }
    ]

    const backgroundSprite = new Sprite2D(0, 0, canvas.width, canvas.height, backgroundFrames, { localWidth: canvas.width, localHeight: canvas.height });

    const background = new Node(backgroundSprite);
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
    /** @type {CanvasRenderingContext2D} */
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

    // skapa stjärnor
    createStars(200);

    // skapa en måne
    createMoon();

    // * starta programmet (loop)
    window.requestAnimationFrame(process);
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
        obj.render(ctx, elapsedTime);
    }

    window.requestAnimationFrame(process);
}



// # INITIERA PROGRAMMET (GODOT STYLE)
document.addEventListener("DOMContentLoaded", () => {

    // * initiera programmet
    ready();
});




