class AddColumnsToGames < ActiveRecord::Migration[6.0]
  def change
    add_column :game_objects, :item, :boolean, default: false
    add_column :game_objects, :goal, :boolean, default: false
  end
end
