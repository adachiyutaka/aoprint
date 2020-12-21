class GameForm
  include ActiveModel::Model
  attr_accessor :name, :text, :objects, :user_id

  # with_options presence: true do
  # end

  def save
    @game = Game.create(name: name, text: text, user_id: user_id)
    # ステージの保存
    stage = Stage.new(game_id: @game.id)
    stage.save
    stage.parse_base64(stage_img)
    # プレイヤーの保存
    gameObject = GameObject.new(game_id: @game.id, player: true)
    gameObject.save
    gameObject.parse_base64(player_img)
    # オブジェクトの保存
    gameObject = GameObject.new(game_id: @game.id, object: true)
    gameObject.save
    gameObject.parse_base64(object_img)
  end

  def game
    @game
  end
end