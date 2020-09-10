class GamesController < ApplicationController

  def index
    @games = Game.all
    @game = Game.new
  end

  def show
    @game = Game.find_by(id: params[:id])
    @games = Game.all
  end

  def create
    @game = GameForm.new(game_params)
    if @game.valid?
      @game.save
      return redirect_to game_path(@game.game)
    else
      render "new"
    end
  end

  def image
    image = Game.find_by(id: params[:id]).game_objects[0].image
    send_data image.download, type: image.content_type, disposition: 'inline', stats: :ok
  end

  def game_params
    params.permit(:stage_img, :player_img, :name, :text).merge(user_id: current_user.id)
  end
end