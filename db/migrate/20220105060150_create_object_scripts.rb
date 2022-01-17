class CreateObjectScripts < ActiveRecord::Migration[6.0]
  def change
    create_table :object_scripts do |t|
      t.references :game_object
      t.references :script

      t.timestamps
    end
  end
end
