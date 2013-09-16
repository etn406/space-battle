/**
 * Balle/Projectile
 */

gamvas.actors = gamvas.actors || {};

gamvas.actors.Bullet = gamvas.Actor.extend(
{
    /// Variables pour le jeu
    // Équipe
    team: undefined,
    
    // Nom de l'Actor propriétaire
    owner: undefined,
    
    // Dégâts provoqués par ce projectile
    damages: 5,
    
    /// Variables pour l'affichage
    // Couleur par défaut (sur le cercle chromatique 0-359)
    color: 120,
    
    // Longueur en pixels par défaut
    size: 6,
    
    /// Variables pour les collisions
    // Rayon de collision
    radius: 3,
    
    /// Variables pour le déplacement
    // Vitesse de déplacement
    speed: 14,
    
    /// Variables pour l'explosion
    // Durée de l'explosion (s)
    explosionDuration: 0.25,
    
    // Instant actuel de l'explosion
    explosionCurrentDuration: 0,
    
    // Rayon de l'explosion
    explosionFinalSize: 10,
    
    
    /**
     * Constructeur.
     * @parent Actor
     * @param name
     */
    
    create: function(name, x, y, rotation, actorOwner)
    {
        this._super(name, x, y);
        
        // Ceci est une balle.
        this.type = 'bullet';
        
        // Rotation de la balle dans la bonne direction
        this.setRotation(rotation);
        
        // Propriétaire de la balle
        this.owner = actorOwner.name;
        
        // Équipe de la balle
        this.team = actorOwner.team;
        
        // Couleur
        this.color = actorOwner.color;
        
        // Dommages
        this.damages = actorOwner.bulletDamages || this.damages;
        
        // ActorState par défaut
        var defState = this.getCurrentState();
        defState.update = this.bulletDefaultUpdate;
        defState.draw = this.bulletDefaultDraw;
        defState.onCollisionEnter = this.bulletDefaultOnCollisionEnter;
        
        // ActorState pour l'explosion
        var explosionState = new gamvas.ActorState('explosion');
        explosionState.update = this.bulletExplosionUpdate;
        explosionState.draw = this.bulletExplosionDraw;
        this.addState(explosionState);
        
        // Physique de la balle
        this.bodyCircle(this.position.x, this.position.y, this.radius, gamvas.physics.DYNAMIC);
        this.setBullet(true);
        this.setSensor(true);
        
        // Vitesse de déplacement en fonction de l'angle.
        this.body.m_linearVelocity.x = Math.cos(this.rotation) * this.speed;
        this.body.m_linearVelocity.y = Math.sin(this.rotation) * this.speed;
    },
    
    /**
     * Mise à jour.
     * @parent ActorState
     * @param t
     */
    
    bulletDefaultUpdate: function(t) {
        gamvas.state.getCurrentState().setInArea(this.actor);
    },
    
    /**
     * Mise à jour de l'affichage.
     * @parent ActorState
     * @param t
     */
    
    bulletDefaultDraw: function(t)
    {
        var bullet = this.actor,
        ctx = gamvas.getContext2D();
        
        ctx.lineWidth = 2;
        ctx.lineCap="round";
        ctx.strokeStyle = 'hsl(' + bullet.color + ', 100%, 50%)';
        
        ctx.beginPath();
        ctx.moveTo(bullet.position.x, bullet.position.y);
        ctx.lineTo(bullet.position.x - bullet.body.m_linearVelocity.x / bullet.speed * bullet.size,
                   bullet.position.y - bullet.body.m_linearVelocity.y / bullet.speed * bullet.size);
        ctx.stroke();
    },
    
    /**
     * Collision avec un autre objet
     * @parent ActorState
     * @param t
     */
    
    bulletDefaultOnCollisionEnter: function(actor)
    {
        if (actor.getCurrentState().name != 'explosion' && (
            actor.type == 'bullet' ||
            (actor.team && actor.team != this.actor.team)
        ))
            this.actor.setState('explosion');
    },
    
    /**
     * Mise à jour de l'explosion du projectile.
     * @parent ActorState
     */
    
    bulletExplosionUpdate: function(t)
    {
        this.actor.resetForces();
        this.actor.explosionCurrentDuration += t;
        
        // Fin de l'explosion, destruction définitive de l'objet
        if (this.actor.explosionCurrentDuration / this.actor.explosionDuration > 1)
            gamvas.state.getCurrentState().removeActor(this.actor.name);
    },
    
    /**
     * Affichage de l'explosion du vaisseau.
     * @parent ActorState
     */
    
    bulletExplosionDraw: function(t)
    {
        var bullet = this.actor,
        ctx = gamvas.getContext2D();
        
        if (bullet.explosionCurrentDuration / bullet.explosionDuration > 1)
            ctx.fillStyle = 'transparent';
        else
            ctx.fillStyle = 'hsla(' + bullet.color + ', 100%, 50%, ' + (1 - bullet.explosionCurrentDuration / bullet.explosionDuration) + ')';
        
        ctx.beginPath();
        ctx.arc(bullet.position.x, bullet.position.y,
                bullet.explosionCurrentDuration / bullet.explosionDuration * bullet.explosionFinalSize,
                0, Math.PI * 2);
        ctx.fill();
    }
});
