import { Innertube, UniversalCache } from 'youtubei.js';
import { LiveChatContinuation } from 'youtubei.js/dist/src/parser';

import LiveChat, { ChatAction, LiveMetadata } from 'youtubei.js/dist/src/parser/youtube/LiveChat';

import Video from 'youtubei.js/dist/src/parser/classes/Video';
import AddChatItemAction from 'youtubei.js/dist/src/parser/classes/livechat/AddChatItemAction';
import MarkChatItemAsDeletedAction from 'youtubei.js/dist/src/parser/classes/livechat/MarkChatItemAsDeletedAction';

import LiveChatTextMessage from 'youtubei.js/dist/src/parser/classes/livechat/items/LiveChatTextMessage';
import LiveChatPaidMessage from 'youtubei.js/dist/src/parser/classes/livechat/items/LiveChatPaidMessage';
import { Key, keyboard } from '@nut-tree/nut-js';
const robot = require("robotjs");
const prompt = require("prompt-sync")({ sigint: true });

console.log("\nWelcome to YoutubePlays, by XLuma!\n");
const liveId = prompt("Enter a livestream video id (hint: you can get it from the url, after the 'watch?'");

keyboard.config.autoDelayMs = 0;
function randomIntFromInterval(min, max) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min)
}

(async () => {
  const yt = await Innertube.create({ cache: new UniversalCache() });
  
  const info = await yt.getInfo(liveId);

  const livechat = await info.getLiveChat();
  
  livechat.on('start', (initial_data: LiveChatContinuation) => {
    /**
     * Initial info is what you see when you first open a Live Chat — this is; inital actions (pinned messages, top donations..), account's info and so on.
     */
     
    console.info(`Hey ${initial_data.viewer_name || 'N/A'}, welcome to Live Chat!`);
    
  });
  
  livechat.on('chat-update', (action: ChatAction) => {
    /**
     * An action represents what is being added to
     * the live chat. All actions have a `type` property,
     * including their item (if the action has an item).
     *
     * Below are a few examples of how this can be used.
     */

    if (action.is(AddChatItemAction)) {
      const item = action.as(AddChatItemAction).item;
   
      if (!item)
        return console.info('Action did not have an item.', action);
      
      const hours = new Date(item.hasKey('timestamp') ? item.timestamp : Date.now()).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
      
      switch (item.type) {
        case 'LiveChatTextMessage':
          console.info(
            `${hours} - ${item.as(LiveChatTextMessage).author?.name.toString()}:\n` +
            `${item.as(LiveChatTextMessage).message.toString()}\n`
          );
          var text = item.as(LiveChatTextMessage).message.toString();
          switch (text){
            case "up":
              //keyboard.pressKey(Key.Up);
              robot.keyTap("up");
              break;
            case "down":
              robot.keyTap("down");
              break;
            case "left":
              robot.keyTap("left");
              break;
            case "right":
              robot.keyTap("right");
              break;
            case "a":
              robot.keyTap("a");
              break;
            case "b":
              robot.keyTap("b");
              break;
            case "start":
              if (randomIntFromInterval(1, 25) == 10) //inspired from twitch plays program doug made for alpharad to prevent stupid trolling. comment this line to disable
                robot.keyTap("s");
              break;
            case "select":
              robot.keyTap("x");
              break;
            case "RS":
              robot.keyTap("r");
              break;
            case "LS":
              robot.keyTap("l");
              break;
            default:
              break;
          }
          break;
        case 'LiveChatPaidMessage':
          console.info(
            `${hours} - ${item.as(LiveChatPaidMessage).author.name.toString()}:\n` +
            `${item.as(LiveChatPaidMessage).purchase_amount}\n`
          );
          break;
        default:
          console.debug(action);
          break;
      }
    }
      
    if (action.is(MarkChatItemAsDeletedAction)) {
      console.warn(`Message ${action.target_item_id} just got deleted and should be replaced with ${action.deleted_state_message.toString()}!`, '\n');
    }
  });

  /*
  livechat.on('metadata-update', (metadata: LiveMetadata) => {
    console.info(`
      VIEWS: ${metadata.views?.view_count.toString()}
      LIKES: ${metadata.likes?.default_text}
      DATE: ${metadata.date?.date_text}
    `);
  });
  */
  livechat.start();
})();