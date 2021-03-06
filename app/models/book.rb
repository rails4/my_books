class Book < ActiveRecord::Base

  has_many :loans, dependent: :destroy

  mount_uploader :cover, CoverUploader

  attr_accessor :crop_x, :crop_y, :crop_w, :crop_h

  after_update :crop_cover

  def crop_cover
    cover.recreate_versions! if crop_x.present?
  end

end
