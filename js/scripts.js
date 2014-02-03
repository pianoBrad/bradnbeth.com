var slide_transition = function(index, direction) {
	if ( index == 1 && direction == 'down' ) {
		console.log('going down!!');
		$('.brad .wrap').css('background-image','url("images/brad-falling.svg")');
	} else if ( index == 2 && direction == 'up') {
		console.log('heading back up!!');
		$('.brad .fixed').css('background-image','url("images/brad-falling.svg")');
	}
}

var slide_loaded = function(anchorLink, index) {
	if ( index == 2 || index == 1 ) {
		currentHeight = $('.brad .fixed').outerHeight();
		$('.brad .fixed').css('background-image','url("images/brad.svg")');
	}
}


$(document).ready(function() {
	$.fn.fullpage({
		afterLoad: function(anchorLink, index){
			slide_loaded(anchorLink, index);
		},
		onLeave: function(index, direction){
			slide_transition(index, direction);
		}
	});

});
