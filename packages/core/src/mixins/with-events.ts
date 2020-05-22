import mitt from 'mitt';
import { CartoError } from '../error/carto-error';

export abstract class WithEvents {
  protected emitter = mitt();
  protected availableEvents = ['*'];

  protected registerAvailableEvents(eventArray: string[]) {
    this.availableEvents = ['*', ...eventArray];
  }

  public emit(type: string, event?: unknown) {
    if (!this.availableEvents.includes(type)) {
      throw new CartoError({
        type: '[Events]',
        message: `Trying to emit an unknown event type: ${type}. Available events: ${this.availableEvents.join(
          ', '
        )}.`
      });
    }

    this.emitter.emit(type, event);
  }

  on(type: string, handler: mitt.Handler) {
    if (!this.availableEvents.includes(type)) {
      this.throwEventNotFoundError(type);
    }

    this.emitter.on(type, handler);
  }

  off(type: string, handler: mitt.Handler) {
    if (!this.availableEvents.includes(type)) {
      this.throwEventNotFoundError(type);
    }

    this.emitter.off(type, handler);
  }

  private throwEventNotFoundError(eventType: string) {
    throw new CartoError({
      type: '[Events]',
      message: `Trying to listen an unknown event type: ${eventType}. Available events: ${this.availableEvents.join(
        ', '
      )}.`
    });
  }
}
