import { whisper, window } from '@oliveai/ldk';

interface Props {
  activeWindow: window.WindowInfo;
  activeWindows: string[];
  timers: Record<string, unknown>;
}
export default class WindowWhisper {
  whisper: whisper.Whisper;

  label: string;

  props: Props;

  constructor(
    activeWindow: window.WindowInfo,
    activeWindows: string[] = [],
    timers: Record<string, unknown> = {}
  ) {
    this.whisper = undefined;
    this.label = 'Screen Time So Far';
    this.props = {
      activeWindow,
      activeWindows,
      timers,
    };
  }

  createComponents() {
    // const name: whisper.ListPair = {
    //   type: whisper.WhisperComponentType.ListPair,
    //   copyable: true,
    //   label: 'Window Name',
    //   value: this.props.activeWindow.path,
    //   style: whisper.Urgency.None,
    // };
    const name: whisper.ListPair = {
      type: whisper.WhisperComponentType.ListPair,
      copyable: true,
      label: 'Active Windows',
      value: this.props.activeWindows.join(', '),
      style: whisper.Urgency.None,
    };
    const pid: whisper.ListPair = {
      type: whisper.WhisperComponentType.ListPair,
      copyable: true,
      label: 'Screen Time',
      value: JSON.stringify(this.props.timers),
      style: whisper.Urgency.None,
    };
    return [name, pid];
  }

  show() {
    whisper
      .create({
        components: this.createComponents(),
        label: this.label,
        onClose: WindowWhisper.onClose,
      })
      .then((newWhisper) => {
        this.whisper = newWhisper;
      });
  }

  close() {
    this.whisper.close(WindowWhisper.onClose);
  }

  static onClose(err?: Error) {
    if (err) {
      console.error('There was an error closing Window whisper', err);
    }
    console.log('Window whisper closed');
  }
}
