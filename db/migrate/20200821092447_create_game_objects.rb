class CreateGameObjects < ActiveRecord::Migration[6.0]
  def change
    create_table :game_objects do |t|
      t.string  :symbol,         default: ""
      t.string  :name,           default: ""
      t.string  :text,           default: ""
      t.integer :role_id,        default: 1
      t.json    :mesh_data
      t.references :game
      t.references :image
      t.references :script

      t.timestamps
    end
  end
end
