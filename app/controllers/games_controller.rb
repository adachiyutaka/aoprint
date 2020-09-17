require 'base64'
require 'json'

class GamesController < ApplicationController

  def index
    @games = Game.all.order(created_at: 'DESC')
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
    stageImg = Game.find_by(id: params[:id]).stages[0].image
    playerImg = Game.find_by(id: params[:id]).game_objects[0].image
    image = { stage: imageToBase64(stageImg), player: imageToBase64(playerImg) }
    render json: image
  end

  def game_params
    params.permit(:stage_img, :player_img, :name, :text).merge(user_id: current_user.id)
  end

  def imageToBase64(image)
    return Base64.encode64(image.download)
  end
end