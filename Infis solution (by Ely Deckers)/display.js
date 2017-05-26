"use strict";

(function (Chip8) {
  Chip8.Display = function (displayCanvasElement) {
    var ZOOM_RATIO = 4, 
        _width     = 64,
        _height    = 32,
        _context   = displayCanvasElement.getContext("2d"),
        _imageData = _context.getImageData(0, 0, _width * ZOOM_RATIO, _height * ZOOM_RATIO),
        _pixels    = _imageData.data,
        _displayUpdateInterval = setInterval(function () { _context.putImageData(_imageData, 0, 0) }, 1/60),
        _clear     = function () {
          var i;
      
          for (i=0; i<_pixels.length; i++) {
            _pixels[i] = 0;
          }
      
          _context.putImageData(_imageData, 0, 0);
        },
        _zoom      = function (ratio, pixels) {
         var i, j, k, line, offset,
             pixelsPerZoomedLine  = _width * ratio,
             zoomedPixels         = new Uint8Array(pixels.length * ratio * ratio); 
  
         for (i=0; i<pixels.length; i++) {
          line   = Math.floor(i / _width);
  
          offset = line * pixelsPerZoomedLine * (ratio - 1);
  
          for (k=0; k<ratio; k++) {
           for (j=0; j<ratio; j++) {
            zoomedPixels[offset + (k * pixelsPerZoomedLine) + (i * ratio) + j] = pixels[i];
           }
          } 
         } 
  
         return zoomedPixels;
        };
  
    _clear();

    return {
      clear : _clear,
      update : function (pixels) {
        var i, index, value,
            zoomedPixels = _zoom(ZOOM_RATIO, pixels);
    
        for (i=0; i<zoomedPixels.length; i++) {
          index = 4 * i;
          value = zoomedPixels[i] * 255;
    
          _pixels[index + 0] = value;
          _pixels[index + 1] = value;
          _pixels[index + 2] = value;
          _pixels[index + 3] = 255;
        }
      },
      getWidth  : function () { return _width; },
      getHeight : function () { return _height; }
    };
  }
}(window.Chip8));
