/*
Copyright 2021 Matthias Müller - Ten Minute Physics

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

// canvas setup ------------------------------------------------

let canvas = document.getElementById("myCanvas");
let c = canvas.getContext("2d");

canvas.width = window.innerWidth - 20;
canvas.height = window.innerHeight - 100;

// coordinate system -------------------------------------------
let simMinWidth = 5.0;
let cScale = Math.min(canvas.width, canvas.height) / simMinWidth;
let simWidth = canvas.width / cScale;
let simHeight = canvas.height / cScale;

function cX(pos) {
    return pos.x * cScale;
}

function cY(pos) {
    return canvas.height - pos.y * cScale;
}

function screenToSim(x, y) { // eine funktion für die Sim koordinaten
    return new Vector2(x / cScale, (canvas.height - y) / cScale);
}


// vector math

class Vector2 {
    constructor(x = 0.0, y = 0.0) {
        this.x = x;
        this.y = y;
    }

    set(v) {
        this.x = v.x; this.y = v.y;
    }

    clone() {
        return new Vector2(this.x, this.y);
    }

    add(v, s = 1.0) {
        this.x += v.x * s;
        this.y += v.y * s;
        return this;
    }

    addVectors(a, b) {
        this.x = a.x + b.x;
        this.y = a.y + b.y;
        return this;
    }

    subtract(v, s = 1.0) {
        this.x -= v.x * s;
        this.y -= v.y * s;
        return this;
    }

    subtractVectors(a, b) {
        this.x = a.x - b.x;
        this.y = a.y - b.y;
        return this;
    }

    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    scale(s) {
        this.x *= s;
        this.y *= s;
    }

    dot(v) {
        return this.x * v.x + this.y * v.y;
    }
}

// scene setup -------------------------------------------------

let mouse = { // ein befehl einführen um mit der mouse zu interagieren
    down: false,
    pos: new Vector2(),
    startPos: new Vector2(),
    selectedBall: null
};




class Ball {
    constructor(radius, mass, pos, vel) {
        this.radius = radius;
        this.mass = mass;
        this.pos = pos.clone();
        this.vel = vel.clone();
        
    }
    simulate(dt, gravity) {
        this.vel.add(gravity, dt);
        this.pos.add(this.vel, dt);
    }
}

class Hole { //eine klasse für die Löcher erstellen
    constructor(x, y, radius) {
        this.pos = new Vector2(x, y);
        this.radius = radius;
    }

    draw() {
        c.beginPath();
        c.arc(cX(this.pos), cY(this.pos), this.radius * cScale, 0, 2 * Math.PI);
        c.fillStyle = "black";
        c.fill();
        c.closePath();
    }

    contains(ball) {
        const dx = ball.pos.x - this.pos.x;
        const dy = ball.pos.y - this.pos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < this.radius;
    }
}


let physicsScene =
{
    gravity: new Vector2(0.0, 0.0),
    dt: 1.0 / 60.0,
    worldSize: new Vector2(simWidth, simHeight),
    paused: true,
    balls: [],
    holes: [], //Löcher im Canvas
    restitution: 1.0,  // Für Ball-Ball-Kollisionen
    wallRestitution: 0.8 //  Für Ball-Wand-Kollisionen (z. B. 0.8 für weniger Bounciness)
};



function setupScene() {
    physicsScene.balls = [];
    physicsScene.holes = []; // physicsScene.holes erstellt

    let numBalls = 20;      // Creating more balls with changing the value

    for (i = 0; i < numBalls; i++) {

        let radius = 0.05 + Math.random() * 0.1;  // Changing the values here changes the ball size
        let mass = Math.PI * radius * radius;
        let pos = new Vector2(Math.random() * simWidth, Math.random() * simHeight);
        let vel = new Vector2(-1.0 + 2.0 * Math.random(), -1.0 + 2.0 * Math.random());
        let color = randomColor(); //scene setup for the random colors
        physicsScene.balls.push(new Ball(radius, mass, pos, vel, color));
    }
      // Füge Löcher hinzu
      physicsScene.holes.push(new Hole(1.0, 1.0, 0.15));
      physicsScene.holes.push(new Hole(1.5, 1.8, 0.2));
      physicsScene.holes.push(new Hole(3.5, 3.8, 0.2));
      physicsScene.holes.push(new Hole(2.5, 2.8, 0.2));
      physicsScene.holes.push(new Hole(1.5, 2.8, 0.15));

    //ein evenetlistner erstellen für die mouse interaktion
      canvas.addEventListener("mousedown", function(e) {
        mouse.down = true;
        mouse.startPos = screenToSim(e.clientX, e.clientY);
        mouse.selectedBall = null;
    
        for (let ball of physicsScene.balls) {
            let dx = ball.pos.x - mouse.startPos.x;
            let dy = ball.pos.y - mouse.startPos.y;
            if (Math.sqrt(dx * dx + dy * dy) <= ball.radius) {
                mouse.selectedBall = ball;
                break;
            }
        }
    });
    
    canvas.addEventListener("mousemove", function(e) {
        mouse.pos = screenToSim(e.clientX, e.clientY);
        if (mouse.down && mouse.selectedBall) {
            // Optional: Ball visuell mitschieben
            mouse.selectedBall.pos.set(mouse.pos);
            mouse.selectedBall.vel.set(new Vector2(0, 0));
        }
    });
    
    canvas.addEventListener("mouseup", function(e) {
        if (mouse.down && mouse.selectedBall) {
            let releasePos = screenToSim(e.clientX, e.clientY);
            let launchVec = new Vector2();
            launchVec.subtractVectors(releasePos, mouse.startPos);
    
            // Stärke anpassen
            mouse.selectedBall.vel.set(launchVec);
        }
    
        mouse.down = false;
        mouse.selectedBall = null;
    });
    
}

// drawing -----------------------------------------------------

function draw() {
    c.clearRect(0, 0, canvas.width, canvas.height);

  // Löcher zeichnen
  for (let hole of physicsScene.holes) {
    hole.draw();
}

    for (let i = 0; i < physicsScene.balls.length; i++) {
        let ball = physicsScene.balls[i];
        c.beginPath();
        c.arc(cX(ball.pos), cY(ball.pos), cScale * ball.radius, 0.0, 2.0 * Math.PI);
        c.fillStyle = ball.color; // ball color is random 
        c.fill();
        c.closePath();
    }
    //  gerade ziehen, Linie zeigen
if (mouse.down && mouse.selectedBall) {
    c.beginPath();
    c.moveTo(cX(mouse.startPos), cY(mouse.startPos));
    c.lineTo(cX(mouse.pos), cY(mouse.pos));
    c.strokeStyle = "rgba(0,0,0,0.5)";
    c.lineWidth = 2;
    c.stroke();
}

}


// collision handling -------------------------------------------------------

function handleBallBallCollision(ball1, ball2, restitution) 
{
    let b = new Vector2();
    b.subtractVectors(ball2.pos, ball1.pos);
    let d = b.length();
    if (d == 0.0 || d > ball1.radius + ball2.radius)
        return;

    b.scale(1.0 / d);

    let corr = (ball1.radius + ball2.radius - d) / 2.0;
    ball1.pos.add(b, -corr);
    ball2.pos.add(b, corr);

    let v1 = ball1.vel.dot(b);
    let v2 = ball2.vel.dot(b);

    let m1 = ball1.mass;
    let m2 = ball2.mass;

    let momentum = m1 * v1 + m2 * v2;

    let k = (momentum - m2 * (v1 - v2) * restitution) / (m1 + m2) - v1;
    let l = (momentum - m1 * (v2 - v1) * restitution) / (m1 + m2) - v2;

    ball1.vel.add(b, k);
    ball2.vel.add(b, l);
}

function randomColor(){ //function randomColor wird hier durf aufgerufen
    //Erzeugt zufällige RGB Farbe
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `rgb(${r},${g},${b})`;
}

// ------------------------------------------------------

function handleBallWallCollision(ball, worldSize) 
{
    let hitWall = false;
    let r = physicsScene.wallRestitution; //wall restitution erstellen und mit dem ball dann multiplizieren

    if (ball.pos.x < ball.radius) {
        ball.pos.x = ball.radius;
        ball.vel.x = -ball.vel.x * r;
        hitWall = true;
    }
    if (ball.pos.x > worldSize.x - ball.radius) {
        ball.pos.x = worldSize.x - ball.radius;
        ball.vel.x = -ball.vel.x * r;
        hitWall = true;
    }
    if (ball.pos.y < ball.radius) {
        ball.pos.y = ball.radius;
        ball.vel.y = -ball.vel.y * r;
        hitWall = true;
    }
    if (ball.pos.y > worldSize.y - ball.radius) {
        ball.pos.y = worldSize.y - ball.radius;
        ball.vel.y = -ball.vel.y * r;
        hitWall = true;
    }

    if (hitWall) {
        ball.color = randomColor(); //If abfrage für das ändern der Farben
    }
}


// simulation --------------------------------------------------

function simulate(timeStep) {

    // Entferne Bälle, die in Löcher gefallen sind
    physicsScene.balls = physicsScene.balls.filter(ball => {
        for (let hole of physicsScene.holes) {
            if (hole.contains(ball)) {
                return false; // Ball wird entfernt
            }
        }
        return true; // Ball bleibt
    });

    for (i = 0; i < physicsScene.balls.length; i++) {
        let ball1 = physicsScene.balls[i];
        ball1.simulate(timeStep, physicsScene.gravity);

        for (j = i + 1; j < physicsScene.balls.length; j++) {
            let ball2 = physicsScene.balls[j];
            handleBallBallCollision(ball1, ball2, physicsScene.restitution);
        }

        handleBallWallCollision(ball1, physicsScene.worldSize);
    }
}

// make browser to call us repeatedly --------------------------

function update() {
    let subSteps = 1;
    let subDt = physicsScene.dt / subSteps;

    for (let i = 0; i < subSteps; i++) {
        simulate(subDt);
    }
    draw();
    requestAnimationFrame(update);
}

setupScene(); // initialize scene
update(); // initial call to start loop

// bind slider to restitution value
document.getElementById("restSlider").oninput = function() {
    physicsScene.restitution = this.value / 10.0;
}