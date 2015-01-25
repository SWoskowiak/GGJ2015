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
    level.three.map.addTilesetImage('tileset', 'tileset');
    level.three.layers.logical = level.three.map.createLayer('logical');

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
  GUARD_PASSABLE: 'guard_passable',
  TOURIST_PASSABLE: 'tourist_passable',
};


MAPINFO = (function () {
  'use strict';

  function getLayerData(map, layerName) {
    return map.layers[map.getLayer(layerName)];
  }


  function guardPassable(map, x, y) {
    var tile = map.getTile(x, y);
    return TILE_PROPS.GUARD_PASSABLE in tile.properties;
  }


  function touristPassable(map, x, y) {
    var tile = map.getTile(x, y);
    return TILE_PROPS.TOURIST_PASSABLE in tile.properties;
  }


  function getTourist(map, x, y) {
    var props = tileProps(map, x, y);
    return props.occupyingTourist;
  }


  function setTourist(map, x, y, tourist) {
    var props = tileProps(map, x, y);
    props.occupyingTourist = tourist;
  }


  function tileProps(map, x, y) {
    var tile = map.getTile(x, y);
    return tilePropsFromTile(tile);
  }

  function tilePropsFromTile(tile) {
    if (!('tileWorldProps' in tile)) {
      tile.tileWorldProps = {
        occupyingTourist: null
      };
    }
    return tile.tileWorldProps;
  }


  return {
    guardPassable: guardPassable,
    getTourist: getTourist,
    setTourist: setTourist,
    tileProps: tileProps,
    tilePropsFromTile: tilePropsFromTile,
    getLayerData: getLayerData
  };
})();
