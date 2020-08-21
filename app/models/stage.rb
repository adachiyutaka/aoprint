class Stage < ApplicationRecord
  has_many_attached :images

  belongs_to :game
  has_many :lines
end
