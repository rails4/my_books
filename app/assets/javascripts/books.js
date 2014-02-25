$(document).ready(function() {

  var addBooksToIsotope = function() {
    $('#books-container').isotope({
      itemSelector: '.book',
      layoutMode: 'masonry',
      masonry: {
        gutter: 20
      }
    });
  };

  addBooksToIsotope();
  $(document).bind("page:load", addBooksToIsotope);

  // document.addEventListener("page:load", addBooksToIsotope);

});
