import { activeWindowListener } from './aptitudes';
import { IntroWhisper } from './whispers';

activeWindowListener.listen();
new IntroWhisper().show();
