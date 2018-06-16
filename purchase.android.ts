/*! *****************************************************************************
Copyright (c) 2018 Tangra Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
***************************************************************************** */

import * as common from "./purchase-common";
import * as application from "application";
import * as types from "utils/types";
import { Product } from "nativescript-purchase/product";
import { Transaction, TransactionState } from "nativescript-purchase/transaction";

export * from "./purchase-common";

let helper: com.tangrainc.inappbilling.InAppBillingHelper;
let currentBuyPayload: string;
let currentBuyProductIdentifier: string;

export function init(productIdentifiers: Array<string>): Promise<any> {
    return new Promise((resolve, reject) => {
        const nativeArray = Array.create(java.lang.String, productIdentifiers.length);
        for (let loop = 0; loop < productIdentifiers.length; loop++) {
            nativeArray[loop] = productIdentifiers[loop].toLowerCase(); // Android product IDs are all lower case
        }

        ensureApplicationContext().then(() => {
            helper = new com.tangrainc.inappbilling.InAppBillingHelper(application.android.context, nativeArray);
            resolve();
        });

        application.android.on(application.AndroidApplication.activityResultEvent, (args: application.AndroidActivityResultEventData) => {
            if (args.requestCode === com.tangrainc.inappbilling.InAppBillingHelper.BUY_INTENT_REQUEST_CODE) {
                const intent = args.intent as android.content.Intent;
                const responseCode = intent && intent.getIntExtra("RESPONSE_CODE", 0);
                const purchaseData = intent && intent.getStringExtra("INAPP_PURCHASE_DATA");
                const dataSignature = intent && intent.getStringExtra("INAPP_DATA_SIGNATURE");
                let tran: Transaction;
                
                if (typeof(responseCode)!=="undefined" && args.resultCode === android.app.Activity.RESULT_OK && responseCode === 0 && !types.isNullOrUndefined(purchaseData)) {
                    const nativeValue = new org.json.JSONObject(purchaseData);
                    nativeValue.put("signature", dataSignature);
                    tran = new Transaction(nativeValue);
                }
                else {
                    tran = new Transaction(null);
                    tran.transactionState = TransactionState.Failed;
                    tran.productIdentifier = currentBuyProductIdentifier;
                    tran.developerPayload = currentBuyPayload;
                }
                common._notify(common.transactionUpdatedEvent, tran);
            }
        });
    });
}

export function getProducts(): Promise<Array<Product>>{
    return new Promise<Array<Product>>((resolve, reject) => {
        Promise.all([
            futureToPromise(helper.getProducts("inapp")),
            futureToPromise(helper.getProducts("subs")),
        ])
            .then((result: Array<Array<org.json.JSONObject>>) => {
                const productArray: Array<Product> = [];
                for (let type = 0; type <= 1; type++) {
                    for (const item of result[type]) {
                        productArray.push(new Product(item, (type === 0 ? "inapp" : "subs")));
                    }
                }

                resolve(productArray);
            })
            .catch(reject);
    });
}

export function buyProduct(product: Product, developerPayload?: string) {
    const tran = new Transaction(null);
    tran.transactionState = TransactionState.Purchasing;
    tran.productIdentifier = product.productIdentifier;
    tran.developerPayload = developerPayload;
    common._notify(common.transactionUpdatedEvent, tran);

    currentBuyProductIdentifier = product.productIdentifier;
    currentBuyPayload = developerPayload;
    
    helper.startBuyIntent(application.android.foregroundActivity,
        product.productIdentifier,
        product.productType,
        developerPayload || "");
}

export function consumePurchase(token: string): Promise<number> {
    return new Promise<number>((resolve, reject) => {
        futureToPromise(helper.consumePurchase(token)).then(resolve, reject);
    });
}

export function restorePurchases() {
    Promise.all([
        futureToPromise(helper.getPurchases(null, "inapp")),
        futureToPromise(helper.getPurchases(null, "subs")),
    ]).then((result: Array<Array<org.json.JSONObject>>) => {
        for (let type = 0; type <= 1; type++) {
            for (const item of result[type]) {
                const tran = new Transaction(null);
                tran.originalTransaction = new Transaction(item);
                tran.transactionState = TransactionState.Restored;

                common._notify(common.transactionUpdatedEvent, tran);
            }
        }    
    });
}

export function canMakePayments(): boolean{
    return true;
}

function futureToPromise(future: any /* ListenableFuture */): Promise<any> {
    return new Promise((resolve, reject) => {
        com.google.common.util.concurrent.Futures.addCallback(future, new com.google.common.util.concurrent.FutureCallback({
            onSuccess: (result) => {
                resolve(result);
            }
            , onFailure: (t /* Throwable */) => {
                reject(new Error(t.getMessage()));
            }
        }));
    });
}

function ensureApplicationContext(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
        if (application.android && application.android.context) {
            resolve();
            return;
        }

        application.on(application.launchEvent, (args: application.LaunchEventData) => {
            resolve();
        });        
    });
}
