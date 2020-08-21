class CreateGames < ActiveRecord::Migration[6.0]
  def change
    create_table :games do |t|
      t.string :name,           null: false, default: ""
      t.string :text,                        default: ""
      t.references :user,       foreign_key: true
      
      t.timestamps
    end
  end
end
