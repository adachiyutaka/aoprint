class Position < ApplicationRecord
  with_options presence: true do
    validates :symbol
    validates :x
    validates :y
    validates :width
    validates :height
  end

  belongs_to :game_object
end
