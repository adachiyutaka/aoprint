class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable
  with_options presence: true do
    validates :name
  end

  validate :password_complexity

  def password_complexity
    return if password.blank? || password =~ /\A(?=.*?[a-z])(?=.*?[0-9])[a-z\d]{6,}\z/i
    errors.add :password, 'Complexity requirement not met. Length should be 6 characters or more, include: 1 alphabet and 1 digit and input alphabet and digit'
  end

  has_one_attached :icon
  has_one_attached :background

  has_many :games, dependent: :destroy
end
