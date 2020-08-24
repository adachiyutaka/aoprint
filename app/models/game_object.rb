class GameObject < ApplicationRecord
  has_one_attached :image

  belongs_to :game
  has_one :position
end
