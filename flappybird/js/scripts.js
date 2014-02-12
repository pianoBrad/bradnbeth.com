var bird_height = $('.bird').outerHeight();
var world_height = $('.world').outerHeight();
var world_width = $('.world').outerWidth();
var bounce_height = 80;
var bounce_duration = 350;
var pipe_width = 85;
var pipe_top_height = 40;
var pipe_bottom_height = 40;

var pipe_assembly;
var pipe_vs_bird;

var current_pipe_position;
var pipe_top_x;
var pipe_bottom_x;

var collision_test = function(element1, element2) {
      var x1 = element1.offset().left;
      var y1 = element1.offset().top;
      var h1 = element1.outerHeight(true);
      var w1 = element1.outerWidth(true);
      var b1 = y1 + h1;
      var r1 = x1 + w1;
      var x2 = element2.offset().left;
      var y2 = element2.offset().top;
      var h2 = element2.outerHeight(true);
      var w2 = element2.outerWidth(true);
      var b2 = y2 + h2;
      var r2 = x2 + w2;
        
      if (b1 < y2 || y1 > b2 || r1 < x2 || x1 > r2) return false;
      return true;
}

function randomIntFromInterval(min,max)
{
    return Math.floor(Math.random()*(max-min+1)+min);
}

var get_current_position = function(selector) {
	var position = selector.position();
	return position;
}


var get_bounce_height = function( current_x ) {

	var distance_from_ground = world_height - ( current_x + bird_height );

	return distance_from_ground;

}

var get_bounce_duration = function( distance_from_ground ) {

	speed_to_ground = ( bounce_duration * distance_from_ground ) / bounce_height;

	if ( speed_to_ground >= bounce_duration ) {
		return speed_to_ground;
	} else {
		return bounce_duration;
	}

}

var start_pipe = function() {
	var random_pipe_top_height = randomIntFromInterval(30,60); 
	var random_pipe_bottom_height = 100 - (random_pipe_top_height + 30 );
	console.log('random pipe top height is '+random_pipe_top_height+' bottom pipe height is '+random_pipe_bottom_height);

	$('.world').append('<div class="pipe-wrap" style="width:'+pipe_width+'; right: -'+pipe_width+'px"><div class="pipe top" style="height:'+random_pipe_top_height+'%;"></div><div class="pipe bottom" style="height:'+random_pipe_bottom_height+'%;"></div></div>');

	if ( $('.pipe-wrap.next').length == 0 ) {
		$('.pipe-wrap').addClass('next');
		pipe_top_x = $('.pipe-wrap.next .pipe.top').outerHeight();
		pipe_bottom_x = world_height - $('.pipe-wrap.next .pipe.bottom').outerHeight();
	}

	$('.pipe-wrap').animate({
		x : -(world_width + pipe_width)+'px'
	},
	5000,
	'linear' 
	);
}

var game_over = function() {

	$('.pipe-wrap').stop(true);
	

	clearInterval(pipe_vs_bird);
	clearInterval(pipe_assembly);
}

var is_pipe_still_next = function() {
	current_pipe_position = get_current_position( $('.pipe-wrap.next') );
	var current_bird_position = get_current_position( $('.bird') );

	//console.log('test'+(current_pipe_position.left + pipe_width)+' '+current_bird_position.left);

	if ( (current_pipe_position.left + pipe_width) < current_bird_position.left && current_pipe_position.left > 0 ) {
		console.log('clear!');
		//alert('current pipe x is '+current_pipe_position.left+' + current bird position is '+current_bird_position.left+'..clear!');
		var cleared_pipe = $('.pipe-wrap.next');
		var next_pipe = cleared_pipe.next('.pipe-wrap').addClass('next');
		cleared_pipe.removeClass('next');
		current_pipe_position = get_current_position( $('.pipe-wrap.next') );
		pipe_top_x = $('.pipe-wrap.next .pipe.top').outerHeight();
		pipe_bottom_x = world_height - $('.pipe-wrap.next .pipe.bottom').outerHeight();
		//alert('class removed from cleared pipe & added to next pipe..which has current position of '+(current_pipe_position.left + pipe_width));
	}
}

var is_bird_touching = function() {

	var current_bird_position = get_current_position( $('.bird') );
	var current_bird_position_top = current_bird_position.top;
	var current_bird_position_bottom = ( current_bird_position_top + bird_height );
	
	if ( pipe_top_x < current_bird_position_top  && pipe_bottom_x > current_bird_position_bottom ) {
		console.log(pipe_top_x+' '+current_bird_position_top+' '+current_bird_position_bottom+' '+pipe_bottom_x);
		return false;
	} else {
		console.log('pipe top is at '+pipe_top_x+', pipe bottom is at '+pipe_bottom_x+', bird is at '+current_bird_position_top+' '+current_bird_position_bottom+': yes');
		return true;
	}
}

$(document).ready(function() {

	$(function() {
            FastClick.attach(document.body);
    });
	

	$('body').one('click', function() {
		$('.hud .get-ready').hide();
		start_pipe();
		pipe_assembly = window.setInterval(function() { start_pipe(); }, 1500)

		pipe_vs_bird = window.setInterval(function() { is_pipe_still_next(); if ( collision_test( $('.bird'), $('.pipe-wrap.next') ) == true && is_bird_touching() == true ) { game_over(); }}, 100);
	});

	$('body').on('click', function() {
		var bird_position = get_current_position( $('.bird') );

		$('.bird').clearQueue();

		$('.bird').stop(true).css('top',bird_position.top+'px').css('y','0px');
		
		
		$('.bird').animate({
			y: '-='+bounce_height+'px'
		}, bounce_duration, 'easeOutQuad', function() {
			var distance_from_ground = get_bounce_height( bird_position.top )
			$('.bird').animate({
				y: distance_from_ground+'px'
			}, get_bounce_duration( distance_from_ground ), 'easeInQuad');
		});
		
	


	});

});
