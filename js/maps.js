// Responsible for all relavent level data setup?
LEVELS = (function () {

  function build(game) {
    var level = {
      one: {
        map : game.add.tilemap('map1'),
        layers : {}
      },
      two: {
        map: game.add.tilemap('map2'),
        layers: {}
      },
      three: {
        map: game.add.tilemap('map3'),
        layers: {}
      },
      current: null
    };

    // Set the game stage background color
    game.stage.backgroundColor = '#000000';

    // Level 1 setup
    level.one.map.addTilesetImage('tiles', 'tiles');
    level.one.layers.terrain = level.one.map.createLayer('terrain');
    level.one.layers.collision = level.one.map.createLayer('collision');
    level.one.layers.misc = level.one.map.createLayer('misc');

    // Level 2 setup
    level.two.map.addTilesetImage('logic_tiles', 'logic_tiles');
    level.two.layers.logical = level.two.map.createLayer('logical');

    // Level 3 setup
    level.three.map.addTilesetImage('tileset1', 'tileset1');
    level.three.map.addTilesetImage('tileset2', 'tileset2');
    level.three.layers.logical = level.three.map.createLayer('floor');
    level.three.layers.logical = level.three.map.createLayer('logical');
    level.three.layers.doodads = level.three.map.createLayer('doodads');

    function setBreakable(map, x, y) {
      var doodadLayer = level.three.layers.doodads.index;
      MAPINFO.tileProps(map, x, y, 'doodads').breakable = true;
    }

    function setLeverOpensDoor(map, leverX, leverY, doorX, doorY) {
      var leverProps = MAPINFO.tileProps(map, leverX, leverY, 'doodads');
      var doorProps = MAPINFO.tileProps(map, doorX, doorY, 'doodads');
      leverProps.leverOpensDoor = new Phaser.Point(doorX, doorY);
      doorProps.doodadBlock = true;
    }

    setBreakable(level.three.map, 3,  11);
    setBreakable(level.three.map, 18,  13);
    setBreakable(level.three.map, 18,  17);
    setBreakable(level.three.map, 23,  12);
    setBreakable(level.three.map, 25,  4);
    setBreakable(level.three.map, 7,  4);

    setLeverOpensDoor(level.three.map, 4, 9, 7, 14);
    setLeverOpensDoor(level.three.map, 13, 11, 14, 14);
    setLeverOpensDoor(level.three.map, 18, 15, 22, 18);
    setLeverOpensDoor(level.three.map, 23, 15, 26, 16);
    setLeverOpensDoor(level.three.map, 23, 13, 25, 10);
    setLeverOpensDoor(level.three.map, 23, 9, 22, 5);
    setLeverOpensDoor(level.three.map, 10, 7, 8, 8);
    setLeverOpensDoor(level.three.map, 1, 1, 3, 4);

    return level;
  }

  // Return our group of levels
  return {
    build: build
  };
})();


DIR = {
  UP: 'up',
  DOWN: 'down',
  LEFT: 'left',
  RIGHT: 'right',

  toOffset: function (direction) {
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

    return new Phaser.Point(x, y);
  },

  oppositeOf: function (direction) {
    switch (direction) {
    case DIR.UP:
      return DIR.DOWN;

    case DIR.DOWN:
      return DIR.UP;

    case DIR.LEFT:
      return DIR.RIGHT;

    case DIR.RIGHT:
      return DIR.LEFT;

    default:
      throw new Error('BAD DIRECTION', direction);
    }
  }
};


TILE_PROPS = {
  // GUARD_PASSABLE: 'guard_passable',
  // TOURIST_PASSABLE: 'tourist_passable',
  BLOCK_TOURIST: 'block_tourist',
  BREAKABLE: 'breakable'
};


MAPINFO = (function () {
  'use strict';

  function getLayerData(map, layerName) {
    return map.layers[map.getLayer(layerName)];
  }


  function guardPassable(map, x, y) {
    // var logicalIdx = map.getLayer('logical');
    // var logicalTile = map.getTile(x, y, logicalIdx);
    // if (!(TILE_PROPS.PASSABLE in logicalTile.properties)) {
    //   return false;
    // }

    if (tileHasWall(map, x, y)) {
      return false;
    }

    var doodadsIdx = map.getLayer('doodads');
    var doodadsTile = map.getTile(x, y, doodadsIdx);

    if (doodadsTile) {
      var tileWorldProps = tilePropsFromTile(doodadsTile);

      if (tileWorldProps.doodadBlock) {
        return false;
      }

      if (tileWorldProps.breakable) {
        return false;
      }
    }

    return true;
  }


  function tileHasWall(map, x, y) {
    var logicalIdx = map.getLayer('logical');
    var logicalTile = map.getTile(x, y, logicalIdx);
    return logicalTile !== null;
  }


  function touristPassable(map, x, y) {
    if (tileHasWall(map, x, y)) {
      return false;
    }

    var doodadsIdx = map.getLayer('doodads');
    var doodadsTile = map.getTile(x, y, doodadsIdx);

    if (doodadsTile) {
      if (TILE_PROPS.BLOCK_TOURIST in doodadsTile.properties) {
        return false;
      }

      var tprops = tilePropsFromTile(doodadsTile);
      if (tprops.doodadBlock) {
        return false;
      }

    }

    return true;
  }


  function tryPullLever(map, x, y) {
    var doodadsIdx = map.getLayer('doodads');
    var doodadsTile = map.getTile(x, y, doodadsIdx);

    if (doodadsTile) {
      var props = tilePropsFromTile(doodadsTile);
      if (props.leverOpensDoor !== null) {
        var doorCoord = props.leverOpensDoor;
        removeDoor(map, doorCoord.x, doorCoord.y);
        props.leverOpensDoor = null;
      }
    }
  }


  function getBreakable(map, x, y) {
    var doodadsIdx = map.getLayer('doodads');
    var doodadsTile = map.getTile(x, y, doodadsIdx);
    if (!doodadsTile) {
      return null;
    }

    var tileWorldProps = tilePropsFromTile(doodadsTile);

    if (tileWorldProps.breakable) {
      return doodadsTile;
    }
    return null;
  }

  function tryRemoveBreakable(map, x, y) {
    var doodadsIdx = map.getLayer('doodads');

    var breakableTile = getBreakable(map, x, y);

    if (breakableTile) {
      var explosion = window.game.add.sprite(breakableTile.worldX, breakableTile.worldY, 'explosion');
      var exAnim = explosion.animations.add('explode', [0,1,2,3,4,5], 20);
      exAnim.killOnComplete = true;
      exAnim.play();
      //explosion.animations.play('explode');
      map.removeTile(x, y, doodadsIdx);
      return true;
    }

    return false;
  }


  function removeDoor(map, x, y) {
    var doodadsIdx = map.getLayer('doodads');
    var doorTile = map.getTile(x, y, doodadsIdx);

    if (!doorTile) {
      return false;
    }

    var explosion = window.game.add.sprite(doorTile.worldX, doorTile.worldY, 'explosion');
    var exAnim = explosion.animations.add('explode', [0,1,2,3,4,5], 20);
    exAnim.killOnComplete = true;
    exAnim.play();
    //explosion.animations.play('explode');
    map.removeTile(x, y, doodadsIdx);

    return true;
  }


  function getTourist(map, x, y) {
    var props = tileProps(map, x, y);
    return props.occupyingTourist;
  }


  function setTourist(map, x, y, tourist) {
    var props = tileProps(map, x, y);
    props.occupyingTourist = tourist;
  }


  function tileProps(map, x, y, layerName) {
    var tile = map.getTile(x, y, layerName);
    return tilePropsFromTile(tile);
  }

  function tilePropsFromTile(tile) {
    if (!('tileWorldProps' in tile)) {
      tile.tileWorldProps = {
        occupyingTourist: null,
        leverOpensDoor: null, // Point(x, y)
        breakable: false,
        doodadBlock: false,
      };
    }
    return tile.tileWorldProps;
  }

  /*
var tileProps = MAPINFO.tileProps(map, breakableX, breakableY);
tileProps.breakable = true;

var tileProps = MAPINFO.tileProps(map, leverX, leverY);
tileProps.leverOpensDoor = new Phaser.Point(doorX, doorY);
   */

  var _private = {
    removeDoor: removeDoor
  };

  return {
    guardPassable: guardPassable,
    touristPassable: touristPassable,
    getTourist: getTourist,
    setTourist: setTourist,
    tileProps: tileProps,
    tilePropsFromTile: tilePropsFromTile,
    getLayerData: getLayerData,
    tryRemoveBreakable: tryRemoveBreakable,
    tryPullLever: tryPullLever,
    _private: _private
  };
})();
