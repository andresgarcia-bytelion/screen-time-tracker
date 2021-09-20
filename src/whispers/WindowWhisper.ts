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

  isShown: boolean;

  constructor(
    activeWindow: window.WindowInfo,
    activeWindows: string[] = [],
    timers: Record<string, unknown> = {},
    totalTime: number
  ) {
    this.whisper = undefined;
    this.label = 'Your Digital Wellbeing';
    this.props = {
      activeWindow,
      activeWindows,
      timers,
      totalTime,
    };
    this.isShown = false;
  }

  calculateTime(value) {
    const minutes = secondsToMinutes(value);

    return (
      `${value < 60 ?
        `${value} seconds` :
        `${minutes} minute${minutes === 1 ? '' : 's'}`}`
    );
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
    const timeValuePairs = [];
    const keys = Object.keys(this.props.timers);

    // Create a list pair component for each timer
    keys.forEach((key, index) => {
      const components = this.createListPair(key, this.calculateTime(this.props.timers[key]));

      // Push list pair component to a temporary array for later use
      if (this.props.timers[key] !== 0) {
        timeValuePairs.push(components);
      }
    });

    // Sort time value pairs based on most used to least used
    timeValuePairs.sort((a, b) => (
      parseInt(a.value.replace(' seconds', '')) < parseInt(b.value.replace(' seconds', ''))
    ) ? 1 : -1)

    if (this.props.totalTime > 0) {
      // Create component to display screen time title
      const totalTimeTitle: whisper.Markdown = {
        type: whisper.WhisperComponentType.Markdown,
        body: `## Screen Time Today`
      };
      // Create component to center totalTimeTitle component
      const totalTimeTitleBox: whisper.Box = {
        type: whisper.WhisperComponentType.Box,
        children: [totalTimeTitle],
        direction: whisper.Direction.Horizontal,
        justifyContent: whisper.JustifyContent.Center,
      };
      // Create component to display the value of screen time today
      const totalTimeValue: whisper.Markdown = {
        type: whisper.WhisperComponentType.Markdown,
        body: `### ${this.calculateTime(this.props.totalTime)}`
      };
      // Create component to center totalTimeValue component
      const totalTimeValueBox: whisper.Box = {
        type: whisper.WhisperComponentType.Box,
        children: [totalTimeValue],
        direction: whisper.Direction.Horizontal,
        justifyContent: whisper.JustifyContent.Center,
      };

      // Push the previous components into the final result
      result.push(totalTimeTitleBox);
      result.push(totalTimeValueBox);

      // Create a divider component
      const divider: whisper.Divider = {
        type: whisper.WhisperComponentType.Divider,
      };

      // Push the divider directly after the total time component group
      result.push(divider);

      // Push each time value pair into the component results list
      timeValuePairs.forEach(pair => {
        result.push(pair);
      });

      // Push the divider directly after the time value pairs
      result.push(divider);

      // Create a component to describe the purpose of reducing screen time
      const markdown: whisper.Markdown = {
        type: whisper.WhisperComponentType.Markdown,
        body: `Reducing screen time **frees up more time to connect with family and friends**. Feeling connections with others can help ward off symptoms of stress, depression and anxiety. We often miss out on the fun and beauty that is happening all around us because of screens.`
      };

      // Push the screen time reduction message after the time value pairs and divider
      result.push(markdown);
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
        this.isShown = true;
      });
  }

  update(activeWindow, activeWindows, timers, totalTime) {
    this.props = { ...this.props, activeWindow, activeWindows, timers, totalTime };
    this.whisper.update({
      components: this.createComponents(),
    });

    if (!this.isShown) {
      this.show();
    }
  }

  close() {
    this.whisper.close(WindowWhisper.onClose);
    this.isShown = false;
  }

  static onClose(err?: Error) {
    if (err) {
      console.error('There was an error closing Window whisper', err);
    }

    console.log('Window whisper closed');
  }
}
