class CreatePositions < ActiveRecord::Migration[6.0]
  def change
    create_table :positions do |t|
      t.integer :x,           null: false
      t.integer :y,           null: false
      t.references :game_object,       foreign_key: true

      t.timestamps
    end
  end
end
