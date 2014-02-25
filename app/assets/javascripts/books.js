$(document).ready(function() {

  var $container = $('#books-container');
  $container.isotope({
    itemSelector: '.book',
    layoutMode: 'masonry',
    masonry: {
      gutter: 20
    }
  });

});
