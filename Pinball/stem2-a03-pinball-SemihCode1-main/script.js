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

// TODO: coordinate system ------------------------------------------


// TODO: vector math ------------------------------------------------


// TODO: math support -----------------------------------------------


// TODO: scene setup ------------------------------------------------

// Ball class

// physics scene

// initialization
function setupScene() {

}

// TODO: drawing ----------------------------------------------------

function draw() {
    
}

// TODO: collision handling -----------------------------------------


// TODO: simulation -------------------------------------------------


// make browser to call us repeatedly -------------------------------

function update() {
    // TODO: call simulation and drawing functions
    requestAnimationFrame(update);
}

setupScene(); // initialize scene
update(); // initial call to start loop

// TODO: user interaction -------------------------------------------
