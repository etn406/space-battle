/**
 * Vaisseau
 */

gamvas.actors = gamvas.actors || {};

gamvas.actors.Ship = gamvas.Actor.extend(
{
    /// Variables pour le jeu
    // Équipe par défaut
    team: undefined,
    
    // Santé par défaut
    health: 100,
    
    // Santé maximale par défaut
    maxHealth: 100,
    
    // Score
    score: 0,
    
    // Valeur du vaisseau pour le score
    scoreValue: 100,
    
    // Afficher la santé à côté du vaisseau
    drawHealth: true,
    
    // "Grain de sel" aléatoire pour ce vaisseau
    salt: undefined,
    
    // Rayon de collison du vaisseau
    collisionRadius: 10,
    
    /// Variables pour l'affichage
    // Couleur par défaut (sur le cercle chromatique 0-359)
    color: 120,
    
    // Opacité du vaisseau, pour l'apparition progressive
    opacity: 0,
    
    // Forme du vaisseau
    shape: [
        [   10,   0],
        [  -10, -10],
        [   -6,   0],
        [  -10,  10]
    ],
    
    // Afficher un laser pointant vers la cible
    laser: true,
    
    // Le vaisseau est rempli de couleur à la place d'avoir un simple contour.
    fill: false,
    
    /// Variables pour les tirs
    // Rayon d'apparition des tirs
    spawnDistance: 16,
    
    // Cadence de tir (s)
    fireRate: 0.15,
    
    // Temps écoulé depuis le dernier tir
    lastFire: 0,
    
    // Précision des tirs (0 = précision parfaite)
    precision: 0,
    
    // Nombre de tirs total du vaisseau
    bulletCounter: 0,
    
    // Dommages causés par les tirs
    bulletDamages: 5,
    
    /// Variables pour le déplacement
    // Vélocité maximale
    maxSpeed: 4, 
    
    // Force d'accélération
    acceleration: 8,
    
    // Force de décélération
    deceleration: 2,
    
    /// Variables pour l'explosion
    // Durée de l'explosion (s)
    explosionDuration: 0.80,
    
    // Rayon de l'explosion
    explosionRadius: 30,
    
    // L'explosion est/n'est pas dangereuse pour les vaisseaux alentours.
    dangerousExplosion: false,
    
    
    /**
     * Constructeur.
     * @parent Actor
     * @param name Nom de l'objet
     */
    
    create: function(name, x, y, color)
    {
        this._super(name, x, y);
        
        // "Grain de sel" aléatoire pour ce vaisseau
        this.salt = Math.random();
        
        // Couleur aléatoire
        this.color = color || this.color;
        
        // Type d'objet
        this.type = 'ship';
        
        // ActorState par défaut
        var defState = this.getCurrentState();
        defState.draw = this.shipDefaultDraw;
        defState.update = this.shipDefaultUpdate;
        defState.onCollisionEnter = this.shipDefaultOnCollisionEnter;
        
        // ActorState pour l'explosion
        var explosionState = new gamvas.ActorState('explosion');
        explosionState.update = this.shipExplosionUpdate;
        explosionState.draw = this.shipExplosionDraw;
        this.addState(explosionState);
        
        // Physique du vaisseau
        this.bodyCircle(this.position.x, this.position.y, this.collisionRadius, gamvas.physics.DYNAMIC);
        this.setSensor(true);
        
    },
    
    /**
     * Retourne l'angle (rad) d'un vecteur.
     * @parent Actor
     * @param vector (Vector2D)
     * @return float
     */
    
    getAngleOf: function(vector)
    {
        var vectorN = vector.normalized(),
        angle = Math.acos(vectorN.x);
        
        if (Math.asin(vectorN.y) < 0)
            angle = -angle;
        
        return angle;
    },
    
    /**
     * Tourne le vaisseau vers un emplacement spécifié.
     * Peut éventuellement prévoir la position 
     * @parent Actor
     * @param target L'Actor vers lequel doit se tourner le vaisseau.
     * @param [predictIndice=0] (environ distReelle/10) L'avance que doit prendre l'angle du vaisseau sur la
     *                          position de l'Actor par rapport à la vélocité de celui-ci;
     *                          (De préférence relative à la distance réelle entre le vaisseau et l'Actor)
     */
    
    turnTo: function(target, predictIndice)
    {
        if (!predictIndice)
            predictIndice = 0;
        
        var diff;
        
        // Vecteur rentre le vaisseau et l'Actor
        if (target.body && target.body.m_linearVelocity)
            diff = new gamvas.Vector2D(
                    this.position.x - target.position.x - target.body.m_linearVelocity.x * predictIndice,
                    this.position.y - target.position.y - target.body.m_linearVelocity.y * predictIndice
                );
        else
            diff = new gamvas.Vector2D(this.position.x - target.x, this.position.y - target.y);
        
        this.setRotation(this.getAngleOf(diff) + Math.PI);
    },
    
    /**
     * Approcher le vaisseau vers un point jusqu'à une certaine distance.
     * @parent Actor
     * @param angle L'angle entre le vaisseau et la cible.
     * @param distance La distance entre le vaisseau et la cible.
     * @param maxDistance La distance maximale à respecter.
     * @return les directions (in)actives pour le déplacement.
     */
    
    approach: function(angle, distance, maxDistance)
    {
        if (distance > maxDistance)
        {
            var sin = Math.sin(angle), cos = Math.cos(angle);
            return {
                up: sin >= 0,
                down: sin < 0,
                left: cos >= Math.PI / 4,
                right: cos < Math.PI / 4
            };
        }
        else
            return {up: false, down: false, left: false, right: false};
    },
    
    /**
     * Écarter le vaisseau d'un point à partir d'une certaine distance.
     * @parent Actor
     * @param angle L'angle entre le vaisseau et la cible.
     * @param distance La distance entre le vaisseau et la cible.
     * @param minDistance La distance minimale de déclenchement.
     * @return les directions (in)actives pour le déplacement.
     */
    
    moveAway: function(angle, distance, minDistance)
    {
        if (distance < minDistance)
            return {
                up: Math.sin(angle) < 0,
                down: Math.sin(angle) >= 0,
                left: Math.cos(angle) < Math.PI / 4,
                right: Math.cos(angle) >= Math.PI / 4
            };
        else
            return {up: false, down: false, left: false, right: false}
    },
    
    /**
     * Applique les gains de vitesse en fonctions des directions, de l'accélération,
     * de la décélération et de la vitesse maximale.
     * @parent Actor
     * @param dirs Les directions à appliquer.
     * @param t le temps écoulé entre deux mises à jours (s)
     */
    
    applyDirections: function(dirs, t)
    {
        var vel = this.body.m_linearVelocity;
        t = t * 1000;
        
        // Accélération
        if (dirs.up) {
            vel.y -= this.acceleration / t;
        }
        if (dirs.down) {
            vel.y += this.acceleration / t;
        }
        if (dirs.right) {
            vel.x += this.acceleration / t;
        }
        if (dirs.left) {
            vel.x -= this.acceleration / t;
        }
        
        // Limite de vitesse
        if (vel.x > this.maxSpeed)
            vel.x = this.maxSpeed;
        else if (vel.x < -this.maxSpeed)
            vel.x = -this.maxSpeed;
        
        if (vel.y > this.maxSpeed)
            vel.y = this.maxSpeed;
        else if (vel.y < -this.maxSpeed)
            vel.y = -this.maxSpeed;
        
        // Décélération
        if (!(dirs.up || dirs.down || dirs.right || dirs.left))
        {
            // Décélération horizontale
            if (vel.x > 0 && !dirs.left)
                vel.x -= this.deceleration / t;
            else if (vel.x < 0 && !dirs.right)
                vel.x += this.deceleration / t;
            
            // Décélération verticale
            if (vel.y > 0 && !dirs.down)
                vel.y -= this.deceleration / t;
            else if (vel.y < 0 && !dirs.up)
                vel.y += this.deceleration / t;
        }
    },
    
    /**
     * Tirer un projectile (si possible).
     */
    
    shoot: function()
    {
        var st = gamvas.state.getCurrentState();
        
        if (this.lastFire > this.fireRate && this.health > 0 && !st.peaceAndLove)
        {
            var angle = this.rotation + Math.random() * this.precision - (this.precision / 2);
            
            var bullet = new gamvas.actors.Bullet(
                'bullet ' + (this.bulletCounter++) + this.name,
                this.position.x + Math.cos(angle) * this.spawnDistance,
                this.position.y + Math.sin(angle) * this.spawnDistance,
                angle,
                this
            );
            
            this.lastFire = 0;
            
            gamvas.state.getCurrentState().addActor(bullet);
        }
    },
    
    /**
     * Afficher le vaisseau.
     * @parent ActorState
     * @param t
     */
    
    shipDefaultDraw: function(t)
    {
        var ship = this.actor,
        ctx = gamvas.getContext2D();
        
        // Apparition progressive (1.5s max)
        if (ship.opacity < 1)
            ship.opacity += (1 / 1.5) * t;
        else
            ship.opacity = 1;
        
        // Initialisation de la couleur et de la rotation du dessin avant l'affichage
        ctx.save();
        ctx.lineWidth = 2;
        ctx.fillStyle = 'hsla(' + ship.color + ', 100%, 50%, ' + ship.opacity + ')';
        ctx.strokeStyle = 'hsla(' + ship.color + ', 100%, 50%, ' + ship.opacity + ')';
        ctx.translate(ship.position.x, ship.position.y);
        ctx.rotate(ship.rotation);
        
        // Dessin de la forme du vaisseau
        // @see shape
        
        ctx.beginPath();
        ctx.moveTo(ship.shape[0][0], ship.shape[0][1]);
        
        // Ajout des points de la forme
        for (var i = 1 ; i < ship.shape.length ; i++) {
            ctx.lineTo(ship.shape[i][0], ship.shape[i][1]);
        }
        
        // Fermeture de la forme
        ctx.lineTo(ship.shape[0][0], ship.shape[0][1]);
        
        // Affichage
        if (ship.fill)
            ctx.fill();
        else
            ctx.stroke();
        ctx.restore();
        
        // Afficher la santé du vaisseau
        if (gamvas.state.getCurrentState().viewShipHealth && ship.drawHealth)
        {
            ctx.font = '10px Visitor, monospace';
            ctx.textAlign = 'left';
            ctx.fillStyle = 'white';
//             ctx.fillText(ship.health + '/' + ship.maxHealth, ship.position.x + 18, ship.position.y + 18);
            ctx.fillText(ship.health, ship.position.x + 18, ship.position.y + 18);
        }/**/
        
        
        // Laser indiquant le point visé par le vaisseau.
        if (gamvas.state.getCurrentState().viewLasers && ship.laser)
        {
            var ctx = gamvas.getContext2D();
            ctx.lineWidth = 0.5;
            ctx.strokeStyle = 'hsla(' + ship.color + ', 100%, 50%, 0.2)';
            ctx.moveTo(ship.position.x, ship.position.y);
            ctx.lineTo(ship.position.x + Math.cos(ship.rotation) * 2000,
                    ship.position.y + Math.sin(ship.rotation) * 2000);
            ctx.stroke();
        }
    },
    
    
    /**
     * Appelé lors d'une collision.
     * @parent ActorState
     * @param actor l'objet en collision
     */
    
    shipDefaultOnCollisionEnter: function(actor)
    {
        // Perte de vie si l'objet en collision est une balle
        if (actor.type == 'bullet' && actor.team != this.actor.team)
            this.actor.loseHealth(actor.damages || 10, gamvas.state.getCurrentState().actors[actor.owner]);
    },
    
    /**
     * Faire perdre de la vie au vaisseau.
     * @parent Actor
     * @param h Quantité de vie à perdre
     * @param [actor] L'Actor ayant fait perdre de la vie, si il existe
     */
    
    loseHealth: function(h, actor)
    {
        this.health -= h;
        
        if (this.health <= 0)
        {
            this.instantlyDestroy();
            
            if (actor && actor.score != undefined)
                actor.score += this.scoreValue;
        }
    },
    
    /**
     * Faire exploser instantanément le vaisseau.
     * @parent Actor
     */
    
    instantlyDestroy: function()
    {
        var st = gamvas.state.getCurrentState();
        this.health = 0;
        this.resetForces();
        
        st.addActor(new gamvas.actors.Explosion(
            this.position.x,
            this.position.y,
            this.color,
            this.explosionRadius,
            this.explosionDuration,
            this.dangerousExplosion
        ));
        
        st.removeActor(this.name);
    }
});