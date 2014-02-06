var change_body_background = function(index) {
	var background_color;
	switch (index) {
    	case 1:
        	background_color = $('.section.intro').css('background-color');
        	$('html').css('background-color', background_color);
        	break;
    	case 2:
        	background_color = $('.about-brad').css('background-color');
        	$('html').css('background-color', background_color);
        	break;
        case 3:
        	background_color = $('.about-beth').css('background-color');
        	$('html').css('background-color', background_color);
        	break;
	}
}

var slide_transition = function(index, direction) {
	change_body_background(index);

	if ( index == 1 && direction == 'down' ) {
		console.log('going down!!');
		$('.brad .wrap.fixed').removeClass('pose-normal').addClass('pose-falling').css('top','inherit');
	} else if ( index == 2 && direction == 'up') {
		console.log('heading back up!!');
		$('.brad .wrap').addClass('fixed').removeClass('pose-normal').addClass('pose-falling').css('top', $('.brad').position().top);
	}
}

var slide_loaded = function(anchorLink, index) {
	if ( index == 1 && $('.section.intro .brad').length == 0 ) {
		$('.about-brad .brad').prependTo('.section.intro .characters').children('.wrap').addClass('fixed').css('top','inherit');
	}
	if ( index == 2 || index == 1 ) {
		currentHeight = $('.brad .fixed').outerHeight();
		$('.brad .fixed').removeClass('pose-falling').addClass('pose-normal');
	}
	if ( index == 2 ) {
		$('.section.intro .brad').prependTo('.about-brad .characters').children('.wrap').removeClass('fixed');
	}
	if ( index == 3 && $('.about-brad .brad').length == 0 ) {
		$('.brad').prependTo('.about-brad .characters').children('.wrap').removeClass('fixed').css('top','auto');
	}
}


$(document).ready(function() {
	$.fn.fullpage({
		anchors:['introPage', 'breezy', 'bephie'],
		slidesColor: ['#ffa9bc','#333333','#008080'],
		css3: false,
		afterLoad: function(anchorLink, index){
			slide_loaded(anchorLink, index);
		},
		onLeave: function(index, direction){
			slide_transition(index, direction);
		}
	});

	$('.section.intro .beth .wrap a').click(function() {
		$('.section.intro .brad .wrap').removeClass('fixed');
	});

});
