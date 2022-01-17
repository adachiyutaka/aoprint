class Script < ApplicationRecord
  has_many :object_scripts
  has_many :game_objects, through: :object_scripts
end
