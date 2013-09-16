/**
 * Vaisseau ennemi (IA facile)
 */

gamvas.actors = gamvas.actors || {};

gamvas.actors.ModerateIAShip = gamvas.actors.BasicShip.extend(
{
    /// Variables pour le jeu
    // Équipe par défaut
    team: 2,
    
    // Santé par défaut
    health: 40,
    
    // Santé maximale par défaut
    maxHealth: 40,
    
    // Valeur du vaisseau pour le score
    scoreValue: 150,
    
    /// Variables pour l'affichage
    // Forme du vaisseau
    shape: [
        [   12,   0],
        [   -3, -10],
        [   -12,  0],
        [   -3,  10]
    ],
    
    /// Variables pour les tirs
    // Cadence de tir (s)
    fireRate: 0.5,
    
    // Distance minimale entre le vaisseau et sa cible pour commencer à tirer
    maxShootDistance: 350,
    
    // Prédiction de déplacement
    predict: 12,
    
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
    minTargetDistance: 100,
    
    // Distance maximale entre le vaisseau et sa cible (+-50 !!!)
    maxTargetDistance: 250
});