// import { IntroWhisper } from './whispers';
// import {
//   activeWindowListener,
// } from './aptitudes';

// activeWindowListener.listen();

// new IntroWhisper().show();

const { whisper } = require('@oliveai/ldk');
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