class CreateGameObjects < ActiveRecord::Migration[6.0]
  def change
    create_table :game_objects do |t|
      t.string :name,                        default: ""
      t.string :text,                        default: ""
      t.references :game,       foreign_key: true

      t.timestamps
    end
  end
end
