import { window } from '@oliveai/ldk';

import { WindowWhisper } from '../../whispers';

let activeWindows = [];
let timers = {};
let previousDateTime;
let currentDateTime;

const handler = (activeWindow: window.WindowInfo) => {
  console.log(JSON.stringify(activeWindow));
  if (!activeWindows.includes(activeWindow.path)) {
    activeWindows.push(activeWindow.path);
    const whisper = new WindowWhisper(activeWindow, activeWindows);
    whisper.show();
  }
  console.log(JSON.stringify(activeWindows));
};
const listen = () => {
  window.listenActiveWindow(handler);
};

export { handler };
export default { listen };
