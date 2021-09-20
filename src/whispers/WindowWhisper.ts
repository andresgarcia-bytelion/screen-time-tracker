import { whisper, window } from '@oliveai/ldk';
import { secondsToMinutes } from 'date-fns';

interface Props {
  activeWindow: window.WindowInfo;
  activeWindows: string[];
  timers: Record<string, unknown>;
  totalTime: number;
}
export default class WindowWhisper {
  whisper: whisper.Whisper;

  label: string;

  props: Props;

  constructor(
    activeWindow: window.WindowInfo,
    activeWindows: string[] = [],
    timers: Record<string, unknown> = {},
    totalTime: number
  ) {
    this.whisper = undefined;
    this.label = 'Screen Time So Far';
    this.props = {
      activeWindow,
      activeWindows,
      timers,
      totalTime,
    };
  }

  // eslint-disable-next-line class-methods-use-this
  createListPair(key, value) {
    const pair: whisper.ListPair = {
      type: whisper.WhisperComponentType.ListPair,
      copyable: true,
      label: `${key}`,
      value: `${value}`,
      style: whisper.Urgency.None,
    };
    return pair;
  }

  createComponents() {
    const result = [];
    const keys = Object.keys(this.props.timers);

    keys.forEach((key, index) => {
      // console.log(`${key}: ${this.props.timers[key]}`);
      const components = this.createListPair(key, `${this.props.timers[key]} seconds`);
      if (this.props.timers[key] !== 0) {
        result.push(components);
      }
    });

    const divider: whisper.Divider = {
      type: whisper.WhisperComponentType.Divider,
    };

    if (this.props.totalTime > 0) {
      result.push(divider);
      const minutes = secondsToMinutes(this.props.totalTime);
      result.push(
        this.createListPair(
          'Overall Screen Time',
          `${this.props.totalTime} seconds (${minutes} minute(s))`
        )
      );
    } else {
      const introMessage: whisper.Message = {
        type: whisper.WhisperComponentType.Message,
        body: 'No screen time has been recorded yet.',
        style: whisper.Urgency.Success,
      };
      return [introMessage];
    }

    return result;
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

  update(activeWindow, activeWindows, timers, totalTime) {
    this.props = { ...this.props, activeWindow, activeWindows, timers, totalTime };
    this.whisper.update({
      components: this.createComponents(),
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
