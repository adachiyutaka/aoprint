class ObjectPosition < ApplicationRecord
  belongs_to :position
  belongs_to :game_object
end