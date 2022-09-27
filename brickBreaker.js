// Select our canvas by using getElementById
const canvas = document.getElementById("BrickBreaker");

// Get the constant of our canvas such as methods and properties
const context = canvas.getContext("2d");

// Add a border to the canvas
canvas.style.border = "1px solid #0ff";

context.lineWidth = 3;

// Constants and game variables
const PADDLE_WIDTH = 100;
const PADDLE_BOTTOM_MARGIN = 50; // the space between the paddle and the bottom edge of the 
const PADDLE_HEIGHT = 20;
const BALL_RADIUS = 8;
let LIFE = 3; // Player has 3 lives
let SCORE = 0;
const SCORE_UNIT = 10;
let LEVEL = 1;
const MAX_LEVEL = 4;
let GAME_OVER = false;
let leftArrow = false;
let rightArrow = false;

// Create paddle object
const paddle =
{
    // To understand how the x and y values are derived look at the references
    // folder (image 1)
    x: canvas.width / 2 - PADDLE_WIDTH / 2,
    y: canvas.height - PADDLE_BOTTOM_MARGIN - PADDLE_HEIGHT,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    dx: 11   // dx = delta x (the # of pixels the paddle moves to the right
}

// Draw the paddle
function drawPaddle() 
{
    context.fillStyle = "#2e3548";
    context.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);

    // Stroke is like the outline of the paddle
    context.strokeStyle = "#ffcd05";
    context.strokeRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

// Controlling user inputted keys to move the paddle
// We add an event listener (the arguments mean that when a key is pressed then
// the event will run)
document.addEventListener("keydown", function (event) 
{
    if (event.key == "ArrowLeft") {
        leftArrow = true;
    } else if (event.key == "ArrowRight") {
        rightArrow = true;
    }
});

document.addEventListener("keyup", function (event) 
{
    if (event.key == "ArrowLeft") {
        leftArrow = false;
    } else if (event.key == "ArrowRight") {
        rightArrow = false;
    }
});

// Moving the paddle
function movePaddle() 
{
    // The && part makes sure the paddle doesn't move out of the canvas
    if (rightArrow && paddle.x + paddle.width < canvas.width) {
        paddle.x += paddle.dx;  // moves the paddle to the right by paddle.dx = 5
    }
    else if (leftArrow && paddle.x > 0) {
        paddle.x -= paddle.dx;
    }
}

// Create a ball object
const ball = {
    // Refer to images 2 & 3 in the reference folder
    x: canvas.width / 2,
    y: paddle.y - BALL_RADIUS,
    radius: BALL_RADIUS,
    speed: 5,
    dx: 3 * (Math.random() * 2 - 1),
    dy: -3
}

// Draw the ball
function drawBall() 
{
    context.beginPath(); // the beginning of the ball path

    // 0 represents the start angle and Math.PI*2 is the end angle which is 360
    context.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);

    context.fillStyle = "#ffcd05";
    context.fill();

    context.strokeStyle = "#2e3548";
    context.stroke();

    context.closePath(); // the end of the ball path
}

// Moving the ball
function moveBall() 
{
    // Refer to image 4 in the reference folder
    ball.x += ball.dx;
    ball.y += ball.dy;
}

// Collision detection between the ball and the canvas edge
function ballEdgeCollision() 
{
    // Refer to image 5 in the reference folder
    // Left side of || is when the ball hits the right edge of the canvas
    // Right side of || is when the ball hits the left edge
    if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) 
    {
        ball.dx = - ball.dx;
        WALL_HIT.play();
    }

    // If the ball hits the top edge
    if (ball.y - ball.radius < 0) 
    {
        ball.dy = -ball.dy;
        WALL_HIT.play();
    }

    // If the ball hits the bottom edge that means the player lost a LIFE
    if (ball.y + ball.radius > canvas.height) 
    {
        LIFE--; // Lose a LIFE
        LIFE_LOST.play();
        resetBall();
    }
}

function resetBall() 
{
    ball.x = canvas.width / 2;
    ball.y = paddle.y - BALL_RADIUS;

    // dy is always negative because when the ball is hit by the paddle it
    // can go in any direction that causes y to decrement (i.e. ball goes up)
    ball.dy = -3;

    // Generates a number between 3 and -3
    ball.dx = 3 * (Math.random() * 2 - 1);

    // The combination of dx and dy makes it so that when we reset the ball it
    // doesn't always start going northeast (like the start of the game) and instead is random
}

// Collision between the ball and the paddle
function ballPaddleCollision() 
{
    // Refer to image 6 in references
    if (ball.x < paddle.x + paddle.width && ball.x > paddle.x && paddle.y < paddle.y + paddle.height && ball.y > paddle.y) 
    {
        // Play sound
        PADDLE_HIT.play();

        // Checks where the ball hit the paddle, refer to image 7
        // If the ball hit the left side of the paddle we will get -paddle.width/2
        // while if it hit the right side we will get paddle.width/2. If it hits the middle 
        // we will get 0
        let collisionPoint = ball.x - (paddle.x + paddle.width / 2);

        // Normalize the values. Instead of getting -paddle.width/2 or paddle.width/2
        // we now get either -1 or 1
        collisionPoint = collisionPoint / (paddle.width / 2);

        // Calculate the angle of the ball by multiplying the 3 possible values we can get
        // either -1 or 1 or 0 by 60 degrees. Refer to image 8
        let angle = collisionPoint * Math.PI / 3;

        // Refer to image 9
        ball.dx = ball.speed * Math.sin(angle);
        ball.dy = - ball.speed * Math.cos(angle); // we use -dy so that the ball goes up
    }
    // Refer to image 10
}

// Crete a bricks object
const brick = {
    // Refer to image 11
    row: 1,
    column: 13,
    width: 55,
    height: 20,
    offSetLeft: 20,
    offSetTop: 20,
    marginTop: 40,
    fillColor: "#ee82ee",
    strokeColor: "#800080"
}

// Create an array of bricks
let bricks = [];

// Creating bricks
function createBricks() 
{
    // Create the rows of bricks
    for (let r = 0; r < brick.row; r++) 
    {
        bricks[r] = [];

        // Create columns of bricks
        for (let c = 0; c < brick.column; c++) 
        {
            // Refer to images 12 (for x) & 13 (for y)
            bricks[r][c] = {
                x: c * (brick.width + brick.offSetLeft) + brick.offSetLeft,
                y: r * (brick.height + brick.offSetTop) + brick.offSetTop + brick.marginTop,
                status: true   // when status = true it means the brick is not broken
            }
        }
    }
}

createBricks();

// Drawing the bricks
function drawBricks() 
{
    // To draw all the brick we must iterate through all bricks (need 2 for loops)
    for (let r = 0; r < brick.row; r++) 
    {
        for (let c = 0; c < brick.column; c++) 
        {
            let b = bricks[r][c];

            // Only draws the non-broken bricks
            if (b.status) 
            {
                context.fillStyle = brick.fillColor;
                context.fillRect(b.x, b.y, brick.width, brick.height);

                context.strokeStyle = brick.strokeColor;
                context.strokeRect(b.x, b.y, brick.width, brick.height);
            }
        }
    }
}

// Collision between the ball and a brick
function ballBrickCollision() 
{
    for (let r = 0; r < brick.row; r++) 
    {
        for (let c = 0; c < brick.column; c++) 
        {
            let b = bricks[r][c];

            // Only checks non-broken bricks
            if (b.status) 
            {
                // There is a collision if:
                // The right side of the ball is touching the left side of the brick
                // The left side of the ball touches the right side of the brick
                // The bottom of the ball is touching the top of the brick
                // The top of the ball touches the bottom of the brick
                if (ball.x + ball.radius > b.x && ball.x - ball.radius < b.x + brick.width && ball.y + ball.radius > b.y && ball.y - ball.radius < b.y + brick.height) 
                {
                    BRICK_HIT.play();
                    ball.dy = - ball.dy; // change the direction of the ball
                    b.status = false; // the brick is broken
                    SCORE += SCORE_UNIT; // increment the score
                }
            }
        }
    }
}

// Displays the game stats
function showGameStats(text, textX, textY, img, imgX, imgY) 
{
    // draw text
    context.fillStyle = "#FFF";
    context.font = "25px Germania One";
    context.fillText(text, textX, textY);

    // draw image
    context.drawImage(img, imgX, imgY, width = 25, height = 25);
}

// Draws different parts of the game
function draw() 
{
    drawPaddle();

    drawBall();

    drawBricks();

    // Shows the score
    showGameStats(SCORE, 35, 25, SCORE_IMG, 5, 5);

    // Shows the number of LIFE
    showGameStats(LIFE, canvas.width - 25, 25, LIFE_IMG, canvas.width - 55, 5);

    // Show the current level
    showGameStats(LEVEL, canvas.width / 2, 25, LEVEL_IMG, canvas.width / 2 - 30, 5);
}

// Ends the game
function gameOver() 
{
    if (LIFE <= 0) {
        displayLose();
        GAME_OVER = true;
    }
}

// Proceeds to the next level
function levelUp() 
{
    let isLevelDone = true;

    // Checks if all the bricks are broken
    for (let r = 0; r < brick.row; r++) 
    {
        for (let c = 0; c < brick.column; c++) 
        {
            // isLevelDone is true if all bricks are broken
            // A single non-broken brick will set isLevelDone to false
            isLevelDone = isLevelDone && !bricks[r][c].status;
        }
    }

    // If all the bricks have been broken
    if (isLevelDone) 
    {
        // Play sound
        WIN.play();

        // Continue to the next level only if we have not reached the max level
        if (LEVEL >= MAX_LEVEL)
        {
            displayWin();
            GAME_OVER = true;
            return;
        }
        brick.row++;    // add another row of bricks
        createBricks(); // create the bricks again
        ball.speed += 1;  // increase the speed of the ball
        resetBall();
        LEVEL++;    // increment the level
    }
}

// Updates the game
function update() 
{
    movePaddle();

    moveBall();

    ballEdgeCollision();

    ballPaddleCollision();

    ballBrickCollision();

    gameOver();

    levelUp();
}

// Function to loop
function loop() 
{
    // Clear the canvas
    context.drawImage(BACKGROUND_IMG, 0, 0);

    // Draws something to canvas
    draw();

    // Update the game logic
    update();

    // If the game is not over
    if (!GAME_OVER) 
    {
        // This calls the loop function as long as your browser is ready to render the frame
        requestAnimationFrame(loop);
    }
}
loop();

// Select the sound element
const soundElement = document.getElementById("sound");

soundElement.addEventListener("click", audioManager);

function audioManager() 
{
    // Change the sound_on and sound_off image
    let imgSrc = soundElement.getAttribute("src");
    let SOUND_IMG = imgSrc == "Images/SOUND_ON.png" ? "Images/SOUND_OFF.png" : "Images/SOUND_ON.png";

    soundElement.setAttribute("src", SOUND_IMG);

    // Mute and unmute the sounds
    WALL_HIT.muted = WALL_HIT.muted ? false : true;
    PADDLE_HIT.muted = PADDLE_HIT.muted ? false : true;
    BRICK_HIT.muted = BRICK_HIT.muted ? false : true;
    WIN.muted = WIN.muted ? false : true;
    LIFE_LOST.muted = LIFE_LOST.muted ? false : true;
}

// Show gameover message
const gameover = document.getElementById("gameover");
const youwin = document.getElementById("youwin");
const youlose = document.getElementById("youlose");
const restart = document.getElementById("restart");

// Clicking on play again
restart.addEventListener("click", function () 
{
    location.reload(); // reload the page
})

// Display that the user won 
function displayWin() 
{
    gameover.style.display = "block";
    youwon.style.display = "block";
}

// Display that the user lost
function displayLose() 
{
    gameover.style.display = "block";
    youlose.style.display = "block";
}
