import axios from 'axios';
import { capitalizeFirstLetter, getCardImage, getRarityColor } from './utils'

const cards = [];
register("renderOverlay", () => {cards.forEach(RewardCard => RewardCard.render())});
register("chat", dailyRewardLink).setCriteria(/http:\/\/rewards.hypixel.net\/claim-reward\/(id)/);
register("chat", dailyRewardLink).setCriteria(/https:\/\/rewards.hypixel.net\/claim-reward\/(id)}/);

const cookies = [];
/*
* Pick cookies from headers. NOTE: this is extremely cursed
 */
function cookieParser(value) {
  const parsed = String(value);
  const string = parsed.substring(1, parsed.length - 1);
  // console.log('parser: ' + string)
  if (string.startsWith('_')) {
    cookies.push(string)
  }
  return string;
}

let id;
function dailyRewardLink(_id) {
    id = _id;
    const link = "https://rewards.hypixel.net/claim-reward/" + id
      axios.get({
        url: link,
        parseHeaders: true,
        headersParser: cookieParser
      }).then(response => {
        // console.log(cookies)
        // console.log(JSON.stringify(response.headers['set-cookie']))
        // console.log(response.body)
        parseHTML(response.data)
      }).catch(e => console.log(e));
}

register("command", (id) => {
  ChatLib.chat(id)
    dailyRewardLink(id)
}).setCommandName("test");

function claimReward(option, id) {
  ChatLib.chat("Claiming reward " + option)
    const link = "https://rewards.hypixel.net/claim-reward/claim?option=" + option + "&id=" + id + "&activeAd=0" + "&_csrf=" + token + "&watchedFallback=false" + "&skipped=0"
    axios.post(link, {
      headers: {
        'set-cookie': ''
      }
    })
}

function displayRewardCards(data, variables) {
    if (data.hasOwnProperty("error")) {
        print("Error: " + data.error)
        return
    }
    // ChatLib.chat(token)
    data.rewards.forEach((reward, i) => {
      ChatLib.chat("Reward " + i + ": " + JSON.stringify(reward));
      const amount = reward.amount;
      const name = (reward.hasOwnProperty("gameType"))
        ? (variables["type." + reward.reward]).replace("{$game}", capitalizeFirstLetter(reward.gameType))
        : variables["type." + reward.reward];
      const rarity = capitalizeFirstLetter(reward.rarity);
      const string = name
      cards.push(new RewardCard(rarity, i, reward, amount, string))
      ChatLib.chat("&5" + string)
    });
    ChatLib.chat(JSON.stringify(cards))
    //claimReward(2, id)
}

let token, data, variables, ga;
function parseHTML(html) {
    const token_regex = /window.securityToken = "([\s\S]*)";/
    const data_regex = /window.appData = '([\s\S]*)';/;
    const var_regex = /window.i18n = ([\s\S]*),        };/;
    const ga_regex = /ga\('create', '(UA-\d{6,10}-\d{1,4})', 'auto'\);/

    token = token_regex.exec(html)[1]
    data = JSON.parse(data_regex.exec(html)[1]);
    variables = JSON.parse(var_regex.exec(html)[1].concat("}").replace(/\\'/g, "'"));
    // console.log(JSON.stringify(variables))

    ga = 'GA-123'//ga_regex.exec(html)//[1]

    // console.log(JSON.stringify(ga))
    // ChatLib.chat("ga: " + ga)
    displayRewardCards(data, variables)
}

const card_height = 157;
const card_width = 110;
const card_spacing = 20;

const hoverSound = new Sound({
  source: "hover.ogg"
})
const pickSound = new Sound({
  source: "pick.ogg"
})

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
    this.cardTexture = imageFromLocalPath("card_back.png");
    this.rewardTexture = imageFromLocalPath("coins.png");
    this.raritySound = new Sound({
      source: String(this.rarity + ".ogg")
    });
    this.render = () => {
        if (this.hovered()) {
              const bigger = 10;
          this.cardTexture.draw(this.x - bigger / 2, this.y - bigger / 2, card_width + bigger, card_height + bigger);
          if (!this.revealed) {
              this.reveal();
          } else {

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
            Renderer.colorize(...[108, 219, 216] /*getRarityColor(this.rarity)*/);
            Renderer.drawString(this.amount, amountWidth, amountHeight);
        }
        const renderWidth = Renderer.screen.getWidth();
        const renderHeight = Renderer.screen.getHeight();

        const dailyString = variables.currentScore + data.dailyStreak.score + "      " + variables.highScore + data.dailyStreak.highScore;
        const titleString = /*variables["rewards.title.clickToClaim"]*/ "This is an example string";
        //(renderWidth / 2) - (Renderer.getStringWidth(titleString) / 2), renderHeight * 0.2
        // const renderTitleString = new Text(titleString, 100, 200).setColor(0xDDBA53).setScale(3).draw();
        Renderer.drawString(dailyString, (renderWidth / 2) - (Renderer.getStringWidth(dailyString) / 2), renderHeight * 0.75)
    }
    this.hovered = function() {
      return ((Client.getMouseX() >= this.x
      && Client.getMouseX() <= (this.x + card_width))
      && (Client.getMouseY() >= this.y
      && Client.getMouseY() <= (this.y + card_height)))
    }
    this.reveal = function() {
        this.revealed = true;
        hoverSound.play();
        this.raritySound.play();
        this.cardTexture = imageFromLocalPath("card_" + this.rarity + ".png");
        this.rewardTexture = imageFromLocalPath(getCardImage(reward.reward));
    }
    this.select = function() {
      //claimReward(this.index, id);
      variables.currentScore += 1;
      pickSound.play();
    }
}
