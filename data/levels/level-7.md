## Order

7

## Title

Decision Time ⚡

## Objective

Use the robot.canMove() function to check if a path is clear before moving. This teaches conditional logic!

## Gameboard

r*w***
**w***
**w*w*
**w*w*
**w*w*
**w*w*
*****g

## Tip

robot.canMove('right') returns true if you can move right, false if there's a wall.
Use if statements to make decisions: if (robot.canMove('right')) { await robot.moveRight(); }

## Available Functions

robot.moveRight()
robot.moveLeft()
robot.moveUp()
robot.moveDown()
robot.canMove(direction)
robot.atGoal()

## Hints

1) Check if you can move right before moving
2) If you can't move right, try moving down instead
3) Use if/else statements to make decisions based on canMove()

## Boilerplate

function solveMaze() {
  
}

solveMaze();

## Requirements

mustUseConditional: true
