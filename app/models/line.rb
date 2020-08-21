class Line < ApplicationRecord
  with_options presence: true do
    validates :s_x
    validates :s_y
    validates :e_x
    validates :e_y
  end
  
  belongs_to :stage
end
