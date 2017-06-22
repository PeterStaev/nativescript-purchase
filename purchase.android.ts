/*! *****************************************************************************
Copyright (c) 2016 Tangra Inc.

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

global.moduleMerge(common, exports);

let helper: com.tangrainc.inappbilling.InAppBillingHelper;
let currentBuyPayload: string;
let currentBuyProductIdentifier: string;

export function init(productIdentifiers: Array<string>, subs: boolean) {
    let nativeArray = Array.create(java.lang.String, productIdentifiers.length);
    for (let loop = 0; loop < productIdentifiers.length; loop++) {
        nativeArray[loop] = productIdentifiers[loop].toLowerCase(); // Android product IDs are all lower case
    }
    ensureApplicationContext().then(() => {
        helper = new com.tangrainc.inappbilling.InAppBillingHelper(application.android.context, nativeArray, subs);
    });

    application.android.on(application.AndroidApplication.activityResultEvent, (args: application.AndroidActivityResultEventData) => {
        if (args.requestCode === com.tangrainc.inappbilling.InAppBillingHelper.BUY_INTENT_REQUEST_CODE) {
            let intent = args.intent as android.content.Intent;
            let responseCode = intent.getIntExtra("RESPONSE_CODE", 0);
            let purchaseData = intent.getStringExtra("INAPP_PURCHASE_DATA");
            let dataSignature = intent.getStringExtra("INAPP_DATA_SIGNATURE");
            let tran: Transaction;
            
            if (args.resultCode === android.app.Activity.RESULT_OK && responseCode === 0 && !types.isNullOrUndefined(purchaseData)) {
                let nativeValue = new org.json.JSONObject(purchaseData);
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
}

export function getProducts(): Promise<Array<Product>>{
    return new Promise<Array<Product>>((resolve, reject) => {
        futureToPromise(helper.getProducts())
            .then((result: Array<org.json.JSONObject>) => {
                let productArray: Array<Product> = [];
                for (let loop = 0; loop < result.length; loop++) {
                    productArray.push(new Product(result[loop]));
                }
                
                resolve(productArray);
            })
            .catch(reject);      
    });
}

export function buyProduct(product: Product, developerPayload?: string) {
    let tran = new Transaction(null);
    tran.transactionState = TransactionState.Purchasing;
    tran.productIdentifier = product.productIdentifier;
    tran.developerPayload = developerPayload;
    common._notify(common.transactionUpdatedEvent, tran);

    currentBuyProductIdentifier = product.productIdentifier;
    currentBuyPayload = developerPayload;
    
    helper.startBuyIntent(application.android.foregroundActivity, product.productIdentifier, developerPayload || "");
}

export function consumePurchase(token: string): Promise<number> {
    return new Promise<number>((resolve, reject) => {
        futureToPromise(helper.consumePurchase(token)).then(resolve, reject);
    });
}

export function restorePurchases() {
    futureToPromise(helper.getPurchases())
        .then((result: Array<org.json.JSONObject>) => {
            for (let loop = 0; loop < result.length; loop++) {
                let tran = new Transaction(null);
                tran.originalTransaction = new Transaction(result[loop]);
                tran.transactionState = TransactionState.Restored;

                common._notify(common.transactionUpdatedEvent, tran);
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