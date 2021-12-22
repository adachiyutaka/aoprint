class Image < ApplicationRecord
  has_one_attached :image

  belongs_to :game_object
end
