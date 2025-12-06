## Order

9

## Title

Keep Going! 🔁

## Objective

Use a while loop with robot.atGoal() to keep moving until you reach the goal. This teaches you about loops that run until a condition is met.

## Gameboard

r*w*w*
**w*w*
**w*w*
**w*w*
**w*w*
**w*w*
*****g

## Tip

while (condition) { code } runs the code as long as the condition is true.
Use while (!robot.atGoal()) to keep moving until you reach the goal.

## Available Functions

robot.moveRight()
robot.moveLeft()
robot.moveUp()
robot.moveDown()
robot.canMove(direction)
robot.atGoal()

## Hints

1) Use while (!robot.atGoal()) to keep moving until you reach the goal
2) Inside the loop, check which direction you can move
3) Move in that direction, then the loop will check again

## Boilerplate

function solveMaze() {
  
}

solveMaze();

## Requirements

mustUseWhile: true
