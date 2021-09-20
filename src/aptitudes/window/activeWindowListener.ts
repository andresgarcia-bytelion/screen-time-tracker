import { whisper, window } from '@oliveai/ldk';

import { differenceInDays, differenceInSeconds } from 'date-fns';
import { WindowWhisper } from '../../whispers';

let activeWindows = [];
let timers = {};
let previousDateTime;
let currentDateTime;
let previousApplicationName = null;
let tempTime;
let currentApplicationName;
let totalTime = 0;
let reminderTime = 0;
let currentWhisper;

const getDateDiff = (startDate: Date, endDate: Date, type?: string) => {
  const diff = endDate.getTime() - startDate.getTime();
  let result;

  switch (type) {
    case 'days':
      result = differenceInDays(endDate, startDate);

      return result;
    case 'seconds':
    default:
      result = differenceInSeconds(endDate, startDate);
      totalTime += result;
      reminderTime += result;

      return result;
  }
};

const handler = (activeWindow: window.WindowInfo) => {
  const now = new Date();

  if (previousDateTime) {
    const dayDiff = getDateDiff(previousDateTime, now, 'days');

    // reset counters if it is a new day
    if (dayDiff > 0) {
      timers = {};
      totalTime = 0;
      activeWindows = [];
    }
  }

  currentApplicationName = activeWindow.path;
  console.log(JSON.stringify(activeWindow));

  if (Object.keys(timers).length === 0) {
    currentDateTime = now;
    previousDateTime = currentDateTime;
    previousApplicationName = currentApplicationName;
  } else {
    previousDateTime = currentDateTime;
    currentDateTime = now;
  }

  if (previousApplicationName) {
    if (timers[previousApplicationName]) {
      tempTime = getDateDiff(previousDateTime, currentDateTime);
      timers[previousApplicationName] += tempTime;

      console.log(`adding ${tempTime} seconds to ${previousApplicationName}`);
    } else {
      tempTime = getDateDiff(previousDateTime, currentDateTime);
      timers[previousApplicationName] = tempTime;

      console.log(`setting ${tempTime} seconds for ${previousApplicationName}`);
    }
  }

  if (!Object.prototype.hasOwnProperty.call(timers, currentApplicationName)) {
    timers[currentApplicationName] = 0;
    console.log(`setting ${currentApplicationName} to 0 seconds`);
  }

  // console.log(JSON.stringify(timers));
  previousApplicationName = currentApplicationName;

  if (!activeWindows.includes(currentApplicationName)) {
    activeWindows.push(currentApplicationName);
  }

  if (!currentWhisper) {
    currentWhisper = new WindowWhisper(activeWindow, activeWindows, timers, totalTime);
    currentWhisper.show();
  } else {
    currentWhisper.update(activeWindow, activeWindows, timers, totalTime);
  }

  if (reminderTime > 60) {
    console.log(`reminder time: ${reminderTime} seconds`);
    reminderTime = 0;

    whisper.create({
      label: '🧘 Time to Stretch!',
      onClose: () => { },
      components: [
        {
          type: whisper.WhisperComponentType.Message,
          body: 'A good stretch or stroll will do wonders for your physical and mental health. ✅',
          style: whisper.Urgency.Success,
        },
        {
          type: whisper.WhisperComponentType.Markdown,
          body: `**Stretching keeps the muscles flexible, strong, and healthy**, and we need that flexibility to maintain a range of motion in the joints. Without it, the muscles shorten and become tight. Then, when you call on the muscles for activity, they are weak and unable to extend all the way.`,
        },
        {
          type: whisper.WhisperComponentType.Divider,
        },
        {
          type: whisper.WhisperComponentType.Markdown,
          body: `**Additional Stretching Techniques**`,
        },
        {
          type: whisper.WhisperComponentType.Link,
          text: 'Pappa Bless Stretch Test',
          onClick: () => {},
        },
        {
          type: whisper.WhisperComponentType.Link,
          text: 'OWASP Tendon Security',
          onClick: () => {},
        },
        {
          type: whisper.WhisperComponentType.Link,
          text: 'Heavy Metal Goat Yoga',
          onClick: () => {},
        }
      ],
    });
  }
};

const listen = () => {
  window.listenActiveWindow(handler);
};

export { handler };
export default { listen };
