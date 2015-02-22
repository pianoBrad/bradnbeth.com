/**********************************************
                TO-DOs
-----------------------------------------------

    * Center the background tile

**********************************************/

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
canvas.width =  window.innerWidth; //640; //display_size.width //320;//512;
canvas.height = window.innerHeight; //480; //display_size.height //568;//480;
var game_board_proportion_x = 400;
var game_board_proportion_y = 600;
var proportion_x = 60; //320;
var proportion_y = 90; //568;
var padding_proportion_top = 8;
var padding_proportion_bottom = 8;
var paddle_proportion_x = 10;
var paddle_proportion_y = 3;

var paddle_speed_proportion = 200;
var ball_speed_proportion = 150;
//var paddle_width = 100;
//var paddle_height = 25;

var block_proportion_width = 4;
var block_proportion_height = 3;

var bassel_proportion_width = 22;
var bassel_proportion_height = 31;

var prison_background_proportion = 38;

var dropshadow_proportion = 1;
// Set styles of hud elements, based on canvas size
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

var add_block = function(blocks_array, block_type, block_pos) {
    blocks_array.push({
        pos: [block_pos[0], block_pos[1]],
        x2: block_pos[0] + block.width,
        y2: block_pos[1] + block.height,
        width: block.width,
        height: block.height,
        type: block_type,
        color: block_type.color,
        is_cleared: false
    });
}

var arrange_blocks = function() {
    var current_column = 1;
    var current_row = 1;
    var block_pos = [block_starting_x, game_board.pos[1]];

    var create_bar = function(starting_pos) {
        var current_pos = starting_pos;
        for ( b = 0; b < blocks_total_rows; b++ ) {
            add_block(blocks, block.types.standard, current_pos );
            current_pos[1]+=block.height;
        }
    }

    var create_horizontal_bar = function(starting_pos) {
        var current_pos = starting_pos;
        for ( b = 0; b < blocks_total_columns; b++) {
            add_block(blocks, block.types.standard, current_pos);
            current_pos[0]+=block.width;
        }
    }

    // Create the Top Frame
    create_horizontal_bar( [block_starting_x, blocks_initial_starting_y] );


    // Create the Vertical Bars
    var current_column_x = block_starting_x + ( (block.width / 3) ) ;
    for ( c = 0; c < 5; c++ ) {
        create_bar([current_column_x, ( blocks_initial_starting_y +  block.height ) ] );
        current_column_x += Math.round( ((block.width * 2) + (block.width / 3)) );
    }

    //Create the Bottom Frame
    create_horizontal_bar( [block_starting_x, blocks_initial_starting_y + ( ( blocks_total_rows * block.height ) + block.height )] );

}

// Once images have loaded, time to start the game
function init() {
    //console.log('all resources loaded..');
    //dead_background= ctx.createPattern(resources.get('images/dead-black.svg'), 'repeat');
    
    // Control replay, if 'Fly Again' button pressed, here
 
    // Control sound mute/unmute listener here

    reset();
    lastTime = Date.now();
    //arrange_blocks();
    ball.is_moving = false;
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

    ball_source_width = 256;
    ball_source_height = 256;

    bassel_source_width = 1280;
    bassel_source_height = 1804;
} else {
    var file_extension = 'svg';

    ball_source_width = 6;
    ball_source_height = 6;

    bassel_source_width = 1000;
    bassel_source_height = 1409;
}


// Get the resources for the game
var background_tile_url = 'images/background-tile.'+file_extension;
var bassel_url = 'images/bassel.'+file_extension;
var paddle_url = 'images/paddle.'+file_extension;
var ball_url = 'images/ball.'+file_extension;
var block_url = { 
    red: 'images/block_red.'+file_extension
}

resources.load([
    background_tile_url,
    bassel_url,
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



// Game states

//Determine actual size of game board, based on canvas size & game board proportion

var x_dominance = ( (canvas.width * game_board_proportion_y) / game_board_proportion_x );
var y_dominance = ( (canvas.height * game_board_proportion_x ) / game_board_proportion_y );

var game_board_scaled_width = 400;
var game_board_scaled_height = 600;

if ( x_dominance <= canvas.height ) {
    game_board_scaled_width = canvas.width;
    game_board_scaled_height = x_dominance; 
} else if ( y_dominance <= canvas.width ) {
    game_board_scaled_height = canvas.height;
    game_board_scaled_width = y_dominance;
} 

game_board = {
    width: game_board_scaled_width,
    height: game_board_scaled_height,
    pos: [( canvas.width / 2 ) - ( game_board_scaled_width / 2 ), Math.round( (canvas.height / 2) - ( game_board_scaled_height / 2 ) )],
    padding_top: Math.round( ( game_board_scaled_height * padding_proportion_top ) / proportion_y ),
    padding_bottom: Math.round( ( game_board_scaled_height * padding_proportion_bottom ) / proportion_y ),
    padding_left: ( canvas.width / 2 ) - ( game_board_scaled_width / 2 ),
    dropshadow: {
        color: 'rgba(0,0,0,0.35)',
        offset: ( ( game_board_scaled_width * dropshadow_proportion ) / proportion_x )
    }
}

var paddle_speed = ( game_board.width * paddle_speed_proportion ) / game_board_proportion_x;

var ball_proportion_width = 2;
var ball_proportion_height = 2;


var block = {
    proportion_width: 4,
    proportion_height: 3,
    width: Math.round( ( game_board.width * block_proportion_width / proportion_x) ),
    height: Math.round( ( ( game_board.height * block_proportion_height ) / proportion_y ) ),
    types: {
        standard: {
            color: 'rgb(190,190,190)'
        }
    }
}

var blocks = [];
var total_blocks = 38;
var blocks_total_columns = 11;
var blocks_total_rows = 12;
var blocks_initial_starting_y = game_board.pos[1] - ( game_board.padding_top + ( blocks_total_rows * block.height ) ); 
var block_starting_x = Math.round( (( game_board.width - (blocks_total_columns * block.width) ) / 2) + game_board.pos[0] );
var one_pixel_x = (game_board.width) / proportion_x;
var one_pixel_y = (game_board.height) / proportion_y;

var game = {
    is_reset: false,
    is_over: false,
    is_running: false,
    round_cleared: false,
    display_title: true,
    blocks_animating: false,
    blocks_in_play: false,
    time: 0,
    starting_score: 0,
    score: 0,
    starting_round: 1,
    round: 1,
    background: {
        pos: [game_board.pos[0], game_board.pos[1]],
        width: game_board.width,
        height: game_board.height,
        //color: 'rgb(55,55,55)'
        color: 'rgb(0,73,94)'
    }
}

/**
ctx.font = font_height+'px fjallaone-regular-webfont';
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#FFFFFF';
            ctx.fillText("You're Fried!", canvas.width/2, youre_fried.pos[1] + (youre_fried_fitted_height / 2.2) );
**/

var hud_top = {
    height: game_board.padding_top,
    width: game_board.width,
    pos: [game_board.pos[0], game_board.pos[1]],
    round: {
        text_props: {
            font: (game_board.padding_top / 3)+'px press_start_2pregular',
            textBaseline: 'middle',
            textAlign: 'center',
            fillStyle: '#FFFFFF'
        },
        strings: {
            round: 'Round: '
        }
    },
    try_again: {
        text_props: {
            font: (game_board.padding_top / 3.5)+'px press_start_2pregular',
            textBaseline: 'middle',
            textAlign: 'center',
            fillStyle: '#FFFFFF'
        },
        strings: {
            try_again: 'Try again? Press any key.'
        }
    },
    next_round: {
        text_props: {
            font: (game_board.padding_top / 3.75)+'px press_start_2pregular',
            textBaseline: 'middle',
            textAlign: 'center',
            fillStyle: '#FFFFFF'
        },
        strings: {
            try_again: 'Next round? Press any key.'
        } 
    }
}

var hud_mid = {
    height: (game_board.pos[1] + game_board.height) -  ( (-blocks_initial_starting_y) + game_board.padding_bottom ) ,
    width: game_board.width,
    pos: [game_board.pos[0], (game_board.pos[1] + ((-blocks_initial_starting_y) + game_board.padding_top)) ],
    center: [ ((canvas.width) / 2), ((game_board.pos[1] + ((-blocks_initial_starting_y) + game_board.padding_top)) + (((game_board.pos[1] + game_board.height) -  ( (-blocks_initial_starting_y) + game_board.padding_bottom ))/2) ) ],
    text_props: {
        line_height: 10,
        font: ( (game_board.height - (game_board.pos[1] + ( (-blocks_initial_starting_y) + game_board.padding_bottom ) )) / 10)+'px press_start_2pregular',
        textBaseline: 'middle',
        textAlign: 'center',
        fillStyle: '#FFFFFF'  
    },
    title: {
        text_props: {
            line_height: 10,
            font: ( (game_board.height - (game_board.pos[1] + ( (-blocks_initial_starting_y) + game_board.padding_bottom ) )) / 10)+'px press_start_2pregular',
            textBaseline: 'middle',
            textAlign: 'left',
            fillStyle: '#FFFFFF'
        },
        strings: {
            bassel: "Bassel",
            breakout: "BreaKout!"
        }
    },
    success: {
        text_props: {},
        strings: {
            success: "Success!"
        }
    },
    fail: {
        text_props: {},
        strings: {
            fail: "Game Over"
        }
    }

}

//console.log(hud_mid.pos);

var hud = {
    height: game_board.padding_bottom,
    width: game_board.width,
    pos: [game_board.pos[0], game_board.pos[1] + ( game_board.height - game_board.height/10 ), game_board.width + game_board.padding_left, game_board.height ],
    score: { 
        text_props: {
            font: (game_board.padding_bottom / 3)+'px',
            textBaseline: 'middle',
            textAlign: 'left',
            fillStyle: '#FFFFFF'
        },
        strings: {
            score: 'Score: '
        }
    },
    round: {
        text_props: {
            font: (game_board.padding_bottom / 3)+'px',
            textBaseline: 'middle',
            textAlign: 'right',
            fillStyle: '#FFFFFF'
        },
        strings: {
            round: 'Round: '
        }
    }
}

var paddle = {
    starting_pos: [(game_board.width / 2) - ( ( ( game_board.width * paddle_proportion_x ) / proportion_x ) /2 ) + (game_board.pos[0]), 
                    game_board.pos[1] + ( ( game_board.height - ( ( game_board.height * paddle_proportion_y ) / proportion_y )) - hud.height )],
    pos: [( ( game_board.width / 2 ) - ( ( ( game_board.width * paddle_proportion_x ) / proportion_x ) / 2 ) ) + (game_board.pos[0]), 
              game_board.pos[1] + ( ( game_board.height - ( ( game_board.height * paddle_proportion_y ) / proportion_y )) - hud.height )],
    x2: ( (game_board.width / 2) + ( ( ( game_board.width * paddle_proportion_x ) / proportion_x ) / 2 ) ),
    y2: ( (game_board.pos[1] + game_board.height) - ( game_board.height/10 ) ),
    center: {x: 0,y: 0}, 
    height: Math.round( ( game_board.height * paddle_proportion_y ) / proportion_y ) ,
    width: Math.round( ( game_board.width * paddle_proportion_x ) / proportion_x ) ,
    color: 'rgb( 254, 238, 106)',
    speed: paddle_speed,
    is_moving: false,
    is_moving_right: false
    //sprite: new Sprite(paddle_url, [0, 0], [paddle_width, paddle_height], 10, [0])
}

var ball = {
    starting_pos: [ (game_board.width / 2) - ( ( ( game_board.width * ball_proportion_width ) / proportion_x ) /2 ) + (game_board.pos[0]), (paddle.pos[1]-( ( game_board.height * ball_proportion_height ) / proportion_y ))],
    pos: [ (game_board.width / 2) - ( ( ( game_board.width * ball_proportion_width ) / proportion_x ) /2 ) + (game_board.pos[0]), (paddle.pos[1]-( ( game_board.height * ball_proportion_height ) / proportion_y ))],
    x2: (game_board.width / 2) - ( ( ( game_board.width * ball_proportion_width ) / proportion_x ) /2 ) + (game_board.pos[0]) + Math.round( ( game_board.width * ball_proportion_width ) / proportion_x ),
    y2: (paddle.pos[1]-( ( game_board.height * ball_proportion_height ) / proportion_y )) + Math.round( ( game_board.height * ball_proportion_height ) / proportion_y ),
    center: {x: 0,y: 0},
    height: Math.round( ( game_board.height * ball_proportion_height ) / proportion_y ),
    width: Math.round( ( game_board.width * ball_proportion_width ) / proportion_x ),
    radius: (Math.round( ( game_board.height * ball_proportion_height ) / proportion_y ) / 2),
    speed_x : ((( game_board.width * ball_speed_proportion ) / game_board_proportion_x) * 1),
    speed_y : ((( game_board.height * ball_speed_proportion ) / game_board_proportion_y ) * 1),
    spin : 1,
    is_moving: true,
    is_moving_down: false,
    is_moving_right: true,
    is_colliding: false,
    animating_speed: 100,
    sprite: new Sprite(ball_url, [0, 0], [ball_source_width, ball_source_height], 10, [0], 'horizontal', [ ( ( ( game_board.width * ball_proportion_width ) / proportion_x ) / ball_source_width ) , ( ( ( game_board.height * ball_proportion_height ) / proportion_y ) / ball_source_height )])
}

var bassel = {
    starting_pos: [ 
        ( game_board.width / 2 ) - ( (( game_board.width * bassel_proportion_width ) / proportion_x) / 2 ) + game_board.pos[0] , 
        game_board.pos[1] + ( (game_board.padding_top)+ ( (((blocks_total_rows + 2) * block.height)/2) - ( (( game_board.height * bassel_proportion_height ) / proportion_y) / 2 ) ) ) ],
    pos: [
        ( game_board.width / 2 ) - ( (( game_board.width * bassel_proportion_width ) / proportion_x) / 2 ) + game_board.pos[0] ,
        game_board.pos[1] + ( (game_board.padding_top)+ ( (((blocks_total_rows + 2) * block.height)/2) - ( (( game_board.height * bassel_proportion_height ) / proportion_y) / 2 ) ) ) ],
    width: ( game_board.width * bassel_proportion_width ) / proportion_x,
    height: ( game_board.height * bassel_proportion_height ) / proportion_y,
    sprite: new Sprite(bassel_url, [0, 0], [bassel_source_width, bassel_source_height], 10, [0], 'horizontal', [ ( (( game_board.width * bassel_proportion_width ) / proportion_x) / bassel_source_width ) , ( (( game_board.height * bassel_proportion_height ) / proportion_y) / bassel_source_height ) ])
}

var prison_background = {
    pos: [ ((game_board.width/2) + game_board.pos[0]) - ( ((game_board.width * prison_background_proportion) / proportion_x) / 2 ),
            bassel.pos[1] - ( (((game_board.height * prison_background_proportion) / proportion_y) - bassel.height) / 3 )
         ],
    color: 'rgb(55,55,55)',
    border_left: {
        pos: [(((game_board.width/2) + game_board.pos[0]) - ( ((game_board.width * prison_background_proportion) / proportion_x) / 2 ) - one_pixel_x ),
            bassel.pos[1] - ( (((game_board.height * prison_background_proportion) / proportion_y) - bassel.height) / 3 )
        ],
        width: one_pixel_x,
        height: (game_board.height * prison_background_proportion) / proportion_y,
        color: 'rgb(42,42,42)'
    },
    border_right: {
        pos: [((((game_board.width/2) + game_board.pos[0]) - ( ((game_board.width * prison_background_proportion) / proportion_x) / 2 ) + ((game_board.width * prison_background_proportion) / proportion_x) ) ),
            bassel.pos[1] - ( (((game_board.height * prison_background_proportion) / proportion_y) - bassel.height) / 3 )
        ],
        width: one_pixel_x,
        height: (game_board.height * prison_background_proportion) / proportion_y,
        color: 'rgb(42,42,42)'
    },
    border_top: {
        pos: [ ((game_board.width/2) + game_board.pos[0]) - ( ((game_board.width * prison_background_proportion) / proportion_x) / 2 ),
            bassel.pos[1] - ( (((game_board.height * prison_background_proportion) / proportion_y) - bassel.height) / 3 ) - one_pixel_y
        ],
        width: (game_board.width * prison_background_proportion) / proportion_x,
        height: one_pixel_y
    },
    border_bottom: {
        pos: [ (((game_board.width/2) + game_board.pos[0]) - ( ((game_board.width * prison_background_proportion) / proportion_x) / 2 )) - one_pixel_x,
               (bassel.pos[1] - ( (((game_board.height * prison_background_proportion) / proportion_y) - bassel.height) / 3 ) - one_pixel_y) + (((game_board.height * prison_background_proportion) / proportion_y) + one_pixel_y )
        ],
        width: ((game_board.width * prison_background_proportion) / proportion_x) + (one_pixel_x * 2),
        height: one_pixel_y,
        color: 'rgb(79,79,79)'
    },
    width: (game_board.width * prison_background_proportion) / proportion_x,
    height: (game_board.height * prison_background_proportion) / proportion_y
}


// Update the game objects
var c = 0;
function update(dt) {
    if ( isNaN( dt ) ) { dt = 0; }
    game.time += dt;

    handle_input(dt);
    update_entities(dt);

    check_collisions();

};



// Handle the player input
//var currently_pressed = false;
var mouse_currently_pressed = false;
var current_mouse_pressed_coords = {};
var currently_touching = false;
var currently_pressed = false;
function handle_input(dt) {
    //console.log('checking..');
    if ( ( input.isDown('*') || input.isDown('LEFT') || (input.isDown('RIGHT')) || input.isDown('MOUSEDOWN') || input.isDown('TOUCHING') ) && !currently_pressed ) {
        currently_pressed = true;
        if ( !game.is_running && game.is_reset && !game.blocks_in_play && !game.blocks_animating ) {
            //Start the round
            //console.log('start round!');
            game.blocks_animating = true;
        } else if ( game.is_over ) {
            reset();
        }
    } else {
        currently_pressed = false;
    }

    if( input.isDown('RIGHT') && game.blocks_in_play && !game.is_over ) {
        if ( !game.is_running && game.is_reset ) { game.is_reset = false; ball.is_moving_right = true; launch_ball(); };
        //console.log('RIGHT');
        //console.log(game.blocks_in_play);
        paddle.is_moving = true;
        paddle.is_moving_right = true;
    } else if ( input.isDown('LEFT') && game.blocks_in_play && !game.is_over ) {
        if ( !game.is_running && game.is_reset ) { game.is_reset = false; ball.is_moving_right = false; launch_ball(); };
        //console.log('LEFT');
        paddle.is_moving = true;
        paddle.is_moving_right = false;
    } else {
        paddle.is_moving = false;
    }

    // Handle MOUSE controls
    if ( !isMobile.any() && input.isDown('MOUSEDOWN') && !mouse_currently_pressed && game.blocks_in_play ) { 
        //mouse_currently_pressed = true;
        var tapping = { left: false, right: true }
        current_mouse_pressed_coords = input.return_coords();
        //console.log(current_mouse_pressed_coords.x);
        if ( current_mouse_pressed_coords.x <= (canvas.width / 2) ) { tapping.left = true; tapping.right = false; } else { tapping.left = false; tapping.right = true; }
        //console.log( current_mouse_pressed_coords.x+' '+canvas.width/2 );
        if ( !game.is_running && game.is_reset && !tapping.left ) { ball.is_moving_right = true; game.is_reset = false; launch_ball(); }
        else if ( !game.is_running && game.is_reset && tapping.left) { ball.is_moving_right = false; game.is_reset = false; launch_ball(); };

        if( game.is_running && !game.is_reset ) {
            //console.log('yes!');
            if ( current_mouse_pressed_coords.x <= ( canvas.width/2 ) ) {
                paddle.is_moving_right = false;
            } else {
                paddle.is_moving_right = true;
            }
            paddle.is_moving = true;
        }
    } else if ( !input.isDown('MOUSEDOWN') && !isMobile.any() ) {
        mouse_currently_pressed = false;
        current_mouse_pressed_coords = {}
    }

    // Handle TOUCH controls
    if ( input.isDown('TOUCHING') && isMobile.any() && game.blocks_in_play ) {
        var tapping = { left: false, right: true }

        current_mouse_pressed_coords = input.return_coords();
        if ( current_mouse_pressed_coords.x <= (canvas.width / 2) ) { console.log('touching left side. '); tapping.left = true; tapping.right = false; } else { tapping.left = false; tapping.right = true; }

        if ( !game.is_running && game.is_reset && !tapping.left && !currently_touching ) { ball.is_moving_right = true; game.is_reset = false; launch_ball(); }
        else if ( !game.is_running && game.is_reset && tapping.left && !currently_touching ) { ball.is_moving_right = false; game.is_reset = false; launch_ball(); };
        
        if( game.is_running && !game.is_reset ) {
            //console.log('yes!');
            if ( current_mouse_pressed_coords.x <= ( canvas.width/2 ) ) {
                paddle.is_moving_right = false;
            } else {
                paddle.is_moving_right = true;
            }
            paddle.is_moving = true;
        }
        //console.log('test '+current_mouse_pressed_coords.x+' '+current_mouse_pressed_coords.y+' '+paddle.is_moving);

        currently_touching = true;
    } else if ( !input.isDown('TOUCHING') && isMobile.any() ) {
        currently_touching = false;
    }

    /**
    if ( currently_touching && isMobile.any() ) {
        paddle.is_moving = true;
    } else if ( !currently_touching && isMobile.any() ) {
        paddle.is_moving = false;
    }
    **/

}


function update_entities( dt ) {
    // Paddle Movement
    if ( paddle.is_moving && paddle.is_moving_right == false ) {
        paddle.pos[0] -= (paddle_speed * dt);
        paddle.x2 = paddle.pos[0] + paddle.width;
    } else if ( paddle.is_moving && paddle.is_moving_right == true ) {
        paddle.pos[0] += (paddle_speed * dt);
        paddle.x2 = paddle.pos[0] + paddle.width;
    }

    if ( paddle.pos[0] <= game_board.pos[0] ) {
        paddle.pos[0] = game_board.pos[0];
    } else if ( ( paddle.pos[0] + paddle.width ) >= ( game_board.pos[0] + game_board.width ) ) {
        paddle.pos[0] = ( game_board.pos[0] + game_board.width ) - paddle.width;
    }

    paddle.center.x = paddle.pos[0] + (paddle.width / 2);
    paddle.center.y = paddle.pos[1] + (paddle.height/ 2);


    // Ball Movement
    if ( ball.is_moving && game.is_running ) {
        switch(ball.is_moving_right) {
            case false:
                ball.pos[0] -= (( ball.speed_x * dt ) * ball.spin);
                ball.x2 = ball.pos[0] + ball.width;
                break;
            case true:
                ball.pos[0] += (( ball.speed_x * dt ) * ball.spin);
                ball.x2 = ball.pos[0] + ball.width;
            }
        switch(ball.is_moving_down) {
            case false:
                ball.pos[1] -= ( ball.speed_y * dt );
                ball.y2 = ball.pos[1] + ball.height;
                break;
            case true:
                ball.pos[1] += ( ball.speed_y * dt );
                ball.y2 = ball.pos[1] + ball.height;

                break;
        }

        ball.center.x = (ball.pos[0] + (ball.width/2));
        ball.center.y = (ball.pos[1] + (ball.height/2));

        if ( ball.pos[1] >= ( game_board.pos[1] + game_board.height ) ) {
            game.is_over = true;
        } 
    }

    // Handle block movement
    if ( game.blocks_animating && blocks[0].pos[1] <= game_board.pos[1] + game_board.padding_top ) {
        //console.log('animating..');
        game.display_title = false;
        for( b=0; b < blocks.length; b++) {
            blocks[b].pos[1] += 10;
            blocks[b].y2 = blocks[b].pos[1] + blocks[b].height;
        }
    }  else if ( game.blocks_animating ) {
        game.blocks_animating = false;
        game.blocks_in_play = true;
    }

}

// New Collision tests
var collisions = {
    intercept: function(x1, y1, x2, y2, x3, y3, x4, y4, d) {
      var denom = ((y4-y3) * (x2-x1)) - ((x4-x3) * (y2-y1));
      //console.log("x1: "+x1+", y1: "+y1+", x2: "+x2+", y2: "+y2+", x3: "+x3+", y3: "+y3+", x4: "+x4+", y4: "+y4+", d: "+d)
      //console.log(denom);
      if (denom != 0) {
        var ua = (((x4-x3) * (y1-y3)) - ((y4-y3) * (x1-x3))) / denom;
        //console.log('checking ua: '+ua);
        if ((ua >= 0) && (ua <= 0.5)) {
          var ub = (((x2-x1) * (y1-y3)) - ((y2-y1) * (x1-x3))) / denom;
          if ((ub >= 0) && (ub <= 1)) {
            var x = x1 + (ua * (x2-x1));
            var y = y1 + (ua * (y2-y1));
            //console.log( "x: "+x+", y: "+y+", d: "+d ) 
            return { x: x, y: y, d: d};
          }
        }
      }
      return null;
    },

    ballIntercept: function(ball, rect, nx, ny) {
      var pt;
      if (!ny) {
        //console.log('check bottom side..');
        pt = collisions.intercept(ball.pos[0], ball.pos[1], ball.pos[0] + ball.width, ball.pos[1] + ball.height, 
                                     rect.left   - ball.radius, 
                                     rect.bottom + ball.radius, 
                                     rect.right  + ball.radius, 
                                     rect.bottom + ball.radius,
                                     "bottom");
      }
      else if (ny) {
        //console.log('check top side..');
        pt = collisions.intercept(ball.pos[0], ball.pos[1], ball.pos[0] + ball.width, ball.pos[1] + ball.height, 
                                     rect.left   - ball.radius, 
                                     rect.top    - ball.radius, 
                                     rect.right  + ball.radius, 
                                     rect.top    - ball.radius,
                                     "top");
        }
      if (!pt) {
        if (!nx) {
            //console.log('check right side..');
            pt = collisions.intercept(ball.pos[0], ball.pos[1], ball.pos[0] + ball.width, ball.pos[1] + ball.height, 
                                   rect.right  + ball.radius, 
                                   rect.top    - ball.radius, 
                                   rect.right  + ball.radius, 
                                   rect.bottom + ball.radius, 
                                   "right");
        }
        else if (nx) {
            //console.log('check left side..');
            pt = collisions.intercept(ball.pos[0], ball.pos[1], ball.pos[0] + ball.width, ball.pos[1] + ball.height, 
                                   rect.left   - ball.radius, 
                                   rect.top    - ball.radius, 
                                   rect.left   - ball.radius, 
                                   rect.bottom + ball.radius,
                                   "left");
        }
      }
      return pt;
    }

}


// Collisions (old)
/**
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
**/

function check_collisions() {
    //ball.is_colliding = false;
    //console.log(ball.is_colliding);

    //Check ball for collision with game_board
    if ( ball.y2 >= ( game_board.pos[1] + game_board.height ) ) {
        //ball.is_moving_down = false;
    } else if ( ball.x2 >= ( game_board.width + game_board.pos[0] )  ) {
        ball.is_moving_right = false;
    } else if ( ball.pos[0] <= game_board.pos[0] ) {
        ball.is_moving_right = true;
    } else if ( ball.pos[1] <= game_board.pos[1] ) {
        ball.is_moving_down = true;
    }

    if ( game.is_running && blocks.length <= 0 ) {
        game.is_running = false;
        game.round_cleared = true;
        reset();
    }


    if ( ball.pos[1] > ((-blocks_initial_starting_y) + game_board.padding_top ) && ball.y2 < paddle.pos[1] ) {
        ball.is_colliding = false;
    } 
    

    //Check ball for collision with paddle (if ball position is within range of paddle position)
    //console.log(ball.y2+' '+(paddle.pos[1]-paddle.height) );
    if ( game.is_running && ( ball.y2 >= ( paddle.pos[1] - paddle.height ) ) ) {

    /**
    if ( box_collides( ball.pos, [ball.width, ball.height], paddle.pos, [paddle.width, paddle.height] ) ) {
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
        
    }
    **/
        var pt = collisions.ballIntercept( ball, { left: paddle.pos[0], right: paddle.x2, top: paddle.pos[1], bottom: paddle.y2}, ball.is_moving_right, ball.is_moving_down );
        //console.log( ball.speed_x+' '+ball.speed_y );
        if ( pt ) {
            switch(pt.d)
            {
                case 'top':
                    ball.is_moving_down = !ball.is_moving_down;

                    var distance_from_center = paddle.center.x - ball.center.x
                    if ( distance_from_center < 0 ) { 
                        distance_from_center = -distance_from_center 
                        ball.is_moving_right = true;
                    } else { ball.is_moving_right = false; }

                    // Calculate angle of spin
                    var s = distance_from_center / ( paddle.width / 2 );
                    if ( s > 1 ) { s=1; }

                    console.log(s);
                    ball.spin = s;
                    break;
                case 'left':
                case 'right':
                    //console.log('hitting '+pt.d+' side of paddle!');
                    ball.is_moving_right = !ball.is_moving_right;
                    break;

            }
        }
    }

    


    //Check ball for collision with blocks
    if (game.is_running && ball.is_moving) {
        for ( b = 0; b < blocks.length; b++ ) {
            var collisions_this_frame = 0;
            if ( 
                ( ball.pos[1] >= ( blocks[b].pos[1] - blocks[b].height) && ball.pos[1] <= (blocks[b].y2 + blocks[b].height) ) &&
                ( ball.pos[0] >= ( blocks[b].pos[0] - blocks[b].width ) && ball.pos[0] <= (blocks[b].x2 + blocks[b].width ) )

               ) {
                var pt = collisions.ballIntercept( ball, { left: blocks[b].pos[0], right: blocks[b].x2, top: blocks[b].pos[1], bottom: blocks[b].y2}, ball.is_moving_right, ball.is_moving_down );
                //console.log("{ left: "+blocks[b].pos[0]+", right: "+blocks[b].x2+", top: "+blocks[b].pos[1]+", bottom: "+blocks[b].y2+"}");
                if ( pt  ) {
                    ball.is_colliding = true;
                    collisions_this_frame++;
                switch(pt.d)
                {
                    case 'top':
                    case 'bottom':
                        //ball.is_moving_down = !ball.is_moving_down;
                        if(collisions_this_frame <= 1) {
                            ball.is_moving_down = !ball.is_moving_down;
                        }
                        
                        //console.log('hitting '+pt.d+' side of block!');
                        break;
                    case 'left':
                    case 'right':
                        if ( collisions_this_frame <= 1 ) {
                            ball.is_moving_right = !ball.is_moving_right;
                        }
                        
                        //console.log('hitting '+pt.d+' side of block!');
                        //ball.is_moving_right = !ball.is_moving_right;
                        break;

                }
                blocks[b].is_cleared = true;
                blocks.splice(b, 1);
                game.score++;
                //ball.is_colliding = true;
                }

            }
            
            /**
            if ( box_collides( ball.pos, [ball.width, ball.height], blocks[b].pos, [blocks[b].width, blocks[b].height ] ) && !blocks[b].is_cleared ) {
                if ( !ball.is_colliding &&
                     (
                    (ball.x2 >= blocks[b].pos[0] && ball.pos[0] < blocks[b].pos[0] ) ||
                    (ball.pos[0] <= blocks[b].x2 && ball.x2 > blocks[b].x2)
                    ) 
                ) {
                ball.is_moving_right = !ball.is_moving_right;
                
                } else if ( 
                !ball.is_colliding 
                ) {
                ball.is_moving_down = !ball.is_moving_down;
                }
                blocks[b].is_cleared = true;
                blocks.splice(b, 1);
                game.score++;
                ball.is_colliding = true;
            } else {
            }
            **/

        }

    } 


}



// Draw everything
function render() {
        //Draw background + tile, etc..
        ctx.fillStyle = "#CCCCCC";
        ctx.fillRect(0,0,canvas.width, canvas.height);

        draw_rect( game.background, ctx );

        //Tile
        var tile = new Image();
        tile.src = background_tile_url;
        var tile_proportion_x = (game_board.width * 16) / proportion_x;

        var tempCanvas = document.createElement("canvas"),
        tCtx = tempCanvas.getContext("2d");
        tempCanvas.width = tile_proportion_x;
        tempCanvas.height = tile_proportion_x;

        tCtx.drawImage(tile,0,0,tile.width,tile.height,0,0,tile_proportion_x,tile_proportion_x);

        var ptrn = ctx.createPattern(tempCanvas, 'repeat');
        ctx.fillStyle = ptrn;
        ctx.fillRect(game_board.pos[0], game_board.pos[1], game_board.width, game_board.height);
            
        //Draw Bassel prison background square
        draw_rect(prison_background, ctx);
        draw_rect(prison_background.border_left, ctx);
        draw_rect(prison_background.border_right, ctx);
        draw_rect(prison_background.border_top, ctx);
        draw_rect(prison_background.border_bottom, ctx);


        render_entity( bassel );

        //Draw Shadows

        draw_shadow( ball, ctx );

        draw_shadow( paddle, ctx );

        for( b = 0; b < blocks.length; b++ ) {
            if ( !blocks[b].is_cleared ) {
                //render_entity(blocks[b]);

                draw_shadow(blocks[b], ctx);
            }
        }


        //Draw Game Entities
        draw_rect( paddle, ctx );

        render_entity( ball );
        //Draw blocks
        for( b = 0; b < blocks.length; b++ ) {
            if ( !blocks[b].is_cleared ) {
                //render_entity(blocks[b]);

                draw_rect(blocks[b], ctx);
            }
        }

        if ( game.is_over ) {
            game_over();
        } else if ( game.is_running ) {
            //Render the score/hud display
            ctx.font = (hud.height/3)+'px press_start_2pregular';
            ctx.textBaseline = hud.score.text_props.textBaseline;
            ctx.textAlign = hud.score.text_props.textAlign;
            ctx.fillStyle = hud.score.text_props.fillStyle;
            ctx.fillText(hud.score.strings.score+game.score, hud.pos[0],( hud.pos[1] + ( (hud.height) - paddle.height ) ) );

            //Render the round
            ctx.textAlign = hud.round.text_props.textAlign;
            ctx.fillText(hud.round.strings.round+game.round, hud.pos[2],( hud.pos[1] + ( hud.height - paddle.height )  ) );

        } 

        if ( game.display_title ) {
            //Show Logo
            
            /**
            ctx.font = '20px press_start_2pregular';
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#FFFFFF';
            ctx.fillText('Bassel BreaKout!',( game_board.pos[0] + (game_board.width/2) ), (game_board.height / 2) );
            **/

            ctx.font = hud_mid.title.text_props.font;
            ctx.textBaseline = hud_mid.title.text_props.textBaseline;
            ctx.textAlign = hud_mid.title.text_props.textAlign;
            ctx.fillStyle = hud_mid.title.text_props.fillStyle;
            ctx.textAlign = 'right';
            ctx.fillText( hud_mid.title.strings.bassel, (hud_mid.pos[0] + (game_board.width / 2.4)), (hud_mid.pos[1]) + ( hud_mid.height / 5 )  );
            ctx.textAlign = 'left';
            ctx.fillText( hud_mid.title.strings.breakout, (hud_mid.pos[0]) + (game_board.width / 2.4), ((( hud_mid.pos[1] + ( (game_board.height - ( (-blocks_initial_starting_y) + game_board.padding_bottom ) ) / hud_mid.title.text_props.line_height) ) + hud_mid.title.text_props.line_height) ) + ( hud_mid.height / 5 ) );
            /**
            ctx.font = hud_mid.title.text_props.font;
            ctx.textBaseline = hud_mid.title.text_props.textBaseline;
            ctx.fillStyle = hud_mid.title.text_props.fillStyle;
            ctx.fillText(hud_mid.title.strings.bassel_breakout, hud_mid.pos[0], hud_mid.pos[2]);
            **/

            //Press any key to play!
            if (!isMobile.any()) {
                ctx.font = ( game_board.padding_top/3 ) + 'px press_start_2pregular';
                ctx.textAlign = hud_top.round.text_props.textAlign;
                ctx.textBaseline = 'top';
                ctx.fillText('Press any key to play', ( game_board.pos[0] + (game_board.width/2)) , game_board.pos[1] + (game_board.padding_top / 2) );
            } else {
                ctx.font = ( game_board.padding_top/3 ) + 'px press_start_2pregular';
                ctx.textAlign = hud_top.round.text_props.textAlign;
                ctx.textBaseline = 'top';
                ctx.fillText('Tap to play', ( game_board.pos[0] + (game_board.width/2)) , game_board.pos[1] + (game_board.padding_top / 2) ); 
            }
        }

        if ( !game.is_running && game.blocks_in_play && !game.is_over ) {
            //Display the Round in the top hud
            ctx.font = hud_top.round.text_props.font;
            ctx.textBaseline = hud_top.round.text_props.textBaseline;
            ctx.textAlign = hud_top.round.text_props.textAlign;
            ctx.fillStyle = hud_top.round.text_props.fillStyle;
            ctx.fillText(hud_top.round.strings.round+game.round, (game_board.pos[0] + (game_board.width/2)) , game_board.pos[1] + (hud_top.height / 2) );
        } else if ( !game.is_running && !game.blocks_animating && !game.is_over && game.round_cleared ) {
            ctx.font = hud_top.next_round.text_props.font;
            ctx.textBaseline = hud_top.next_round.text_props.textBaseline;
            ctx.textAlign = hud_top.next_round.text_props.textAlign;
            ctx.fillStyle = hud_top.next_round.text_props.fillStyle;
            ctx.fillText(hud_top.next_round.strings.try_again, (game_board.pos[0] + (game_board.width/2) ), game_board.pos[1] + (hud_top.height / 2) );

            //Display success message
            ctx.font = hud_mid.text_props.font;
            ctx.textAlign = hud_mid.text_props.textAlign;
            ctx.fillStyle = hud_mid.text_props.fillStyle;
            ctx.fillText( hud_mid.success.strings.success, hud_mid.center[0], hud_mid.center[1] );

        } else if ( game.is_over ) {
            //Display try again message in top_hud
            ctx.font = hud_top.try_again.text_props.font;
            ctx.textBaseline = hud_top.try_again.text_props.textBaseline;
            ctx.textAlign = hud_top.try_again.text_props.textAlign;
            ctx.fillStyle = hud_top.try_again.text_props.fillStyle;
            ctx.fillText(hud_top.try_again.strings.try_again, (game_board.pos[0] + (game_board.width/2) ), game_board.pos[1] + (hud_top.height / 2) );

            //Display 'Game Over' in mid hud
            ctx.font = hud_mid.text_props.font;
            ctx.textAlign = hud_mid.text_props.textAlign;
            ctx.textBaseline = hud_mid.text_props.textBaseline;
            ctx.fillStyle = hud_mid.text_props.fillStyle;
            ctx.fillText( hud_mid.fail.strings.fail, hud_mid.center[0], hud_mid.center[1] );            
        }

        // Border
        
        ctx.beginPath();
        ctx.lineWidth=ball.width + game_board.dropshadow.offset;
        ctx.strokeStyle="#666666";
        //ctx.strokeRect(game_board.pos[0] - (ctx.lineWidth/2), game_board.pos[1] - (ctx.lineWidth/2), game_board.width + (ctx.lineWidth),game_board.height + (ctx.lineWidth));
        
        if ( game_board.pos[1] > 0 ) {
            ctx.fillStyle="#666666";
            ctx.fillRect(game_board.pos[0], 0, canvas.width, game_board.pos[1]);
            ctx.fillRect( game_board.pos[0], (game_board.pos[1] + game_board.height), canvas.width, canvas.height );
        } else if ( game_board.pos[0] > 0 ) {
            ctx.fillStyle="#666666";
            ctx.fillRect(0, 0, game_board.pos[0], canvas.height);
            ctx.fillRect( (game_board.pos[0] + game_board.width), 0, canvas.width, canvas.height );
        }
};

function draw_shadow( element, context ) {
    context.fillStyle = game_board.dropshadow.color;
    context.fillRect( ( element.pos[0] - game_board.dropshadow.offset ), ( element.pos[1] + game_board.dropshadow.offset ), element.width, element.height )
}

function draw_rect( element, context ) {
    context.fillStyle = element.color;
    context.fillRect(element.pos[0], element.pos[1], element.width, element.height);
}

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
    //console.log('game currently over..');
    ball.is_moving = false;
    game.is_running = false;
    game.is_over = true;
    game.round_cleared = false;
}



// Reset game to original state
function reset() {
    game.is_over = false;
    game.is_reset = true;
    game.blocks_in_play = false;

    ball.is_moving = false;
    ball.is_moving_down = false;
    ball.pos[0] = ball.starting_pos[0];
    ball.pos[1] = ball.starting_pos[1];

    paddle.pos[0] = paddle.starting_pos[0];
    paddle.pos[1] = paddle.starting_pos[1];

    blocks = [];
    arrange_blocks();

    if ( !game.round_cleared ) {
        game.display_title = true;
        game.score = game.starting_score;
        game.round = game.starting_round;
    } else {
        console.log('next round!');
        game.round++;
    }
};


function launch_ball() {
    game.is_running = true; 
    ball.is_moving = true; 
}
