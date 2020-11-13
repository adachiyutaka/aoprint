class CreateObjectPositions < ActiveRecord::Migration[6.0]
  def change
    create_table :object_positions do |t|
      t.references :game_object,       foreign_key: true
      t.references :position,       foreign_key: true

      t.timestamps
    end
  end
end
