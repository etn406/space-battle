/**
 * Menu principal.
 */

gamvas.states = gamvas.states || {};

gamvas.states.MenuState = gamvas.State.extend(
{
    // Durée minimale d'affichage (secondes)
    // Pour éviter les appuis répétés imédiatement après le Game Over
    displayDuration: 1,
    
    // Durée actuelle d'affichage
    currentDisplayDuration: 0,
    
    /// Variables d'affichage
    // Titre affiché
    title: "Invaders Invasion",
    
    // Sous-titre
    subtitle: "Press any key",
    
    // Clignotement du sous-titre
    currentSubtitleAlpha: 0,
    
    // Durée du clignotement du sous-titre
    blinkDuration: 1,
    
    /**
     * Initialisation.
     * @parent State
     */
    
    enter: function()
    {
        this.currentDisplayDuration = 0;
        this.camera.setPosition(gamvas.getCanvasDimension().w / 2, gamvas.getCanvasDimension().h / 2);
        this.addActor(new gamvas.actors.Pointer('cursor', 0, 0));
    },
    
    /**
     * Mise à jour de l'HUD.
     * @parent State
     * @param t
     */
    
    update: function(t)
    {
        this.currentDisplayDuration += t;
        
        if (localStorage.autoplay == true)
            this.startGame();
    },
    
    /**
     * Mise à jour de l'HUD.
     * @parent State
     * @param t
     */
    
    draw: function(t)
    {
        var width = gamvas.getCanvasDimension().w;
        var height = gamvas.getCanvasDimension().h;
        var ctx = this.c;
        this.clearColor = 'rgb(16, 16, 16)';
        
        ctx.save();
        
        // Titre
        ctx.font = '50px Visitor, monospace';
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = '#fff';
        ctx.lineCap = 'round';
        ctx.lineWidth = 4;
        ctx.textAlign = 'center';
        
        ctx.fillText(this.title, width / 2, height / 2 - height / 10);
        
        ctx.beginPath();
        ctx.moveTo(width / 4, height / 2 - height / 10 + 10);
        ctx.lineTo(width - width / 4, height / 2 - height / 10 + 10);
        ctx.stroke();
        
        // Message clignotant
        this.currentSubtitleAlpha += t / this.blinkDuration;
        
        if (this.currentSubtitleAlpha > 1 || this.currentSubtitleAlpha < 0)
        {
            this.blinkDuration = - this.blinkDuration;
            this.currentSubtitleAlpha = Math.round(this.currentSubtitleAlpha);
        }
        
        ctx.font = '20px Visitor, monospace';
        ctx.fillStyle = 'rgba(255, 255, 255, ' + this.currentSubtitleAlpha + ')';
        ctx.textAlign = 'center';
        
        ctx.fillText(this.subtitle, width / 2, height / 2 + height / 10);
        
        ctx.restore();
    },
    
    /**
     * Clic de la souris.
     * @parent State
     */
    
    onMouseDown: function() {
        //this.startGame();
    },
    
    /**
     * Appui sur une touche.
     * @parent State
     * @param key
     */
    
    onKeyDown: function(key)
    {
        if (key == gamvas.key.H)
            this.viewHighscores();
        else
            this.startGame();
    },
    
    /**
     * Lancer le jeu.
     * @parent State
     */
    
    startGame: function()
    {
        if (this.currentDisplayDuration >= this.displayDuration)
            gamvas.state.setState('jeu');
    },
    
    /**
     * Afficher les highscores.
     * @parent State
     */
    
    viewHighscores: function()
    {
        gamvas.state.setState('scores');
    }
});
