class GameForm
  include ActiveModel::Model
  attr_accessor :name, :text, :objects, :user_id

  # with_options presence: true do
  # end

  def save
    i = 0
    @game = Game.create(name: name, text: text, user_id: user_id)
    # GameObject、Positionの保存
    JSON.parse(objects, symbolize_names: true).each do |object|
      # GameObjectの保存
      gameObject = GameObject.new(symbol: object[:symbol], game_id: game.id)
      case object[:script]
        when 'object'
          gameObject.object = true
        when 'player'
          gameObject.player = true
        when 'enemy'
          #
      end
      gameObject.save
      gameObject.parse_base64(object[:object])
      puts "save object"
      puts i
      puts 'gameObject'
      
      # Positionの保存
      positions = object[:position]
      position = Position.new(symbol: object[:symbol], x: positions[:x], y: positions[:y], width: positions[:w],  height: positions[:h])
      position.save
      puts 'position'

      i += 1
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