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
simHeight
// add your implementation here

// - coordinate system ------------------------------------------

let simMinWidth = 20.0; //coordiante system change
let cScale = Math.min(canvas.width, canvas.height) / simMinWidth;
let simWidth = canvas.width / cScale;
let simHeight = canvas.height / cScale;
function cX(pos) {
return pos.x * cScale;
}
function cY(pos) {
return canvas.height - pos.y * cScale; //change x and y to flip the scene ?
}

// - scene setup ------------------------------------------------

let gravity = { x: 0.0, y: -10.0}; // changing gravity directions

let dt = 1.0 / 60.0;

let ball = {
radius : 0.3, // size of the ball
pos : {x : 10, y : 18},
vel : {x : 0.0, y : 0.0}
}
// let ball2 = {
//     radius : 0.6, // size of the ball 2
//     pos : {x : 20, y : 18},
//     vel : {x : 0.0, y : 0.0}
// }

// - drawing ----------------------------------------------------

function draw(){

    
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = "#FF50000"; // Colour Ball

        ctx.beginPath();
        ctx.arc(cX(ball.pos), cY(ball.pos),
        cScale * ball.radius,
        0.0, 2.0 * Math.PI);
        // ctx.arc(cX(ball2.pos), cY(ball2.pos),   //ball 2
        // cScale * ball2.radius,
        // 0.0, 2.0 * Math.PI);
         ctx.closePath();
         ctx.fill();
        
}

// - simulation -------------------------------------------------

function simulate(timeStep) {

    ball.vel.x += gravity.x * timeStep;
    ball.vel.y += gravity.y * timeStep;
    ball.pos.x += ball.vel.x * timeStep;
    ball.pos.y += ball.vel.y * timeStep;

    let damping = 0.6; //Bounciness
    if (ball.pos.y - ball.radius < 0) {
    ball.pos.y = ball.radius;
    ball.vel.y *= -damping; // Bounce with energy loss
    }
    if (ball.pos.x < 0.0) {
    ball.pos.x = 0.0;
    ball.vel.x = -ball.vel.x;
    }
    if (ball.pos.x > simWidth) {
    ball.pos.x = simWidth;
    ball.vel.x = -ball.vel.x;
    }
// Ball 2
    // ball2.vel.x += gravity.x * timeStep;
    // ball2.vel.y += gravity.y * timeStep;
    // ball2.pos.x += ball2.vel.x * timeStep;
    // ball2.pos.y += ball2.vel.y * timeStep;

    // {
    //     let damping = 0.6; //Bounciness
    //     if (ball2.pos.y - ball2.radius < 0) {
    //     ball2.pos.y = ball2.radius;
    //     ball2.vel.y *= -damping; // Bounce with energy loss
    //     }
    //     if (ball2.pos.x < 0.0) {
    //     ball2.pos.x = 0.0;
    //     ball2.vel.x = -ball2.vel.x;
    //     }
    //     if (ball2.pos.x > simWidth) {
    //     ball2.pos.x = simWidth;
    //     ball2.vel.x = -ball2.vel.x;
    //     }

   // }
  }
// make browser to call us repeatedly -------------------------------

function update() {
    // TODO: call simulation and drawing functions

let subSteps = 10;
let subDt = dt / subSteps;
for (let i = 0; i < subSteps; i++) {
simulate(subDt);
}

draw();
    
    draw(); 
    requestAnimationFrame(update);
}
update(); // initial call to start