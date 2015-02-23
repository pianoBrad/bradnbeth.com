var pics = [];
var urls = [];
var images = [];

var preLoadImages = function(urls, slider) {
	for (i = 0; i < urls.length; i++) {
		images[i] = new Image();
		$(images[i]).on('load', function() {
			var pic_index = $.inArray($(this).attr('src'), urls);
			if (pic_index > -1) {
				if (pic_index == 0) {
					$('.slides li').each(function() {
						slider.removeSlide($(this));
					});
				}
				slider.addSlide(pics[pic_index]);
			}
		})

		$(images[i]).attr('src', urls[i]);
	}
}

var loadSlider = function() {
	// Find out how many slides hard-coded into html page 
	// and offset json doc to avoid duplicates
	var offset = $('.slides li').size();
	if (offset > 0) { cur_slide = (offset); }

	$('.flexslider').flexslider({
    	animation: "slide",
    	controlNav: false,
    	start: function(slider) {    		
    		var startHeight = slider.find('.slides li:first-child').outerHeight();

    		preLoadImages(urls, slider);
    	},
    	before: function(slider) {
    		slider.css('height', "inherit");
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

	$('.flex-active-slide').click(function() {
  		$(this).find('.flex-caption').toggle();
	});
}

$(document).ready(function() {

	$.getJSON( "album.json", function( data ) {
		
		$.each( data.pictures, function(pic,info) {
			var cur_url = "";

			// Construct the slide element
			var slide = "<li>"
			if (info.url) { 
				cur_url += info.url;
				slide += '<img src="' + info.url + '" />'; 
			}
			if (info.caption) { 
				slide += '<div class="flex-caption">';
					slide+= '<p>' + info.caption + '</p>';
				slide += '</div>'; 
			}
			slide += "</li>";

			urls.push(cur_url);
			pics.push(slide);

		});
	})
	.always(function() {
		// getJSON complete, let's load flexslider now.
		loadSlider();
	});

});