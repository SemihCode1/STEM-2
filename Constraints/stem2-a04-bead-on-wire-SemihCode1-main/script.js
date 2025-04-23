/*
Copyright 2021 Matthias Müller - Ten Minute Physics

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

// canvas setup ------------------------------------------------

let canvas = document.getElementById("myCanvas");
let ctx = canvas.getContext("2d");

canvas.width = window.innerWidth - 20;
canvas.height = window.innerHeight - 100;

// coordinate system setup

let simMinWidth = 2.0;
let cScale = Math.min(canvas.width, canvas.height) / simMinWidth;
let simWidth = canvas.width / cScale;
let simHeight = canvas.height / cScale;

function cX(pos) {
    return pos.x * cScale;
}

function cY(pos) {
    return canvas.height - pos.y * cScale;
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

    addScale(v, s = 1.0) {
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

    perp() {
        return new Vector2(-this.y, this.x);
    }
}

// math support ---------------------

function clamp(num, lower, upper) {
    return Math.min(Math.max(num, lower), upper);
}

function closestPointOnSegment(p, a, b) {
    let ab = new Vector2();
    ab.subtractVectors(b, a); // get direction of segment
    let l = ab.dot(ab); // get squared length of segment
    if (l == 0.0)
        return a.clone(); // avoid division by zero
    // compute t as the ratio between projected point and full segment length
    t = (p.dot(ab) - a.dot(ab)) / l;
    t = clamp(t, 0.0, 1.0); // ensure that t is in [0,1]
    let closest = a.clone();
    return closest.addScale(ab, t);
}
// add your implementation here

// TODO: scene setup ------------------------------------------------

class Bead {
    constructor(radius, mass, pos) {
        this.radius = radius;
        this.mass = mass;
        this.pos = pos.clone();
        this.prevPos = pos.clone();
        this.vel = new Vector2();
    }
    startStep(dt, gravity) {
        this.vel.addScale(gravity, dt);
        this.prevPos.set(this.pos);
        this.pos.addScale(this.vel, dt);
    }
    keepOnWire(center) {
        let dir = new Vector2();
        dir.subtractVectors(this.pos, center);
        let len = dir.length();
        if (len == 0.0)
            return;
        dir.scale(1.0 / len);
        let lambda = physicsScene.wireRadius - len;
        this.pos.addScale(dir, lambda);
        return lambda;
    }
    endStep(dt) {
        this.vel.subtractVectors(this.pos, this.prevPos);
        this.vel.scale(1.0 / dt);
    }
}
var physicsScene = {
    gravity: new Vector2(0.0, -10.0),
    dt: 1.0 / 60.0,
    numSteps: 10,
    paused: false,
    wireCenter: new Vector2(),
    wireRadius: 0.0,
    beads: []
};
function setupScene() {
    physicsScene.paused = false;
    physicsScene.wireCenter.x = simWidth / 2.0;
    physicsScene.wireCenter.y = simHeight / 2.0;
    physicsScene.wireRadius = simMinWidth * 0.4;

    physicsScene.beads = [];
    let numBeads = 5;
    let radius = 0.05;

    for (let i = 0; i < numBeads; i++) {
        let angle = (2 * Math.PI / numBeads) * i;
        let pos = new Vector2(
            physicsScene.wireCenter.x + physicsScene.wireRadius * Math.cos(angle),
            physicsScene.wireCenter.y + physicsScene.wireRadius * Math.sin(angle));
        let bead = new Bead(radius, 1.0, pos);

        // Optional: give a slight initial velocity
        bead.vel.x = 1.0 - i * 0.2;
        bead.vel.y = 0.0;

        physicsScene.beads.push(bead);
    }

    document.getElementById("force").innerHTML = "0.000";
}


// TODO: drawing ----------------------------------------------------

function drawCircle(pos, radius, filled) {
    ctx.beginPath();
    ctx.arc(
        cX(pos), cY(pos), cScale * radius, 0.0, 2.0 * Math.PI);
    ctx.closePath();
    if (filled)
        ctx.fill();
    else
        ctx.stroke();
}
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawCircle(physicsScene.wireCenter, physicsScene.wireRadius, false);
    for (let bead of physicsScene.beads) {
        drawCircle(bead.pos, bead.radius, true);
    }
}


// TODO: simulation -------------------------------------------------

function simulate() {
    if (physicsScene.paused) return;
    let sdt = physicsScene.dt / physicsScene.numSteps;
    let maxForce = 0.0;

    for (let step = 0; step < physicsScene.numSteps; step++) {
        // Step all beads
        for (let bead of physicsScene.beads) {
            bead.startStep(sdt, physicsScene.gravity);
        }

        // Constrain to wire and compute constraint forces
        for (let bead of physicsScene.beads) {
            let lambda = bead.keepOnWire(physicsScene.wireCenter);
            let force = Math.abs(lambda / sdt / sdt);
            maxForce = Math.max(maxForce, force);
        }

        // End step for all beads
        for (let bead of physicsScene.beads) {
            bead.endStep(sdt);
        }
    }

    document.getElementById("force").innerHTML = maxForce.toFixed(3);
}


// make browser to call us repeatedly -------------------------------

function update() {
    // TODO: call simulation and drawing functions
    simulate();
    draw();

    requestAnimationFrame(update);

}
setupScene();
update(); // initial call to start

function run() {
    physicsScene.paused = false;
}
function step() {
    physicsScene.paused = false;
    simulate();
    physicsScene.paused = true;
}