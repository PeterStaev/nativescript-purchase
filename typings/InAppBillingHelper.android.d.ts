declare namespace com {
    export var google: any;

    export namespace tangrainc {
        export namespace inappbilling {
            export class InAppBillingHelper {
                public static BUY_INTENT_REQUEST_CODE: number;
                
                constructor(context: android.content.Context, productIdentifiers: Array<string>);
                public getProducts(): any; /* ListenableFuture<JSONObjec[]> */
                public startBuyIntent(foregroundActivity: android.app.Activity, productIdentifier: string, payload: string);
                public consumePurchase(token: string): any /* ListenableFuture<Integer> */
                public getPurchases(continuationToken?: string): any ;
            }
        }
    }
}