class Game < ApplicationRecord
  with_options presence: true do
    validates :name
  end
  
  belongs_to :user
  has_many :game_objects, dependent: :destroy
  has_many :stages, dependent: :destroy
end