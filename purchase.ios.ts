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

import { Product } from "nativescript-purchase/product";
import { Transaction } from "nativescript-purchase/transaction";
import * as common from "./purchase-common";

export * from "./purchase-common";

let productRequest: SKProductsRequest;
let productIds: NSMutableSet<string>;
let productRequestDelegate: SKProductRequestDelegateImpl;
let paymentTransactionObserver: SKPaymentTransactionObserverImpl;
let storedDeveloperPayload: string;

export function init(productIdentifiers: Array<string>): Promise<any> {
    return new Promise((resolve, reject) => {
        productIds = NSMutableSet.alloc<string>().init();
        paymentTransactionObserver = new SKPaymentTransactionObserverImpl();
        
        productIdentifiers.forEach((value) => productIds.addObject(value));

        SKPaymentQueue.defaultQueue().addTransactionObserver(paymentTransactionObserver);
        resolve();
    });
}

export function getProducts(): Promise<Array<Product>> {
    return new Promise((resolve, reject) => {
        productRequest = SKProductsRequest.alloc().initWithProductIdentifiers(productIds);
        productRequestDelegate = SKProductRequestDelegateImpl.initWithResolveReject(resolve, reject);
        productRequest.delegate = productRequestDelegate;
        productRequest.start();
    });
}

export function buyProduct(product: Product, developerPayload?: string) {
    if (!product.nativeValue) {
        throw "Invalid Product! (missing native value)";
    }

    storedDeveloperPayload = developerPayload;

    const payment = SKPayment.paymentWithProduct(product.nativeValue);
    SKPaymentQueue.defaultQueue().addPayment(payment);
}

export function consumePurchase(token: string): Promise<number> {
    return new Promise<number>((resolve, reject) => {
        resolve(0);
    });
}

export function restorePurchases(): Promise<void> {
    SKPaymentQueue.defaultQueue().restoreCompletedTransactions();
    return Promise.resolve();
}

export function canMakePayments(): boolean {
    return SKPaymentQueue.canMakePayments();
}

export function getStoreReceipt(): string {
    const receiptData = NSData.dataWithContentsOfURL(NSBundle.mainBundle.appStoreReceiptURL);

    if (receiptData) {
        return receiptData.base64EncodedStringWithOptions(0);
    }
    else {
        return null;
    }
}

@ObjCClass(SKProductsRequestDelegate)
class SKProductRequestDelegateImpl extends NSObject implements SKProductsRequestDelegate {
    private _resolve: Function;
    private _reject: Function;
    
    public static initWithResolveReject(resolve: Function, reject: Function): SKProductRequestDelegateImpl {
        const delegate: SKProductRequestDelegateImpl = SKProductRequestDelegateImpl.new() as SKProductRequestDelegateImpl;
        delegate._resolve = resolve;
        delegate._reject = reject;

        return delegate;
    }

    public productsRequestDidReceiveResponse(request: SKProductsRequest, response: SKProductsResponse) {
        const products = response.products;
        const result: Array<Product> = [];

        for (let loop = 0; loop < products.count; loop++) {
            result.push(new Product(products.objectAtIndex(loop)));
        }

        this._resolve(result);
        this._cleanup();
    }
    
    public requestDidFailWithError(request: SKRequest, error: NSError) {
        this._reject(new Error(error.localizedDescription));
        this._cleanup();
    }

    private _cleanup() {
        productRequestDelegate = null;
        productRequest = null;
    }
}

@ObjCClass(SKPaymentTransactionObserver)
class SKPaymentTransactionObserverImpl extends NSObject implements SKPaymentTransactionObserver {
    public paymentQueueUpdatedTransactions(queue: SKPaymentQueue, transactions: NSArray<SKPaymentTransaction>) {
        for (let loop = 0; loop < transactions.count; loop++) {
            const transaction = transactions.objectAtIndex(loop);
            const resultTransaction = new Transaction(transaction);

            resultTransaction.developerPayload = storedDeveloperPayload;

            common._notify(common.transactionUpdatedEvent, resultTransaction);

            if (transaction.transactionState === SKPaymentTransactionState.Failed
                || transaction.transactionState === SKPaymentTransactionState.Purchased
                || transaction.transactionState === SKPaymentTransactionState.Restored) {
                SKPaymentQueue.defaultQueue().finishTransaction(transaction);
                storedDeveloperPayload = undefined;
            }           
        }
    }
}