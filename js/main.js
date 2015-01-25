var game = new Phaser.Game(1024, 768, Phaser.AUTO, 'game', { preload: preload, create: create, update: update });
//fuck the world
window.game = game;

function preload() {
  // Load the tilemap json
  game.load.tilemap('map1', 'maps/map1.json', null, Phaser.Tilemap.TILED_JSON);
  game.load.tilemap('map2', 'maps/map2.json', null, Phaser.Tilemap.TILED_JSON);
  game.load.tilemap('map3', 'maps/map3.json', null, Phaser.Tilemap.TILED_JSON);
  // Load the tiles png itself
  game.load.image('tiles', 'assets/tiles.png');
  game.load.image('logic_tiles', 'assets/logic_tiles.png');
  game.load.image('tileset', 'assets/tileset.png');
  game.load.image('tileset1', 'assets/tileset1.png');
  game.load.image('tileset2', 'assets/tileset2.png');

  // EXPLOSIONS WE NEED MORE EPXLOSIONS
  game.load.spritesheet('explosion', 'assets/explosion.png', 64, 64, 6);

  // Speech bubbles
  game.load.image('go_bubble', 'assets/go.png');
  game.load.image('stop_bubble', 'assets/stop.png');
  // Load the guard sprite
  game.load.spritesheet('guard_sprite', 'assets/guard64x64.png', 64, 64, 17);

  for (var i = 0; i < 4; i++) {
    var assetName = 'tourist_' + i;
    game.load.spritesheet(assetName, 'assets/' + assetName + '.png', 64, 64);
  }

  // Credit to HorrorPen on open game art
  game.load.audio('music', ['assets/music.mp3', 'assets/music.ogg']);
}

var GLOBALS = {
  tile_width: 64,
  tile_height: 64
};

// Game objects
var level,player,touristList,goalCoords;

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
  level.current = level.three;
  level.current.layers.logical.resizeWorld();
  // Gives you the cursor key controls
  game.GLOBALS.cursors = game.input.keyboard.createCursorKeys();
  game.GLOBALS.spacebar = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
  game.GLOBALS.mKey = game.input.keyboard.addKey(Phaser.Keyboard.M);

  touristList = TOURIST.buildChainFromLevel(game, level.current);
  oKey = game.input.keyboard.addKey(Phaser.Keyboard.O);
  iKey = game.input.keyboard.addKey(Phaser.Keyboard.I);

  // Builds out our "player"

  var logicalLayer = MAPINFO.getLayerData(level.current.map, 'logical');
  var splitPair = logicalLayer.properties.player_spawn.split(' ');
  var playerSpawnPos = new Phaser.Point(Number(splitPair[0]),
                                        Number(splitPair[1]));
  // player = PLAYER.build(game, level, { x:2,  y:4});
  player = PLAYER.build(game, level, playerSpawnPos);


  // setup the goal tile
  splitPair = logicalLayer.properties.goal.split(' ');
  goalCoords = new Phaser.Point(Number(splitPair[0]),
                                 Number(splitPair[1]));

  // ~*Music*~
  var music = game.add.audio('music');
  music.volume = 0.1;
  music.loop = true;
  music.play();
}


function updateTourGuideFacing() {
  'use strict';
  var tourGuide = touristList[0];

  if (!PLAYER.isPointing()) {
    return;
  }
  var target = level.current.map.getTile(player.tileX, player.tileY);
  var playerTile = level.current.map.getTileWorldXY(target.worldX, target.worldY);
  var playerOnTourGuide = Phaser.Point.equals(tourGuide.tilePos, new Phaser.Point(playerTile.x, playerTile.y));

  if (!playerOnTourGuide) {
    return;
  }

  TOURIST.setTourGuideFacing(tourGuide, level.current.map, PLAYER.getFacing());
}


// Update stuff
function update() {
  PLAYER.update(game, level);
  updateTourGuideFacing();

  if (PLAYER.isPointing()) {
    var playerTilePos = PLAYER.getTilePos();
    MAPINFO.tryPullLever(level.current.map, playerTilePos.x, playerTilePos.y);
  }

  TOURIST.updateTourists(touristList, level.current, PLAYER.isSayingGo(), oKey, iKey);

  var tourGuide = touristList[0];
  if (tourGuide.tilePos.x == goalCoords.x &&
      tourGuide.tilePos.y == goalCoords.y) {
    console.log('YOU WON');

    PLAYER.win(game);
  }
}

// function render() {
// }
