var game = new Phaser.Game(800, 600, Phaser.AUTO, 'game', { preload: preload, create: create, update: update, render: render});

function preload() {
  // Load the tilemap json
  game.load.tilemap('map1', 'maps/map1.json', null, Phaser.Tilemap.TILED_JSON);
  game.load.tilemap('map2', 'maps/map2.json', null, Phaser.Tilemap.TILED_JSON);
  // Load the tiles png itself
  game.load.image('tiles', 'assets/tiles.png');
  game.load.image('logic_tiles', 'assets/logic_tiles.png');
  
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
var level,player,touristList;

// Controls
var iKey, oKey;

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

  console.log('poo');
  touristList = TOURIST.buildChainFromLevel(game, level.two);
  oKey = game.input.keyboard.addKey(Phaser.Keyboard.O);
  iKey = game.input.keyboard.addKey(Phaser.Keyboard.I);

  // ~*Music*~
  var music = game.add.audio('music');
  music.volume = 0.1;
  music.loop = true;
  //music.play();
}

function updateTourists() {
  var i, tourist;
  if (oKey.justUp) {
    for (i = 0; i < touristList.length; i++) {
      tourist = touristList[i];
      // if step returns false, it means he couldn't move, so
      // don't keep trying to move
      if (!TOURIST.stepForward(game, level.two.map, tourist)) {
        break;
      }
    }
    touristList.forEach(function (tourist) {
    });
  } else if (iKey.justUp) {
    for (i = touristList.length - 1; i >= 0; i--) {
      tourist = touristList[i];
      // if step returns false, it means he couldn't move, so
      // don't keep trying to move
      if (!TOURIST.stepBackward(game, level.two.map, tourist)) {
        break;
      }
    }
  }
  touristList.forEach(function (tourist) {
    TOURIST.updateSpriteCoords(level.two.map, tourist);
  });
}

function updateTourGuideFacing(game) {
  var tourGuide = touristList[0];

  if (game.GLOBALS.cursors.up.isDown) {
    tourGuide.facing = DIR.UP;
  }

  if (game.GLOBALS.cursors.down.isDown) {
    tourGuide.facing = DIR.DOWN;
  }

  if (game.GLOBALS.cursors.left.isDown) {
    tourGuide.facing = DIR.LEFT;
  }

  if (game.GLOBALS.cursors.right.isDown) {
    tourGuide.facing = DIR.RIGHT;
  }
}

// Update stuff
function update() {
  PLAYER.update(game);
  updateTourGuideFacing(game);
  updateTourists();
}

function render() {

}
