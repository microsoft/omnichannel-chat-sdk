declare module 'core-js/features/observable' {
    export default class Observable<T> {
      constructor(observerCallback: (observer: Observer<T>) => void);
      subscribe: (subscriber: Subscriber<T>) => Subscription;
    }

    export class Observer<T> {
      complete(): void;
      error(error: Error): void;
      next(value: T): void;
    }

    export type Subscriber<T> = {
      complete(): void;
      error(error: Error): void;
      next(value: T): void;
      start(subscription: Subscription): void;
    };

    export class Subscription {
      unsubscribe(): void;
    }
}