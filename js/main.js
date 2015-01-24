var game = new Phaser.Game(800, 600, Phaser.AUTO, 'game', { preload: preload, create: create, update: update, render: render});

function preload() {
  // Load the tilemap json
  game.load.tilemap('map1', 'maps/map1.json', null, Phaser.Tilemap.TILED_JSON);
  // Load the tiles png itself
  game.load.image('tiles', 'assets/tiles.png');
  // Load the guard sprite
  game.load.spritesheet('guard_sprite', 'assets/guard.png', 128, 128);
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
  console.log(game.GLOBALS.spacebar);
}

// Update stuff
function update() {
  PLAYER.update(game);
}

function render() {

}
