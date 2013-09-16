/**
 * Effet de disparition
 */

gamvas.actors = gamvas.actors || {};

gamvas.actors.Explosion = gamvas.Actor.extend(
{
    // Couleur de l'explosion
    color: 0,
    
    // Rayon de l'explosion
    radius: 30,
    
    // Durée de l'explosion (s)
    duration: 0.80,
    
    // Instant actuel de l'explosion
    currentDuration: 0,
    
    
    /**
     * Constructeur.
     * @parent Actor
     * @param x
     * @param y
     * @param color angle en degrés
     * @param radius rayon en pixels
     * @param duration en secondes
     */
    
    create: function(x, y, color, radius, duration, dangerous, damages)
    {
        this._super('explosion ' + Math.random(), x, y);
        
        // Couleur, taille et durée de l'explosion
        this.color = color || 120;
        this.radius = radius || 30;
        this.duration = duration || 0.5;
        
        if (dangerous)
        {
            var st = gamvas.state.getCurrentState();
            damages = damages || 15;
            
            for (var n in st.actors)
            {
                if (st.actors[n].position && st.actors[n].health > 0)
                {
                    var len = (new gamvas.Vector2D(st.actors[n].position.x - x, st.actors[n].position.y - y)).length();
                    
                    if (len <= radius)
                        st.actors[n].loseHealth(Math.ceil(damages * (1 - len / radius)));
                }
            }
        }
    },
    
    /**
     * Mise à jour de l'affichage.
     * @parent Actor
     * @param t
     */
    
    draw: function(t)
    {
        this.currentDuration += t;
        
        if (this.currentDuration / this.duration > 1)
        {
            this.currentDuration = this.duration;
            gamvas.state.getCurrentState().removeActor(this.name);
            return;
        }
        
        var ctx = gamvas.getContext2D(),
        r = this.currentDuration / this.duration;
        
        if (this.currentDuration / this.duration > 1)
            r = 1;
        
        ctx.lineWidth = this.radius / 10 * (1 - r);
        ctx.strokeStyle = 'hsla(' + this.color + ', 100%, 50%, ' + (1 - r) + ')';
        
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, r * this.radius, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.fillStyle = 'hsla(' + this.color + ', 100%, 50%, ' + (1 - r) + ')';
        
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius - this.radius / 2 - r * (this.radius - this.radius / 2), 0, Math.PI * 2);
        ctx.fill();
    }
});