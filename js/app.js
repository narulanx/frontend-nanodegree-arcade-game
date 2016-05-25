// Enemies our player must avoid
var Enemy = function(speed,y) {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';
    this.speed = speed;
    this.y = y;
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    // if x position is not defined, define it to the beginning of the row
    if (typeof this.x == 'undefined')
        this.x = -10;
    else {
        // Increment the x position by the delta time multiplied over speed
        this.x = this.x + (dt * this.speed);
        // If the bug reaches to the end of the row, reset it to the beginning on a random row
        if (this.x > 505){
            this.x = -10;
            this.y = position[Math.floor(Math.random() * 3)];
        }
    }
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function() {
    this.sprite = '';
    this.x = 200;
    this.y = 400;
    this.score = 0;
    this.timer = timerStart;
    this.highScore = 0;
}

// This is not used because the player position is updated with the key press in handleInput function
Player.prototype.update = function(dt) {
}

// Draw the player on the screen
Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    this.updateScore();
    this.displayTimer();
    this.displayHighScore();
};

// Handles individual key events left, up, right and down arrow keys
Player.prototype.handleInput = function(key){
    if (key == 'left'){
        this.x = this.x <= 0 ? this.x : this.x - 101;
    } else if (key == 'up'){
        this.y = this.y <= -10 ? this.y : this.y - 83;
    } else if (key == 'right') {
        this.x = this.x >= 400 ? this.x : this.x + 101;
    } else if (key == 'down') {
        this.y = this.y >= 400 ? this.y : this.y + 83;
    }
}

//updates the score on the top right corner of the canvas
Player.prototype.updateScore = function() {
    ctx.font = "20px serif";
    ctx.fillStyle = "white";
    ctx.fillText("Score", 430, 80);
    ctx.font = "40px serif";
    ctx.fillText(this.score, 450, 120);
}

// Displays a timer on top left corner of the page
// Timer decrements on every second
// When timer reaches 0, the game ends
Player.prototype.displayTimer = function() {
    ctx.font = "20px serif";
    ctx.fillStyle = "white";
    ctx.fillText("Timer", 20, 80);
    ctx.font = "40px serif";
    ctx.fillText(this.timer, 20, 120);
    if (this.timer != 0){
        var newDate = new Date();
        var newSec = newDate.getSeconds();
        if (newSec - origSec >= 1 || origSec - newSec >= 1){
            origSec = newSec;
            this.timer--;
        }
    } else {
        end = true;
    }
}

// Displays high score on top middle of the page
// When timer reaches 0, compare the high score with the current score and update accordingly
Player.prototype.displayHighScore = function() {
    if (this.timer == 0) {
        if (this.score > this.highScore) {
            this.highScore = this.score;
        }
    }
    ctx.font = "20px serif";
    ctx.fillStyle = "white";
    ctx.fillText("High Score", 210, 80);
    ctx.font = "40px serif";
    ctx.fillText(this.highScore, 240, 120);
}

// Class to choose the character in the beginning of the game
var Character = function(sprite, imgX, imgY) {
    this.imgX = imgX;
    this.imgY = imgY;
    this.imgWidth = 101;
    this.imgHeight = 171;
    this.sprite = sprite;
}

// Displays each character
Character.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.imgX, this.imgY);
}

// Click a character to select that as the player for the current game
Character.prototype.imgClick = function(e) {
    var x, y;
    if (e.layerX || e.layerX == 0) { // for firefox
        x = e.layerX;
        y = e.layerY;
    }
    if (x >= this.imgX && x <= (this.imgX + this.imgWidth)
            && y >= this.imgY && y <= (this.imgY + this.imgHeight)) {
        player.sprite = this.sprite;
        start = true;
    }
}

// Collectibles in between the game to provide bonus points
var Diamond = function(sprite) {
    this.sprite = sprite;
    this.x = -99;
    this.y = -99;
}

// Updates the position of the collectible randomly
Diamond.prototype.update = function() {
    var cols = [0,103,206,309,412];
    var rows = [86,172,258];
    this.x = cols[Math.floor(Math.random() * 5)];
    this.y = rows[Math.floor(Math.random() * 3)];
}

// Displays the collectible on the screen
Diamond.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y, 90, 120);
}

// Function to hide the collectible
Diamond.prototype.hide = function() {
    this.x = -99;
    this.y = -99;
}

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
var allEnemies = [];
var position = [60,140,220];
allEnemies.push(new Enemy(100,position[Math.floor(Math.random() * 3)]));
allEnemies.push(new Enemy(200,position[Math.floor(Math.random() * 3)]));
allEnemies.push(new Enemy(300,position[Math.floor(Math.random() * 3)]));
// variable to define the start of the timer
var timerStart = 90;
// Place the player object in a variable called player
var player = new Player();
// Place all collectibles in a variable called diamond
var diamonds = [];
diamonds.push(new Diamond('images/Gem Blue.png'));
diamonds.push(new Diamond('images/Gem Green.png'));
diamonds.push(new Diamond('images/Gem Orange.png'));
// Create a seconds variable to display the timer
var date = new Date();
var origSec = date.getSeconds();
// variable to define if the game has started
var start = false;
// variable to define if the game has ended
var end = false;
// variable to decide of the diamond collectible has to be displayed
var isDiamondDisplay = true;

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});
