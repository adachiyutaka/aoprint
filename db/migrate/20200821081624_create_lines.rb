class CreateLines < ActiveRecord::Migration[6.0]
  def change
    create_table :lines do |t|
      t.integer :s_x,           null: false
      t.integer :s_y,           null: false
      t.integer :e_x,           null: false
      t.integer :e_y,           null: false
      t.references :stage,       foreign_key: true
      
      t.timestamps
    end
  end
end
