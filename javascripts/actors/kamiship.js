/**
 * Vaisseau explosif.
 */

gamvas.actors = gamvas.actors || {};

gamvas.actors.KamiShip = gamvas.actors.BasicShip.extend(
{
    /// Variables pour le jeu
    // Équipe par défaut
    team: 2,
    
    // Santé par défaut
    health: 50,
    
    // Santé maximale par défaut
    maxHealth: 50,
    
    // Valeur du vaisseau pour le score
    scoreValue: 200,
    
    // Rayon de collison du vaisseau
    collisionRadius: 14,
    
    /// Variables pour l'affichage
    // Forme du vaisseau
    shape: [
        [   10,   0],
        [    4,  -4],
        [    0, -10],
        [   -4,  -4],
        [   -10,  0],
        [   -4,   4],
        [    0,  10],
        [    4,   4],
        [   10,   0]
    ],
    
    /// Variables d'affichage
    // Affichage d'un laser
    laser: false,
    
    /// Variables pour les tirs
    // Cadence de tir (s)
    fireRate: Infinity,
    
    /// Variables pour le déplacement
    // Vélocité maximale
    maxSpeed: 4, 
    
    // Force d'accélération
    acceleration: 5,
    
    // Force de décélération
    deceleration: 2,
    
    /// Variables pour l'explosion
    // Durée de l'explosion (s)
    explosionDuration: 1,
    
    // Rayon de l'explosion
    explosionRadius: 60,
    
    // L'explosion est/n'est pas dangereuse pour les vaisseaux alentours.
    dangerousExplosion: true,
    
    /**
     * Constructeur.
     * @parent Actor
     * @param name Nom de l'objet
     */
    
    create: function(name, x, y, color)
    {
        this._super(name, x, y, color);
        
        // Vitesse légèrement aléatoire pour éviter les patés.
        this.maxSpeed = this.maxSpeed + Math.random() * 2 - 1;
    },
    
    /**
     * Mise à jour par défaut.
     * @parent ActorState
     * @param name Nom de l'objet
     */
    
    shipDefaultUpdate: function(t)
    {
        var ship = this.actor,
        
        /// Déplacement du vaisseau
        
        // Directions pouvant prises par le vaisseau
        directions = {
            up: false,
            down: false,
            right: false,
            left: false
        },
        
        // Cible
        enemy = gamvas.state.getCurrentState().player;
        
        // Remise du vaisseau dans l'arène si celui-ci est sortit
        gamvas.state.getCurrentState().setInArea(ship);
        
        // Si la cible est définie
        if (enemy && enemy.health > 0)
        {
            // Vecteur entre le vaisseau et sa cible
            var diff = new gamvas.Vector2D(ship.position.x - enemy.position.x, ship.position.y - enemy.position.y),
            
            // Approche la cible
            directions = ship.approach(ship.getAngleOf(diff), diff.length(), 0);
        }
        
        // Rotation continue.
        ship.setRotation(ship.rotation + 0.15);
        
        if (ship.rotation >= 360)
            ship.setRotation(ship.rotation - 360);
        
        // Modifier la vélocité.
        ship.applyDirections(directions, t);
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
        
        // Explosion
        else if (actor.type == 'ship' && actor.team != this.actor.team)
            this.actor.instantlyDestroy();
    }
});