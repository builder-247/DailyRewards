function capitalizeFirstLetter(i) {
  const string = i.toLowerCase();
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// This data would require parsing app.js - screw that
function getGameName(type) {
  const typeToClean = {
    WALLS3: 'Mega Walls',
    SURVIVAL_GAMES: 'Blitz SG',
    TNTGAMES: 'TNT Games',
    ARCADE: 'Arcade',
    UHC: 'UHC',
    MCGO: 'Cops and Crims',
    BATTLEGROUND: 'Warlords',
    SUPER_SMASH: 'Smash Heroes',
    SKYWARS: 'SkyWars',
    BEDWARS: 'Bed Wars',
    BUILD_BATTLE: 'Build Battle',
    MURDER_MYSTERY: 'Murder Mystery',
    DUELS: 'Duels',
    LEGACY: 'Classic'
  };
  return typeToClean[type] || capitalizeFirstLetter(type);
}

function getCardImage(reward) {
  switch (reward) {
    default:
      return 'chest_open.png'
    case 'coins':
    case 'dust':
    case 'souls':
    case 'experience':
    case 'mystery_box':
    case 'adsense_token':
      return reward + '.png'
  }
}

function getRarityColor(rarity) {
  switch (rarity) {
    default:
    case 'common':
      return [221, 186, 83];
    case 'rare':
      return [108, 219, 216];
    case 'epic':
      return [181, 46, 212];
    case 'legendary':
      return [224, 181, 81];
  }
}

module.exports = {
  capitalizeFirstLetter,
  getGameName,
  getCardImage,
  getRarityColor
}
