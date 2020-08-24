class GameForm
  include ActiveModel::Model
  attr_accessor :stage_img, :player_img, :name, :text, :user_id

  # with_options presence: true do
  # end

  def save
    @game = Game.create(name: name, text: text, user_id: user_id)
    stage = Stage.create(image: stage_img, game_id: @game.id)
    Line.create(s_x: 0, s_y: 0, e_x: 0, e_y: 0, stage_id: stage.id)
    gameObject = GameObject.create(image: player_img, game_id: @game.id)
    Position.create(x: 0, y: 0, game_object_id: gameObject.id)
    binding.pry
  end

  def game
    @game
  end
end