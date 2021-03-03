class CreateScripts < ActiveRecord::Migration[6.0]
  def change
    create_table :scripts do |t|
      t.string :name,         default: ""
      t.string :text,         default: ""
      t.references :game_object

      t.timestamps
    end
  end
end
