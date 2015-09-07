var pics = [];

var loadSlider = function() {
	// Find out how many slides hard-coded into html page 
	// and offset json doc to avoid duplicates

	$('.flexslider').flexslider({
    	animation: "slide",
    	controlNav: false,
    	start: function(slider) {
    		/**    		
    		var startHeight = slider.find('.slides li:first-child').outerHeight();

    		$(pics).each(function(index, pic) {
    			slider.addSlide(pic);
    		});
			**/
    	},
    	before: function(slider) {
    		/**
    		slider.css('height', "inherit");
    		**/
    		slider.removeClass('loading');
    	},
    	after: function(slider) {
    	},
    	end: function(slider) {
    		// Slider reached end

    	}
  	});

  	$('.flexslider .flex-direction-nav .flex-prev').html('<i class="fa fa-angle-double-left"></i>');
	$('.flexslider .flex-direction-nav .flex-next').html('<i class="fa fa-angle-double-right"></i>');

	$('.slides li').click(function() {
		$(this).find('.flex-caption').toggle();
	});
}

$(document).ready(function() {

	loadSlider();
	/**
	$.getJSON( "album.json", function( data ) {
		
		$.each( data.pictures, function(pic,info) {

			//Construct the slide element
			var slide = "<li>"
			if (info.url) { slide += '<img src="' + info.url + '" />'; }
			if (info.caption) { 
				slide += '<div class="flex-caption">';
					slide+= '<p>' + info.caption + '</p>';
				slide += '</div>'; 
			}
			slide += "</li>";

			pics.push(slide);

		});
	})
	.always(function() {
		// getJSON complete, let's load flexslider now.
		loadSlider();
	});
	**/

	$(".reception .icon").click(function(e) {
  		$("html, body").animate({ scrollTop: $(document).height() }, "slow");
  		e.preventDefault();
	});

});