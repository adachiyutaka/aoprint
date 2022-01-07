class Position < ApplicationRecord
  with_options presence: true do
    validates :x
    validates :y
    validates :width
    validates :height
  end
  
  has_one :object_position
  has_one :game_object, through: :object_position
  belongs_to :stage
end
