var PLAYER = (function () {

  var player, tween,
    moving = false,
    facing = 'down',
    acting = false,
    showMove = false,
    movespeed = 200;

  var speechBubbles = {
    stop: '',
    go: ''
  }

  var lightRadius = 150,
    shadowTexture,
    lightOffset = {
      x : 50,
      y : 50
    },
    lightTexture

  function build(game) {
    player = game.add.sprite(0, 0, 'guard_sprite');

    game.physics.enable(player, Phaser.Physics.ARCADE);

    player.body.collideWorldBounds = true;
    player.body.setSize(64, 64, 43, 32);

    // Movement animations
    player.animations.add('right', [3, 4, 5], 20, true);
    player.animations.add('left', [8, 9, 10], 20, true);
    player.animations.add('up', [11, 12, 13], 20, true);
    player.animations.add('down', [0, 1, 2], 20, true);

    // Pointing animations
    player.animations.add('point_left', [6], 20, true);
    player.animations.add('point_right', [7], 20, true);
    player.animations.add('point_down', [15], 20, true);
    player.animations.add('point_up', [14], 20, true);

    // Action animations
    player.animations.add('pushButtonUp', [17], 1, true);

    shadowTexture = game.add.bitmapData(game.width, game.height);
    lightTexture = game.add.image(0, 0, shadowTexture);

    lightTexture.blendMode = Phaser.blendModes.MULTIPLY;

    game.camera.follow(player);

    speechBubbles.go = game.add.sprite(0, 0, 'go_bubble');
    speechBubbles.stop = game.add.sprite(0, 0, 'stop_bubble');

    speechBubbles.go.visible = false;
    speechBubbles.stop.visible = false;

    return player;
  }

  function update(game) {
    //player.body.velocity.x = player.body.velocity.y = 0;

    // Movement
    if (game.GLOBALS.cursors.right.isDown) {
      move('right');
    } else if (game.GLOBALS.cursors.left.isDown) {
      move('left');
    } else if (game.GLOBALS.cursors.down.isDown) {
      move('down');
    } else if (game.GLOBALS.cursors.up.isDown) {
      move('up');
    }
    // Action
    if (game.GLOBALS.spacebar.isDown && !moving) {
      // Act
      point();
      acting = true;
      // Add tile check here for thing
    } else {
      acting = false;

    }


    // Orders!
    if (game.GLOBALS.mKey.isDown) {
      speechBubbles.go.visible = true;
      speechBubbles.stop.visible = false;

      showMove = true;
    } else {
      if (showMove) {
        showMove = false;
        speechBubbles.go.visible = false;
        speechBubbles.stop.alpha = 1;
        speechBubbles.stop.visible = true;
        var bubbleTween = game.add.tween(speechBubbles.stop);

        bubbleTween.to({alpha: 0}, 500);
        bubbleTween.start();
      }
    }

    speechBubbles.stop.x = speechBubbles.go.x = player.x + 90;
    speechBubbles.stop.y = speechBubbles.go.y = player.y;

    // Lighting draw
    shadowTexture.context.fillStyle = 'rgb(150, 150, 150)';
    shadowTexture.context.fillRect(0, 0, game.width, game.height);
    // Draw circle of light with a soft edge
    var gradient = shadowTexture.context.createRadialGradient(
      player.x + lightOffset.x, player.y + lightOffset.y, lightRadius * 0.75,
      player.x + lightOffset.x, player.y + lightOffset.y, lightRadius);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0.0)');

    shadowTexture.context.beginPath();
    shadowTexture.context.fillStyle = gradient;
    shadowTexture.context.arc(player.x + lightOffset.x, player.y + lightOffset.y,
      lightRadius, 0, Math.PI*2);
    shadowTexture.context.fill();

    // This just tells the engine it should update the texture cache
    shadowTexture.dirty = true;

    // Idle
    if (!acting && !moving) {
      player.animations.stop(facing, true)
    }
  }

  function point() {
    player.animations.stop('point_' + facing, true);
  }

  function doneMoving(dir) {
    player.animations.stop(null, true);
    moving = false;
    facing = dir;
    tween.stop();
  }

  // move in a direction
  function move(dir) {
    // Break early if we are already moving
    if (moving) return false;

    // delay our movement a bit then on direction change
    if (dir !== facing) {
      moving = true;
      setTimeout(function () {moving = false;}, 150);
      player.animations.stop(dir, true);
      facing = dir;
    // MOVE!
  } else if(!acting) {
      moving = true; // now we are moving
      player.animations.play(dir); // play the direction we are moving in
      tween = game.add.tween(player); // new player tween
      if (dir === 'left') {
        tween.to({x: player.x - 64}, 150);
      } else if (dir === 'right') {
        tween.to({x: player.x + 64}, 150);
      } else if (dir === 'down') {
        tween.to({y: player.y + 64}, 150);
      } else if (dir === 'up') {
        tween.to({y: player.y - 64}, 150);
      }
      // What we do when we are done moving
      tween.onComplete.add(function () {doneMoving(dir);});
      // Play the tween
      tween.start();
    }
  }

  return {
    build: build,
    update: update
  }
})();
