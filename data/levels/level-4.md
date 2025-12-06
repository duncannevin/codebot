## Order

4

## Title

Loop the Loop 🔄

## Objective

Use a for loop to repeat the same movement multiple times. This makes your code shorter and more powerful!

## Gameboard

r****g
******
******
******

## Tip

Instead of writing robot.moveRight() three times, use a loop:
for (let i = 0; i < 3; i++) {
  await robot.moveRight();
}

## Available Functions

robot.moveRight()
robot.moveLeft()
robot.moveUp()
robot.moveDown()

## Hints

1) A for loop repeats code multiple times
2) for (let i = 0; i < 3; i++) means "do this 3 times"
3) Count how many moves you need and use that number in your loop

## Boilerplate

function solveMaze() {
  
}

solveMaze();

## Requirements

mustUseLoop: true
