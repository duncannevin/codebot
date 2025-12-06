## Order

8

## Title

Function Junction 🛤️

## Objective

Create a function to move in a specific pattern, then call it multiple times. Learn about code reuse!

## Gameboard

r*****
*w*w*w
******
*w*w*w
******
*w*w*w
*****g

## Tip

You can create your own functions! 
function movePattern() {
  await robot.moveRight();
  await robot.moveDown();
}
Then call movePattern() multiple times.

## Available Functions

robot.moveRight()
robot.moveLeft()
robot.moveUp()
robot.moveDown()
robot.canMove(direction)

## Hints

1) Write a function that moves in a repeating pattern
2) Call that function multiple times
3) Functions help you avoid repeating the same code

## Boilerplate

function solveMaze() {
  
}

solveMaze();

## Requirements

mustUseFunction: true
