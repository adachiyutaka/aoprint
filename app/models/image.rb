class Image < ApplicationRecord
  has_one_attached :image
  has_many :object_images
  has_many :game_objects, through: :object_images

  def height
    image.metadata['height']
  end

  def width
    image.metadata['width']
  end
end
