(function() {

  $('#jcrop_target').Jcrop({
    onChange: showCoords,
    onSelect: showCoords,
    minSize: [200, 200],

    onRelease: clearCoords,

    // http://deepliquid.com/content/Jcrop_Sizing_Issues.html
    boxWidth: 400,
    boxHeight: 400
  }); 

  // function showCoords(c) {
  //   console.log('x:', c.x, ' y:', c.y, 'w:', c.w, ' h:', c.h);
  // };

  function showCoords(c) {
    $('#book_crop_x').val(c.x);
    $('#book_crop_y').val(c.y);
    $('#book_crop_w').val(c.w);
    $('#book_crop_h').val(c.h);
  
    console.log('x:', c.x, ' y:', c.y, 'w:', c.w, ' h:', c.h);
  };

  function clearCoords() {
    $('#coords input').val('');
  };

  console.log('crop.js: Jcrop was configured...')

})();
