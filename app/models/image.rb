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

  # base64urlをActiveStorageで保存
  def attach_base64url(base64url)
    base64 = base64url.sub(%r/data:image\/png;base64/, '')
    filename = Time.zone.now.to_s + '.png'
    image.attach(
      io: StringIO.new(Base64.decode64(base64)),
      filename: filename,
      content_type: "image/png"
    )
  end
end
