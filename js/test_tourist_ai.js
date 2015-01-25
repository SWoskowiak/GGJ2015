var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });

function preload() {
  // 'use strict';
  game.load.tilemap('map1', 'maps/test_tourist_snake.json', null, Phaser.Tilemap.TILED_JSON);
  game.load.tilemap('tourist_test_map', 'maps/test_tourist_snake.json', null, Phaser.Tilemap.TILED_JSON);

  game.load.image('tiles', 'assets/tiles.png');
  game.load.image('logic_tileset', 'assets/logic_tileset.png');

  game.load.spritesheet('guard', 'assets/guard.png', 128, 128);
  game.load.spritesheet('tourist', 'assets/tourist.png', 128, 128);
}


var GLOB = {
  cursors: null,
  tourGuide: null,
  tourists: null,
  map: null,
  oKey: null,
  iKey: null
};


function create() {
  'use strict';

  game.stage.backgroundColor = '#00FFFF';

  GLOB.map = game.add.tilemap('tourist_test_map');
  GLOB.map.addTilesetImage('LogicTiles', 'logic_tileset');
  GLOB.map.addTilesetImage('tiles', 'tiles');
  var terrain = GLOB.map.createLayer('terrain');
  terrain.resizeWorld();

  //  This resizes the game world to match the layer dimensions
  // layers.terrain.resizeWorld();

  GLOB.cursors = game.input.keyboard.createCursorKeys();

  var touristPositions = [
    new PIXI.Point(4, 4),
    new PIXI.Point(3, 4),
    new PIXI.Point(2, 4),
    new PIXI.Point(1, 4),
  ];
  GLOB.tourists = TOURIST.buildChain(game, touristPositions);

  GLOB.oKey = game.input.keyboard.addKey(Phaser.Keyboard.O);
  GLOB.iKey = game.input.keyboard.addKey(Phaser.Keyboard.I);

  GLOB.tourGuide = GLOB.tourists[0];

  GLOB.tourists.forEach(function (tourist) {
    TOURIST.updateSpriteCoords(GLOB.map, tourist);
  });
}

function update() {
  'use strict';

  // var moving = false;

  if (GLOB.cursors.up.isDown) {
    GLOB.tourGuide.facing = DIR.UP;
  }

  if (GLOB.cursors.down.isDown) {
    GLOB.tourGuide.facing = DIR.DOWN;
  }

  if (GLOB.cursors.left.isDown) {
    GLOB.tourGuide.facing = DIR.LEFT;
  }

  if (GLOB.cursors.right.isDown) {
    GLOB.tourGuide.facing = DIR.RIGHT;
  }

  var i, tourist;
  if (GLOB.oKey.justUp) {
    for (i = 0; i < GLOB.tourists.length; i++) {
      tourist = GLOB.tourists[i];
      // if step returns false, it means he couldn't move, so
      // don't keep trying to move
      if (!TOURIST.stepForward(game, GLOB.map, tourist)) {
        break;
      }
    }
    GLOB.tourists.forEach(function (tourist) {
    });
  } else if (GLOB.iKey.justUp) {
    for (i = GLOB.tourists.length - 1; i >= 0; i--) {
      tourist = GLOB.tourists[i];
      // if step returns false, it means he couldn't move, so
      // don't keep trying to move
      if (!TOURIST.stepBackward(game, GLOB.map, tourist)) {
        break;
      }
    }
  }
}
