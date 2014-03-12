// A cross-browser requestAnimationFrame
// See https://hacks.mozilla.org/2011/08/animating-with-javascript-from-setinterval-to-requestanimationframe/
var requestAnimFrame = (function(){
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function(callback){
            window.setTimeout(callback, 1000 / 60);
        };
})();

// Function to get a random number between a given range
function getRandomArbitary (min, max) {
    return Math.random() * (max - min) + min;
}

function isNumber(n)
{
   return n == parseFloat(n);
}
function isEven(n) 
{
   return isNumber(n) && (n % 2 == 0);
}

// Find current window/browser/display size
var display_size = {
  width: window.innerWidth || document.body.clientWidth,
  height: window.innerHeight || document.body.clientHeight
}

// Create the canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width =  640; //display_size.width //320;//512;
canvas.height = 480; //display_size.height //568;//480;
var proportion_y = 480; //320;
var proportion_x = 640; //568;
var paddle_width = 100;
var paddle_height = 25;
var paddle_speed = 300;
var ball_height = 25;
var ball_width = 25;
var ball_x_speed = 150;
var ball_y_speed = 150;
// Set styles of hud elements, based on canvas size
// document.getElementById('score').style.width=canvas.width+"px";
// document.getElementById('score').style.margin=(canvas.height/20)+"px 0px";
document.getElementById('game').appendChild(canvas);


Element.prototype.hasClass = function(className) {
    return this.className && new RegExp("(^|\\s)" + className + "(\\s|$)").test(this.className);
};


// The main game loop
var last_time;
function main() {
    var now = Date.now();
    var dt = ( now - last_time ) / 1000.0;

    //console.log('run main');
    update( dt );
    render();

    last_time = now;
    requestAnimFrame(main);
}

// Set up the blocks

var block_width = 75;
var block_height = 25;
var blocks = [];
var total_blocks = 38;
var blocks_total_columns = 7;
var blocks_total_rows = 8;
var block_starting_x = ( canvas.width - (blocks_total_columns * block_width) ) / 2;

var arrange_blocks = function() {
    var current_column = 1;
    var current_row = 1;
    var block_pos = [block_starting_x,0];

    for ( b = 0; b < total_blocks; b++ ) {
        var block_color = 'red';
        var current_block_url;
        switch (block_color) {
            case 'red':
                current_block_url = block_url.red;
                break;
        }

        blocks.push({
            pos: [block_pos[0], block_pos[1]],
            x2: block_pos[0] + block_width,
            y2: block_pos[1] + block_height,
            width: block_width,
            height: block_height,
            color: block_color,
            is_cleared: false,
            sprite: new Sprite(current_block_url, [0, 0], [block_width, block_height], 10, [0])
        });


        if (current_row >= blocks_total_rows & current_column <= blocks_total_columns) {
            current_row = 1;
            block_pos[0] = blocks[b].pos[0] + block_width;
            block_pos[1] = blocks[0].pos[1];
            current_column++;
        } else {
            if ( isEven(current_column) && current_row == 1 ) {
                current_row = blocks_total_rows; 
                block_pos[1] = blocks[blocks_total_rows - 1].pos[1]
            } else {
                current_row++;
                block_pos[1] += block_height;
            }
        }

    }

}

// Once images have loaded, time to start the game
function init() {
    //console.log('all resources loaded..');
    //dead_background= ctx.createPattern(resources.get('images/dead-black.svg'), 'repeat');
    
    // Control replay, if 'Fly Again' button pressed, here
 
    // Control sound mute/unmute listener here

    reset();
    lastTime = Date.now();
    arrange_blocks();
    main();
}

var use_svg = true;
var file_extension = 'svg';
if ( document.getElementById('breakout').hasClass('svg') == true ) { 
    use_svg = true;  
} else { 
    use_svg = false; 
}

if ( use_svg == false ) {
    var file_extension = 'png';
} else {
    var file_extension = 'svg';
}


// Get the resources for the game
var paddle_url = 'images/paddle.'+file_extension;
var ball_url = 'images/ball.'+file_extension;
var block_url = { 
    red: 'images/block_red.'+file_extension
}

resources.load([
    paddle_url,
    ball_url,
    block_url.red
]);
resources.onReady(init);

var isMobile = {
    Android: function() {
        return navigator.userAgent.match(/Android/i) ? true : false;
    },
    BlackBerry: function() {
        return navigator.userAgent.match(/BlackBerry/i) ? true : false;
    },
    iOS: function() {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i) ? true : false;
    },
    Windows: function() {
        return navigator.userAgent.match(/IEMobile/i) ? true : false;
    },
    any: function() {
        return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Windows());
    }
};

// Function for getting coordinates of mouse click or touch
function relMouseCoords(event){
    var totalOffsetX = 0;
    var totalOffsetY = 0;
    var canvasX = 0;
    var canvasY = 0;
    var currentElement = this;

    do{
        totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
        totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
    }
    while(currentElement = currentElement.offsetParent)

    canvasX = event.pageX - totalOffsetX;
    canvasY = event.pageY - totalOffsetY;

    return {x:canvasX, y:canvasY}
}
HTMLCanvasElement.prototype.relMouseCoords = relMouseCoords;



// Game states
var paddle = {
    pos: [( ( canvas.width / 2 ) - ( paddle_width / 2 ) ), ( ( canvas.height - paddle_height) - canvas.height/10 )],
    x2: ( (canvas.width / 2) + ( paddle_width / 2 ) ),
    y2: ( canvas.height - ( canvas.height/10 ) ),
    height: paddle_height,
    width: paddle_width,
    speed: paddle_speed,
    is_moving: false,
    horizontal_dir: 'left',
    sprite: new Sprite(paddle_url, [0, 0], [paddle_width, paddle_height], 10, [0])
}

var ball = {
    pos: [ (canvas.width / 2), (canvas.height / 2)],
    x2: ( (canvas.width / 2) + ball_width ),
    y2: ( (canvas.height / 2) + ball_height ),
    height: ball_height,
    width: ball_width,
    is_moving: true,
    is_moving_down: true,
    is_moving_right: true,
    is_colliding: false,
    center: [ 0,0 ],
    sprite: new Sprite(ball_url, [0, 0], [ball_width, ball_height], 10, [0])
}


// The score
var score = 0;
var game_time = 0;
//var score_el = document.getElementById('score');



// Update the game objects
var c = 0;
function update(dt) {
    if ( isNaN( dt ) ) { dt = 0; }
    game_time += dt;

    handle_input(dt);
    update_entities(dt);

    check_collisions();

};



// Handle the player input
//var currently_pressed = false;
var currently_pressed = false;
function handle_input(dt) {
    if( input.isDown('RIGHT') ) {
        //console.log('RIGHT');
        paddle.is_moving = true;
        paddle.horizontal_dir = 'right';
    } else if ( input.isDown('LEFT') ) {
        //console.log('LEFT');
        paddle.is_moving = true;
        paddle.horizontal_dir = 'left';
    } else {
        paddle.is_moving = false;
    }
}


function update_entities( dt ) {
    // Paddle Movement
    if ( paddle.is_moving && paddle.horizontal_dir == 'left' ) {
        paddle.pos[0] -= (paddle_speed * dt);
        paddle.x2 = paddle.pos[0] + paddle.width;
    } else if ( paddle.is_moving && paddle.horizontal_dir == 'right' ) {
        paddle.pos[0] += (paddle_speed * dt);
        paddle.x2 = paddle.pos[0] + paddle.width;
    }

    if ( paddle.pos[0] <= 0 ) {
        paddle.pos[0] = 0;
    } else if ( ( paddle.pos[0] + paddle.width ) >= canvas.width ) {
        paddle.pos[0] = ( canvas.width - paddle.width );
    }


    // Ball Movement
    if ( ball.is_moving ) {
        switch(ball.is_moving_right) {
            case false:
                ball.pos[0] -= ( ball_x_speed * dt );
                ball.x2 = ball.pos[0] + ball.width;
                break;
            case true:
                ball.pos[0] += ( ball_x_speed * dt );
                ball.x2 = ball.pos[0] + ball.width;
            }
        switch(ball.is_moving_down) {
            case false:
                ball.pos[1] -= ( ball_y_speed * dt );
                ball.y2 = ball.pos[1] + ball.height;
                break;
            case true:
                ball.pos[1] += ( ball_y_speed * dt );
                ball.y2 = ball.pos[1] + ball.height;
                break;
        }

        ball.center[0] = (ball.pos[0] + ball.x2)/2;
        ball.center[1] = (ball.pos[1] + ball.y2)/2;
    }

}



// Collisions

function collides(x, y, r, b, x2, y2, r2, b2) {
    return !(r <= x2 || x > r2 ||
             b <= y2 || y > b2);
}

function box_collides(pos, size, pos2, size2) {
    return collides(pos[0], pos[1],
                    pos[0] + size[0], pos[1] + size[1],
                    pos2[0], pos2[1],
                    pos2[0] + size2[0], pos2[1] + size2[1]);
}

function check_collisions() {
    if ( ball.y2 >= canvas.height ) {
        ball.is_moving_down = false;
    } else if ( ball.x2 >= canvas.width ) {
        ball.is_moving_right = false;
    } else if ( ball.pos[0] <= 0 ) {
        ball.is_moving_right = true;
    } else if ( ball.pos[1] <= 0 ) {
        ball.is_moving_down = true;
    }
    
    if ( box_collides( ball.pos, ball.sprite.size, paddle.pos, paddle.sprite.size ) ) {
        //if ( !ball.is_colliding && ball.pos[1] >= ( paddle.pos[1] ) ) {
        if ( !ball.is_colliding &&
             (
             (ball.x2 >= paddle.pos[0] && ball.pos[0] <= paddle.pos[0] ) ||
             (ball.pos[0] <= paddle.x2 && ball.x2 >= paddle.x2)
             ) &&
             ( ball.center[1] >= paddle.pos[1] && ball.center[1] <= paddle.y2 )
           ) {
            ball.is_colliding = true;
            ball.is_moving_right = !ball.is_moving_right;

        } else if ( !ball.is_colliding ) {
            ball.is_colliding = true;
            ball.is_moving_down = !ball.is_moving_down;
        }
        
    } else {
        ball.is_colliding = false;
    }

    for ( b = 0; b < blocks.length; b++ ) {
        if ( box_collides( ball.pos, ball.sprite.size, blocks[b].pos, blocks[b].sprite.size ) && !blocks[b].is_cleared ) {
            //console.log('hitting a block!');
            if ( !ball.is_colliding &&
                 (
                 (ball.x2 >= blocks[b].pos[0] && ball.pos[0] <= blocks[b].pos[0] ) ||
                 (ball.pos[0] <= blocks[b].x2 && ball.x2 >= blocks[b].x2)
                 ) 
               ) {
                ball.is_colliding = true;
                ball.is_moving_right = !ball.is_moving_right;
                blocks[b].is_cleared = true;
                blocks.splice(b, 1);
            } else if ( 
                !ball.is_colliding 
              ) {
                ball.is_colliding = true;
                ball.is_moving_down = !ball.is_moving_down;
                blocks[b].is_cleared = true;
                blocks.splice(b, 1);
                //console.log('top or bottom collision');
            }
        } else {
            ball.is_colliding = false;
        }
    } 

}



// Draw everything
function render() {
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        render_entity( paddle );

        render_entity( ball );

        for( b = 0; b < blocks.length; b++ ) {
            if ( !blocks[b].is_cleared ) {
                render_entity(blocks[b]);
            }
        }

};

function render_entities( list ) {
    for(var i=0; i<list.length; i++) {
        //console.log( list[i].pos[0] );
        render_entity(list[i]);
    }    
}

function render_entity( entity ) {
    ctx.save();
    ctx.translate(entity.pos[0], entity.pos[1]);
    entity.sprite.render(ctx);
    ctx.restore();
}



// Game over
function game_over() {
}



// Reset game to original state
function reset() {
};
