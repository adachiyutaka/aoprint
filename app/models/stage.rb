class Stage < ApplicationRecord
  belongs_to :game
  has_many :positions

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