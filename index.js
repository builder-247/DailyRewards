import axios from 'axios';
import { capitalizeFirstLetter, getGameName, getCardImage, getRarityColor } from './utils'


let id;
let cards = [];
let clickTrigger = null;
const cookies = [];

/*
* Pick cookies from headers. NOTE: this is extremely cursed
 */
function cookieParser(value) {
  const parsed = String(value);
  const string = parsed.substring(1, parsed.length - 1);
  if (string.startsWith('_')) {
    cookies.push(string)
  }
  return string;
}

function dailyRewardLink(_id) {
  setTimeout(function(){ Client.currentGui.close() } , 350) // Close the book gui after a short delay (to wait for it to show up)
  id = _id;
  const link = `https://rewards.hypixel.net/claim-reward/${id}`
  axios.get({
    url: link,
    parseHeaders: true,
    headersParser: cookieParser
  }).then(response => {
    parseHTML(response.data)
  }).catch(e => console.error(e));
}

function claimReward(option, id) {
  const link = 'https://rewards.hypixel.net/claim-reward/claim';
  const query = {
    option,
    id,
    activeAd: 0,
    _csrf: token,
    watchedFallback: false,
    skipped: 0,
  }
  axios.post(link, {
    query,
    headers: {
      'cookie': cookies.join('; ')
    },
  }).then(response => {
    console.log(JSON.stringify(response))
  })
}

function displayRewardCards(data, variables) {
  if (data.hasOwnProperty('error')) {
    print('Error: ' + data.error)
    return
  }
  data.rewards.forEach((reward, i) => {
    const amount = reward.amount;
    // Currently doesn't account for housing blocks etc.
    const name = (reward.hasOwnProperty('gameType'))
      ? (variables['type.' + reward.reward]).replace('{$game}', getGameName(reward.gameType))
      : variables['type.' + reward.reward];
    const rarity = capitalizeFirstLetter(reward.rarity);
    cards.push(new RewardCard(rarity, i, reward, amount, name))
  });
  clickTrigger = register('clicked', () => cards.forEach(card => card.handleClick()));
}

let token, data, variables, ga;

function parseHTML(html) {
  const token_regex = /window.securityToken = "([\s\S]*)";/
  const data_regex = /window.appData = '([\s\S]*)';/;
  const var_regex = /window.i18n = ([\s\S]*),        };/;
  const ga_regex = /ga\('create', '(UA-\d{6,10}-\d{1,4})', 'auto'\);/

  token = token_regex.exec(html)[1]
  data = JSON.parse(data_regex.exec(html)[1]);
  variables = JSON.parse(var_regex.exec(html)[1].concat('}').replace(/\\'/g, "'"));

  ga = 'GA-123'//ga_regex.exec(html)//[1]

  displayRewardCards(data, variables);
}

const card_height = 157;
const card_width = 110;
const card_spacing = 20;

const hoverSound = new Sound({
  source: 'hover.ogg'
});
const pickSound = new Sound({
  source: 'pick.ogg'
});

function imageFromLocalPath(file) {
  return new Image(javax.imageio.ImageIO.read(new java.io.File(`./config/ChatTriggers/modules/DailyRewardsV2/assets/${file}`)))
}

function RewardCard(rarity, index, reward, amount, string) {
  this.rarity = rarity.toLowerCase();
  this.index = index;
  this.reward = reward;
  this.amount = amount;
  this.string = string;
  this.x = ((Renderer.screen.getWidth() - card_width) / 2 - (card_width + card_spacing)) + this.index * (card_width + card_spacing);
  this.y = (Renderer.screen.getHeight() - card_height) / 2;
  this.revealed = false;
  this.cardTexture = imageFromLocalPath('card_back.png');
  this.rewardTexture = imageFromLocalPath('coins.png');
  // this.glowTexture = imageFromLocalPath(`glow_${this.rarity}.png`)
  // this.titleString = new Text(variables['rewards.title.clickToClaim'], 100, 200).setColor(0xDDBA53).setScale(3);
  this.raritySound = new Sound({
    source: String(this.rarity + '.ogg')
  });
  this.render = () => {
    // Draw glow under if revealed
    //if (this.revealed) {
    //  this.glowTexture.draw(this.x, this.y, card_width * 2.4, card_width * 2.8);
    //}
    if (this.hovered()) {
      const bigger = 10;
      this.cardTexture.draw(this.x - bigger / 2, this.y - bigger / 2, card_width + bigger, card_height + bigger);
      if (!this.revealed) {
        this.reveal();
      }
    } else {
      this.cardTexture.draw(this.x, this.y, card_width, card_height);
    }
    if (this.revealed) {
      this.rewardTexture.draw(this.x, this.y, card_width, card_height);

      const stringWidth = ((this.x + (card_width / 2)) - Renderer.getStringWidth(this.string) / 2);
      const stringHeight = (this.y + card_height * 0.7);
      Renderer.drawString(this.string, stringWidth, stringHeight);

      const amountWidth = ((this.x + (card_width / 2)) - Renderer.getStringWidth(this.amount) / 2);
      const amountHeight = (this.y + card_height * 0.85);
      Renderer.colorize(...getRarityColor(this.rarity), 255);
      Renderer.drawString(this.amount, amountWidth, amountHeight);
    }
    const renderWidth = Renderer.screen.getWidth();
    const renderHeight = Renderer.screen.getHeight();

    const dailyString = variables.currentScore + data.dailyStreak.score + '      ' + variables.highScore + data.dailyStreak.highScore;
    Renderer.drawString(dailyString, (renderWidth / 2) - (Renderer.getStringWidth(dailyString) / 2), renderHeight * 0.75);
    // this.titleString.draw();
  }
  this.hovered = function () {
    return ((Client.getMouseX() >= this.x
      && Client.getMouseX() <= (this.x + card_width))
      && (Client.getMouseY() >= this.y
      && Client.getMouseY() <= (this.y + card_height)))
  }
  this.reveal = function () {
    this.revealed = true;
    hoverSound.play();
    this.raritySound.play();
    this.cardTexture = imageFromLocalPath(`card_${this.rarity}.png`);
    this.rewardTexture = imageFromLocalPath(getCardImage(reward.reward));
  }
  this.select = function () {
    claimReward(this.index, id);
    data.dailyStreak.score += 1;
    pickSound.play();
  }
  this.handleClick = function () {
    if (this.hovered()) {
      this.select();
      clickTrigger.unregister();
      cards = cards.filter(card => card.index === this.index);
      this.x = ((Renderer.screen.getWidth() - card_width) / 2 - (card_width + card_spacing)) + (card_width + card_spacing);
      setTimeout(() => {
        cards = [];
      }, 5000);
    }
  }
}

register('renderOverlay', () => {
  cards.forEach(RewardCard => RewardCard.render());
});
register('chat', dailyRewardLink).setCriteria(/&r&bhttps:\/\/rewards\.hypixel\.net\/claim-reward\/(\w+)&r/g).setParameter('contains');
// register('command', dailyRewardLink).setCommandName('test');
