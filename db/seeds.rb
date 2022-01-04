# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)


# imege list用のPresetGameObject作成seed
Game.destroy_all
GameObject.destroy_all

game = Game.create(name: 'my game', text: 'game explantion', user_id: 1)

preset_images_dir = 'app/assets/images/TestData/GameObject/'

Dir.foreach(preset_images_dir) do |directory_name|
  # カレントディレクトリを示す . や親ディレクトリを示す .. が含まれてしまうので、それらを除くため
  next if directory_name == '.' or directory_name == '..'
  
  dir = preset_images_dir + directory_name + '/'
  Dir.foreach(dir) do |file_name|
    # カレントディレクトリを示す . や親ディレクトリを示す .. が含まれてしまうので、それらを除くため
    next if file_name == '.' or file_name == '..'

    game_object = GameObject.create(name: 'test game object', text: 'game object explantion', game_id: game.id)
    image = Image.create(name: 'test image', text: 'image explantion', game_object_id: game_object.id)
    image.image.attach(io: File.open(dir + file_name), filename: file_name)

    PresetGameObject.create(groupe: directory_name, game_object_id: game_object.id)
  end
end