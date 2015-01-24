var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });

function preload() {
  'use strict';

  //  Tilemaps are split into two parts: The actual map data (usually stored in a CSV or JSON file)
  //  and the tileset/s used to render the map.

  //  Here we'll load the tilemap data. The first parameter is a unique key for the map data.

  //  The second is a URL to the JSON file the map data is stored in. This is actually optional, you can pass the JSON object as the 3rd
  //  parameter if you already have it loaded (maybe via a 3rd party source or pre-generated). In which case pass 'null' as the URL and
  //  the JSON object as the 3rd parameter.

  //  The final one tells Phaser the foramt of the map data, in this case it's a JSON file exported from the Tiled map editor.
  //  This could be Phaser.Tilemap.CSV too.

  game.load.tilemap('map1', 'maps/test_tourist_snake.json', null, Phaser.Tilemap.TILED_JSON);
  game.load.tilemap('tourist_test_map', 'maps/test_tourist_snake.json', null, Phaser.Tilemap.TILED_JSON);

  //  Next we load the tileset. This is just an image, loaded in via the normal way we load images:

  game.load.image('tiles', 'assets/tiles.png');
  game.load.image('logic_tileset', 'assets/logic_tileset.png');

  game.load.spritesheet('guard_sprite', 'assets/guard_sprites.png', 128, 128);
  game.load.spritesheet('tourist_sprite', 'assets/tourist_sprites.png', 128, 128);
}

DIR = {
  UP: 'up',
  DOWN: 'down',
  LEFT: 'left',
  RIGHT: 'right'
};

TILE_PROPS = {
  GUARD_PASSABLE: 'guard_passable',
  TOURIST_PASSABLE: 'tourist_passable'
};

TOUR_GUIDE = (function () {

  function build(game) {

    var sprite = game.add.sprite(0, 0, 'guard_sprite');
    sprite.animations.add('walk_up', [9, 10, 11], 15, true);
    sprite.animations.add('walk_down', [0, 1, 2], 15, true);
    sprite.animations.add('walk_left', [6, 7, 8], 15, true);
    sprite.animations.add('walk_right', [3, 4, 5], 15, true);

    sprite.scale = new PIXI.Point(0.25, 0.25);

    var TILE_WIDTH = 32;
    var TILE_HEIGHT = 32;

    var tilePos = new PIXI.Point(1, 1);

    sprite.x = TILE_WIDTH * tilePos.x;
    sprite.y = TILE_HEIGHT * tilePos.y;

    return {
      sprite: sprite,
      facing: DIR.RIGHT,
      tilePos: tilePos,
      lastUpdateTime: 0.0,
      passableFlag: 'tourist_passable'
    };
  }

  function update(game, tourGuide) {
    if (game.time.totalElapsedSeconds() - tourGuide.lastUpdateTime < 1.0) {
      return;
    }
    tourGuide.lastUpdateTime = game.time.totalElapsedSeconds();
    move(map, tourGuide, tourGuide.facing);
    updateSpriteCoords(map, tourGuide);
  }

  function tileDirOffset(direction) {
    var x = 0;
    var y = 0;

    switch (tourGuide.facing) {
    case DIR.UP:
      y = -1;
      break;

    case DIR.DOWN:
      y = 1;
      break;

    case DIR.LEFT:
      x = -1;
      break;

    case DIR.RIGHT:
      x = 1;
      break;
    }

    return new PIXI.Point(x, y);
  }

  function move(map, tourGuide, direction) {
    var currentTile = map.getTile(tourGuide.tilePos.x, tourGuide.tilePos.y, 0);
    var nextTilePos = tileDirOffset(direction);

    nextTilePos.x += tourGuide.tilePos.x;
    nextTilePos.y += tourGuide.tilePos.y;

    var nextTile = map.getTile(nextTilePos.x, nextTilePos.y);

    if (tourGuide.passableFlag in  nextTile.properties) {
      tourGuide.tilePos.set(nextTilePos.x, nextTilePos.y);
    }
  }

  function updateSpriteCoords(map, tourGuide) {
    var currentTile = map.getTile(tourGuide.tilePos.x, tourGuide.tilePos.y, 0);
    tourGuide.sprite.x = currentTile.worldX;
    tourGuide.sprite.y = currentTile.worldY;
  }

  return {
    build: build,
    update: update,
    move: move
  };
})();


TOURIST = (function () {
  var tourGuide;

  function build(game) {
    var sprite = game.add.sprite('tourist_sprite');
    sprite.animations.add('walk_up', [9, 10, 11], 15, true);
    sprite.animations.add('walk_down', [0, 1, 2], 15, true);
    sprite.animations.add('walk_left', [6, 7, 8], 15, true);
    sprite.animations.add('walk_right', [3, 4, 5], 15, true);

    sprite.scale = new PIXI.Point(0.25, 0.25);

    return {
      sprite: sprite,
      facing: DIR.RIGHT
    };
  }

  function update() {
  }

  return {
    build: build,
    update: update
  };
})();


var cursors;
var tourGuide;
var map;
var terrain;


function create() {
  'use strict';

  game.stage.backgroundColor = '#00FFFF';

  map = game.add.tilemap('tourist_test_map');
  map.addTilesetImage('LogicTiles', 'logic_tileset');
  map.addTilesetImage('tiles', 'tiles');
  terrain = map.createLayer('terrain');
  terrain.resizeWorld();

  //  This resizes the game world to match the layer dimensions
  // layers.terrain.resizeWorld();

  cursors = game.input.keyboard.createCursorKeys();

  tourGuide = TOUR_GUIDE.build(game);
}

function update() {
  'use strict';

  // var moving = false;

  if (cursors.up.isDown) {
    tourGuide.facing = DIR.UP;
  }

  if (cursors.down.isDown) {
    tourGuide.facing = DIR.DOWN;
  }

  if (cursors.left.isDown) {
    tourGuide.facing = DIR.LEFT;
  }

  if (cursors.right.isDown) {
    tourGuide.facing = DIR.RIGHT;
  }

  TOUR_GUIDE.update(game, tourGuide);
}
