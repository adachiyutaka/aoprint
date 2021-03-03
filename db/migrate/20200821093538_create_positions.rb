class CreatePositions < ActiveRecord::Migration[6.0]
  def change
    create_table :positions do |t|
      t.string :symbol,       null: false
      t.integer :x,           null: false
      t.integer :y,           null: false
      t.integer :width,       null: false
      t.integer :height,      null: false
      t.string :text,         default: ""
      t.references :stage

      t.timestamps
    end
  end
end
