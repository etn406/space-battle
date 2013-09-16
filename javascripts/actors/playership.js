/**
 * Vaisseau du joueur (sans IA)
 */

gamvas.actors = gamvas.actors || {};

gamvas.actors.PlayerShip = gamvas.actors.Ship.extend(
{
    /// Variables pour le jeu
    // Équipe par défaut
    team: 1,
    
    // Dommages causés par les balles
    bulletDamages: 10,
    
    /// Variables d'affichage
    // Affichage d'un laser
    laser: false,
    
    /// Variables pour les tirs
    // Précision
    precision: Math.PI / 50,
    
    /// Variables d'affichage
    // Vitesse
    maxSpeed: 4.5,
    
    // Remplir de couleur
    fill: true,
    
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
            up: gamvas.key.isPressed(gamvas.key.Z),
            down: gamvas.key.isPressed(gamvas.key.S),
            right: gamvas.key.isPressed(gamvas.key.D),
            left: gamvas.key.isPressed(gamvas.key.Q)
        },
        
        // Cible
        target = {
            x: gamvas.mouse.getX(),
            y: gamvas.mouse.getY()
        };
        
        // Remise du vaisseau dans l'arène si celui-ci est sortit
        gamvas.state.getCurrentState().setInArea(ship);
        
        // Rotation vers la cible.
        ship.turnTo(target);
        
        // Modifier la vélocité.
        ship.applyDirections(directions, t);
        
        // Met à jour le dernier tir du vaisseau
        ship.lastFire += t;
        
        if (gamvas.mouse.isPressed(gamvas.mouse.LEFT))
            ship.shoot();
    }
});