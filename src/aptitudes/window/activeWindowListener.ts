import { window } from '@oliveai/ldk';

import { WindowWhisper } from '../../whispers';

const activeWindows = [];
const timers = {};
let previousDateTime;
let currentDateTime;
let previousApplicationName = null;
let tempTime;
let currentApplicationName;

const getDateDiff = (startDate: Date, endDate: Date) => {
  return (endDate.getTime() - startDate.getTime()) / 1000;
};

const handler = (activeWindow: window.WindowInfo) => {
  currentApplicationName = activeWindow.path;
  // console.log(JSON.stringify(activeWindow));
  // console.log(JSON.stringify(activeWindows));

  if (Object.keys(timers).length === 0) {
    currentDateTime = new Date();
    previousDateTime = currentDateTime;
    previousApplicationName = activeWindow.path;
  } else {
    previousDateTime = currentDateTime;
    currentDateTime = new Date();
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
  previousApplicationName = activeWindow.path;

  if (!activeWindows.includes(currentApplicationName)) {
    activeWindows.push(currentApplicationName);
    const whisper = new WindowWhisper(activeWindow, activeWindows, timers);
    whisper.show();
  }
};
const listen = () => {
  window.listenActiveWindow(handler);
};

export { handler };
export default { listen };
