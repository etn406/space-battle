/**
 * Effet de disparition
 */

gamvas.actors = gamvas.actors || {};

gamvas.actors.DisappearanceEffect = gamvas.Actor.extend(
{
    actor: undefined, // Actor créateur de l'effet
    duration: 0.4, // (secondes)
    maxSize: 20,
    currentDuration: 0,
    
    // Constructeur
    create: function(name, actor)
    {
        this._super(name, actor.position.x, actor.position.y);
        this.actor = actor;
        
        this.getCurrentState().draw = this.defaultState_draw;
        this.getCurrentState().update = this.defaultState_update;
    },
    
        // Affichage pour l'ActorState par défaut
    defaultState_update: function(t)
    {
        var fx = this.actor;
        
        fx.currentDuration += t;
        
        if (fx.currentDuration > fx.duration)
        {
            fx.currentDuration = fx.duration;
            gamvas.state.getCurrentState().removeActor(fx.name);
        }
    },
    
        // Affichage pour l'ActorState par défaut
    defaultState_draw: function(t)
    {
        var fx = this.actor,
            ctx = gamvas.getContext2D(),
            color = fx.actor.color || 'white';
        
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = 'hsla(' + color + ', 100%, 50%, ' + (1 - fx.currentDuration / fx.duration) + ')';
        
        ctx.beginPath();
        ctx.arc(fx.position.x, fx.position.y, fx.currentDuration / fx.duration * fx.maxSize, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.fillStyle = 'hsla(' + color + ', 100%, 50%, ' + (1 - fx.currentDuration / fx.duration) + ')';
        
        ctx.beginPath();
        ctx.arc(fx.position.x, fx.position.y, fx.maxSize - (fx.maxSize / 2) - fx.currentDuration / fx.duration * (fx.maxSize - (fx.maxSize / 2)), 0, Math.PI * 2);
        ctx.fill();
    }
});