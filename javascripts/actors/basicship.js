/**
 * Vaisseau ennemi (IA facile)
 */

gamvas.actors = gamvas.actors || {};

gamvas.actors.BasicShip = gamvas.actors.Ship.extend(
{
    /// Variables pour le jeu
    // Équipe par défaut
    team: 2,
    
    // Santé par défaut
    health: 10,
    
    // Santé maximale par défaut
    maxHealth: 10,
    
    // Valeur du vaisseau pour le score
    scoreValue: 100,
    
    /// Variables pour l'affichage
    // Forme du vaisseau
    shape: [
        [   10,   0],
        [   -5, -10],
        [   -5,  10]
    ],
    
    /// Variables pour les tirs
    // Cadence de tir (s)
    fireRate: 1.5,
    
    // Distance minimale entre le vaisseau et sa cible pour commencer à tirer
    maxShootDistance: Infinity,
    
    // Précision
    precision: Math.PI / 10,
    
    // Prédiction de déplacement
    predict: 0,
    
    // Dommages causés par les tirs
    bulletDamages: 5,
    
    /// Variables pour le déplacement
    // Vélocité maximale
    maxSpeed: 3, 
    
    // Force d'accélération
    acceleration: 6,
    
    // Force de décélération
    deceleration: 3,
    
    // Distance minimale entre le vaisseau et sa cible (+-50 !!!)
    minTargetDistance: 150,
    
    // Distance maximale entre le vaisseau et sa cible (+-50 !!!)
    maxTargetDistance: 600,
    
    /**
     * Mise à jour par défaut.
     * @parent ActorState
     * @param name Nom de l'objet
     */
    
    shipDefaultUpdate: function(t)
    {
        var ship = this.actor,
        
        /// Déplacement du vaisseau
        
        // Vélocité du vaisseau
        vel = ship.body.m_linearVelocity,
        
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
            // Rotation vers la cible.
            ship.turnTo(enemy, ship.predict);
            
            // Vecteur entre le vaisseau et sa cible
            var diff = new gamvas.Vector2D(ship.position.x - enemy.position.x, ship.position.y - enemy.position.y),
            
            // Distance réelle entre la position du vaisseau et sa cible
            angle = ship.getAngleOf(diff),
            
            // Distance réelle entre la position du vaisseau et sa cible
            distance = diff.length(),
            
            // Approche la cible si celle-ci est trop lointaine
            d1 = ship.approach(angle, distance, ship.maxTargetDistance + ship.salt * 100 - 50),
            
            // Éloignement de la cible si celle-ci est trop proche
            d2 = ship.moveAway(angle, distance, ship.minTargetDistance + ship.salt * 100 - 50);
            
            // Applique les directions recommandées
            directions.up = d1.up || d2.up;
            directions.down = d1.down || d2.down;
            directions.right = d1.right || d2.right;
            directions.left = d1.left || d2.left;
            
            /// Gestion des tirs du vaisseau
            if (distance < ship.maxShootDistance)
                ship.shoot();
        }
        
        // Modifier la vélocité.
        ship.applyDirections(directions, t);
        
        // Met à jour le dernier tir du vaisseau
        ship.lastFire += t;
    }
});