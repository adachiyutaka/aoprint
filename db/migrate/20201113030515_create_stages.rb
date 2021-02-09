class CreateStages < ActiveRecord::Migration[6.0]
  def change
    create_table :stages do |t|
      t.integer :width,       null: false
      t.integer :height,      null: false
      t.references :game

      t.timestamps
    end
  end
end
