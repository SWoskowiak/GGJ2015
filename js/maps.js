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
      }
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
    console.log('poo2');
    level.two.layers.logical = level.two.map.createLayer('logical');

    // console.log(level.one.layers.misc);
    // Resize our world to level one initially
    // level.one.layers.terrain.resizeWorld();

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

    return new PIXI.Point(x, y);
  }
};


TILE_PROPS = {
  GUARD_PASSABLE: 'guard_passable',
  TOURIST_PASSABLE: 'tourist_passable',
  TOURIST_SPAWN: 'tourist_spawn',
  TOURGUIDE_SPAWN: 'tourguide_spawn'
};


MAPINFO = (function () {
  'use strict';


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
