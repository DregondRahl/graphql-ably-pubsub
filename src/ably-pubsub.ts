import * as Ably from "ably";
import { PubSubEngine } from "graphql-subscriptions";
import { PubSubAsyncIterator } from "./pubsub-async-iterator";

type OnMessage<T> = (message: T) => void;

export class AblyPubSub implements PubSubEngine {
  constructor(
    options?,
    channelName = "",
    pubSubClient = new Ably.Realtime(options)
  ) {
    this.currentClientId = 0;
    this.subscriptionMap = {};
    this.subsRefsMap = {};
    this.subscribeFnMap = {};
    this.channelName = channelName;
    this.pubSubClient = pubSubClient;
  }

  public async publish(trigger: string, payload: unknown): Promise<void> {
    const channel = this.pubSubClient.channels.get(
      this.channelName === "" || null ? trigger : this.channelName
    );
    await channel.publish(trigger, payload);
  }

  public subscribe(
    trigger: string,
    onMessage: OnMessage<string>,
    options: unknown = {}
  ): Promise<number> {
    const id = this.currentClientId++;
    this.subscriptionMap[id] = [trigger, onMessage];
    const channel = this.pubSubClient.channels.get(
      this.channelName === "" || null ? trigger : this.channelName
    );
    const refs = this.subsRefsMap[trigger];
    if (refs && refs.length > 0) {
      const newRefs = [...refs, id];
      this.subsRefsMap[trigger] = newRefs;
      return Promise.resolve(id);
    } else {
      const subscriptionIds = this.subsRefsMap[trigger] || [];
      this.subsRefsMap[trigger] = [...subscriptionIds, id];
      return new Promise<number>((resolve) => {
        channel.subscribe(
          trigger,
          (this.subscribeFnMap[id] = (message) => {
            this.onMessage(trigger, message.data);
            resolve(id);
          })
        );
      });
    }
  }

  public unsubscribe(subId: number) {
    const [triggerName = null] = this.subscriptionMap[subId] || [];
    const refs = this.subsRefsMap[triggerName];
    const channel = this.pubSubClient.channels.get(
      this.channelName === "" || null ? triggerName : this.channelName
    );

    if (!refs) throw new Error(`There is no subscription of id "${subId}"`);

    if (refs.length === 1) {
      // unsubscribe from specific channel and pattern match
      channel.unsubscribe(triggerName, this.subscribeFnMap[subId]);

      delete this.subsRefsMap[triggerName];
    } else {
      const index = refs.indexOf(subId);
      const newRefs =
        index === -1
          ? refs
          : [...refs.slice(0, index), ...refs.slice(index + 1)];
      this.subsRefsMap[triggerName] = newRefs;
    }
    delete this.subscriptionMap[subId];
  }

  public asyncIterator<T>(triggers: string | string[]): AsyncIterator<T> {
    return new PubSubAsyncIterator<T>(this, triggers);
  }

  private onMessage(channel: string, message: string) {
    const subscriptions = this.subsRefsMap[channel];
    if (!subscriptions) {
      return;
    } // no subscribers, don't publish msg
    for (const subId of subscriptions) {
      const [, listener] = this.subscriptionMap[subId];
      listener(message);
    }
  }

  private subscriptionMap: { [subId: number]: [string, OnMessage<unknown>] };
  private subsRefsMap: { [trigger: string]: Array<number> };
  private subscribeFnMap: { [subId: number]: (message: any) => void };
  private pubSubClient: any;
  private currentClientId: number;
  private channelName: string;
}
