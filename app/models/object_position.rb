class ObjectPosition < ApplicationRecord
  with_options presence: true do
    validates :name
  end
  
  belongs_to :game
  belongs_to :position
  belongs_to :game_object
end