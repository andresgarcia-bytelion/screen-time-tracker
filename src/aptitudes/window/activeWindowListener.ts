import { whisper, window } from '@oliveai/ldk';

import { differenceInDays, addDays, getDate, differenceInSeconds } from 'date-fns';
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
    console.log();
  }

  currentApplicationName = activeWindow.path;
  console.log(JSON.stringify(activeWindow));
  // console.log(JSON.stringify(activeWindows));

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
    if (!currentWhisper) {
      currentWhisper = new WindowWhisper(activeWindow, activeWindows, timers, totalTime);
      currentWhisper.show();
    } else {
      currentWhisper.update(activeWindow, activeWindows, timers, totalTime);
    }
  }

  if (reminderTime > 60) {
    console.log(`reminder time: ${reminderTime} seconds`);
    reminderTime = 0;
    whisper.create({
      label: 'Activity Reminder',
      onClose: () => { },
      components: [
        {
          type: whisper.WhisperComponentType.Message,
          body: `Don't forget to stretch your legs!`,
        },
      ],
    });
  }
};
const listen = () => {
  window.listenActiveWindow(handler);
};

export { handler };
export default { listen };
