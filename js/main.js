var game = new Phaser.Game(800, 600, Phaser.AUTO, 'game', { preload: preload, create: create, update: update, render: render});

function preload() {
  // Load the tilemap json
  game.load.tilemap('map1', 'maps/map1.json', null, Phaser.Tilemap.TILED_JSON);
  // Load the tiles png itself
  game.load.image('tiles', 'assets/tiles.png');
  // Speech bubbles
  game.load.image('go_bubble', 'assets/go.png');
  game.load.image('stop_bubble', 'assets/stop.png');
  // Load the guard sprite
  game.load.spritesheet('guard_sprite', 'assets/guard64x64.png', 64, 64, 17);
  // Credit to HorrorPen on open game art
  game.load.audio('music', ['assets/music.mp3', 'assets/music.ogg']);
  // Bitmap fonts courtesy of spicy pixel of open game art
  text = game.add.text(32, 380, '', { font: "30pt Courier", fill: "#19cb65", stroke: "#119f4e", strokeThickness: 2 });

}

var GLOBALS = {
  tile_width: 64,
  tile_height: 64
}

// Game objects
var level,player;

// Controls
var cursors;

// Where almost all our initialization happens
function create() {
  // some pass through stuff
  game.GLOBALS = GLOBALS;
  // Start physics
  game.physics.startSystem(Phaser.Physics.ARCADE);
  // Something like this
  game.time.desiredFps = 60;
  // Will give you the level object which contains level.one, level.two etc.
  level = LEVELS.build(game);
  // Builds out our "player"
  player = PLAYER.build(game);
  // Gives you the cursor key controls
  game.GLOBALS.cursors = game.input.keyboard.createCursorKeys();
  game.GLOBALS.spacebar = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
  game.GLOBALS.mKey = game.input.keyboard.addKey(Phaser.Keyboard.M);

  // ~*Music*~
  var music = game.add.audio('music');
  music.volume = 0.1;
  music.loop = true;
  //music.play();
}

// Update stuff
function update() {
  PLAYER.update(game);
}

function render() {

}
