
let CANVAS = document.getElementById('gameCanvas');
let CTX = CANVAS.getContext('2d');


const draw = (game) => {
    // draw the game here
    CTX.clearRect(0, 0, CANVAS.width, CANVAS.height);
    CTX.fillStyle = 'black';
    CTX.font = '20px Arial';
    CTX.fillText(`Score: ${game.score}`, 10, 30);
    CTX.fillText(`Lives: ${game.lives}`, 10, 60);
    CTX.fillText(`Level: ${game.level}`, 10, 90);
    game.bugs.forEach(bug => {
        drawBug(bug);
    });
}

const drawBug = (bug) => {
    if(bug.type === 'beetle') {
    CTX.fillStyle = 'black';
    CTX.beginPath();
    CTX.arc(bug.x, bug.y, bug.size, 0, Math.PI * 2);
    CTX.fill();
    CTX.closePath();
    }
}

const painter = {
    draw,
    drawBug
}