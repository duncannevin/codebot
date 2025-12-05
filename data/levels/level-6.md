## Order

6

## Objective

Use nested loops (a loop inside another loop) to navigate a grid pattern to the goal.

## Gameboard

r******
*w*w*w*
*******
*w*w*w*
******g
********
********
********

## Tip

You can put a loop inside another loop! The inner loop runs completely for each iteration of the outer loop.

## Available Functions

robot.moveRight()
robot.moveLeft()
robot.moveUp()
robot.moveDown()
robot.canMove(direction)

## Hints

1) First loop: move right multiple times
2) Then move down
3) Repeat this pattern until you reach the goal
4) Try using nested loops: one for horizontal movement, one for the pattern

