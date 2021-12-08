class CreatePresetGameObjects < ActiveRecord::Migration[6.0]
  def change
    create_table :preset_game_objects do |t|
      t.string :groupe,                default: ""
      t.references :game_object,       foreign_key: true

      t.timestamps
    end
  end
end
