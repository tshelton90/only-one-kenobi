//Global variables
$(document).ready(function() {
    
    //Array of Playable Characters
    let characters = {
        'rey': {
            name: 'rey',
            health: 125,
            attack: 8,
            imageUrl: "assets/images/rey.jpg",
            enemyAttackBack: 15
        }, 
        'luke': {
            name: 'luke',
            health: 100,
            attack: 14,
            imageUrl: "assets/images/luke.jpg",
            enemyAttackBack: 10
        }, 
        'kylo': {
            name: 'kylo',
            health: 150,
            attack: 12,
            imageUrl: "assets/images/kylo.jpeg",
            enemyAttackBack: 18
        }, 
        'darth': {
            name: 'darth',
            health: 200,
            attack: 16,
            imageUrl: "assets/images/darth.jpeg",
            enemyAttackBack: 20
        }
    };
    
    var activeChar;
    var currDefender;
    var combatants = [];
    var indexofSelChar;
    var attackResult;
    var turnCounter = 1;
    var killCount = 0;
    

    var renderOne = function(character, renderArea, makeChar) {
        //character: obj, renderArea: class/id, makeChar: string
        var charDiv = $("<div class='character' data-name='" + character.name + "'>");
        var charName = $("<div class='character-name'>").text(character.name);
        var charImage = $("<img alt='image' class='character-image'>").attr("src", character.imageUrl);
        var charHealth = $("<div class='character-health'>").text(character.health);
        charDiv.append(charName).append(charImage).append(charHealth);
        $(renderArea).append(charDiv);

        // render enemies and defender depending on selections from the user
        if (makeChar == 'enemy') {
          $(charDiv).addClass('enemy');
        } else if (makeChar == 'defender') {
          currDefender = character;
          $(charDiv).addClass('target-enemy');
        }
      };
    
      // Create function to render game message to DOM
      var renderMessage = function(message) {
        var gameMesageSet = $("#gameMessage");
        var newMessage = $("<div>").text(message);
        gameMesageSet.append(newMessage);
    
        if (message == 'clearMessage') {
          gameMesageSet.text('');
        }
      };
    
      var renderCharacters = function(charObj, areaRender) {
        //render all characters
        if (areaRender == '#characters-section') {
          $(areaRender).empty();
          for (var key in charObj) {
            if (charObj.hasOwnProperty(key)) {
              renderOne(charObj[key], areaRender, '');
            }
          }
        }
        //render player character
        if (areaRender == '#selected-character') {
          $('#selected-character').prepend("Your Character");       
          renderOne(charObj, areaRender, '');
          $('#attack-button').css('visibility', 'visible');
        }
        //render combatants
        if (areaRender == '#available-to-attack-section') {
            $('#available-to-attack-section').prepend("Choose Your Next Opponent");      
          for (var i = 0; i < charObj.length; i++) {
    
            renderOne(charObj[i], areaRender, 'enemy');
          }
          //render one enemy to defender area
          $(document).on('click', '.enemy', function() {
            //select an combatant to fight
            name = ($(this).data('name'));
            //if defernder area is empty
            if ($('#defender').children().length === 0) {
              renderCharacters(name, '#defender');
              $(this).hide();
              renderMessage("clearMessage");
            }
          });
        }
        //render defender
        if (areaRender == '#defender') {
          $(areaRender).empty();
          for (var i = 0; i < combatants.length; i++) {
            //add enemy to defender area
            if (combatants[i].name == charObj) {
              $('#defender').append("Your selected opponent")
              renderOne(combatants[i], areaRender, 'defender');
            }
          }
        }
        //re-render defender when attacked
        if (areaRender == 'playerDamage') {
          $('#defender').empty();
          $('#defender').append("Your selected opponent")
          renderOne(charObj, '#defender', 'defender');
        }
        //re-render player character when attacked
        if (areaRender == 'enemyDamage') {
          $('#selected-character').empty();
          renderOne(charObj, '#selected-character', '');
        }
        //render defeated enemy
        if (areaRender == 'enemyDefeated') {
          $('#defender').empty();
          var gameStateMessage = "You have defated " + charObj.name + ", you can choose to fight another enemy.";
          renderMessage(gameStateMessage);
        }
      };
      //this is to render all characters for user to choose their computer
      renderCharacters(characters, '#characters-section');
      $(document).on('click', '.character', function() {
        name = $(this).data('name');
        //if no player char has been selected
        if (!activeChar) {
          activeChar = characters[name];
          for (var key in characters) {
            if (key != name) {
              combatants.push(characters[key]);
            }
          }
          $("#characters-section").hide();
          renderCharacters(activeChar, '#selected-character');
          //this is to render all characters for user to choose fight against
          renderCharacters(combatants, '#available-to-attack-section');
        }
      });
    
      // ----------------------------------------------------------------
      // Create functions to enable actions between objects.
      $("#attack-button").on("click", function() {
        //if defernder area has enemy
        if ($('#defender').children().length !== 0) {
          //defender state change
          var attackMessage = "You attacked " + currDefender.name + " for " + (activeChar.attack * turnCounter) + " damage.";
          renderMessage("clearMessage");
          //combat
          currDefender.health = currDefender.health - (activeChar.attack * turnCounter);
    
          //win condition
          if (currDefender.health > 0) {
            //enemy not dead keep playing
            renderCharacters(currDefender, 'playerDamage');
            //player state change
            var counterAttackMessage = currDefender.name + " attacked you back for " + currDefender.enemyAttackBack + " damage.";
            renderMessage(attackMessage);
            renderMessage(counterAttackMessage);
    
            activeChar.health = activeChar.health - currDefender.enemyAttackBack;
            renderCharacters(activeChar, 'enemyDamage');
            if (activeChar.health <= 0) {
              renderMessage("clearMessage");
              restartGame("You have been defeated...GAME OVER!!!");
              $("#attack-button").unbind("click");
            }
          } else {
            renderCharacters(currDefender, 'enemyDefeated');
            killCount++;
            if (killCount >= 3) {
              renderMessage("clearMessage");
              restartGame("Congratulations, success you have found. GAME OVER!!!");
            }
          }
          turnCounter++;
        } else {
          renderMessage("clearMessage");
          renderMessage("These are not the droids you are looking for.");
        }
      });
    
    //Restarts the game - renders a reset button
      var restartGame = function(inputEndGame) {
        //When 'Restart' button is clicked, reload the page.
        var restart = $('<button class="btn">Restart</button>').click(function() {
          location.reload();
        });
        var gameState = $("<div>").text(inputEndGame);
        $("#gameMessage").append(gameState);
        $("#gameMessage").append(restart);
      };
    
   



// //function of the game
// //allow for a player selection and on that selection make that character the attacker
// // once the attacker is selected move the players to the defender selction segment

// //This adds the function so that when the button is clicked we have a text box
// //appear that shows what is happening in the game.


// $('.col-md-3').click(function(){
//     $('.col-md-3').empty();
//     var attacker = $(this).attr('id');
//     attacker=attacker.toString();
//     var img = $('<img class="attacker" style="width:100%;">');
//     img.attr('src' , attacker.imgUrl);
//     $('.character-1').html(img)
//     console.log(characters.name)
// }); 


// $(function() {
//     $('.col-md-3').on('click', function(e) {
//         e.preventDefault();
//         $('<div/>').addClass( 'new-text-div' )
//         .html( $('<input type="textbox"/>').addClass( 'attack-message' ) )
//         .append( $('<button/>').addClass( 'attack' ).text( 'ATTACK' ) )
//         .insertBefore( this );
//     });
//     $(document).on('click', 'button.remove', function( e ) {
//         e.preventDefault();
//         $(this).closest( 'div.new-text-div' ).remove();
//     });
// });



















//this is the closing of the overall function of the page... always bottom

});