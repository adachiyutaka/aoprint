class Image < ApplicationRecord
  has_one_attached :image
  has_many :object_images
  has_many :game_objects, through: :object_images

  def height
    image.metadata['height']
  end

  def width
    image.metadata['width']
  end

  # base64urlを画像ファイルに変換し、ActiveStorageで保存
  def attach_base64url(base64url)
    # if base64url.present?
    #   content_type = 'png'
    #   base64 = base64url.sub %r/data:image\/png;base64/, ''
    #   decoded_data = Base64.decode64(base64)
    #   filename = Time.zone.now.to_s + '.' + content_type
    #   File.open("#{Rails.root}/tmp/#{filename}", 'wb') do |f|
    #     f.write(decoded_data)
    #   end
    # end
    # image.attach(io: File.open("#{Rails.root}/tmp/#{filename}"), filename: filename)
    # FileUtils.rm("#{Rails.root}/tmp/#{filename}")

    base64 = base64url.sub %r/data:image\/png;base64/, ''
    decoded_data = Base64.decode64(base64)
    filename = Time.zone.now.to_s + '.png'

    image.attach(
      io: StringIO.new(decoded_data),
      filename: filename,
      content_type: "image/png"
    )
  end
end
