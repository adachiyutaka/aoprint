class ObjectPosition < ApplicationRecord
  belongs_to :game
  belongs_to :position
  belongs_to :game_object
end