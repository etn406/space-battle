/**
 * State de jeu.
 */

gamvas.states = gamvas.states || {};

gamvas.states.ScoresState = gamvas.State.extend(
{
    // Durée minimale d'affichage (secondes)
    // Pour éviter les appuis répétés imédiatement après le Jeu
    displayDuration: 0.5,
    
    // Durée actuelle d'affichage
    timer: 0,
    
    // Liste des scores à afficher
    scores: [],
    
    /**
     * Initialisation
     */
    
    enter: function()
    {
        this.timer = 0;
        
        this.camera.setPosition(gamvas.getCanvasDimension().w / 2, gamvas.getCanvasDimension().h / 2);
        this.addActor(new gamvas.actors.Pointer('cursor', 0, 0));
        
        try {
            this.scores = JSON.parse(localStorage.scores);
        }
        catch (e) {
            this.scores = [];
        }
        
        // Tri des scores
        this.scores = this.scores.sort(function(a, b)
        {
            return b.score - a.score;
        });
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
        ctx.fillStyle = '#00FF00';
        ctx.textAlign = 'left';
        
        ctx.fillText("Highscores", width / 2 - ctx.measureText("Highscores").width / 2, 60);
        
        ctx.textAlign = 'left';
        ctx.fillStyle = 'white';
        ctx.font = '20px Visitor, monospace';
            
        var scoreX = width / 3;
        var timeX = width / 2;
        var dateX = width / 3 * 2;
        
        var addZero = function(n) {
            return (n<10 ? '0':'') + new String(n);
        }
        
        for (var i = 0 ; i < this.scores.length ; i++)
        {
            var scoreText = this.scores[i].score;
            
            ctx.fillText(scoreText, scoreX - ctx.measureText(scoreText).width / 2, 100 + i * 25);
            
            var min = Math.floor(this.scores[i].time / 60000),
                sec = Math.floor(this.scores[i].time % 60000 / 1000),
                milli = Math.floor(this.scores[i].time % 60000 % 1000);
            
            var timeText = addZero(min) + ':' + addZero(sec) + ':' + addZero(Math.round(milli / 10));
            
            ctx.fillText(timeText, timeX - ctx.measureText(timeText).width / 2, 100 + i * 25);
            
            var date = new Date(this.scores[i].date);
            var dday = Math.floor(date.getDate()),
                dmonth = Math.floor(date.getMonth() + 1),
                dhour = Math.floor(date.getHours()),
                dmin = Math.floor(date.getMinutes());
            
            var dateText = dday + '/' + addZero(dmonth) + ' ' + addZero(dhour) + ':' + addZero(dmin);
            
            ctx.fillText(dateText, dateX - ctx.measureText(dateText).width / 2, 100 + i * 25);
            
            
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
