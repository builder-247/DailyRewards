var cards = [];
register("renderOverlay", function() {cards.forEach(function(RewardCard) {RewardCard.render();})})
register("chat", dailyRewardLink).setChatCriteria("&r&bhttp://rewards.hypixel.net/claim-reward/${id}&r\n&r").setParameter("contains");

function p(msg) {
    print("[DailyRewards] " + msg)
}

var id;
function dailyRewardLink(_id) {
    id = _id;
    var link = "https://rewards.hypixel.net/claim-reward/" + id
      HTTP(link, "GET");
}

register("command", function(id) {
  ChatLib.chat(id)
    dailyRewardLink(id)
}).setName("test");

function claimReward(option, id) {
    var link = "https://rewards.hypixel.net/claim-reward/claim?option=" + option + "&id=" + id + "&activeAd=0" + "&_csrf=" + token + "&watchedFallback=false" + "&skipped=0"
    HTTP(link, "POST")
}

function capitalizeFirstLetter(i) {
    var string = i.toLowerCase();
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function getGameName() {

}

function displayRewardCards(data, variables) {
    if (data.hasOwnProperty("error")) {
        p("Error: " + data.error)
        return
    }
    ChatLib.chat(token)
    for (i = 0; i < data.rewards.length; i++) {
      var reward = data.rewards[i];
      //ChatLib.chat("Reward " + i + ": " + JSON.stringify(reward));
      var amount = reward.amount;
      var name = (reward.hasOwnProperty("gameType"))
          ? (variables["type." + reward.reward]).replace("{$game}", capitalizeFirstLetter(reward.gameType))
          : variables["type." + reward.reward];
      var rarity = capitalizeFirstLetter(reward.rarity);
        cards.push(new RewardCard(rarity, i))
        ChatLib.chat("&5" + amount + " "  + name + " " + rarity)
    }
    ChatLib.chat(JSON.stringify(cards))
    //claimReward(0, id)
}

var token, data, variables, ga;
function parseHTML(html) {
    var token_regex = /window.securityToken = "([\s\S]*)";/
    var data_regex = /window.appData = '([\s\S]*)';/;
    var var_regex = /window.i18n = ([\s\S]*),        };/;
    var ga_regex = /ga\('create', '(UA-\d{6,10}-\d{1,4})', 'auto'\);/

    token = token_regex.exec(html)[1]
    data = JSON.parse(data_regex.exec(html)[1]);
    variables = JSON.parse(var_regex.exec(html)[1].concat("}").replace(/\\'/g, "'"));
    ga = ga_regex.exec(html)[2]

    ChatLib.chat("ga: " + ga)
    displayRewardCards(data, variables)
}

var card_height = 157;
var card_width = 110;
var card_spacing = 25;
function RewardCard(rarity, index) {
    this.rarity = rarity.toLowerCase();
    this.index = index;
    this.x = ((Renderer.screen.getWidth() - card_width) / 2 - (card_width + card_spacing)) + this.index * (card_width + card_spacing);
    this.y = (Renderer.screen.getHeight() - card_height) / 2;
    this.revealed = false;
    this.texture = Image.load("./config/ChatTriggers/modules/DailyRewards/assets/images/card_back.png");

    this.render = function() {
        if (this.hovered()) {
              var bigger = 10;
              Renderer.drawImage(this.texture, this.x - bigger / 2, this.y - bigger / 2, card_width + bigger, card_height + bigger);
          if (!this.revealed) {
              this.reveal()
          }
        } else {
            Renderer.drawImage(this.texture, this.x, this.y, card_width, card_height);
        }
        var renderWidth = Renderer.screen.getWidth();
        var renderHeight = Renderer.screen.getHeight();

        var dailyString = variables.currentScore + data.dailyStreak.score + "      " + variables.highScore + data.dailyStreak.highScore;
        var titleString = /*variables["rewards.title.clickToClaim"]*/ "This is an example string";
        //(renderWidth / 2) - (Renderer.getStringWidth(titleString) / 2), renderHeight * 0.2
        var renderTitleString = Renderer.text(titleString, 100, 200).setColor(0xDDBA53).setScale(3).draw();
        Renderer.drawString(dailyString, (renderWidth / 2) - (Renderer.getStringWidth(dailyString) / 2), renderHeight * 0.75)
    }
    this.hovered = function() {
      if ((Client.getMouseX() >= this.x && Client.getMouseX() <= (this.x + card_width))
      && (Client.getMouseY() >= this.y && Client.getMouseY() <= (this.y + card_height))) {
          return true;
      }
      return false;
    }
    this.reveal = function() {
        this.revealed = true;
        World.playSound("./config/ChatTriggers/modules/DailyRewards/assets/sounds/pick.ogg", 1, 1)
        this.texture = Image.load("./config/ChatTriggers/modules/DailyRewards/assets/images/card_" + this.rarity + ".png");
    }
}
