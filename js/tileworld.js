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
