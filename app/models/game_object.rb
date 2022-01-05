class GameObject < ApplicationRecord
  extend ActiveHash::Associations::ActiveRecordExtensions

  belongs_to :game
  has_one :preset_game_object
  has_many :object_positions
  has_many :positions, through: :object_positions
  has_many :object_scripts
  has_many :scripts, through: :object_scripts
  has_many :object_images
  has_many :images, through: :object_images
  belongs_to_active_hash :role

  # 画像をbase64形式のファイルに変換
  def parse_base64(image)
    if image.present?
      content_type = 'png'
      contents = image.sub %r/data:image\/png;base64/, ''
      decoded_data = Base64.decode64(contents)
      filename = Time.zone.now.to_s + '.' + content_type
      File.open("#{Rails.root}/tmp/#{filename}", 'wb') do |f|
        f.write(decoded_data)
      end
    end
    attach_image(filename)
  end

  private
  # ファイルをGameObjectのimageとしてアタッチ
  def attach_image(filename)
    image.attach(io: File.open("#{Rails.root}/tmp/#{filename}"), filename: filename)
    FileUtils.rm("#{Rails.root}/tmp/#{filename}")
  end
end