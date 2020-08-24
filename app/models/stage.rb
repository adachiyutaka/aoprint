class Stage < ApplicationRecord
  has_one_attached :image

  belongs_to :game
  has_many :lines
end
