class CreateGameObjects < ActiveRecord::Migration[6.0]
  def change
    create_table :game_objects do |t|
      t.string :symbol,         default: ""
      t.string :name,           default: ""
      t.string :text,           default: ""
      t.boolean :player,        default: false
      t.boolean :object,        default: false
      t.references :game
      
      t.timestamps
    end
  end
end
