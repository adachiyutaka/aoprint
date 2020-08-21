class Game < ApplicationRecord
  with_options presence: true do
    validates :name, uniqueness: { case_sensitive: true }
  end
  
  belongs_to :user
  has_many :game_objects, dependent: :destroy
  has_many :stages, dependent: :destroy
end