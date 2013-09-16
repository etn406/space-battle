/**
 * Mur solide
 */

gamvas.actors = gamvas.actors || {};

gamvas.actors.Wall = gamvas.Actor.extend(
{
    width: undefined,
    height: undefined,
    color: 'rgb(48, 48, 48)',
    type: 'wall',
    
    // Constructeur
    create: function(name, x, y, width, height)
    {
        this._super(name, x, y);
        
        // Hauteur et largeur (optionnels)
        this.width = width || 20;
        this.height = height || 20;
        
        // ActorState par défaut
        this.getCurrentState().draw = this.defaultState_draw;
        
        // Physique du mur
        this.bodyRect(this.position.x, this.position.y, this.width, this.height, gamvas.physics.STATIC);
    },
    
    // Mise à jour pour l'ActorState par défaut
    defaultState_draw: function(t)
    {
        var wall = this.actor,
            ctx = gamvas.getContext2D();
        
        ctx.fillStyle = wall.color;
        ctx.fillRect(wall.position.x - wall.width / 2, wall.position.y - wall.height / 2, wall.width, wall.height);
    }
});