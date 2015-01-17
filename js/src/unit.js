define(['candy'], function(Candy){
   var Unit = function(x, y, unitData, phaserInstance, sprite, isFriendly, bulletCollisionGroup){
       this.unitData = unitData;
       this.isFriendly = isFriendly;
       this.bulletCollisionGroup = bulletCollisionGroup;
       this.isFighting = false;
       this.sprite = sprite;
       this.sightBox = phaserInstance.add.sprite(this.sprite.x, this.sprite.y, 'sightBox');
       phaserInstance.physics.enable(this.sightBox, Phaser.Physics.ARCADE);
       this.phaserInstance = phaserInstance;
       if(unitData.type === 'military'){
           this.bullets = this.phaserInstance.add.group();
           this.bullets.enableBody();
           this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
       }
   };

   Unit.prototype = {
       update: function() {
           if(!this.isFighting){
               if (this.bullets) {
                   if (this.bulletInterval <= 0) {
                       //Fire gun, reset cooldown
                       this.bulletInterval = 600;
                   }
                   else{
                       this.bulletInterval -= 1;
                   }
                   this.phaserInstance.physics.arcade.overlap(this.bulletCollisionGroup, this.sprite, this.unitBulletCollision, null, this);
               }
               //Run unit AI:
               //move aimlessly
               //Move towards enemy if in sight range
               //Unless near unique unit under orders, then stay near him until dismissed
               if(this.underOrders){
                   this.followLeader();
               }
               else if(this.phaserInstance.physics.arcade.overlap(this.bulletCollisionGroup, this.sightBox, this.accelerateToEnemy, null, this)){
               }
               else{
                   this.wander();
               }
               this.sightBox.x = this.sprite.x;
               this.sightBox.y = this.sprite.y;
           }
       },
       unitBulletCollision: function(bulletSprite, unitSprite) {
           var unit = Candy.getObjectFromSprite(unitSprite);
           if (unit)unit.die();
           bulletSprite.destroy();
       },
       die: function(){
           //U dead. Bodies stay for 30 secs
           this.sprite.animations.play('die');
           this.sprite.kill();
           var that = this;
           window.setTimeout(function(){
               that.sprite.destroy();
           }, 30000);
       },
       accelerateToEnemy: function(thisSprite, bulletSprite){
           console.log('near some asshole.');
           this.phaserInstance.physics.arcade.accelerateToObject(this.sprite, bulletSprite, 60, 60,60);
       },
       wander: function(){
            if(this.directionTimer >=0){
                this.directionTimer -= 1;
            }
           else{
                this.directionTimer = 100;
                this.phaserInstance.physics.arcade.accelerateToXY(this.sprite, Math.random()*this.phaserInstance.world.width,
                    Math.random()*this.phaserInstance.world.height, 30, 30, 30);
            }
       },
       followLeader: function(){
           if(this.leader){
               this.phaserInstance.physics.arcade.accelerateToObject(this.sprite, this.leader, 30, 30, 30);
           }
       }
   };

   return Unit;
});