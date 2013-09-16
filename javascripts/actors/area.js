/**
 * Zone de jeu
 */

gamvas.actors = gamvas.actors || {};

gamvas.actors.Area = gamvas.Actor.extend(
{
    // Couleur actuelle de l'alerte (clignotement rouge-jaune)
    alertColor: 0,
    
    // Incrémentation de l'alerte
    alertI: 2,
    
    /**
     * Constructeur
     * @parent Actor
     * @param name
     * @param x
     * @param y
     * @param width
     * @param height
     */
    
    create: function(name, x, y, width, height)
    {
        this._super(name, x - width / 2, y - height / 2);
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    },
    
    
    /**
     * Mise à jour de l'affichage.
     * @parent Actor
     * @param t
     */
    
    draw: function(t)
    {
        var ctx = gamvas.getContext2D(),
        st = gamvas.state.getCurrentState();
        
        if (!st.armageddon)
            ctx.strokeStyle = 'hsla(' + (st.color || 120) + ', 100%, 50%, 0.5)';
        else
        {
            ctx.strokeStyle = 'hsla(' + this.alertColor + ', 100%, 50%, 1)';
            
            this.alertColor += this.alertI;
            if (this.alertColor >= 60 || this.alertColor <= 0)
                this.alertI = -this.alertI;
        }
        
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        ctx.moveTo(this.x + 2, this.y);
        ctx.lineTo(this.x + this.width - 2, this.y);
        
        ctx.moveTo(this.x + this.width, this.y + 2);
        ctx.lineTo(this.x + this.width, this.y + this.height - 2);
        
        ctx.moveTo(this.x + 2, this.y + this.height);
        ctx.lineTo(this.x + this.width - 2, this.y + this.height);
        
        ctx.moveTo(this.x, this.y + 2);
        ctx.lineTo(this.x, this.y + this.height - 2);
        
        ctx.stroke();
    }
});