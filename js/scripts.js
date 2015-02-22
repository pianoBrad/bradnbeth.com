var pics = [];
var cur_slide = 0;
var slides_batch = 5;

var getPhotos = function() {
	var slides = "";
	var start_slide = cur_slide;

	for (var i = start_slide; i < (start_slide + slides_batch); i++) {
		slides += pics[cur_slide];

		cur_slide++;
	}

	return slides;

}

var loadSlider = function() {
	/**
	$(pics).each(function( pic, info ) {
		console.log(pic);
	});**/
	// Find out how many slides hard-coded into html page 
	// and offset json doc to avoid duplicates
	var offset = $('.slides li').size();
	if (offset > 0) { cur_slide = (offset); }

	$('.flexslider').flexslider({
    	animation: "slide",
    	controlNav: false,
    	start: function(slider) {    		
    		var startHeight = slider.find('.slides li:first-child').outerHeight();
    		//slider.css('height', startHeight - 8);
    		//slider.css('max-height', startHeight - 8);
    	},
    	before: function(slider) {
    		slider.css('height', "inherit");
    		slider.removeClass('loading');
    	},
    	after: function(slider) {
    		console.log(slider.currentSlide + 1);
    		console.log(slider.count);

    		if ( slider.count - (slider.currentSlide + 1) <= 1 ) {

    			if ( cur_slide < pics.length ) {

    			var start_slide = cur_slide;
    			for (var i = start_slide; i < (start_slide + slides_batch); i++) {
    				if(pics[cur_slide]) {
    					console.log(pics[cur_slide]);
    					slider.addSlide(pics[cur_slide]);
    				}

    				cur_slide++;
    			}

    			}

    		}
    	},
    	end: function(slider) {
    		// Slider reached end
    	}
  	});

  	$('.flexslider .flex-direction-nav .flex-prev').html('<i class="fa fa-angle-double-left"></i>');
	$('.flexslider .flex-direction-nav .flex-next').html('<i class="fa fa-angle-double-right"></i>');

	$('.flex-active-slide').click(function() {
  		$(this).find('.flex-caption').toggle();
	});
}

$(document).ready(function() {

	$.getJSON( "album.json", function( data ) {
		
		$.each( data.pictures, function(pic,info) {
			//console.log("key: " + key + " " + "val: " + val);
			//pics.push(info);

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

});