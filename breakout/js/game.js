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
var proportion_x = 60; //320;
var proportion_y = 90; //568;
var padding_proportion_top = 8;
var padding_proportion_bottom = 8;
var paddle_proportion_x = 10;
var paddle_proportion_y = 3;
//var paddle_width = 100;
//var paddle_height = 25;
var paddle_speed = 300;

var ball_proportion_width = 3;
var ball_proportion_height = 3;
var ball_x_speed = 150;
var ball_y_speed = 150;

var block_proportion_width = 4;
var block_proportion_height = 3;

var bassel_proportion_width = 22;
var bassel_proportion_height = 31;

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
    var block_pos = [block_starting_x,0];

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
var bassel_url = 'images/bassel.'+file_extension;
var paddle_url = 'images/paddle.'+file_extension;
var ball_url = 'images/ball.'+file_extension;
var block_url = { 
    red: 'images/block_red.'+file_extension
}

resources.load([
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

game_board = {
    width: 400,
    height: 600,
    pos: [( canvas.width / 2 ) - ( 400 / 2 ), 0],
    padding_top: Math.round( ( 600 * padding_proportion_top ) / proportion_y ),
    padding_bottom: Math.round( ( 600 * padding_proportion_bottom ) / proportion_y ),
    padding_left: ( canvas.width / 2 ) - ( 400 / 2 ),
    dropshadow: {
        color: 'rgba(0,0,0,0.35)',
        offset: ( ( 400 * dropshadow_proportion ) / proportion_x )
    }
}

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
        pos: [game_board.pos[0], 0],
        width: game_board.width,
        height: game_board.height,
        color: 'rgb(55,55,55)'
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

var hud = {
    height: game_board.padding_bottom,
    width: game_board.width,
    pos: [game_board.pos[0], ( game_board.height - game_board.height/10 ), game_board.width + game_board.padding_left, game_board.height ],
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
    starting_pos: [(game_board.width / 2) - ( ( ( game_board.width * paddle_proportion_x ) / proportion_x ) /2 ) + (game_board.pos[0]), ( ( game_board.height - ( ( game_board.height * paddle_proportion_y ) / proportion_y )) - hud.height )],
    pos: [( ( game_board.width / 2 ) - ( ( ( game_board.width * paddle_proportion_x ) / proportion_x ) / 2 ) ) + (game_board.pos[0]), ( ( game_board.height - ( ( game_board.height * paddle_proportion_y ) / proportion_y )) - hud.height )],
    x2: ( (game_board.width / 2) + ( ( ( game_board.width * paddle_proportion_x ) / proportion_x ) / 2 ) ),
    y2: ( game_board.height - ( game_board.height/10 ) ),
    height: ( ( game_board.height * paddle_proportion_y ) / proportion_y ) ,
    width: ( ( game_board.width * paddle_proportion_x ) / proportion_x ) ,
    color: 'rgb( 254, 238, 106)',
    speed: paddle_speed,
    is_moving: false,
    horizontal_dir: 'left'
    //sprite: new Sprite(paddle_url, [0, 0], [paddle_width, paddle_height], 10, [0])
}

var ball = {
    starting_pos: [ (game_board.width / 2) - ( ( ( game_board.width * ball_proportion_width ) / proportion_x ) /2 ) + (game_board.pos[0]), (paddle.pos[1]-( ( game_board.height * ball_proportion_height ) / proportion_y ))],
    pos: [ (game_board.width / 2) - ( ( ( game_board.width * ball_proportion_width ) / proportion_x ) /2 ) + (game_board.pos[0]), (paddle.pos[1]-( ( game_board.height * ball_proportion_height ) / proportion_y ))],
    x2: ( (canvas.width / 2) + ( ( game_board.width * ball_proportion_width ) / proportion_x ) ),
    y2: ( (canvas.height / 2) + ( ( game_board.height * ball_proportion_height ) / proportion_y ) ),
    height: Math.round( ( game_board.height * ball_proportion_height ) / proportion_y ),
    width: Math.round( ( game_board.width * ball_proportion_width ) / proportion_x ),
    is_moving: true,
    is_moving_down: false,
    is_moving_right: true,
    is_colliding: false,
    animating_speed: 100,
    center: [ 0,0 ],
    sprite: new Sprite(ball_url, [0, 0], [ball_source_width, ball_source_height], 10, [0], 'horizontal', [ ( ( ( game_board.width * ball_proportion_width ) / proportion_x ) / ball_source_width ) , ( ( ( game_board.height * ball_proportion_height ) / proportion_y ) / ball_source_height )])
}

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


//var block_width = 75;
//var block_height = 25;
var blocks = [];
var total_blocks = 38;
var blocks_total_columns = 11;
var blocks_total_rows = 12;
var blocks_initial_starting_y = 0 - ( game_board.padding_top + ( blocks_total_rows * block.height ) ); 
var block_starting_x = Math.round( (( game_board.width - (blocks_total_columns * block.width) ) / 2) + game_board.pos[0] );

var bassel = {
    starting_pos: [ 
        ( game_board.width / 2 ) - ( (( game_board.width * bassel_proportion_width ) / proportion_x) / 2 ) + game_board.pos[0] , 
        ( (game_board.padding_top)+ ( (((blocks_total_rows + 2) * block.height)/2) - ( (( game_board.height * bassel_proportion_height ) / proportion_y) / 2 ) ) ) ],
    pos: [
        ( game_board.width / 2 ) - ( (( game_board.width * bassel_proportion_width ) / proportion_x) / 2 ) + game_board.pos[0] ,
        ( (game_board.padding_top)+ ( (((blocks_total_rows + 2) * block.height)/2) - ( (( game_board.height * bassel_proportion_height ) / proportion_y) / 2 ) ) ) ],
    width: ( game_board.width * bassel_proportion_width ) / proportion_x,
    height: ( game_board.height * bassel_proportion_height ) / proportion_y,
    sprite: new Sprite(bassel_url, [0, 0], [bassel_source_width, bassel_source_height], 10, [0], 'horizontal', [ ( (( game_board.width * bassel_proportion_width ) / proportion_x) / bassel_source_width ) , ( (( game_board.height * bassel_proportion_height ) / proportion_y) / bassel_source_height ) ])
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
    if ( ( input.isDown('*') || input.isDown('LEFT') || (input.isDown('RIGHT')) || input.isDown('MOUSEDOWN') ) && !currently_pressed ) {
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
        if ( !game.is_running && game.is_reset ) { ball.is_moving_right = true; launch_ball(); };
        //console.log('RIGHT');
        console.log(game.blocks_in_play);
        paddle.is_moving = true;
        paddle.horizontal_dir = 'right';
    } else if ( input.isDown('LEFT') && game.blocks_in_play && !game.is_over ) {
        if ( !game.is_running && game.is_reset ) { ball.is_moving_right = false; launch_ball(); };
        //console.log('LEFT');
        paddle.is_moving = true;
        paddle.horizontal_dir = 'left';
    } else {
        paddle.is_moving = false;
    }

    if ( input.isDown('MOUSEDOWN') && !mouse_currently_pressed && game.blocks_in_play ) { 
        mouse_currently_pressed = true;
        current_mouse_pressed_coords = input.return_coords();
        if ( !game.is_running && game.is_reset ) { launch_ball(); };
    } else if ( !input.isDown('MOUSEDOWN') ) {
        mouse_currently_pressed = false;
        current_mouse_pressed_coords = {}
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

    if ( paddle.pos[0] <= game_board.pos[0] ) {
        paddle.pos[0] = game_board.pos[0];
    } else if ( ( paddle.pos[0] + paddle.width ) >= ( game_board.pos[0] + game_board.width ) ) {
        paddle.pos[0] = ( game_board.pos[0] + game_board.width ) - paddle.width;
    }


    // Ball Movement
    if ( ball.is_moving && game.is_running ) {
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

        if ( ball.pos[1] >= game_board.height ) {
            game.is_over = true;
        } 
    }

    // Handle block movement
    if ( game.blocks_animating && blocks[0].pos[1] <= game_board.padding_top ) {
        console.log('animating..');
        game.display_title = false;
        for( b=0; b < blocks.length; b++) {
            blocks[b].pos[1] += 10;
        }
    }  else if ( game.blocks_animating ) {
        game.blocks_animating = false;
        game.blocks_in_play = true;
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
    if ( ball.y2 >= game_board.height ) {
        //ball.is_moving_down = false;
    } else if ( ball.x2 >= ( game_board.width + game_board.pos[0] )  ) {
        ball.is_moving_right = false;
    } else if ( ball.pos[0] <= game_board.pos[0] ) {
        ball.is_moving_right = true;
    } else if ( ball.pos[1] <= 0 ) {
        ball.is_moving_down = true;
    }

    if ( game.is_running && blocks.length <= 0 ) {
        game.is_running = false;
        game.round_cleared = true;
        reset();
    }
    
    if ( box_collides( ball.pos, [ball.width, ball.height], paddle.pos, [paddle.width, paddle.height] ) ) {
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
        if ( box_collides( ball.pos, [ball.width, ball.height], blocks[b].pos, [blocks[b].width, blocks[b].height ] ) && !blocks[b].is_cleared ) {
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
                game.score++;
                blocks.splice(b, 1);
            } else if ( 
                !ball.is_colliding 
              ) {
                ball.is_colliding = true;
                ball.is_moving_down = !ball.is_moving_down;
                blocks[b].is_cleared = true;
                game.score++;
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
        ctx.fillStyle = "#CCCCCC";
        ctx.fillRect(0,0,canvas.width, canvas.height);

        draw_rect( game.background, ctx );

        
            
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
            ctx.font = '20px press_start_2pregular';
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#FFFFFF';
            ctx.fillText('Bassel BreaKout!',( game_board.pos[0] + (game_board.width/2) ), (game_board.height / 2) );

            //Press any key to play!
            if (!isMobile.any()) {
                ctx.font = ( game_board.padding_top/3 ) + 'px press_start_2pregular';
                ctx.textBaseline = 'top';
                ctx.fillText('Press any key to play', ( game_board.pos[0] + (game_board.width/2)) , (game_board.padding_top / 2) );
            }
        }

        if ( !game.is_running && game.blocks_in_play && !game.is_over ) {
            //Display the Round in the top hud
            ctx.font = hud_top.round.text_props.font;
            ctx.textBaseline = hud_top.round.text_props.textBaseline;
            ctx.textAlign = hud_top.round.text_props.textAlign;
            ctx.fillStyle = hud_top.round.text_props.fillStyle;
            ctx.fillText(hud_top.round.strings.round+game.round, (game_board.pos[0] + (game_board.width/2)) , (hud_top.height / 2) );
        } else if ( !game.is_running && !game.blocks_animating && !game.is_over && game.round_cleared ) {
            ctx.font = hud_top.next_round.text_props.font;
            ctx.textBaseline = hud_top.next_round.text_props.textBaseline;
            ctx.textAlign = hud_top.next_round.text_props.textAlign;
            ctx.fillStyle = hud_top.next_round.text_props.fillStyle;
            ctx.fillText(hud_top.next_round.strings.try_again, (game_board.pos[0] + (game_board.width/2) ), (hud_top.height / 2) );
        } else if ( game.is_over ) {
            //Display try again message in top_hud
            ctx.font = hud_top.try_again.text_props.font;
            ctx.textBaseline = hud_top.try_again.text_props.textBaseline;
            ctx.textAlign = hud_top.try_again.text_props.textAlign;
            ctx.fillStyle = hud_top.try_again.text_props.fillStyle;
            ctx.fillText(hud_top.try_again.strings.try_again, (game_board.pos[0] + (game_board.width/2) ), (hud_top.height / 2) );
        }

        // Red rectangle
        
        ctx.beginPath();
        ctx.lineWidth=ball.width + game_board.dropshadow.offset;
        ctx.strokeStyle="#666666";
        ctx.strokeRect(game_board.pos[0] - (ctx.lineWidth/2), game_board.pos[1] - (ctx.lineWidth/2), game_board.width + (ctx.lineWidth),game_board.height + (ctx.lineWidth));
        
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
