class Book < ActiveRecord::Base

  mount_uploader :cover, CoverUploader

end
