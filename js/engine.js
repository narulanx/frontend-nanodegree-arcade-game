/* Engine.js
 * This file provides the game loop functionality (update entities and render),
 * draws the initial game board on the screen, and then calls the update and
 * render methods on your player and enemy objects (defined in your app.js).
 *
 * A game engine works by drawing the entire game screen over and over, kind of
 * like a flipbook you may have created as a kid. When your player moves across
 * the screen, it may look like just that image/character is moving or being
 * drawn but that is not the case. What's really happening is the entire "scene"
 * is being drawn over and over, presenting the illusion of animation.
 *
 * This engine is available globally via the Engine variable and it also makes
 * the canvas' context (ctx) object globally available to make writing app.js
 * a little simpler to work with.
 */

var Engine = (function(global) {
    /* Predefine the variables we'll be using within this scope,
     * create the canvas element, grab the 2D context for that canvas
     * set the canvas elements height/width and add it to the DOM.
     */
    var doc = global.document,
        win = global.window,
        canvas = doc.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        lastTime;

    canvas.width = 505;
    canvas.height = 606;
    doc.body.appendChild(canvas);

    /* This function serves as the kickoff point for the game loop itself
     * and handles properly calling the update and render methods.
     */
    function main() {
        /* Get our time delta information which is required if your game
         * requires smooth animation. Because everyone's computer processes
         * instructions at different speeds we need a constant value that
         * would be the same for everyone (regardless of how fast their
         * computer is) - hurray time!
         */
        var now = Date.now(),
            dt = (now - lastTime) / 1000.0;

        /* Call our update/render functions, pass along the time delta to
         * our update function since it may be used for smooth animation.
         */
        update(dt);
        render();

        /* Set our lastTime variable which is used to determine the time delta
         * for the next time this function is called.
         */
        lastTime = now;

        /* Use the browser's requestAnimationFrame function to call this
         * function again as soon as the browser is able to draw another frame.
         */
        win.requestAnimationFrame(main);
    }

    /* This function does some initial setup that should only occur once,
     * particularly setting the lastTime variable that is required for the
     * game loop.
     */
    function init() {
        reset();
        lastTime = Date.now();
        main();
    }

    /* This function displays the welcome message in the game,
    *  loads all the player characters for the user to select,
    *  and allows the user to select it, using the addEventListener
    */
    function welcomeGame() {
        ctx.font = "30px Comic Sans MS";
        ctx.fillStyle = "white";
        ctx.fillText("Welcome to Nik's Frogger Game!!", 20, 100);
        ctx.fillStyle = "red";
        ctx.fillText("Choose your character!", 90, 250);
        var chars = [];
        chars[0] = new Character('images/char-boy.png', 20, 300);
        chars[1] = new Character('images/char-cat-girl.png', 110, 300);
        chars[2] = new Character('images/char-horn-girl.png', 200, 300);
        chars[3] = new Character('images/char-pink-girl.png', 290, 300);
        chars[4] = new Character('images/char-princess-girl.png', 380, 300);
        chars.forEach(function(character){
            character.render();
            canvas.addEventListener("click", function(e) {
                character.imgClick(e);
            });
        });
    }

    /* This function displays the message Game Over,
    *  game score of the user
    *  and a 'Play Again' button to restart the game
    */
    function gameOver() {
        ctx.font = "40px Comic Sans MS";
        ctx.fillStyle = "red";
        ctx.fillText("GAME OVER!", 120, 250);
        ctx.fillStyle = "green";
        var msg = "Your Score: "+player.score;
        ctx.fillText(msg, 120, 350);
        ctx.fillStyle = "yellow";
        ctx.fillText("Play Again!", 120, 450);
        canvas.addEventListener("click", againClick);
    }

    /* This function allows the user to play the game again
    *  by resetting all the variables accordingly
    */
    function againClick(e) {
        if (e.layerX || e.layerX == 0) {
            x = e.layerX;
            y = e.layerY;
        }
        if (x >= 120 && x <= 316 && y <= 462 && y >= 418) {
            start = true;
            end = false;
            player.timer = timerStart;
            canvas.removeEventListener("click", againClick);
            player.score = 0;
            renderEntities();
        }
    }

    /* This function is called by main (our game loop) and itself calls all
     * of the functions which may need to update entity's data. Based on how
     * you implement your collision detection (when two entities occupy the
     * same space, for instance when your character should die), you may find
     * the need to add an additional function call here. For now, we've left
     * it commented out - you may or may not want to implement this
     * functionality this way (you could just implement collision detection
     * on the entities themselves within your app.js file).
     */
    function update(dt) {
        updateEntities(dt);
        checkCollisions();
        checkDiamondCollision();
    }

    /* This is called by the update function and loops through all of the
     * objects within your allEnemies array as defined in app.js and calls
     * their update() methods. It will then call the update function for your
     * player object. These update methods should focus purely on updating
     * the data/properties related to the object. Do your drawing in your
     * render methods.
     */
    function updateEntities(dt) {
        allEnemies.forEach(function(enemy) {
            enemy.update(dt);
        });
        player.update();
        // Display a random diamond for 5 seconds in every 10th of a second, otherwise hide all the diamonds
        if (player.timer % 5 == 0){
            if (player.timer % 10 == 0) {
                if (isDiamondDisplay){
                    var dNum = Math.floor(Math.random() * 3);
                    diamonds[dNum].update();
                    isDiamondDisplay = false;
                }
            } else {
                diamonds.forEach(function(diamond) {
                    diamond.hide();
                    isDiamondDisplay = true;
                });
            }
        }
    }

    /* This function initially draws the "game level", it will then call
     * the renderEntities function. Remember, this function is called every
     * game tick (or loop of the game engine) because that's how games work -
     * they are flipbooks creating the illusion of animation but in reality
     * they are just drawing the entire screen over and over.
     */
    function render() {
        /* This array holds the relative URL to the image used
         * for that particular row of the game level.
         */
        var rowImages = [
                'images/water-block.png',   // Top row is water
                'images/stone-block.png',   // Row 1 of 3 of stone
                'images/stone-block.png',   // Row 2 of 3 of stone
                'images/stone-block.png',   // Row 3 of 3 of stone
                'images/grass-block.png',   // Row 1 of 2 of grass
                'images/grass-block.png'    // Row 2 of 2 of grass
            ],
            numRows = 6,
            numCols = 5,
            row, col;

        /* Loop through the number of rows and columns we've defined above
         * and, using the rowImages array, draw the correct image for that
         * portion of the "grid"
         */
        for (row = 0; row < numRows; row++) {
            for (col = 0; col < numCols; col++) {
                /* The drawImage function of the canvas' context element
                 * requires 3 parameters: the image to draw, the x coordinate
                 * to start drawing and the y coordinate to start drawing.
                 * We're using our Resources helpers to refer to our images
                 * so that we get the benefits of caching these images, since
                 * we're using them over and over.
                 */
                ctx.drawImage(Resources.get(rowImages[row]), col * 101, row * 83);
            }
        }
        // If the game has not started, display the welcome message
        if (!start) {
            welcomeGame();
        // If the game has ended, display the Game over message
        // Reset the characters so that the user can start the game again.
        } else if (end) {
            gameOver();
            reset();
        } else {
            renderEntities();
        }
    }

    /* This function is called by the render function and is called on each game
     * tick. Its purpose is to then call the render functions you have defined
     * on your enemy and player entities within app.js
     */
    function renderEntities() {
        /* Loop through all of the objects within the allEnemies array and call
         * the render function you have defined.
         */
        allEnemies.forEach(function(enemy) {
            enemy.render();
        });

        player.render();

        diamonds.forEach(function(diamond) {
            diamond.render();
        });
    }

    /* This function does nothing but it could have been a good place to
     * handle game reset states - maybe a new game menu or a game over screen
     * those sorts of things. It's only called once by the init() method.
     */
     // Resets the position of the player
    function reset() {
        // noop
        // If the player has reached the water (i.e., the y coordinate is less than 60), then increment the score
        if (player.y < 60){
            player.score++;
        }
        player.x = 200;
        player.y = 400;
    }

    /* This function checks the collision of the player with the enemies based on x and y coordinates
    *  If they collide, reset the player position to the starting point
    *  If the player reaches water, display it for 200 ms and then reset it to the start
    */
    function checkCollisions() {
        allEnemies.forEach(function(enemy) {
            if( (player.x < enemy.x + 80) &&
                (enemy.x < player.x + 60) &&
                (enemy.y < player.y) &&
                (player.y < enemy.y + 60)){
                player.score--;
                reset();
            }
        });
        if(player.y < 60){
            window.setTimeout(function(){reset();},200);
        }
    }

    /* This function checks the collision of the player with the diamonds based on x and y coordinates
    *  If they collide, hide the diamond and give 5 bonus points to the player
    */
    function checkDiamondCollision() {
        diamonds.forEach(function(diamond) {
            if( (player.x + 60 > diamond.x) &&
                (player.x < diamond.x + 80) &&
                (diamond.y < player.y + 60) &&
                (player.y + 24 < diamond.y + 60)){
                    diamond.hide();
                    player.score += 5;
            }
        });
    }

    /* Go ahead and load all of the images we know we're going to need to
     * draw our game level. Then set init as the callback method, so that when
     * all of these images are properly loaded our game will start.
     */
    Resources.load([
        'images/stone-block.png',
        'images/water-block.png',
        'images/grass-block.png',
        'images/enemy-bug.png',
        'images/char-boy.png',
        'images/char-cat-girl.png',
        'images/char-horn-girl.png',
        'images/char-pink-girl.png',
        'images/char-princess-girl.png',
        'images/Gem Blue.png',
        'images/Gem Green.png',
        'images/Gem Orange.png'
    ]);
    Resources.onReady(init);

    /* Assign the canvas' context object to the global variable (the window
     * object when run in a browser) so that developers can use it more easily
     * from within their app.js files.
     */
    global.ctx = ctx;
})(this);
