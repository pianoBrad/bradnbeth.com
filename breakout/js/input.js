(function() {
    var coords = 'test';

    // Function for getting coordinates of mouse click or touch
    function relMouseCoords(event){
        var totalOffsetX = 0;
        var totalOffsetY = 0;
        var canvasX = 0;
        var canvasY = 0;
        var currentElement = this;

        do{
            totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
            totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
        }
        while(currentElement = currentElement.offsetParent)

        canvasX = event.pageX - totalOffsetX;
        canvasY = event.pageY - totalOffsetY;

        return {x:canvasX, y:canvasY}
    }
    HTMLCanvasElement.prototype.relMouseCoords = relMouseCoords;


    var pressedKeys = {};

    function setKey(event, status) {
        var code = event.keyCode;
        var key;

        switch(code) {
        case 32:
            key = 'SPACE'; break;
        case 37:
            key = 'LEFT'; break;
        case 38:
            key = 'UP'; break;
        case 39:
            key = 'RIGHT'; break;
        case 40:
            key = 'DOWN'; break;
        default:
            // Convert ASCII codes to letters
            key = '*';
            //key = String.fromCharCode(code);
        }

        if ( event.type == "mousedown" && status) {
            key = 'MOUSEDOWN';
        } else if ( event.type == "mouseup" && !status) {
            key = 'MOUSEDOWN';
        } else if ( event.type == "touchstart" && status) {
            key = 'TOUCHING';
        } else if ( event.type == "touchend" && !status) {
            key = 'TOUCHING';
        } 

        pressedKeys[key] = status;
    }

    document.addEventListener('keydown', function(e) {
        setKey(e, true);
    });

    document.addEventListener('keyup', function(e) {
        setKey(e, false);
    });
  
    document.addEventListener('mousedown', function(e) {
        //console.log('mouse');
        //var key = 'MOUSE';
        setKey(e, true);
        coords = canvas.relMouseCoords(e);
        //console.log(coords.x+' '+coords.y);
        //pressedKeys[key] = true;
        //console.log(pressedKeys[key.toUpperCase()]);
    });


    document.addEventListener('mouseup', function(e) {
        setKey(e, false);
    }); 

    document.addEventListener('touchstart', function(e) {
        setKey(e, true);
        coords = canvas.relMouseCoords(e);
    }); 
    
    document.addEventListener('touchend', function(e) {
        console.log('touchend..');
        setKey(e, false);
    }); 

    window.addEventListener('blur', function() {
        pressedKeys = {};
    });

    window.input = {
        isDown: function(key) {
            /**
            if ( key == 'MOUSEDOWN' && pressedKeys[key.toUpperCase()] ) {
                return 
            } 
            **/
 
            //console.log(pressedKeys[key.toUpperCase()]);
            return pressedKeys[key.toUpperCase()];
        },

        return_coords: function() {
            return coords;
        }
    };
})();