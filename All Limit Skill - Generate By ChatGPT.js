// RPG Maker MV Plugin: All Limit Skill
// ChatGPT
/*:
 * @plugindesc All Limit Skill - RPG Maker MV Plugin
 *
 * @param All Limit Icon
 * @desc The icon index used to represent the All Limit skill.
 * @default 0
 *
 * @help
 * This plugin allows you to create All Limit skills in your RPG Maker MV game.
 * All Limit skills consume a percentage of the total TP of all party members
 * except the user.
 *
 * To set up an All Limit skill, use the following notetag in the skill's note field:
 *   <AllLimit: x>
 *   - Replace 'x' with the level of the All Limit skill.
 *   - The All Limit skill level determines the TP percentage required from the party.
 *
 * Additionally, you can specify a custom TP cost for the All Limit skill by using
 * the following notetag in the skill's note field:
 *   <TP: y>
 *   - Replace 'y' with the TP cost for the All Limit skill.
 *   - If not specified, the skill will consume the default TP cost.
 *
 * Note: Make sure to set up the skill type and assign it to the appropriate actors
 * in the database.
 *
 * Plugin Commands:
 *   None
 *
 * Terms of Use:
 * - This plugin can be used in commercial and non-commercial projects.
 * - Attribution is not required, but appreciated.
 *
 * @param ---End of Help---
 * @default
 *
 */
(function() {
  // VAR All Limit Save
  var totalAllLimitTP = 0;
   // Draw All Limit window
  var _Scene_Battle_createAllWindows = Scene_Battle.prototype.createAllWindows;
  Scene_Battle.prototype.createAllWindows = function() {
    _Scene_Battle_createAllWindows.call(this);
    this.createAllLimitWindow();
  };
   // create All Limit window
  Scene_Battle.prototype.createAllLimitWindow = function() {
    this._allLimitWindow = new Window_AllLimit();
    this.addWindow(this._allLimitWindow);
  };
   // add All Limit Skill on actor skill window
  var _Scene_Battle_commandSkill = Scene_Battle.prototype.commandSkill;
  Scene_Battle.prototype.commandSkill = function() {
    _Scene_Battle_commandSkill.call(this);
    this._allLimitWindow.setActor(this._actorCommandWindow.currentExt());
  };
   // process actor use skill calculate TP cost
  var _Game_Battler_useItem = Game_Battler.prototype.useItem;
  Game_Battler.prototype.useItem = function(item) {
    _Game_Battler_useItem.call(this, item);
    this.processAllLimitTP(item);
  };
   // All Limit TP calculate
  Game_Battler.prototype.processAllLimitTP = function(item) {
    if (item.meta.AllLimit) {
      var allLimitLevel = Number(item.meta.AllLimit);
      var allLimitTPRequired = Number(item.meta.TP);
      totalAllLimitTP += allLimitTPRequired;
       // cost actor TP point logic
      var actors = this.friendsUnit().members();
      var userIndex = actors.indexOf(this);
      var tpToRemove = Math.floor(this.tp * allLimitTPRequired / totalAllLimitTP);
      this.gainTp(-tpToRemove);
       // Re-calculate
      totalAllLimitTP = actors.reduce(function(total, actor, index) {
        if (index !== userIndex) {
          return total + actor.tp;
        } else {
          return total;
        }
      }, 0);
       // update All Limit window show up
      if (this instanceof Game_Actor) {
        var actor = this;
        var allLimitPercentage = Math.floor(totalAllLimitTP / 400 * 100);
        this.setAllLimitTP(allLimitPercentage);
      }
    }
  };
   // clear TP
  var _BattleManager_startBattle = BattleManager.startBattle;
  BattleManager.startBattle = function() {
    _BattleManager_startBattle.call(this);
    totalAllLimitTP = 0;
  };
   // in actor skill window show the all limit skill
  function Window_AllLimit() {
    this.initialize.apply(this, arguments);
  }
   Window_AllLimit.prototype = Object.create(Window_Base.prototype);
  Window_AllLimit.prototype.constructor = Window_AllLimit;
   Window_AllLimit.prototype.initialize = function() {
    var x = Graphics.boxWidth - this.windowWidth();
    var y = 0;
    Window_Base.prototype.initialize.call(this, x, y, this.windowWidth(), this.windowHeight());
    this.refresh();
  };
   Window_AllLimit.prototype.windowWidth = function() {
    return 240;
  };
   Window_AllLimit.prototype.windowHeight = function() {
    return this.fittingHeight(2);
  };
   // update All Limit windows
  Window_AllLimit.prototype.refresh = function() {
    this.contents.clear();
    this.drawAllLimitIcon();
    this.drawAllLimitPercentage();
  };
   // draw All Limit iconset
  Window_AllLimit.prototype.drawAllLimitIcon = function() {
    var iconIndex = 0; // Icon number
    var x = 0;
    var y = 0;
    this.drawIcon(iconIndex, x, y);
  };
   // draw All Limit percentage
  Window_AllLimit.prototype.drawAllLimitPercentage = function() {
    var allLimitPercentage = $gameParty.allLimitPercentage();
    var text = allLimitPercentage + "%";
    var x = Window_Base._iconWidth + 4;
    var y = 0;
    var width = this.contentsWidth() - x;
    this.drawText(text, x, y, width, "right");
  };
   // get all party TP point percentage
  Game_Party.prototype.allLimitPercentage = function() {
    var allLimitPercentage = Math.floor(totalAllLimitTP / 400 * 100);
    return allLimitPercentage.clamp(0, 100);
  };
   // set actor all tp
  Game_Actor.prototype.setAllLimitTP = function(tp) {
    this._allLimitTP = tp;
  };
   // get actor all tp
  Game_Actor.prototype.allLimitTP = function() {
    return this._allLimitTP || 0;
  };
})();
