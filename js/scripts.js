// Can also be used with $(document).ready()
$(document).ready(function() {
  $('.flexslider').flexslider({
    animation: "slide",
    controlNav: false,
    start: function(slider) {
    	var startHeight = slider.find('.slides li:first-child').outerHeight();
    	slider.css('height', startHeight);
    },
    before: function(slider) {
    	slider.css('height', "inherit");
    	console.log('slider ready!');
    	slider.removeClass('loading');
    }
  });

  $('.flexslider .flex-direction-nav .flex-prev').html('<i class="fa fa-angle-double-left"></i>');
  $('.flexslider .flex-direction-nav .flex-next').html('<i class="fa fa-angle-double-right"></i>');

  $('.flex-active-slide').click(function() {
  	$(this).find('.flex-caption').toggle();
  });
});



    /**
    after: function(slider){
      console.log('check fire');
    }**/