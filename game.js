const config = {
  type: Phaser.AUTO,
  parent: 'game',
  width: 1920,
  heigth: 1080,
  scale: {
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: {
    preload,
    create,
    update,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 1500 },
      debug: true,
    },
  }
};

const game = new Phaser.Game(config);

function preload() {
  this.load.image('background', 'assets/images/background.png');
  this.load.image('spike', 'assets/images/spike.png');
  // At last image must be loaded with its JSON
  this.load.atlas('player', 'assets/images/kenney_player.png','assets/images/kenney_player_atlas.json');
  this.load.image('tiles', 'assets/tilesets/platformPack_tilesheet.png');
  // Load the export Tiled JSON
  this.load.tilemapTiledJSON('map', 'assets/tilemaps/level1.json');
}

function create() {
  //CAMERA


  //map

  const backgroundImage = this.add.image(0, 0,'background').setOrigin(0, 0);
  backgroundImage.setScale(2, 0.8);
  const map = this.make.tilemap({ key: 'map' });
  const tileset = map.addTilesetImage('kenny_simple_platformer', 'tiles');
  const platforms = map.createStaticLayer('Platforms', tileset, 0, 200);
  platforms.setCollisionByExclusion(-1, true);

  //player

  this.player = this.physics.add.sprite(50, 300, 'player');
  this.player.setBounce(0.1);
  this.player.setCollideWorldBounds(false);
  this.physics.add.collider(this.player, platforms);

  //animation

  this.anims.create({
    key: 'walk',
    frames: this.anims.generateFrameNames('player', {
      prefix: 'robo_player_',
      start: 2,
      end: 3,
    }),
    frameRate: 10,
    repeat: -1
  });
  this.anims.create({
    key: 'idle',
    frames: [{ key: 'player', frame: 'robo_player_0' }],
    frameRate: 10,
  });
  this.anims.create({
    key: 'jump',
    frames: [{ key: 'player', frame: 'robo_player_1' }],
    frameRate: 10,
  });
  this.cursors = this.input.keyboard.createCursorKeys();

// SPIKES

  // Create a sprite group for all spikes, set common properties to ensure that
// sprites in the group don't move via gravity or by player collisions
  this.spikes = this.physics.add.group({
    allowGravity: false,
    immovable: true
  });

// Let's get the spike objects, these are NOT sprites
// We'll create spikes in our sprite group for each object in our map
  map.getObjectLayer('Spikes').objects.forEach((spike) => {
    // Add new spikes to our sprite group
    const spikeSprite = this.spikes.create(spike.x, spike.y + 200 - spike.height, 'spike').setOrigin(0);
  });
  map.getObjectLayer('Spikes').objects.forEach((spike) => {
    const spikeSprite = this.spikes.create(spike.x, spike.y + 200 - spike.height, 'spike').setOrigin(0);
    spikeSprite.body.setSize(spike.width, spike.height - 20).setOffset(0, 20);
  });

  this.physics.add.collider(this.player, this.spikes, playerHit, null, this);

  function playerHit(player, spike) {
    player.setVelocity(0, 0);
    player.setX(50);
    player.setY(300);
    player.play('idle', true);
    player.setAlpha(0);
    let tw = this.tweens.add({
      targets: player,
      alpha: 1,
      duration: 100,
      ease: 'Linear',
      repeat: 5,
    });
  }

}

function update() {
  // Control the player with left or right keys
  if (this.cursors.left.isDown) {
    this.player.setVelocityX(-160);
    if (this.player.body.onFloor()) {
      this.player.play('walk', true);
    }
  } else if (this.cursors.right.isDown) {
    this.player.setVelocityX(160);
    if (this.player.body.onFloor()) {
      this.player.play('walk', true);
    }
  } else {
    // If no keys are pressed, the player keeps still
    this.player.setVelocityX(0);
    // Only show the idle animation if the player is footed
    // If this is not included, the player would look idle while jumping
    if (this.player.body.onFloor()) {
      this.player.play('idle', true);
    }
  }

// Player can jump while walking any direction by pressing the space bar
// or the 'UP' arrow
  if ((this.cursors.space.isDown || this.cursors.up.isDown) && this.player.body.onFloor()) {
    this.player.setVelocityY(-850);
    this.player.play('jump', true);
  }



  if (this.player.body.velocity.x > 0) {
    this.player.setFlipX(false);
  } else if (this.player.body.velocity.x < 0) {
    // otherwise, make them face the other side
    this.player.setFlipX(true);
  }


}