class AddEnemyToGameObjects < ActiveRecord::Migration[6.0]
  def change
    add_column :game_objects, :enemy, :boolean, default: false
  end
end
