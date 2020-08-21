class GameObject < ApplicationRecord
  has_many_attached :images

  belongs_to :game
  has_one :position
end
