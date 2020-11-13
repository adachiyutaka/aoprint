class Game < ApplicationRecord
  with_options presence: true do
    validates :name
  end
  
  belongs_to :user
  has_many :game_objects
  has_many :stages
  has_many :object_positions
end