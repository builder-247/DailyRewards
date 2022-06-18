function p(msg) {
    print("[DailyRewards] " + msg)
}

function capitalizeFirstLetter(i) {
    var string = i.toLowerCase();
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function getGameName() {

}

function getCardImage(reward) {
  switch(reward) {
    default:
      return "chest_open.png"
    case "coins":
    case "dust":
    case "souls":
    case "experience":
    case "mystery_box":
    case "adsense_token":
      return reward + ".png"
  }
}

function getRarityColor(rarity) {
  switch (rarity) {
    default:
    case "common":
      return [221, 186, 83]
      return 0xDDBA53;
    case "rare":
      return [108, 219, 216]
      return 0x6CDBD8;
    case "epic":
      // Placeholder
      return 0x2A002A;
    case "legendary":
      // Placeholder
      return 0x2A2A00;
  }
}

module.exports = {
  capitalizeFirstLetter,
  getCardImage,
  getRarityColor
}
