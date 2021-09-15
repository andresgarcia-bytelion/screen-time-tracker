import { IntroWhisper } from './whispers';
import {
  activeWindowListener,
} from './aptitudes';

const { whisper } = require('@oliveai/ldk');

activeWindowListener.listen();

whisper.create({
  label: 'Hello world',
  onClose: () => {},
  components: [
    {
      type: whisper.WhisperComponentType.Message,
      body: "Hello World",
      style: "success",
      textAlign: "center"
    },
  ],
});

// new IntroWhisper().show();

// const { whisper } = require('@oliveai/ldk');
// whisper.create({
//   label: 'Hello world',
//   onClose: () => {},
//   components: [
//     {
//       type: whisper.WhisperComponentType.Message,
//       body: "Hello World",
//       style: "success",
//       textAlign: "center"
//     },
//   ],
// });