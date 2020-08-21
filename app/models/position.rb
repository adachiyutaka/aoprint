class Position < ApplicationRecord
  with_options presence: true do
    validates :x
    validates :y
  end

  belongs_to :game_object
end
