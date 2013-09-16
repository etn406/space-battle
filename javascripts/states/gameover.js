/**
 * State de jeu.
 */

gamvas.states = gamvas.states || {};

gamvas.states.GameOverState = gamvas.State.extend(
{
    // Durée minimale d'affichage (secondes)
    // Pour éviter les appuis répétés imédiatement après le Jeu
    displayDuration: 3,
    
    // Durée actuelle d'affichage
    timer: 0,
    
    // Score affiché (Pour l'effet d'augmentation)
    currentDisplayScore: 0,
    
    // Score enregistré
    scoreSaved: false,
    
    /**
     * Initialisation
     */
    
    enter: function()
    {
        this.timer = 0;
        this.currentDisplayScore = 0;
        
        this.camera.setPosition(gamvas.getCanvasDimension().w / 2, gamvas.getCanvasDimension().h / 2);
        this.addActor(new gamvas.actors.Pointer('cursor', 0, 0));
        
        // Enregistrement du score
        if (!gamvas.vars.cheated && !this.scoreSaved)
        {
            try {
                var scores = JSON.parse(localStorage.scores);
            }
            catch (e) {
                var scores = [];
            }
            
            scores.push({
                score: gamvas.vars.score,
                date: new Date,
                time: gamvas.vars.time
            });
            
            localStorage.scores = JSON.stringify(scores);
            this.scoreSaved = true;
        }
    },
    
    /**
     * Mise à jour de l'HUD.
     * @parent State
     * @param t
     */
    
    update: function(t)
    {
        this.timer += t;
    },
    
    /**
     * Mise à jour de l'HUD.
     */
    
    draw: function(t)
    {
        var width = gamvas.getCanvasDimension().w;
        var height = gamvas.getCanvasDimension().h;
        var ctx = this.c;
        this.clearColor = 'rgb(16, 16, 16)';
        
        ctx.font = '50px Visitor, monospace';
        ctx.fillStyle = 'hsl(' + (gamvas.vars.color || 120) + ', 100%, 50%)';
        ctx.textAlign = 'left';
        
        if (this.timer > 1)
            ctx.fillText("Game Over", width / 2 - ctx.measureText("Game Over").width / 2, height / 2 - 15);
        
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'left';
        
        if (this.currentDisplayScore < gamvas.vars.score && this.timer > 2)
            this.currentDisplayScore += Math.ceil(gamvas.vars.score / 100);
        else if (this.currentDisplayScore > gamvas.vars.score)
            this.currentDisplayScore = gamvas.vars.score;
        
        var scoreText = "Score " + this.currentDisplayScore;
        
        var min = Math.floor(gamvas.vars.time / 60000),
            sec = Math.floor(gamvas.vars.time % 60000 / 1000),
            milli = Math.floor(gamvas.vars.time % 60000 % 1000);
        
        var timeText = (min<10 ? '0':'') + min + ' : ' + (sec<10 ? '0':'') + sec + ' : ' + (milli<100 ? '0':'') + (milli<10 ? '0':'') + milli;
        
        ctx.font = '30px Visitor, monospace';
        
        if (this.timer > 2)
            ctx.fillText(scoreText, width / 2 - ctx.measureText(scoreText).width / 2, height / 2 + 30);
        
        ctx.font = '20px Visitor, monospace';
        
        if (this.timer > 3)
        {
            ctx.fillText(timeText, width / 2 - ctx.measureText(timeText).width / 2, height / 2 + 70);
            
            if (this.scoreSaved)
            {
                ctx.fillStyle = 'grey';
                ctx.textAlign = 'right';
                ctx.fillText('Saved.', width - ctx.measureText('Saved.').width - 20, height - 40);
            }
        }
    },
    
    onMouseDown: function() {
        this.backToMenu();
    },
    
    onKeyDown: function() {
        this.backToMenu();
    },
    
    backToMenu: function()
    {
        if (this.timer >= this.displayDuration)
            gamvas.state.setState('menu');
    }
});
