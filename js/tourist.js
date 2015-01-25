TOURIST = (function () {
  'use strict';


  function buildChain(game, positions, options) {
    var touristList = [];

    for (var i = 0; i < positions.length; i++) {
      var tilePos = positions[i];
      var nextTourist = i > 0 ? touristList[i - 1] : null;
      var tourist = TOURIST.build(game, nextTourist);
      tourist.facing = DIR.RIGHT;
      tourist.tilePos.set(positions[i].x, positions[i].y);
      touristList.push(tourist);

      if (options && 'group' in options) {
        options.group.add(tourist.sprite);
      }
    }

    return touristList;
  }


  function build(game, nextTourist) {
    var sprite = game.add.sprite(0, 0, 'tourist');
    var tilePos = new PIXI.Point(0, 0);

    return {
      sprite: sprite,
      facing: DIR.RIGHT,
      tilePos: tilePos,
      lastUpdateTime: 0.0,
      nextTourist: nextTourist || null,
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
    updateSpriteCoords: updateSpriteCoords,
    buildChain: buildChain
  };
})();
