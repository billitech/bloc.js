import { Subscription } from 'rxjs'

export class SubscriptionsContainer {
  private subscriptions: Subscription[] = []

  set add(subscription: Subscription) {
    this.subscriptions.push(subscription)
  }

  dispose() {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe()
    })
    this.subscriptions = []
  }
}
