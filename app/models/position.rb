class Position < ApplicationRecord
  with_options presence: true do
    validates :symbol
    validates :x
    validates :y
    validates :width
    validates :height
  end
  
  has_one :object_position
  belongs_to :stage
end
