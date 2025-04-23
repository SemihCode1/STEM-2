# STEM2 Tasks - Day 04 - Bead on wire

## TODO: Preparation (same as Day 01)

It is recommended to use [Visual Studio Code (VS Code)](https://code.visualstudio.com/) for the development. All code is implemented in HTML, CSS and JavaScript. If you prefer, you can use TypeScript. If you use VS Code two extensions are recommended for easier development: [LiveServer](https://marketplace.visualstudio.com/items/?itemName=ritwickdey.LiveServer) and [ESLint](https://marketplace.visualstudio.com/items/?itemName=dbaeumer.vscode-eslint). VS Code should ask you, if those extensions should be installed or not.

You can check, if the installation was successful by right-clicking the file [index.html](index.html). There should be an option "Open with LiveServer". Selecting this starts a local web server that allows the local testing of the implementation.

## TODO: Tasks

In the following, some tasks are listed that need to be implemented in order to better understand the implemented code. Note that you have to implement at least one simple, two complex and one out of context task in order to pass the assignment. Note that some tasks include observating and describing the results. The more and the better you implement the tasks, the better the grading. Please check the boxes of the tasks you implemented with x.

### Simple

(small and easy code changes)

- [x] Change the number of substeps and describe your observation.
- [x] Change the starting position of the bead.
- [x] Set an initial velocity for the bead and observe the effect (if there is none, explain why.)

### Complex 

(needs new functions)

- [x] Add more beads on the wire including their collision.
- [ ] Put the bead on wire onto a billiard table and check if it can deal with other balls.
- [ ] Put the bead on wire onto a pinball table as a new kind of obstacle.

### Out of context

(does not deal with math or physics, but can be fun)

- [ ] Change the color of the bead according to its position.
- [ ] Let the wire vibrate.
- [ ] Let the user change the number of substep with a slider.

## TODO: Learning protocol

**Here, you should describe how you solved the tasks from above and explain your code changes. Reflect your decisions and also describe what you learned today.** (max 500 words)
With low numSteps, the bead might visibly drift away from the wire before snapping back.
With high numSteps, the bead stays much closer to the circular path at all times.
physicsScene.wireCenter.x + 0.01, with this you give it a small push so it starts moving 
physicsScene.bead.vel.x = 1.0, adding an inital velocity for the bead, its just faster but since the gravity is always the same the result will  be the same
I didnt manage to make a collision since it crashed everytime so I gave up, also didnt manage the other Complex tasks
It was mostly the same functions from the other task which I implemented, for example chaning the bead to an array so I can create more beads, adding a velocity and changing the position also wasnt that hard
