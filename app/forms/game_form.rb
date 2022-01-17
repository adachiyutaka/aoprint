class GameForm
  include ActiveModel::Model
  attr_accessor :name, :text, :objects, :canvas, :user_id

  # with_options presence: true do
  # end

  def save
    # Gameの作成
    @game = Game.create(name: name, text: text, user_id: user_id)

    # Stageの作成
    canvas_size = JSON.parse(canvas, symbolize_names: true)
    stage = Stage.create(width: canvas_size[:width], height: canvas_size[:height], game_id: @game.id)

    puts "objects in game_form: "
    puts objects
    # TODO: 1object対多positionに対応する必要あり
    # 各オブジェクトを作成
    JSON.parse(objects, symbolize_names: true).each do |object|
      # GameObjectの作成
      game_object = GameObject.create(symbol: object[:symbol], game_id: game.id, role_id: object[:role])

      if object[:image]
        # Imageが既存のものかどうか
        if object[:image][:id]
          image_id = object[:image][:id]
        else
          image = Image.create()
          image.attach_base64url(object[:image][:base64url])
          image_id = image.id
        end
        object_image = ObjectImage.create(game_object_id: game_object.id, image_id: image_id)
      end

      # game_object.parse_base64(object[:object])

      # Positionの作成
      positions = object[:position]
      position = Position.create(symbol: object[:symbol], x: positions[:x], y: positions[:y], width: positions[:width],  height: positions[:height], stage_id: stage.id)
      
      # ObjectPositionの作成
      ObjectPosition.create(game_object_id: game_object.id, position_id: position.id)
    end
  end

  def game
    @game
  end
end