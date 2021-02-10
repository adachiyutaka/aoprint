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

    # TODO: 1object対多positionに対応する必要あり
    # 各オブジェクトを作成
    JSON.parse(objects, symbolize_names: true).each do |object|
      # GameObjectの作成
      game_object = GameObject.new(symbol: object[:symbol], game_id: game.id)
      case object[:script]
        when 'object'
          game_object.object = true
        when 'player'
          game_object.player = true
        when 'enemy'
          game_object.enemy = true
      end
      game_object.save
      game_object.parse_base64(object[:object])
      
      # Positionの作成
      positions = object[:position]
      position = Position.create(symbol: object[:symbol], x: positions[:x], y: positions[:y], width: positions[:width],  height: positions[:height], stage_id: stage.id)
      
      # ObjectPositionの作成
      object_position = ObjectPosition.create(game_object_id: game_object.id, position_id: position.id)
    end
  end

  def game
    @game
  end
end