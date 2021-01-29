class GameForm
  include ActiveModel::Model
  attr_accessor :name, :text, :objects, :user_id

  # with_options presence: true do
  # end

  def save
    # Gameの作成
    @game = Game.create(name: name, text: text, user_id: user_id)

    # Stageの作成
    stage = Stage.create(game_id: @game.id)

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
          #
      end
      game_object.save
      game_object.parse_base64(object[:object])
      
      # Positionの作成
      positions = object[:position]
      position = Position.create(symbol: object[:symbol], x: positions[:x], y: positions[:y], width: positions[:w],  height: positions[:h], stage_id: stage.id)
      
      # ObjectPositionの作成
      object_position = ObjectPosition.create(game_object_id: game_object.id, position_id: position.id)
    end
    # stage = Stage.new(game_id: @game.id)
    # stage.save
    # stage.parse_base64(stage_img)
    # # プレイヤーの保存
    # gameObject = GameObject.new(game_id: @game.id, player: true)
    # gameObject.save
    # gameObject.parse_base64(player_img)
    # # オブジェクトの保存
    # gameObject = GameObject.new(game_id: @game.id, object: true)
    # gameObject.save
    # gameObject.parse_base64(object_img)
  end

  def game
    @game
  end
end