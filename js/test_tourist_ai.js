var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });

function preload() {
  'use strict';
  game.load.tilemap('map1', 'maps/test_tourist_snake.json', null, Phaser.Tilemap.TILED_JSON);
  game.load.tilemap('tourist_test_map', 'maps/test_tourist_snake.json', null, Phaser.Tilemap.TILED_JSON);

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

    var sprite = game.add.sprite(0, 0, 'tourist');

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

  function stepForward(game, map, tourist) {
    var moved = false;

    if (tourist.nextTourist !== null && tourist.nextTourist.moveHistory.length > 1) {
      var nextTourist_twoMovesBackIndex = tourist.nextTourist.moveHistory.length - 2;
      var nextTourist_twoMovesBack = tourist.nextTourist.moveHistory[nextTourist_twoMovesBackIndex];
      tourist.facing = nextTourist_twoMovesBack.facing;
    }
    moved = move(map, tourist, tourist.facing);

    updateSpriteCoords(map, tourist);

    return moved;
  }

  function stepBackward(game, map, tourist) {
    var moved = false;

    if (tourist.moveHistory.length > 0) {
      backupMove(map, tourist);
      moved = true;
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
    var curTile = map.getTile(tourist.tilePos.x, tourist.tilePos.y);
    var curTileProps = TILEWORLD.tileProps(curTile);
    curTileProps.occupyingTourist = null;

    var prevMove = tourist.moveHistory.pop();
    tourist.tilePos.set(prevMove.tilePos.x, prevMove.tilePos.y);
    tourist.facing = prevMove.facing;

    var nextTile = map.getTile(prevMove.tilePos.x, prevMove.tilePos.y);
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
    stepForward: stepForward,
    stepBackward: stepBackward,
    move: move,
    updateSpriteCoords: updateSpriteCoords
  };
})();

var GLOB = {
  cursors: null,
  tourGuide: null,
  tourists: null,
  map: null,
  oKey: null,
  iKey: null,
};


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

  GLOB.map = game.add.tilemap('tourist_test_map');
  GLOB.map.addTilesetImage('LogicTiles', 'logic_tileset');
  GLOB.map.addTilesetImage('tiles', 'tiles');
  var terrain = GLOB.map.createLayer('terrain');
  terrain.resizeWorld();

  //  This resizes the game world to match the layer dimensions
  // layers.terrain.resizeWorld();

  GLOB.cursors = game.input.keyboard.createCursorKeys();

  // tourGuide = TOURIST.build(game);
  GLOB.tourists = buildTouristChain(game);

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
