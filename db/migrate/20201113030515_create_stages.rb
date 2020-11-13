class CreateStages < ActiveRecord::Migration[6.0]
  def change
    create_table :stages do |t|
      t.references :game,       foreign_key: true

      t.timestamps
    end
  end
end
