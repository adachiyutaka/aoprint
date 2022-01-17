class CreateObjectImages < ActiveRecord::Migration[6.0]
  def change
    create_table :object_images do |t|
      t.references :game_object
      t.references :image
      
      t.timestamps
    end
  end
end
