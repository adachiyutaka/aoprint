class CreateImages < ActiveRecord::Migration[6.0]
  def change
    create_table :images do |t|
      t.string :name,            default: ""
      t.string :text,            default: ""
      t.references :game_object

      t.timestamps
    end
  end
end
