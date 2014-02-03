var slide_transition = function(index, direction) {
	if ( index == 1 && direction == 'down' ) {
		console.log('going down!!');
		$('.brad .fixed').attr('src','images/brad-falling.svg');
	} else if ( index == 2 && direction == 'up') {
		console.log('heading back up!!');
		$('.brad .fixed').attr('src','images/brad-falling.svg');
	}
}

var slide_loaded = function(anchorLink, index) {
	if ( index == 2 || index == 1 ) {
		$('.brad .fixed').attr('src','images/brad.svg')
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
