class GameObject < ApplicationRecord
  extend ActiveHash::Associations::ActiveRecordExtensions

  belongs_to :game
  has_one :preset_game_object
  has_many :object_positions
  has_many :positions, through: :object_positions
  has_many :object_scripts
  has_many :scripts, through: :object_scripts
  has_many :object_images
  has_many :images, through: :object_images
  belongs_to_active_hash :role
end