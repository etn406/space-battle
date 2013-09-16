
/**
 * Lancement du jeu
 */

gamvas.event.addOnLoad(function()
{
  gamvas.canvas
  
  gamvas.state.addState(new gamvas.states.MenuState('menu'));
  gamvas.state.addState(new gamvas.states.ScoresState('scores'));
  gamvas.state.addState(new gamvas.states.GameState('jeu'));
  gamvas.state.addState(new gamvas.states.GameOverState('fin'));
  
  gamvas.start('gameCanvas', true, false);
});

