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

  game.load.spritesheet('guard', 'assets/guard.png', 128, 128);
  game.load.spritesheet('tourist', 'assets/tourist.png', 128, 128);
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

tilemapInfo = [];


TILEWORLD = (function () {
  function tileProps(tile) {
    if (!('tileWorldProps' in tile)) {
      tile.tileWorldProps = {
        occupyingTourist: null
      };
    }
    return tile.tileWorldProps;
  }

  return {
    tileProps: tileProps
  };

})();


TOURIST = (function () {
  'use strict';

  function build(game, nextTourist) {

    var sprite = game.add.sprite(0, 0, 'guard');
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
      nextTourist: nextTourist,
      moveHistory: [],
      passableFlag: TILE_PROPS.TOURIST_PASSABLE,
      backingUp: false
    };
  }

  function step(game, tourist) {
    // if (game.time.totalElapsedSeconds() - tourist.lastUpdateTime >= 1.0) {
    // tourist.lastUpdateTime = game.time.totalElapsedSeconds();
    var moved = false;

    // if (tourist.backingUp) {
      
    // } else
    if (tourist.nextTourist !== null && tourist.nextTourist.moveHistory.length > 1) {
      var nextTourist_twoMovesBackIndex = tourist.nextTourist.moveHistory.length - 2;
      var nextTourist_twoMovesBack = tourist.nextTourist.moveHistory[nextTourist_twoMovesBackIndex];
      tourist.facing = nextTourist_twoMovesBack.facing;
      moved = move(map, tourist, tourist.facing);

    } else {
      moved = move(map, tourist, tourist.facing);

    }

    updateSpriteCoords(map, tourist);

    return moved;
  }

  function setTilePos(tourist, newTileX, newTileY, addToHistory) {
    tourist.moveHistory.push({
      tilePos: tourist.tilePos.clone(),
      facing: tourist.facing
    });
    tourist.tilePos.set(newTileX, newTileY);
  }

  function tileDirOffset(direction) {
    var x = 0;
    var y = 0;

    switch (direction) {
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

  function directionFromPointVector(pointVector) {
    if ((pointVector.x !== 0 && pointVector.y !== 0) ||
        (pointVector.x === pointVector.y)) {
      console.error('invalid cardinal direction point vector', pointVector);
    }

    if (pointVector.x > 0) {
      return DIR.RIGHT;
    }
    if (pointVector.x < 0) {
      return DIR.LEFT;
    }
    if (pointVector.y > 0) {
      return DIR.DOWN;
    }
    if (pointVector.y < 0) {
      return DIR.UP;
    }

    return null;
  }


  function backupMove(map, tourist) {
    // must be called in reverse-chain order
    prevMove = tourist.moveHistory.pop();
    tourist.tilePos.set(prevMove.tilePos.x, prevMove.tilePos.y);
    tourist.facing = prevMove.facing;

    var curTile = map.getTile(tourist.tilePos.x, tourist.tilePos.y);

    curTileProps = TILEWORLD.tileProps(curTile);
    curTileProps.occupyingTourist = null;

    nextTile = map.getTile(prevMove.tilePos.x, prevMove.tilePos.y);
    TILEWORLD.tileProps(nextTile).occupyingTourist = tourist;
  }


  function move(map, tourist, direction) {
    var currentTile = map.getTile(tourist.tilePos.x, tourist.tilePos.y, 0);
    var nextTilePos = tileDirOffset(direction);

    nextTilePos.x += tourist.tilePos.x;
    nextTilePos.y += tourist.tilePos.y;

    var nextTile = map.getTile(nextTilePos.x, nextTilePos.y);

    var nextTileProps = TILEWORLD.tileProps(nextTile);
    var currentTileProps = TILEWORLD.tileProps(currentTile);

    if (nextTileProps.occupyingTourist !== null) {
      return false;
    }

    if (!(tourist.passableFlag in nextTile.properties)) {
      return false;
    }

    nextTileProps.occupyingTourist = tourist;
    currentTileProps.occupyingTourist = null;
    setTilePos(tourist, nextTilePos.x, nextTilePos.y);

    return true;
  }


  function updateSpriteCoords(map, tourist) {
    var currentTile = map.getTile(tourist.tilePos.x, tourist.tilePos.y, 0);
    tourist.sprite.x = currentTile.worldX;
    tourist.sprite.y = currentTile.worldY;
  }


  return {
    build: build,
    step: step,
    move: move,
    updateSpriteCoords: updateSpriteCoords
  };
})();


var cursors;
var tourGuide;
var tourists;
var map;

var oKey;
var iKey;


function buildTouristChain(game) {
  'use strict';
  var touristList = [];

  var touristPositions = [
    new PIXI.Point(4, 4),
    new PIXI.Point(3, 4),
    new PIXI.Point(2, 4),
    new PIXI.Point(1, 4),
  ];

  for (var i = 0; i < touristPositions.length; i++) {
    var tilePos = touristPositions[i];
    var nextTourist = i > 0 ? touristList[i - 1] : null;
    var tourist = TOURIST.build(game, nextTourist);
    tourist.facing = DIR.RIGHT;
    tourist.tilePos.set(touristPositions[i].x, touristPositions[i].y);
    touristList.push(tourist);
  }

  return touristList;
}


function create() {
  'use strict';

  game.stage.backgroundColor = '#00FFFF';

  map = game.add.tilemap('tourist_test_map');
  map.addTilesetImage('LogicTiles', 'logic_tileset');
  map.addTilesetImage('tiles', 'tiles');
  var terrain = map.createLayer('terrain');
  terrain.resizeWorld();

  //  This resizes the game world to match the layer dimensions
  // layers.terrain.resizeWorld();

  cursors = game.input.keyboard.createCursorKeys();

  // tourGuide = TOURIST.build(game);
  tourists = buildTouristChain(game);

  oKey = game.input.keyboard.addKey(Phaser.Keyboard.O);
  iKey = game.input.keyboard.addKey(Phaser.Keyboard.I);

  tourGuide = tourists[0];

  tourists.forEach(function (tourist) {
    TOURIST.updateSpriteCoords(map, tourist);
  });
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

  if (oKey.justUp) {
    for (var i = 0; i < tourists.length; i++) {
      var tourist = tourists[i];
      // if step returns false, it means he couldn't move, so
      // don't keep trying to move
      if (!TOURIST.step(game, tourist)) {
        break;
      }
    }
    tourists.forEach(function (tourist) {
    });
  } else if (iKey.justUp) {
    for (var i = 0; i < tourists.length; i++) {
      var tourist = tourists[i];
      // if step returns false, it means he couldn't move, so
      // don't keep trying to move
      if (!TOURIST.step(game, tourist)) {
        break;
      }
    }
  }
}
