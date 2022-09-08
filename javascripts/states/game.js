/**
 * State de jeu.
 */

gamvas.states = gamvas.states || {};

gamvas.states.GameState = gamvas.State.extend(
{
    /// Variables du jeu
    // Limites du jeu
    area: undefined,
    
    // Instant de début du jeu, pour le calcul de la durée.
    timerStart: undefined,
    
    // Niveau actuel
    level: 0,
    
    // Joueur principal
    player: undefined,
    
    // Nombre de vaisseaux créés depuis le début
    shipCounter: 0,
    
    // Types d'ennemis
    enemies: [
        gamvas.actors.BasicShip,
        gamvas.actors.BasicShip2,
        gamvas.actors.ModerateIAShip,
        gamvas.actors.KamiShip,
        gamvas.actors.HardIAShip,
    ],
    
    // Niveau de difficultée des ennemis
    enemiesLevels: [
        1,
        2,
        6,
        12,
        22,
    ],
    
    /// Variables d'affichage
    // Couleur principale du jeu
    color: undefined,
    
    // Quantité de vie précédente du joueur principal (pour l'affichage rouge)
    playerPrevHealth: 0,
    
    // Durée depuis laquelle le joueur reçut des dégâts
    damagesTimer: 0,
    
    // Afficher/masquer la vie de chaque vaisseau
    viewShipHealth: false,
    
    // Afficher/masquer les lasers
    viewLasers: false,
    
    /// Variables des actions du clavier
    // Dernière touche utilisée
    lastKey: 0,
    
    /// Variables des codes de triche
    // Nombre de codes de triches utilisés
    cheatCodesUsed: 0,
    
    // Mode Armageddon
    armageddon: false,
    
    // Mode P&L
    peaceAndLove: false,
    
    // Nom du code de triche en train d'être rentré
    currentCheatName: undefined,
    
    // Index du caractère actuel dans le code de triche entré
    currentChar: 0,
    
    
    /**
     * (Ré)initialisation du jeu.
     * @parent State
     */
    
    enter: function()
    {
        // Réinitialisation des variables globales
        gamvas.global = {
            score: 0,
            time: 0
        };
        
        // Réinitialisation des codes de triche
        this.armageddon = false;
        this.peaceAndLove = false;
        this.cheatCodesUsed = 0;
        this.currentCheatName = undefined;
        this.currentChar = 0;
        
        // Initialisation de l'arène
        if (this.actors['area'] == undefined)
        {
            this.area = new gamvas.actors.Area('area', 20, 30, gamvas.getCanvasDimension().w - 15 * 2, gamvas.getCanvasDimension().h - 30 * 2);
            this.addActor(this.area);
        }
        
        // Initialisation de la physique
        gamvas.physics.pixelsPerMeter = 64;
        gamvas.physics.resetWorld(0, 0, false);
        
        // Initialisation de la caméra
        this.camera.setPosition(this.area.x + this.area.width / 2, this.area.y + this.area.height / 2);
        
        // Réinitialisation du niveau de jeu
        this.level = 0;
        
        // Réinitialisation du chronomètre
        this.timerStart = gamvas.timer.getMilliseconds();
        
        // Couleur aléatoire
        this.color = Math.floor((Math.random() * 360));
        
        // Initialisation du joueur principal
        this.addActor(this.player = new gamvas.actors.PlayerShip('joueur principal',
                                                                 this.area.x + this.area.width / 2,
                                                                 this.area.y + this.area.height / 2,
                                                                 this.color));
        
        // Initialisation du pointeur
        if (this.actors['cursor'] == undefined)
            this.addActor(new gamvas.actors.Pointer('cursor', 0, 0));
    },
    
    /**
     * Destruction des objets
     * @parent State
     */
    
    leave: function()
    {
        // Si le joueur a utilisé un code de triche.
        gamvas.vars.cheated = this.cheatCodesUsed;
        gamvas.vars.color = this.color;
        
        // Réinitialisation de la liste des Actors
        for (var n in this.actors)
        {
            if (this.actors[n].type == 'bullet' || this.actors[n].type == 'ship' || this.actors[n].type == 'effect')
            {
                this.removeActor(this.actors[n]);
            }
        }
    },
    
    /**
     * Mise à jour
     * @parent State
     */
    
    update: function()
    {
        // Mise à jour du score global
        gamvas.vars = {
            score: this.player.score,
            time: gamvas.timer.getMilliseconds() - gamvas.state.getCurrentState().timerStart
        };
        
        // Si le joueur principal est mort, arrêt du jeu
        if (this.player.health <= 0)
        {
            var st = gamvas.state.getCurrentState();
            
            // Réinitialisation de la liste des Actors
            for (var n in st.actors)
            {
                console.log(n + ': ');
                if (st.actors[n].type == 'bullet' || st.actors[n].type == 'ship' || st.actors[n].type == 'effect')
                {
                    st.removeActor(st.actors[n]);
                    console.log('removed')
                }
            }
            
            setTimeout(function()
            {
                gamvas.state.setState('fin');
            }, 2000);
        }
        else
        {
            // Niveau suivant si il n'y a plus d'ennemis
            var enemyCounter = 0;
            for (var name in this.actors)
            {
                if (this.actors[name].type == 'ship' && this.actors[name].team != this.player.team)
                    enemyCounter++;
            }
            
            if (enemyCounter == 0)
                this.nextLevel();
        }
    },
    
    /**
     * Avancer d'un niveau.
     * @parent State
     */
    
    nextLevel: function()
    {
        this.level++;
        var levelValue = this.level;
        
        // Calcul des vaisseaux pouvant apparaître
        // Il est impératif que la difficulté d'un des vaisseaux soit de 1.
        var n = 0, ne = 0;
        
        do
        {
          n++;
          var r = Math.floor(Math.random() * this.enemies.length);
          
          if (levelValue - this.enemiesLevels[r] >= 0)
          {
            levelValue -= this.enemiesLevels[r];
            
            if (ne > 0)
              setTimeout(function() {
                var st = gamvas.state.getCurrentState();
                st.spawnEnemy(st.enemies[r]);
              }, Math.floor(Math.random() * 3000));
            else
              this.spawnEnemy(this.enemies[r]);
              
            ne++;
          }
        }
        while (levelValue > 0 && n < 1000);
        
        
        
        /* Ancien algo (croissance de la difficultée trop rapide)
        // Calcul des probabilités pour chaque type de vaisseau
        var probas = [];
        for (var t = 0 ; t < this.enemies.length ; t++)
        {
            for (var p = 0 ; p < this.enemies.length - t ; p++)
                probas.push(t);
        }
        
        for (var i = 0 ; i < this.level ; i++)
        {
            var e = probas[Math.floor(Math.random() * probas.length)];
            this.spawnEnemy(this.enemies[e]);
        }*/
    },
    
    /**
     * Mise à jour de l'HUD.
     * @parent State
     */
    
    draw: function(t)
    {
        // Dimesions du canvas
        var width = gamvas.getCanvasDimension().w;
        var height = gamvas.getCanvasDimension().h;
        
        // Contexte et couleur de remplissage
        var ctx = this.c;
        this.clearColor = 'rgb(16, 16, 16)';
        
        /// Affichage du score
        ctx.font = '20px Visitor, monospace';
        ctx.fillStyle = this.cheatCodesUsed == 0 ? 'white' : 'grey';
        ctx.textAlign = 'left';
        ctx.fillText("Score " + gamvas.vars.score, 30, 20);
        
        /// Affichage du niveau
        ctx.font = '20px Visitor, monospace';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'left';
        ctx.fillText("Level " + this.level, 30, this.area.y + this.area.height + 20);
        
        /// Affichage de la vie
        if (this.player.health != Infinity)
            var healthText = "Health " + this.player.health + "/" + this.player.maxHealth;
        else
            var healthText = "Norris Mode";
        
        this.damagesTimer -= t;
        if (this.damagesTimer < 0)
            this.damagesTimer = 0;
        
        if (this.player.health < this.playerPrevHealth)
            this.damagesTimer = 1;
        
        this.playerPrevHealth = this.player.health;
        
        // Rectangle "encadrant" l'indicateur de vie
        if (this.player.health != Infinity && this.player.health / this.player.maxHealth > 0)
        {
            var textW = ctx.measureText(healthText).width,
                rectX = width - 37 - textW + (textW + 10) * (1 - this.player.health / this.player.maxHealth),
                rectWidth = (textW + 10) * (this.player.health / this.player.maxHealth);
            
            ctx.fillStyle = 'hsla(' + this.color + ', 100%, 40%, 0.5)';
            
            ctx.fillRect(rectX - 2, 7, rectWidth + 4, 16);
            ctx.fillRect(rectX, 5, rectWidth, 20);
            
            ctx.fillStyle = 'hsla(0, 100%, 50%, ' + this.damagesTimer + ')';
            
            ctx.fillRect(rectX - 2, 7, rectWidth + 4, 16);
            ctx.fillRect(rectX, 5, rectWidth, 20);
        }
        
        // Texte indicateur de vie
        ctx.textAlign = 'right';
        ctx.fillStyle = 'white'; // Premier remplissage en blanc
        ctx.fillText(healthText, width - 30, 20);
        
        /// Affichage des objets physiques
//         gamvas.physics.drawDebug();
    },
    
    /**
     * Replace un Actor à l'intérieur de la zone de jeu.
     * @parent State
     * @param actor
     */
    
    setInArea: function(actor)
    {
        var newX = actor.position.x,
            newY = actor.position.y;
        
        if (actor.position.x > this.area.x + this.area.width)
            newX = this.area.x;
        
        else if (actor.position.x < this.area.x)
            newX = this.area.x + this.area.width;
        
        if (actor.position.y > this.area.y + this.area.height)
            newY = this.area.y;
        
        else if (actor.position.y < this.area.y)
            newY = this.area.y + this.area.height;
        
        if (actor.position.x != newX || actor.position.y != newY)
        {
            if (actor.type == 'ship')
            {
                gamvas.state.getCurrentState().addActor(
                    new gamvas.actors.DisappearanceEffect('effect ' + Math.random(), actor)
                );
                actor.opacity = 0;
            }
            else if (actor.type == 'bullet')
            {
                if (!gamvas.state.getCurrentState().armageddon)
                {
                    gamvas.state.getCurrentState().removeActor(actor.name);
                }
            }
            
            actor.setPosition(newX, newY);
        }
    },
    
    /**
     * Fait apparaître un vaisseau à un emplacement aléatoire.
     * @parent State
     * @param shipType La classe du vaisseau à faire apparaître.
     */
    
    spawnEnemy: function(shipType)
    {
        var shipPosition = {};
        
        do
        {
            shipPosition = {
                x: Math.random() * this.area.width,
                y: Math.random() * this.area.height
            };
            
            var distance = Math.sqrt(Math.pow(shipPosition.x - this.player.position.x, 2) + Math.pow(shipPosition.y - this.player.position.y, 2));
        }
        while (distance < 500 && shipPosition.x < 20 && shipPosition.y < 20 && this.area.width - shipPosition.x < 20 && this.area.height - shipPosition.y < 20);
        
        var ship = new shipType('ennemi ' + this.shipCounter,
                                 this.area.x + shipPosition.x,
                                 this.area.y + shipPosition.y,
                                 this.color - 180 + Math.round(Math.random() * 30 - 15) + (this.enemies.indexOf(shipType) - Math.ceil(this.enemies.length / 2)) * 30
                            );
        
        this.shipCounter++;
        this.addActor(ship);
    },
    
    
    /**
     * Actions lors de l'appui sur les touches
     * @parent State
     * @param key
     */
    
     onKeyDown: function (key, _character, event)
     {
        event.preventDefault()

        // Clavier
        var keyboard = gamvas.key;
        
        // Changer la couleur du vaisseau principal et de l'HUD
        if (key == keyboard.C)
        {
            this.color += 12;
            this.player.color = this.color;
        }
        
        // Activer/désactiver l'affichage de la vie des vaisseaux.
        if (key == keyboard.H) {
            this.viewShipHealth = !this.viewShipHealth;
        }
        
        // Activer/désactiver l'affichage des lasers.
        if (key == keyboard.K) {
            this.viewLasers = !this.viewLasers;
        }
        
        // Forcer le passage au niveau suivant
        if (key == keyboard.L) {
            this.nextLevel();
        }
        
        /// Gestion des codes de triche
        if (this.currentCheatName == undefined)
        {
            var results = 0;
            for (var cheatName in this.cheats)
            {
                if (keyboard[cheatName[this.currentChar]] && key == keyboard[cheatName[this.currentChar]])
                {
                    this.currentCheatName = cheatName;
                    results++;
                }
            }
            
            if (results > 0)
                this.currentChar++;
            
            if (results > 1)
                this.currentCheatName = undefined;
            else if (results == 0)
            {
                this.currentChar = 0;
                this.currentCheatName = undefined;
            }
        }
        else if (this.cheats[this.currentCheatName])
        {
            if (keyboard[this.currentCheatName[this.currentChar]]
                && key == keyboard[this.currentCheatName[this.currentChar]])
            {
                this.currentChar++;
                
                if (this.currentChar == this.currentCheatName.length)
                {
                    this.cheatCodesUsed++;
                    this.cheats[this.currentCheatName]();
                    this.currentCheatName = undefined;
                    this.currentChar = 0;
                }
            }
            else
            {
                this.currentCheatName = undefined;
                this.currentChar = 0;
            }
        }
    },
    
    /**
     * Codes de triche
     */
    
    cheats:
    {
        // Les tirs ne disparaissent pas en sortant de l'écran
        // mais réapparaissent de l'autre côté.
        ARMA: function()
        {
            var st = gamvas.state.getCurrentState();
            st.armageddon = !st.armageddon;
            console.warn('Armageddon mode : ' + (st.armageddon ? 'ON' : 'OFF'));
        },
        
        // 100% de vie
        HESOYAM: function()
        {
            var st = gamvas.state.getCurrentState();
            st.player.health = st.player.maxHealth;
            console.warn('Cheat activated.');
        },
        
        // Enlève de la vie
        AIE: function()
        {
            var st = gamvas.state.getCurrentState();
            st.player.health /= 2;
            console.warn('AIE !');
        },
        
        // Enlève de la vie
        PEACE: function()
        {
            var st = gamvas.state.getCurrentState();
            st.peaceAndLove = !st.peaceAndLove;
            console.warn('Peace&Love mode : ' + (st.peaceAndLove ? 'ON' : 'OFF'));
        },
        
        // Invincibilité
        NORRIS: function()
        {
            var st = gamvas.state.getCurrentState();
            st.player.health = (st.player.health == Infinity) ? st.player.maxHealth : Infinity;
            console.warn('Norris mode : ' + (st.player.health == Infinity ? 'ON' : 'OFF'));
        }
    }
});
