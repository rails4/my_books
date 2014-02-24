## Moje książki

Przykładowa aplikacja korzystająca z gemu *carrierwave* oraz
biblioteki JavaScript Masonry/Isotope.

Linki do dokumentacji Carrierwave:

* [home](https://github.com/jnicklas/carrierwave) –
  classier solution for file uploads for Rails,
  Sinatra and other Ruby web frameworks
* [wiki](https://github.com/jnicklas/carrierwave/wiki)
* [application](https://github.com/jnicklas/carrierwave-example-app/blob/master/app/views/users/_form.html.erb) –
  an example
* [carrierwave-mongoid](https://github.com/jnicklas/carrierwave-mongoid) –
  [Mongoid](http://mongoid.org/en/mongoid/index.html) support for CarrierWave
* [cropping images](http://railscasts.com/episodes/182-cropping-images-revised?view=asciicast) –
  RailsCasts \#182
* [Carrierwave, Rails 4, and Multiple Uploads](http://stackoverflow.com/questions/19712816/carrierwave-rails-4-and-multiple-uploads)

Simple Form:

* [README](https://github.com/plataformatec/simple_form)


## Carrierwave na konsoli

Dopisujemy do *Gemfile*:

```ruby
gem 'rmagick', '~> 2.13.2'
gem 'carrierwave', '~> 0.9.0'
gem 'simple_form', '~> 3.0.1'
```

i instalujemy oba gemy wykonując:

```sh
bundle install
rails generate simple_form:install
```

Kilka okładek pobrałem z [Surrealistyczne okładki książek Daniela Mroza](http://booklips.pl/galeria/surrealistyczne-okladki-ksiazek-daniela-mroza/),
z [Galerii okładek](http://home.agh.edu.pl/~evermind/okladki/galeria_okladek.htm)
i [GitHub Octodex](http://octodex.github.com/). Obrazki zapisałem w katalogu *public*:

* Stanisław Jerzy Lec, Myśli nieuczesane. Wydawnictwo Literackie
* Stanisław Lem, Cyberiada. Wydawnictwo Literackie
* John Ronald Reuel Tolkien, Hobbit. Wydawnictwo Iskry
* John Ronald Reuel Tolkien, Rudy Dżil i jego pies. Wydawnictwo Amber
* The Kimonoctocat

Jak to działa? Na konsoli Rails wykonujemy kolejno:

```ruby
class MyUploader < CarrierWave::Uploader::Base
  storage :file
end
file = File.open('public/lem-cyberiada.jpg')
uploader = MyUploader.new
uploader.store! file
```

Jeśli nie było błędów, to w katalogu *public/uploads/* powinna się
pojawić kopia pliku *lem-cyberiada.jpg*.


## Scaffolding

Generujemy szablon CRUD dla modelu *Book*:

```sh
rails generate scaffold Book author title isbn price:integer
rake db:migrate
```

Generujemy uploader:

```sh
rails g uploader Cover
  create  app/uploaders/cover_uploader.rb
rails g migration add_cover_to_books cover:string
rake db:migrate
```

Dopisujemy uploader do modelu *Book*:

```ruby
class Book < ActiveRecord::Base
  mount_uploader :cover, CoverUploader
end
```

Dopisujemy atrybuty w metodzie *book_params* w kontrolerze *BooksController*:

```ruby
# Never trust parameters from the scary internet, only allow the white list through.
def book_params
  params.require(:book).permit(:author, :title, :isbn, :price,
      :cover, :remove_cover, :cover_cache, :remote_cover_url)
#  :crop_x, :crop_y, :crop_w, :crop_h  # for Jcrop
end
```

Teraz możemy sprawdzić na konsoli Rails, czy nie zrobiliśmy jakiś błędów:

```ruby
b = Book.new
b.title = "Octocat Story"
b.cover = File.open 'public/kimonotocat.jpg'
b.save!
b.cover.url           #=> "/uploads/book/cover/1/kimonotocat.jpg"
b.cover.current_path  #=> ".../public/uploads/book/cover/1/kimonotocat.jpg
b.cover.identifier    #=> "kimonotocat.jpg"
```

Fix white list:

```ruby
class CoverUploader < CarrierWave::Uploader::Base
  def extension_white_list
    %w(jpg jpeg png)
  end
end
```

Różne wielkości obrazków:

```ruby
class CoverUploader < CarrierWave::Uploader::Base
  include CarrierWave::RMagick

  process :resize_to_fit => [400, 400]

  version :thumb do
    process :resize_to_fill => [60,60]
  end
end
```

Dokumentacja [CarrierWave::RMagick](http://rdoc.info/github/jnicklas/carrierwave/CarrierWave/RMagick):

* [instance methods (a-d)](http://www.imagemagick.org/RMagick/doc/image1.html)
* [instance methods (e-o)](http://www.imagemagick.org/RMagick/doc/image2.html)
* [instance methods (p-w)](http://www.imagemagick.org/RMagick/doc/image3.html)
  - [resize_to_fill](http://www.imagemagick.org/RMagick/doc/image3.html#resize_to_fill)
  - [resize_to_fit](http://www.imagemagick.org/RMagick/doc/image3.html#resize_to_fit)


## Rails 4

Poprawiamy szablony.

Zaczynamy od szablonu *_form.html.erb* (korzystamy z gemu *simple_form*):

```rhtml
<%= simple_form_for(@book) do |f| %>
  <%= f.error_notification %>
  <div class="control-group string optional">
    <div class="controls">
    <% if @book.cover? %>
      <%= image_tag @book.cover_url(:thumb) %>
    <% end %>
    </div>
  </div>
  <div class="form-inputs">
    <%= f.input :cover, label: "Upload local file", as: :file%>
    <%= f.hidden_field :cover_cache %>
    <%= f.input :remote_cover_url, label: "or input URL" %>
    <% unless @book.new_record? %>
      <%= f.input :remove_cover, label: "remove cover", as: :boolean %>
    <% end %>
  </div>
  <div class="form-inputs">
    <%= f.input :author %>
    <%= f.input :title %>
    <%= f.input :isbn %>
    <%= f.input :price %>
  </div>
  <div class="form-actions">
    <%= f.button :submit %>
  </div>
<% end %>
```

*show.html.erb*:

```rhtml
<div class="cover">
  <%= image_tag @book.cover_url if @book.cover? %>
</div>
```

*TODO:* dodać CSS dla elementu *div.cover*.


## Strona główna aplikacji

W *config/routes.rb* ustawiamy *root url* aplikacji:

```ruby
MyBooks::Application.routes.draw do
  resources :books
  root 'books#index'
```

**TODO:** Skorzystać z Isotope lub Masonry w *index.html.erb*:

```rhtml
<% @books.each do |book| %>
   <tr>
     <td><%= image_tag(book.cover_url(:thumb)) if book.cover? %></td>
    ...
    ...
    <td>
      <%= link_to t('.show', :default => t("helpers.links.show")), book_path(book), :class => 'btn btn-mini' %>
```

## TODO: Jcrop

* [Jcrop](http://deepliquid.com/content/Jcrop.html),
* [źródło](https://github.com/tapmodo/Jcrop) (Github)

Zmiany w kodzie. Zaczynamy od routingu, *routes.rb*:

```ruby
Library::Application.routes.draw do
  resources :books do
    member do
      get 'crop'
    end
  end
```
Wygenerowany *cover_uploader.rb*:

```ruby
class CoverUploader < CarrierWave::Uploader::Base
  include CarrierWave::RMagick

  process :resize_to_fit => [400, 400]

  version :thumb do
    process :resize_to_fill => [60,60]
  end
```

*books_controller.rb*:


```ruby
class BooksController < ApplicationController
  # GET /books/1/crop
  def show
    @book = Book.find(params[:id])
  end
```

*crop.html.erb*:

```rhtml
    <h1>Crop Cover</h1>
    <%= image_tag @book.cover_url(:large) %>
```

### Dalsze poprawki

*book.rb*:

```ruby
class Book < ActiveRecord::Base
  attr_accessor :crop_x, :crop_y, :crop_w, :crop_h
```

*crop.html.erb*:

```rhtml
<%= image_tag @book.cover_url, id: "cropbox" %>
<%= simple_form_for @book, html: { id: "coords", class: "coords form-horizontal" } do |f| %>
<% %w[x y w h].each do |attr| %>
  <%= f.input "crop_#{attr}", as: :hidden %>
<% end %>
  <div class="form-actions">
    <%= f.button :submit, t("helpers.links.crop"), class: "btn-primary" %>
  </div>
<% end %>
```

Tłumaczenie:

```yaml
en:
  helpers:
    links:
      crop: "Crop"
      tocrop: "click to crop"
```

*application.js*:

```javascript
jQuery(function() {
  $('#cropbox').Jcrop({
    onChange: showCoords,
    onSelect: showCoords,
    onRelease: clearCoords,

    aspectRatio: 1,
    // http://deepliquid.com/content/Jcrop_Sizing_Issues.html
    boxWidth: 400,
    boxHeight: 400
  });
});

function showCoords(c) {
  $('#book_crop_x').val(c.x);
  $('#book_crop_y').val(c.y);
  // $('#x2').val(c.x2);
  // $('#y2').val(c.y2);
  $('#book_crop_w').val(c.w);
  $('#book_crop_h').val(c.h);
};

function clearCoords() {
  $('#coords .controls').val('');
};
```

*book.rb*:

```ruby
class Book < ActiveRecord::Base
  after_update :crop_cover

  def crop_cover
    cover.recreate_versions! if crop_x.present?
  end
```

Dodajemy „przycinanie” do kodu *cover_uploader.rb*:

```ruby
class CoverUploader < CarrierWave::Uploader::Base
  include CarrierWave::RMagick

  process :resize_to_fit => [400, 400]

  version :thumb do
    process :crop
    process :resize_to_fill => [60,60]
  end

  def crop
    if model.crop_x.present?
      manipulate! do |img|
        x = model.crop_x.to_i
        y = model.crop_y.to_i
        w = model.crop_w.to_i
        h = model.crop_h.to_i
        img.crop!(x, y, w, h)
      end
    end
  end
```

Przerabiamy wszystkie obrazki wczytane przez Carrierwave:

```ruby
Book.all.each do |book|
  book.cover.recreate_versions!
end
```

Przycinanie via klikanie na obrazek okładki na stronie **Edit**, *_form.html.erb*:

```rhtml
<div class="controls">
<% if @book.cover %>
  <%= image_tag @book.cover_url(:thumb) %>
  <%= link_to t('.crop', default: t("helpers.links.tocrop")), crop_book_path(@book), class: 'btn' %>
<% end %>
</div>
```
Po edycji i dodaniu nowej książki przechodzimy na stronę główną, a nie na stronę „Show Book”.

JTZ? Poprawić kod metod `create` i `update` kontrolera.


# TODO

Jeszcze takie funkcjonalności powinna mieć ta aplikacja…

## AJAX

* [AJAX uploader & Mongoid](https://github.com/huobazi/ajax-upload-with-carrierwave-mongoid)


## Rijksmuseum

* [Rijksmuseum](https://www.rijksmuseum.nl/en/)


## ISBN API

Dodać możliwość korzystania z ISBN. Zobacz:

* http://stackoverflow.com/questions/1297700/what-is-the-most-complete-free-isbn-api
* http://pastie.org/589354
* http://isbndb.com/docs/api/51-books.html
* https://developers.google.com/books/docs/getting-started?hl=pl
* https://developers.google.com/books/docs/v1/getting_started?hl=pl

## Misc stuff

Debugging views:

```rhtml
<div style="clear: both">
  <%= debug @book %>
</div>
```



## TODO

* Ruby version: **2.1.0**, gemset: **my_books**
* Rails version: **4.0.3**

* System dependencies
* Configuration
* Database creation
* Database initialization
* How to run the test suite
* Services (job queues, cache servers, search engines, etc.)
* Deployment instructions
