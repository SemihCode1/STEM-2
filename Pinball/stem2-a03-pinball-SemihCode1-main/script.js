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

// add your implementation here

//  coordinate system ------------------------------------------

let flipperHeight = 1.7;
let cScale = canvas.height / flipperHeight;
let simWidth = canvas.width / cScale;
let simHeight = canvas.height / cScale;
function cX(pos) {
    return pos.x * cScale;
}
function cY(pos) {
    return canvas.height - pos.y * cScale;
}

//  vector math ------------------------------------------------

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
    subtract(v, s = 1.0) {
        this.x -= v.x * s;
        this.y -= v.y * s;
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

//  math support -----------------------------------------------
function clamp(num, lower, upper) {
    return Math.min(Math.max(num, lower), upper);
}

function getclosestPointOnSegment(p, a, b) {
    let ab = new Vector2();
    ab.subtractVectors(b, a); // get direction of segment
    let l = ab.dot(ab); // get squared length of segment
    if (l == 0.0)
        return a.clone(); // avoid division by zero
    // compute t as the ratio between projected point and full segment length
    t = (p.dot(ab) - a.dot(ab)) / l;
    t = clamp(t, 0.0, 1.0); // ensure that t is in [0,1]
    let closest = a.clone();
    closest.addScale(ab, t);
    return closest;
}
//  scene setup ------------------------------------------------

// Ball class
class Ball {
    constructor(radius, mass, pos, vel, restitution) {
        this.radius = radius;
        this.mass = mass;
        this.restitution = restitution;
        this.pos = pos.clone();
        this.vel = vel.clone();
    }
    simulate(dt, gravity) {
        this.vel.addScale(gravity, dt);
        this.pos.addScale(this.vel, dt);
    }
}
// Flipper class
class Flipper {
    constructor(radius, pos, length, restAngle, maxRotation,
        angularVelocity) {
        // fixed
        this.radius = radius; // capsule radius
        this.pos = pos.clone(); // capsule start point
        this.length = length; // capsule length
        this.restAngle = restAngle; // default resting position
        this.maxRotation = Math.abs(maxRotation); // maximum rotation
        this.sign = Math.sign(maxRotation); // rotation direction
        this.angularVelocity = angularVelocity; // speed of rotation
        // changing
        this.rotation = 0.0; // rotation angle, initially zero
        this.currentAngularVelocity = 0.0; // current speed of rotation
        this.activation = -1; // whether flipper is activated
    }
    simulate(dt) {
        let prevRotation = this.rotation; // store last rotation angle
        // check if flipper/key is pressed and update rotation accordingly
        let pressed = this.activation >= 0;
        if (pressed)
            this.rotation = Math.min(this.rotation + dt * this.angularVelocity,
                this.maxRotation);
        else
            this.rotation = Math.max(this.rotation - dt * this.angularVelocity,
                0.0);
        // compute the current speed of the flipper movement
        this.currentAngularVelocity = this.sign * (this.rotation - prevRotation) / dt;
    }
    getTip() {
        let angle = this.restAngle + this.sign * this.rotation;
        let dir = new Vector2(Math.cos(angle), Math.sin(angle));
        let tip = this.pos.clone();
        return tip.addScale(dir, this.length);
    }
}
// Obstacle class
class Obstacle {
    constructor(radius, pos, pushVel, isSpawner, color = "#FF80000") {
        this.radius = radius;
        this.pos = pos.clone();
        this.pushVel = pushVel;
        this.isSpawner = isSpawner;
        this.spawnCooldown = 1; // seconds until it can spawn again
        this.color = color;
    }
}
// physics scene
let physicsScene =
{
    gravity: new Vector2(0.0, -3.0),
    dt: 1.0 / 60.0,
    score: 0,
    border: [],
    balls: [],
    obstacles: [],
    flippers: [],
};
// initialization
function setupScene() {
    physicsScene.score = 0;
    setupBorder();
    setupBalls();
    setupObstacles();
    setupFlippers();
}
function setupBorder() {
    let offset = 0.02;
    physicsScene.border.push(new Vector2(0.74, 0.25));
    physicsScene.border.push(new Vector2(1.0 - offset, 0.4));
    physicsScene.border.push(new Vector2(1.0 - offset, flipperHeight - offset));
    physicsScene.border.push(new Vector2(offset, flipperHeight - offset));
    physicsScene.border.push(new Vector2(offset, 0.4));
    physicsScene.border.push(new Vector2(0.26, 0.25));
    physicsScene.border.push(new Vector2(0.26, 0.0));
    physicsScene.border.push(new Vector2(0.74, 0.0));
}
function setupBalls() {
    physicsScene.balls = [];
    let radius = 0.03;
    let mass = Math.PI * radius * radius;
    let pos = new Vector2(0.92, 0.5);
    let vel = new Vector2(-0.2, 3.5);
    physicsScene.balls.push(new Ball(radius, mass, pos, vel, 0.4)); //Changing the value on the number changes the restitution = more bouncy
    pos = new Vector2(0.08, 0.5);
    vel = new Vector2(0.2, 3.5);
    physicsScene.balls.push(new Ball(radius, mass, pos, vel, 0.4)); //Changing the value on the number changes the restitution = more bouncy

}
function setupObstacles() {
    physicsScene.obstacles = [];

    physicsScene.obstacles.push(new Obstacle(0.1, new Vector2(0.25, 0.6), 2.0, false, "#FF0000")); // red
    physicsScene.obstacles.push(new Obstacle(0.13, new Vector2(0.75, 0.8), 2.0, false, "#00FF00")); // green
    physicsScene.obstacles.push(new Obstacle(0.12, new Vector2(0.7, 1.3), 2.0, false, "#0000FF")); // blue
    physicsScene.obstacles.push(new Obstacle(0.08, new Vector2(0.2, 1.2), 2.0, false, "#FFFF00")); // yellow

    let spawnerObstacle = new Obstacle(0.06, new Vector2(0.5, 1.0), 2.0, true, "#FF00FF"); // magenta spawner
    physicsScene.obstacles.push(spawnerObstacle);
}

function setupFlippers() {
    physicsScene.flippers = [];
    let radius = 0.03; // breite des Flippers
    let length = 0.2; // länge des Flippers
    let maxRotation = 1.0;
    let restAngle = 0.5;
    let angularVelocity = 15.0; //Velocity vom Flipper
    let pos1 = new Vector2(0.26, 0.22);
    let pos2 = new Vector2(0.74, 0.22);
    physicsScene.flippers.push(
        new Flipper(radius, pos1, length,
            -restAngle, maxRotation, angularVelocity));
    physicsScene.flippers.push(
        new Flipper(radius, pos2, length,
            Math.PI + restAngle, -maxRotation, angularVelocity));
}
function spawnNewBall(position) {
    if (physicsScene.balls.length >= 10) return;

    let radius = 0.03;
    let mass = Math.PI * radius * radius;
    let angle = Math.random() * 2 * Math.PI;
    let speed = 3.5;
    let vel = new Vector2(Math.cos(angle), Math.sin(angle));
    vel.scale(speed);

    let newBall = new Ball(radius, mass, position.clone(), vel, 0.8);
    physicsScene.balls.push(newBall);
}


//  drawing ----------------------------------------------------

function draw() {
    // clear the canvas
    ctx.fillStyle = "rgba(240, 240, 240, 0.1)"; // Adjust color & alpha as needed
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawBorder();
    drawBalls();
    drawObstacles();
    drawFlippers();
}
function drawBorder() {
    if (physicsScene.border.length >= 2) {
        ctx.beginPath();
        let v = physicsScene.border[0];
        ctx.moveTo(cX(v), cY(v));
        for (let i = 1; i < physicsScene.border.length; i++) {
            v = physicsScene.border[i];
            ctx.lineTo(cX(v), cY(v));
        }
        ctx.closePath();

        // fill the table area inside the border
        ctx.fillStyle = "#f0f0f0"; // Change this to your desired color
        ctx.fill();

        // then stroke the border
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 5;
        ctx.stroke();

        ctx.lineWidth = 1;
    }
}

function drawDisc(x, y, radius) {
    ctx.beginPath();
    ctx.arc(
        x, y, radius, 0.0, 2.0 * Math.PI);
    ctx.closePath();
    ctx.fill();
}
function drawBalls() {
    ctx.fillStyle = "#202020";
    for (let i = 0; i < physicsScene.balls.length; i++) {
        let ball = physicsScene.balls[i];
        drawDisc(cX(ball.pos), cY(ball.pos), ball.radius * cScale);
    }
}
function drawObstacles() {
    // obstacles
    for (let i = 0; i < physicsScene.obstacles.length; i++) {
        let obstacle = physicsScene.obstacles[i];
        ctx.fillStyle = obstacle.color;
        drawDisc(cX(obstacle.pos), cY(obstacle.pos), obstacle.radius * cScale);
    }
}
function drawFlippers() {
    ctx.fillStyle = "#FF0000";
    for (let i = 0; i < physicsScene.flippers.length; i++) {
        let flipper = physicsScene.flippers[i];
        ctx.translate(cX(flipper.pos), cY(flipper.pos));
        ctx.rotate(-flipper.restAngle - flipper.sign * flipper.rotation);
        ctx.fillRect(0.0, -flipper.radius * cScale,
            flipper.length * cScale, 2.0 * flipper.radius * cScale);
        drawDisc(0, 0, flipper.radius * cScale);
        drawDisc(flipper.length * cScale, 0, flipper.radius * cScale);
        ctx.resetTransform();
    }
}

//  collision handling -----------------------------------------
function handleBallBallCollision(ball1, ball2) {
    let restitution = Math.min(ball1.restitution, ball2.restitution);
    let b = new Vector2();
    b.subtractVectors(ball2.pos, ball1.pos);
    let d = b.length();
    if (d == 0.0 || d > ball1.radius + ball2.radius)
        return;
    b.scale(1.0 / d);
    let corr = (ball1.radius + ball2.radius - d) / 2.0;
    ball1.pos.addScale(b, -corr);
    ball2.pos.addScale(b, corr);
    let v1 = ball1.vel.dot(b);
    let v2 = ball2.vel.dot(b);
    let m1 = ball1.mass;
    let m2 = ball2.mass;
    let momentum = m1 * v1 + m2 * v2;
    let k = (momentum - m2 * (v1 - v2) * restitution) / (m1 + m2) - v1;
    let l = (momentum - m1 * (v2 - v1) * restitution) / (m1 + m2) - v2;
    ball1.vel.addScale(b, k);
    ball2.vel.addScale(b, l);
}
function handleBallObstacleCollision(ball, obstacle) {
    let dir = new Vector2();
    dir.subtractVectors(ball.pos, obstacle.pos);
    let d = dir.length();
    if (d == 0.0 || d > ball.radius + obstacle.radius)
        return;
    dir.scale(1.0 / d);
    let corr = ball.radius + obstacle.radius - d;
    ball.pos.addScale(dir, corr);
    let v = ball.vel.dot(dir);
    ball.vel.addScale(dir, obstacle.pushVel - v);
    // Spawn a new ball if it's a spawner obstacle
    if (obstacle.isSpawner && obstacle.spawnCooldown <= 0) {
        spawnNewBall(obstacle.pos);
        obstacle.spawnCooldown = 1.0; // cooldown of 1 second (adjust as needed)
    }

    physicsScene.score++;
}
function handleBallFlipperCollision(ball, flipper) {
    // get the contact point
    let closest = getclosestPointOnSegment(ball.pos, flipper.pos, flipper.getTip());
    // handle it like a ball
    let dir = new Vector2();
    dir.subtractVectors(ball.pos, closest);
    let d = dir.length();
    if (d == 0.0 || d > ball.radius + flipper.radius)
        return;
    dir.scale(1.0 / d);
    let corr = (ball.radius + flipper.radius - d);
    ball.pos.addScale(dir, corr);
    // update velocity based on current flipper speed
    let radius = closest.clone();
    radius.addScale(dir, flipper.radius);
    radius.subtract(flipper.pos);
    let surfaceVel = radius.perp();
    surfaceVel.scale(flipper.currentAngularVelocity);
    let v = ball.vel.dot(dir);
    let vNew = surfaceVel.dot(dir);
    ball.vel.addScale(dir, vNew - v);
}
function handleBallBorderCollision(ball, border) {
    if (border.length < 3)
        return;
    // find closest segment;
    // bounce the ball using the segment normal
}
function handleBallBorderCollision(ball, border) {
    // initialize all needed variables
    let d = new Vector2();
    let closest = new Vector2();
    let ab = new Vector2();
    let normal;
    let minDist = 0.0;
    // loop through all border segments
    for (let i = 0; i < border.length; i++) {
        let a = border[i];
        let b = border[(i + 1) % border.length];
        let c = getclosestPointOnSegment(ball.pos, a, b);
        d.subtractVectors(ball.pos, c);
        let dist = d.length();
        // store the closest point and its normal for later processing
        if (i == 0 || dist < minDist) {
            minDist = dist;
            closest.set(c);
            ab.subtractVectors(b, a);
            normal = ab.perp();
        }
        // const restitution = 1.2; // change the values for bounciness

        // if (ball.pos.x - ball.radius < 0 || ball.pos.x + ball.radius > canvas.width) {
        //     ball.vel.x *= -restitution;
        // }

        // if (ball.pos.y - ball.radius < 0 || ball.pos.y + ball.radius > canvas.height) {
        //     ball.vel.y *= -restitution;
        //     if (ball.pos.x - ball.radius < 0) {
        //         ball.pos.x = ball.radius;
        //         ball.vel.x *= -restitution; b
        //     }
        // }
        // balls are disappearing inside the walls
    }
    // push out
    d.subtractVectors(ball.pos, closest);
    let dist = d.length();
    if (dist == 0.0) {
        d.set(normal);
        dist = normal.length();
    }
    d.scale(1.0 / dist);
    // check if ball is behind the border
    if (d.dot(normal) >= 0.0) {
        if (dist > ball.radius)
            return;
        ball.pos.addScale(d, ball.radius - dist);
    }
    else
        ball.pos.addScale(d, -(dist + ball.radius));
    // update velocity
    let v = ball.vel.dot(d);
    let vNew = Math.abs(v) * ball.restitution;
    ball.vel.addScale(d, vNew - v);
}
// end of handleBallBorderCollision

//  simulation -------------------------------------------------
function simulate(timeStep) {
    for (let ball of physicsScene.balls) {
        ball.simulate(timeStep, physicsScene.gravity);

        // WANDKOLLISION 
        handleBallBorderCollision(ball, physicsScene.border);

        // Kollision mit Hindernissen
        for (let obstacle of physicsScene.obstacles) {
            handleBallObstacleCollision(ball, obstacle);
        }

        // Kollision mit Flippern
        for (let flipper of physicsScene.flippers) {
            handleBallFlipperCollision(ball, flipper);
        }
    }

    // Flipper updaten
    for (let flipper of physicsScene.flippers) {
        flipper.simulate(timeStep);
    }
    for (let obstacle of physicsScene.obstacles) {
        if (obstacle.spawnCooldown > 0) {
            obstacle.spawnCooldown -= timeStep;
        }
    }

    // Ball-Ball-Kollisionen
    for (let i = 0; i < physicsScene.balls.length; i++) {
        for (let j = i + 1; j < physicsScene.balls.length; j++) {
            handleBallBallCollision(physicsScene.balls[i], physicsScene.balls[j]);
        }
    }
}


// make browser to call us repeatedly -------------------------------

function update() {
    let subSteps = 1;
    let subDt = physicsScene.dt / subSteps;
    for (let i = 0; i < subSteps; i++) {
        simulate(subDt);
    }
    draw();
    // update the score
    document.getElementById("score").innerHTML = physicsScene.score.toString();
    requestAnimationFrame(update);
}
setupScene(); // initialize scene
update(); // initial call to start loop

// TODO: user interaction -------------------------------------------
document.addEventListener(
    "keydown",
    (event) => {
        const key = event.key; // "ArrowRight", "ArrowLeft", "ArrowUp", or "ArrowDown"
        switch (event.key) {
            case "ArrowLeft":
                // Left pressed raise left flipper
                physicsScene.flippers[0].activation = 0;
                break;
            case "ArrowRight":
                // Right pressed
                physicsScene.flippers[1].activation = 0;
                break;
            case "ArrowUp":
                // Up pressed
                break;
            case "ArrowDown":
                // Down pressed
                break;
        }
    },
    false,
);
document.addEventListener(
    "keyup",
    (event) => {
        const key = event.key; // "ArrowRight", "ArrowLeft", "ArrowUp", or "ArrowDown"
        switch (event.key) {
            case "ArrowLeft":
                // Left pressed raise left flipper
                physicsScene.flippers[0].activation = -1;
                break;
            case "ArrowRight":
                // Right pressed
                physicsScene.flippers[1].activation = -1;
                break;
            case "ArrowUp":
                // Up pressed
                break;
            case "ArrowDown":
                // Down pressed
                setupScene();
                break;
        }
    },
    false,
);