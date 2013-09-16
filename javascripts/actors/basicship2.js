/**
 * Vaisseau ennemi type 2 (IA facile)
 */

gamvas.actors = gamvas.actors || {};

gamvas.actors.BasicShip2 = gamvas.actors.BasicShip.extend(
{
    /// Variables pour le jeu
    // Santé par défaut
    health: 10,
    
    // Santé maximale par défaut
    maxHealth: 20,
    
    // Valeur du vaisseau pour le score
    scoreValue: 250,
    
    /// Variables pour l'affichage
    // Forme du vaisseau
    shape: [
        [   10,   0],
        [  -10, -10],
        [  -10, -10],
        [   -3,   0],
        [  -10,  10],
        [  -10,  10]
    ],
    
    /// Variables pour les tirs
    // Cadence de tir (s)
    fireRate: 1,
    
    // Distance minimale entre le vaisseau et sa cible pour commencer à tirer
    maxShootDistance: 400,
    
    // Prédiction de déplacement
    predict: 10,
    
    // Dommages causés par les tirs
    bulletDamages: 2,
    
    // Précision
    precision: Math.PI / 12,
    
    /// Variables pour le déplacement
    // Vélocité maximale
    maxSpeed: 2, 
    
    // Force d'accélération
    acceleration: 4,
    
    // Force de décélération
    deceleration: 2,
    
    // Distance minimale entre le vaisseau et sa cible (+-50 !!!)
    minTargetDistance: 250,
    
    // Distance maximale entre le vaisseau et sa cible (+-50 !!!)
    maxTargetDistance: 300
});