class Image < ApplicationRecord
  has_one_attached :image

  belongs_to :game_object

  def height
    image.metadata['height']
  end

  def width
    image.metadata['width']
  end
end
