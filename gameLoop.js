/**
 * TODOS:
 * - Add mother fly that spawns flies when it lands and when killed.
 * - Add an enemy that lays eggs.
 * - Add a beetle that takes more than one hit to kill.
 * - Add a worm that is invincible when it's in the ground and pops up occasionally.
 * 
 * - Add combos for killing multiple bugs in a row. They will give the player more points and will happen if the player does not miss between kills.
 * - Instead of increasing spawn rate when the player levels up increase it as time passes in the game. this will make the game harder as time goes on so the player can't get stuck on a level and the difficulty increases from the bugs getting harder to kill instead of just more bugs spawning.
 * - (optional) Make a portion of the screen where the player can't tap. This will make the game harder.
 * - Redo the game's ui. Make it look better. 
 * - Add a pause button.
 * - Add a settings menu.
 * - Make a portion of the points be coins that the player can use to buy powerups.
 * - Add a shop where the player can buy powerups.
 * - Add a powerup that slows down time.
 * - Add a powerup that kills half the bugs on the screen.
 * - Add a powerup that resets the spawn rate.
 * - Add a powerup that acts like a trap and kills bugs that walk over it.
 * - Add a powerup that is a bomb that kills all bugs in an area.
 * - Add a leaderboard.
 * - Add a tutorial.
 * 
 */




// The canvas element and the context
let CANVAS, CTX;

const generateCanvas = () => {
    let canvasDiv = document.getElementById('canvasDiv');
    let canvas = document.createElement('canvas');
    canvas.id = 'gameCanvas';
    canvas.classList.add('canvas');
    // get the width and height of the canvasDiv
    let rect = canvasDiv.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    canvasDiv.appendChild(canvas)
    CANVAS = canvas;
    CTX = CANVAS.getContext('2d');
    CANVAS.addEventListener('mousedown', clickHandler);    
}
setTimeout(generateCanvas, 10);

// constants and game loop

let FPS = 60;
let interval = 1000 / FPS;
let game;

const gameLoop = () => {
    if (!game) { return }
    update(game);
    painter.draw(game);
    setTimeout(gameLoop, interval);
}

const startGame = () => {
    game = new Game();
    gameLoop();
}

setTimeout(startGame, 200);



/**
 * The bug class will be inherited by all the bugs in the game.
 * it contains:
 * - x coordinate
 * - y coordinate
 * - the speed of the bug
 * - the size of the bug
 * - the move method - used to move the bug across the screen.
 * (every bug will have to implement the move method)
 * - points - used to determine how many points the player gets when they kill the bug.
 * - type - used to determine the type of bug.
 * - typeMultiplier - score multiplier for the bug type.
 */
class Bug {
    type;

    constructor(x, y, speed, size, typeMultiplier = 1) {
        this.x = x;
        this.y = y;
        this.speed = speed;
        let variation = Math.random() * 15;
        variation = Math.random() < 0.5 ? -variation : variation;
        this.size = size + variation;

        this.points = ((speed * 10) / size) * typeMultiplier;
    }
    // move the bug across the screen
    // every bug will have to implement this method
    move() {
    }

    pushOutOfWall() {
        let halfSize = this.size / 2;
        // push the bug out of the wall
        if (this.x < halfSize) {
            this.x = halfSize + this.speedX + 1;
        }
        if (this.x > CANVAS.width - halfSize) {
            this.x = CANVAS.width - halfSize - this.speedX - 1;
        }

        if (this.y < halfSize) {
            this.y = halfSize + this.speedY + 1;
        }
        if (this.y > CANVAS.height - halfSize) {
            this.y = CANVAS.height - halfSize - this.speedY - 1;
        }
    }
}

/**
* Beetle class
* The most basic bug in the game. Moves in a straight line in the direction given to it at random. 
* If it hits the edge of the screen, it will turn around.
*/
class Beetle extends Bug {
    type = 'beetle';

    constructor(x, y, speed, size) {
        super(x, y, speed, size);

        // The direction clamped between 0.1 and 0.9 to avoid the bug moving in a straight line.
        let direction = Math.max(0.1, Math.min(0.9, Math.random()))
        this.speedX = speed * direction;
        this.speedY = speed * (1 - direction);

        // used for animation
        this.frameCounter = Math.floor(Math.random() * 60) + 1;
    }

    move() {
        let halfSize = this.size / 2;
        this.x += this.speedX;
        // if the bug hits the edge of the screen, turn around
        if (this.x < halfSize  || this.x > CANVAS.width - halfSize ) {
            this.speedX *= -1;
        }

        this.y += this.speedY;
        // if the bug hits the top or bottom of the screen, turn around
        if (this.y < halfSize || this.y > CANVAS.height - halfSize) {
            this.speedY *= -1;
        }

        this.pushOutOfWall();
    }
}


/**
 * Grasshopper class
 * the grasshopper will jump around the screen in a random direction. 
 * if its near the edge of the screen, it will jump in the opposite direction.
 * the grasshopper will be worth more points than the beetle.
 */
class Grasshopper extends Bug {
    type = 'grasshopper';
    typeMultiplier = 2;


    constructor(x, y, speed, size) {
        super(x, y, speed, size, 2);

        this.countDownUntilJump = Math.floor(Math.random() * 60) + 30;
        this.counDownUntilLanding = 0;
        this.isJumping = false;

        // The initial direction of the grasshopper
        let direction = Math.random();
        this.speedX = speed * direction;
        this.speedY = speed * (1 - direction);
    }

    setRandomDirection() {
        let direction = Math.random();
        this.speedX = this.speed * direction;
        this.speedY = this.speed * (1 - direction);
        // 50% chance of going in the opposite direction
        this.speedX *= Math.random() < 0.5 ? -1 : 1;
        this.speedY *= Math.random() < 0.5 ? -1 : 1;
    }

    resetCountDownUntilJump() {
        this.countDownUntilJump = Math.floor(Math.random() * 60) + 30;
    }

    resetCountDownUntilLanding() {
        this.counDownUntilLanding = Math.floor(Math.random() * 10) + 5;;
    }


    move() {
        if (this.isJumping === false) {
            this.countDownUntilJump--;
            if (this.countDownUntilJump <= 0) {
                this.isJumping = true;
                this.resetCountDownUntilLanding();
            }
        }
        else {
            let halfSize = this.size / 2;
            this.x += this.speedX;
            // if the bug hits the edge of the screen, turn around
            if (this.x < halfSize || this.x > CANVAS.width - halfSize) {
                this.speedX *= -1;
            }

            this.y += this.speedY;
            // if the bug hits the top or bottom of the screen, turn around
            if (this.y < halfSize || this.y > CANVAS.height - halfSize) {
                this.speedY *= -1;
            }
            this.pushOutOfWall();

            this.counDownUntilLanding--;
            if (this.counDownUntilLanding <= 0) {
                this.isJumping = false;
                this.resetCountDownUntilJump();
                this.setRandomDirection();
            }
        }
    }
}

/**
 * Fly class
 * the fly will fly around the screen in a random direction.
 * 
 */

class Fly extends Bug {
    type = 'fly';
    typeMultiplier = 3;
    maxSpeed = 3; // Maximum speed limit

    constructor(x, y, speed, size) {
        super(x, y, speed, size, 3);

        let direction = Math.random();
        this.speedX = speed * direction;
        this.speedY = speed * (1 - direction);
        // the speed of the fly will be random and will be capped at maxSpeed
        this.rateOfChangeX = 0.1; // Rate of change for speedX
        this.rateOfChangeY = 0.1; // Rate of change for speedY

        this.framesUntilDirectionChangeX = Math.floor(Math.random() * 60) + 30;
        this.framesUntilDirectionChangeY = Math.floor(Math.random() * 60) + 30;

        this.frameCounter = Math.floor(Math.random() * 6) + 1;
    }

    changeDirectionX() {
        // random value between -0.2 and 0.2
        this.rateOfChangeX = Math.random() * 0.4 - 0.2;
        this.framesUntilDirectionChangeX = Math.floor(Math.random() * 20) + 20;
    }

    changeDirectionY() {
        // Random value between -0.2 and 0.2
        this.rateOfChangeY = Math.random() * 0.4 - 0.2; 
        this.framesUntilDirectionChangeY = Math.floor(Math.random() * 20) + 20;
    }


    move() {
        this.speedX += this.rateOfChangeX;
        this.speedY += this.rateOfChangeY;

        if(this.speedX > this.maxSpeed || this.speedY > this.maxSpeed){
            console.log("max speed reached");
        }

        // Cap the speed at maxSpeed
        this.speedX = Math.min(this.maxSpeed, Math.max(-this.maxSpeed, this.speedX));
        this.speedY = Math.min(this.maxSpeed, Math.max(-this.maxSpeed, this.speedY));

        this.x += this.speedX;
        this.y += this.speedY;

        this.framesUntilDirectionChangeX--;
        if (this.framesUntilDirectionChangeX <= 0) {
            this.changeDirectionX();
        }

        this.framesUntilDirectionChangeY--;
        if (this.framesUntilDirectionChangeY <= 0) {
            this.changeDirectionY();
        }

        // if the bug hits the edge of the screen, turn around
        let halfSize = this.size / 2;
        if (this.x < halfSize || this.x > CANVAS.width - halfSize) {
            this.speedX *= -1;
            // if rateOfChangeX is positive and we hit the far wall then we need to change the direction
            if (this.rateOfChangeX > 0 && this.x > CANVAS.width - halfSize) {
                this.rateOfChangeX = -this.rateOfChangeX;
            }
            // if rateOfChangeX is negative and we hit the near wall then we need to change the direction
            if (this.rateOfChangeX < 0 && this.x < halfSize) {
                this.rateOfChangeX = -this.rateOfChangeX;
            }
        }

        // if the bug hits the top or bottom of the screen, turn around
        if (this.y < halfSize || this.y > CANVAS.height - halfSize) {
            this.speedY *= -1;
            // if rateOfChangeY is positive and we hit the bottom wall then we need to change the direction
            if (this.rateOfChangeY > 0 && this.y > CANVAS.height - halfSize) {
                this.rateOfChangeY = -this.rateOfChangeY;
            }
            // if rateOfChangeY is negative and we hit the upper wall then we need to change the direction
            if (this.rateOfChangeY < 0 && this.y < halfSize) {
                this.rateOfChangeY = -this.rateOfChangeY;
            }
        }

        this.pushOutOfWall(); // Assuming this method handles additional boundary logic
    }
}


class Game {

    constructor() {
        this.bugs = [];
        this.taps = [];
        this.gameOver = false;
        this.score = 0;
        this.lives = 1;
        this.level = 1;
        this.speed = 1;
        this.size = 60;
        this.gameTimer = 0;
        this.spawnAfterMiliseconds = 10_000;
        this.spawnEvery = Math.floor(10_000 / 60);
        this.init();
    }

    calculateSpawnTime = () => {
        let decreaseBy = this.level > 10 ? 100 : 1000;
        let spawnAfterMiliseconds = this.spawnAfterMiliseconds - decreaseBy;
        let spawnEvery = Math.floor(spawnAfterMiliseconds / 60);
        return { spawnAfterMiliseconds, spawnEvery }
    }

    // get a random bug from the game. On level 1, only beetles will spawn. On level 2, grasshoppers will also spawn, level 3 also has flies and level 4 has mosquitos.
    getRandomBug() {
        if (this.level === 1) {
            return new Beetle(Math.random() * CANVAS.width, Math.random() * CANVAS.height, this.speed * 4, this.size);
        }
        if (this.level === 2) {
            let random = Math.random();
            if (random < 0.5) {
                return new Beetle(Math.random() * CANVAS.width, Math.random() * CANVAS.height, this.speed * 4, this.size);
            }
            else {
                return new Grasshopper(Math.random() * CANVAS.width, Math.random() * CANVAS.height, this.speed * 40, this.size * 1.2);
            }
        }
        if (this.level > 2) {
            let random = Math.random();
            if (random < 0.3) {
                return new Beetle(Math.random() * CANVAS.width, Math.random() * CANVAS.height, this.speed * 4, this.size);
            }
            else if (random < 0.6) {
                return new Grasshopper(Math.random() * CANVAS.width, Math.random() * CANVAS.height, this.speed * 40, this.size * 1.2);
            }
            else {
                return new Fly(Math.random() * CANVAS.width, Math.random() * CANVAS.height, this.speed * 4, this.size * 0.9);
            }
        }
    }

    init() {
        this.bugs = [];
        for (let i = 0; i < 10; i++) {
            this.bugs.push(this.getRandomBug());
        }
    }

    handleTaps() {
        // check if the player killed a bug
        let deadIndexes = [];
        this.taps.forEach(tap => {
            this.bugs.forEach(bug => {
                if (
                    (tap.x > bug.x - bug.size / 2 && tap.x < bug.x + bug.size / 2)
                    &&
                    (tap.y > bug.y - bug.size / 2 && tap.y < bug.y + bug.size / 2)
                ) {
                    this.score += bug.points;
                    //remove the bug from the game
                    deadIndexes.push(this.bugs.indexOf(bug));
                }
            });
        });
        deadIndexes.forEach(index => {
            this.bugs.splice(index, 1);
        });

        //remove the taps
        this.taps = [];
    }

    moveBugs() {
        this.bugs.forEach(bug => {
            bug.move();
        });
    }
}


const update = (game) => {
    if (game.gameOver) {
        return;
    }

    game.gameTimer++;

    // kill the bugs that were tapped by the player
    game.handleTaps();

    // move the bugs
    game.moveBugs();

    // spawn a new bug
    if (game.gameTimer % game.spawnEvery === 0) {
        game.bugs.push(game.getRandomBug());
    }

    // if the player killed all the bugs they win the level
    if (game.bugs.length === 0) {
        game.level++;
        let { spawnAfterMiliseconds, spawnEvery } = game.calculateSpawnTime();
        game.spawnAfterMiliseconds = spawnAfterMiliseconds;
        game.spawnEvery = spawnEvery;
        
        game.init();
    }

    // check if the player lost
    if (game.bugs.length > 30) {
        game.lives--;
        if (game.lives === 0) {
            game.gameOver = true;
            return;
        }
        game.init();
    }

}

let clickHandler = (e) => {
    const rect = CANVAS.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    game.taps.push({ x, y });
    console.log(x, y);
}







// drawing logic
const draw = (game) => {
    if (game.gameOver) {
        CTX.clearRect(0, 0, CANVAS.width, CANVAS.height);
        CTX.fillStyle = 'black';
        CTX.font = '20px Arial';
        CTX.fillText(`Game Over!`, CANVAS.width / 2 - 50, CANVAS.height / 2);
        CTX.fillText(`Score: ${Math.floor(game.score)}`, CANVAS.width / 2 - 50, CANVAS.height / 2 + 30);
        return;
    }
    // draw the game here
    CTX.clearRect(0, 0, CANVAS.width, CANVAS.height);
    CTX.fillStyle = 'black';
    CTX.font = '20px Arial';
    CTX.fillText(`Score: ${Math.floor(game.score)}`, 10, 30);
    CTX.fillText(`Lives: ${game.lives}`, 10, 60);
    CTX.fillText(`Level: ${game.level}`, 10, 90);
    game.bugs.forEach(bug => {
        drawBug(bug);
    });
}
const beetleImages = {
    beetleImage0: new Image(),
    beetleImage1: new Image(),
    beetleImage2: new Image(),
    beetleImage3: new Image()
};

beetleImages.beetleImage0.src = 'beetle/frame_1.png';
beetleImages.beetleImage1.src = 'beetle/frame_2.png';
beetleImages.beetleImage2.src = 'beetle/frame_3.png';
beetleImages.beetleImage3.src = 'beetle/frame_4.png';

const grasshopperImages = {
    jumping: new Image(),
    standing: new Image()
};

grasshopperImages.jumping.src = 'grasshopper/jumping.png';
grasshopperImages.standing.src = 'grasshopper/standing.png';


const flyImages = {
    flyImage_1: new Image(),
    flyImage_2: new Image(),
    flyImage_3: new Image(),
    flyImage_4: new Image(),
    flyImage_5: new Image(),
}

flyImages.flyImage_1.src = 'fly/frame_1.png';
flyImages.flyImage_2.src = 'fly/frame_2.png';
flyImages.flyImage_3.src = 'fly/frame_3.png';
flyImages.flyImage_4.src = 'fly/frame_4.png';
flyImages.flyImage_5.src = 'fly/frame_5.png';


const drawBug = (bug) => {
    if (bug.type === 'beetle') {
        // Save the current state of the canvas
        CTX.save();

        // Translate the canvas origin to the bug's position
        CTX.translate(bug.x, bug.y);

        // Calculate the rotation angle in radians
        let angle = Math.atan2(bug.speedX, -bug.speedY);

        // Rotate the canvas
        CTX.rotate(angle);

        // get the current frame and update the counter
        let currentFrame = bug.frameCounter % 24;
        bug.frameCounter++;
        let useFrame = currentFrame < 6 ? 0 : currentFrame < 12 ? 1 : currentFrame < 18 ? 2 : 3;
        // Draw the bug's image centered on the new origin
        CTX.drawImage(beetleImages["beetleImage" + useFrame], -bug.size / 2, -bug.size / 2, bug.size, bug.size);

        // //draw the bug's hitbox
        // CTX.strokeStyle = 'red';
        // CTX.strokeRect(-bug.size/2, -bug.size/2, bug.size, bug.size);


        // Restore the canvas to its original state
        CTX.restore();
    }
    else if (bug.type === 'grasshopper') {
        // Save the current state of the canvas
        CTX.save();

        // Translate the canvas origin to the bug's position
        CTX.translate(bug.x, bug.y);

        // Calculate the rotation angle in radians
        let angle = Math.atan2(bug.speedX, -bug.speedY);

        // Rotate the canvas
        CTX.rotate(angle);

        // Draw the bug's image centered on the new origin
        if (bug.isJumping) {
            CTX.drawImage(grasshopperImages.jumping, -bug.size / 2, -bug.size / 2, bug.size, bug.size);
        }
        else {
            CTX.drawImage(grasshopperImages.standing, -bug.size / 2, -bug.size / 2, bug.size, bug.size);
        }
        // //draw the bug's hitbox
        // CTX.strokeStyle = 'red';
        // CTX.strokeRect(-bug.size/2, -bug.size/2, bug.size, bug.size);

        // Restore the canvas to its original state
        CTX.restore();
    }
    else if (bug.type === 'fly') {
        // Save the current state of the canvas
        CTX.save();

        // Translate the canvas origin to the bug's position
        CTX.translate(bug.x, bug.y);

        // Calculate the rotation angle in radians
        let angle = Math.atan2(bug.speedX, -bug.speedY);

        // Rotate the canvas
        CTX.rotate(angle);

        // get the current frame and update the counter
        bug.frameCounter++;
        let currentFrame = (bug.frameCounter % 5) + 1;

        // Draw the bug's image centered on the new origin
        CTX.drawImage(flyImages["flyImage_" + currentFrame], -bug.size / 2, -bug.size / 2, bug.size, bug.size);

        // //draw the bug's hitbox
        // CTX.strokeStyle = 'red';
        // CTX.strokeRect(-bug.size/2, -bug.size/2, bug.size, bug.size);

        // Restore the canvas to its original state
        CTX.restore();
    }
}

const painter = {
    draw,
    drawBug
}
