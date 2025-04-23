# STEM2 Tasks - Day 03 - Pinball

## TODO: Preparation (same as Day 01)

It is recommended to use [Visual Studio Code (VS Code)](https://code.visualstudio.com/) for the development. All code is implemented in HTML, CSS and JavaScript. If you prefer, you can use TypeScript. If you use VS Code two extensions are recommended for easier development: [LiveServer](https://marketplace.visualstudio.com/items/?itemName=ritwickdey.LiveServer) and [ESLint](https://marketplace.visualstudio.com/items/?itemName=dbaeumer.vscode-eslint). VS Code should ask you, if those extensions should be installed or not.

You can check, if the installation was successful by right-clicking the file [index.html](index.html). There should be an option "Open with LiveServer". Selecting this starts a local web server that allows the local testing of the implementation.

## TODO: Tasks

In the following, some tasks are listed that need to be implemented in order to better understand the implemented code. Note that you have to implement at least two simple, two complex and one out of context task in order to pass the assignment. Note that some tasks include observating and describing the results. The more and the better you implement the tasks, the better the grading. Please check the boxes of the tasks you implemented with x.

### Simple

(small and easy code changes)

- [x] Create a new obstacle.
- [x] Change the obstacle's push velocity.
- [x] Change the size and velocity of the flippers.
- [x] Makes the balls more bouncy.

### Complex

(needs new functions)

- [x] Add an obstacle that creates another ball.
- [x] Make the walls more bouncy.
- [ ] Change the flippers after reaching a given number of points.

### Out of context

(does not deal with math or physics, but can be fun)

- [x] Add colored obstacles.
- [x] Fill the table with a color.
- [ ] Make the balls draw a colored trace.
- [ ] Add [sounds](https://www.soundsnap.com/tags/pinball) for each [element](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API).
- [ ] Add a highscore list.


## TODO: Learning protocol

**Here, you should describe how you solved the tasks from above and explain your code changes as well as the observed results. Reflect your decisions and also describe what you learned today.** (max 500 words)
push velocity for obstacles ball.vel.addScale(dir, obstacle.pushVel - v); playing with the numbers on the flipper functions you can change the flipper size and velocity, adding a restitution on the ball makes it more bouncy. Adding a new Class for the obstacle that spawns more balls when hit with a cooldown so it can only generate balls in a certain time interval. Making the balls mor bouncy with restitution made it so the balls collide with the wall and disappear I didnt manage to find a fix for that