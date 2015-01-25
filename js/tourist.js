

TOURIST = (function () {
  'use strict';

  var goingBackward = false;

  function buildChainFromLevel(game, level) {
    var touristPositions = [];

    // BEGIN Extract spawn positions from logical layer of tilemap
    var logicalLayer = level.map.layers[level.map.getLayer('logical')];
    var spawnString = logicalLayer.properties.tourist_spawns;
    // '1 4 , 1 3, 111       22222  '.split(',')[2].trim().split(' ')
    var coordPairs = spawnString.split(',');

    function extractPosFromCoordPair(s) {
      var splitPair = s.trim().split(/\W/).filter(Boolean);
      var pos = new Phaser.Point(Number(splitPair[0]), Number(splitPair[1]));
      pos.facing = splitPair.length >= 3 ? splitPair[2] : DIR.RIGHT;
      return pos;
    }

    var guidePosStr = coordPairs.shift();
    var guidePos = extractPosFromCoordPair(guidePosStr);
    touristPositions.push(guidePos);

    var i;
    for (i = 0; i < coordPairs.length; i++) {
      var posStr = coordPairs[i].trim();
      var pos = extractPosFromCoordPair(posStr);
      touristPositions.push(pos);
    }
    // END Extract spawn positions

    return buildChain(game, level.map, touristPositions);
  }


  function buildChain(game, map, positions) {
    var touristList = [];

    for (var i = 0; i < positions.length; i++) {
      var tilePos = positions[i];
      var nextTourist = i > 0 ? touristList[i - 1] : null;
      var tourist = TOURIST.build(game, map, nextTourist);
      tourist.facing = positions[i].facing;
      tourist.tilePos.set(positions[i].x, positions[i].y);
      touristList.push(tourist);
      forceUpdateSpriteCoords(map, tourist);
    }

    return touristList;
  }


  function setTourGuideFacing(tourGuide, map, direction) {
    var tileOffset = DIR.toOffset(direction);
    Phaser.Point.add(tileOffset.clone(), tourGuide.tilePos, tileOffset);

    var touristAtDestTile = MAPINFO.getTourist(map, tileOffset.x, tileOffset.y);

    if (touristAtDestTile && touristAtDestTile.nextTourist === tourGuide) {
      goingBackward = true;
    } else {
      goingBackward = false;
    }

    tourGuide.facing = direction;
    tourGuide.sprite.animations.stop(direction, true);
  }


  function build(game, map, nextTourist) {
    var sprite = game.add.sprite(0, 0, 'tourist_' + Math.floor(Math.random() * 4));
    var tilePos = new Phaser.Point(0, 0);

    sprite.animations.add(DIR.RIGHT, [3, 4, 5], 20, true);
    sprite.animations.add(DIR.LEFT, [6, 7, 8], 20, true);
    sprite.animations.add(DIR.UP, [9, 10, 11], 20, true);
    sprite.animations.add(DIR.DOWN, [0, 1, 2], 20, true);
    var tourist = {
      sprite: sprite,
      facing: DIR.RIGHT,
      moving: false,
      tween: null,
      tilePos: tilePos,
      lastUpdateTime: 0.0,
      nextTourist: nextTourist || null,
      moveHistory: []
    };

    // updateSpriteCoords(map, tourist);

    return tourist;
  }


  function stepForward(game, map, tourist) {
    var moved = false;

    if (tourist.nextTourist !== null && tourist.nextTourist.moveHistory.length > 1) {
      var nextTourist_twoMovesBackIndex = tourist.nextTourist.moveHistory.length - 2;
      var nextTourist_twoMovesBack = tourist.nextTourist.moveHistory[nextTourist_twoMovesBackIndex];
      tourist.facing = nextTourist_twoMovesBack.facing;
    }
    moved = move(map, tourist, tourist.facing);

    // updateSpriteCoords(map, tourist);
    if (moved) {
      tweenMove(tourist);
    }

    return moved;
  }


  function stepBackward(game, map, tourist) {
    var moved = false;

    if (tourist.moveHistory.length > 0) {
      backupMove(map, tourist);
      moved = true;
    }

    // updateSpriteCoords(map, tourist);
    if (moved) {
      tweenMove(tourist);
    }

    return moved;
  }


  function setTilePos(tourist, newTileX, newTileY, addToHistory) {
    tourist.moveHistory.push({
      tilePos: tourist.tilePos.clone(),
      facing: tourist.facing
    });
    tourist.tilePos.set(newTileX, newTileY);
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
    // curTileProps.occupyingTourist = null;
    MAPINFO.setTourist(map, tourist.tilePos.x, tourist.tilePos.y, null);
    var curTileProps = MAPINFO.tileProps(map, tourist.tilePos.x, tourist.tilePos.y);

    var prevMove = tourist.moveHistory.pop();
    tourist.tilePos.set(prevMove.tilePos.x, prevMove.tilePos.y);
    tourist.facing = prevMove.facing;

    MAPINFO.setTourist(map, prevMove.tilePos.x, prevMove.tilePos.y, tourist);
    var nextTileProps = MAPINFO.tileProps(map, prevMove.tilePos.x, prevMove.tilePos.y);
    console.log('poo');
  }


  function move(map, tourist, direction) {
    var currentTile = map.getTile(tourist.tilePos.x, tourist.tilePos.y, 0);
    var nextTilePos = DIR.toOffset(direction);

    nextTilePos.x += tourist.tilePos.x;
    nextTilePos.y += tourist.tilePos.y;

    var nextTile = map.getTile(nextTilePos.x, nextTilePos.y);

    var nextTileProps = MAPINFO.tilePropsFromTile(nextTile);
    var currentTileProps = MAPINFO.tilePropsFromTile(currentTile);

    if (nextTileProps.occupyingTourist !== null) {
      return false;
    }

    if (!(tourist.passableFlag in nextTile.properties)) {
      return false;
    }

    nextTileProps.occupyingTourist = tourist;
    currentTileProps.occupyingTourist = null;
    setTilePos(tourist, nextTilePos.x, nextTilePos.y);

    // var breakable = MAPINFO.hasBreakable(map, nextTilePos.x, nextTilePos.y);
    // if (breakable) {
    //   map.removeTile
    // }

    MAPINFO.tryRemoveBreakable(map, nextTilePos.x, nextTilePos.y);

    return true;
  }


  function tweenMove(tourist) {
    tourist.moving = true; // now we are moving
    tourist.sprite.animations.play(tourist.facing); // play the direction we are moving in
    tourist.tween = game.add.tween(tourist.sprite); // new player tween

    var dir = goingBackward ? DIR.oppositeOf(tourist.facing) : tourist.facing;

    switch (dir) {
    case DIR.LEFT:
      tourist.tween.to({x: tourist.sprite.x - 64}, 300);
      break;

    case DIR.RIGHT:
      tourist.tween.to({x: tourist.sprite.x + 64}, 300);
      break;

    case DIR.UP:
      tourist.tween.to({y: tourist.sprite.y - 64}, 300);
      break;

    case DIR.DOWN:
      tourist.tween.to({y: tourist.sprite.y + 64}, 300);
      break;
    }

    // What we do when we are done moving
    tourist.tween.onComplete.add(function () {
      tourist.sprite.animations.stop(null, true);
      tourist.moving = false;
    });

    // Play the tween
    tourist.tween.start();

    // TOURIST.updateSpriteCoords(level.current.map, tourist);
  }


  function updateTourists(touristList, currentLevel, guardSaysGo, oKey, iKey) {
    var i, tourist;

    if (!guardSaysGo) {
      return;
    }

    var anyoneMoving = touristList.reduce(function (prev, cur) {
      return prev || cur.moving;
    }, false);

    if (anyoneMoving) {
      return;
    }

    if (!goingBackward) {
      for (i = 0; i < touristList.length; i++) {
        tourist = touristList[i];
        if (!TOURIST.stepForward(game, currentLevel.map, tourist)) {
          break;
        }
      }
    } else {
      for (i = touristList.length - 1; i >= 0; i--) {
        tourist = touristList[i];
        // if step returns false, it means he couldn't move, so
        // don't keep trying to move
        if (!TOURIST.stepBackward(game, currentLevel.map, tourist)) {
          break;
        }
      }
    }
  }


  function forceUpdateSpriteCoords(map, tourist) {
    var currentTile = map.getTile(tourist.tilePos.x, tourist.tilePos.y, 0);
    tourist.sprite.x = currentTile.worldX;
    tourist.sprite.y = currentTile.worldY;
  }


  function isChainGoingBackward() {
    return goingBackward;
  }


  return {
    build: build,
    stepForward: stepForward,
    stepBackward: stepBackward,
    setTourGuideFacing: setTourGuideFacing,
    move: move,
    buildChain: buildChain,
    buildChainFromLevel: buildChainFromLevel,
    updateTourists: updateTourists,
    isChainGoingBackward: isChainGoingBackward
  };
})();
