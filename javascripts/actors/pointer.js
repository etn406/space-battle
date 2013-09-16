/**
 * Pointeur cuseur
 */

gamvas.actors = gamvas.actors || {};

gamvas.actors.Pointer = gamvas.Actor.extend(
{
    // Constructeur
    create: function(name, x, y)
    {
        this._super(name, x, y);
        
        // ActorState par défaut
        var defState = this.getCurrentState();
        defState.update = this.defaultStateUpdate;
        defState.draw = this.defaultStateDraw;
    },
    
    // Mise à jour pour l'ActorState par défaut
    defaultStateUpdate: function(t)
    {
        var actor = this.actor;
        actor.setPosition(gamvas.mouse.getX(), gamvas.mouse.getY());
    },
    
    // Affichage pour l'ActorState par défaut
    defaultStateDraw: function(t)
    {
        var actor = this.actor,
            ctx = gamvas.getContext2D();
        
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        
        if (gamvas.state.getCurrentState().color)
            ctx.strokeStyle = 'hsl(' + gamvas.state.getCurrentState().color + ', 100%, 50%)';
        else
            ctx.strokeStyle = 'white';
        
        ctx.beginPath();
        
        ctx.moveTo(actor.position.x - 12, actor.position.y)
        ctx.lineTo(actor.position.x -  6, actor.position.y);
        
        ctx.moveTo(actor.position.x + 12, actor.position.y)
        ctx.lineTo(actor.position.x +  6, actor.position.y);
        
        ctx.moveTo(actor.position.x, actor.position.y -  6)
        ctx.lineTo(actor.position.x, actor.position.y - 12);
        
        ctx.moveTo(actor.position.x, actor.position.y +  6)
        ctx.lineTo(actor.position.x, actor.position.y + 12);
        
        ctx.stroke();
    }
});
