class GameForm
  include ActiveModel::Model
  attr_accessor :stage, :player, :name, :text

  # with_options presence: true do
  # end

  def save
    @game = Game.create(name: name, text: text, user_id: 1)
    gameObject = GameObject.create(images: player, game_id: @game.id)
    Position.create(x: 0, y: 0, game_object_id: gameObject.id)
    stage = Stage.create(images: stage, game_id: @game.id)
    Line.create(s_x: 0, s_y: 0, e_x: 0, e_y: 0, stage_id: stage.id)
  end

  def game
    @game
  end
end