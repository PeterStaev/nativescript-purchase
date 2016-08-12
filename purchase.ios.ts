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

import { Product } from "nativescript-purchase/product";
import { Transaction } from "nativescript-purchase/transaction";
import * as common from "./purchase-common";

global.moduleMerge(common, exports);

let productRequest: SKProductsRequest;
let productIds: NSMutableSet;
let productRequestDelegate: SKProductRequestDelegateImpl;
let paymentTransactionObserver: SKPaymentTransactionObserverImpl;

export function init(productIdentifiers: Array<string>) {
    productIds = new NSMutableSet();
    paymentTransactionObserver = new SKPaymentTransactionObserverImpl();
    
    productIdentifiers.forEach((value) => productIds.addObject(value));

    SKPaymentQueue.defaultQueue().addTransactionObserver(paymentTransactionObserver);
}

export function getProducts(): Promise<Array<Product>> {
    return new Promise((resolve, reject) => {
        productRequest = SKProductsRequest.alloc().initWithProductIdentifiers(productIds);
        productRequestDelegate = SKProductRequestDelegateImpl.initWithResolveReject(resolve, reject);
        productRequest.delegate = productRequestDelegate;
        productRequest.start();
    });
}

export function buyProduct(product: Product) {
    if (!product.nativeValue) {
        throw "Invalid Product! (missing native value)";
    }

    let payment = SKPayment.paymentWithProduct(product.nativeValue);
    SKPaymentQueue.defaultQueue().addPayment(payment);
}

export function restorePurchases() {
    SKPaymentQueue.defaultQueue().restoreCompletedTransactions();
}

export function canMakePayments(): boolean {
    return SKPaymentQueue.canMakePayments();
}

class SKProductRequestDelegateImpl extends NSObject implements SKProductsRequestDelegate {
    public static ObjCProtocols = [SKProductsRequestDelegate];

    private _resolve: Function;
    private _reject: Function;
    
    public static initWithResolveReject(resolve: Function, reject: Function): SKProductRequestDelegateImpl {
        let delegate: SKProductRequestDelegateImpl = SKProductRequestDelegateImpl.new() as SKProductRequestDelegateImpl;
        delegate._resolve = resolve;
        delegate._reject = reject;

        return delegate;
    }

    public productsRequestDidReceiveResponse(request: SKProductsRequest, response: SKProductsResponse) {
        let products = response.products;
        let result: Array<Product> = [];

        for (let loop = 0; loop < products.count; loop++) {
            result.push(new Product(products.objectAtIndex(loop)));
        }

        this._resolve(result);
        this._cleanup();
    }
    
    public requestDidFailWithError(error: NSError) {
        this._reject(new Error(error.localizedDescription));
        this._cleanup();
    }

    private _cleanup() {
        productRequestDelegate = null;
        productRequest = null;
    }
}

class SKPaymentTransactionObserverImpl extends NSObject implements SKPaymentTransactionObserver {
    public static ObjCProtocols = [SKPaymentTransactionObserver];

    public paymentQueueUpdatedTransactions(queue: SKPaymentQueue, transactions: NSArray) {
        for (let loop = 0; loop < transactions.count; loop++) {
            let transaction = transactions.objectAtIndex(loop) as SKPaymentTransaction;
            let resultTransaction = new Transaction(transaction);

            common._notify(common.transactionUpdatedEvent, resultTransaction);

            if (transaction.transactionState === SKPaymentTransactionState.SKPaymentTransactionStateFailed
                || transaction.transactionState === SKPaymentTransactionState.SKPaymentTransactionStatePurchased
                || transaction.transactionState === SKPaymentTransactionState.SKPaymentTransactionStateRestored) {
                SKPaymentQueue.defaultQueue().finishTransaction(transaction);
            }           
        }
    }
}