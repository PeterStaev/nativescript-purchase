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

import * as common from "./transaction-common";

global.moduleMerge(common, exports);

export class Transaction extends common.Transaction {
    constructor(nativeValue: SKPaymentTransaction) {
        super(nativeValue);
        
        switch (nativeValue.transactionState) {
            case SKPaymentTransactionState.SKPaymentTransactionStateDeferred:
                this.transactionState = common.TransactionState.Deferred;
                break;

            case SKPaymentTransactionState.SKPaymentTransactionStateFailed:
                this.transactionState = common.TransactionState.Failed;
                break;
                
            case SKPaymentTransactionState.SKPaymentTransactionStatePurchased:
                this.transactionState = common.TransactionState.Purchased;
                break;
                
            case SKPaymentTransactionState.SKPaymentTransactionStatePurchasing:
                this.transactionState = common.TransactionState.Purchasing;
                break;
                
            case SKPaymentTransactionState.SKPaymentTransactionStateRestored:
                this.transactionState = common.TransactionState.Restored;
                this.originalTransaction = new Transaction(nativeValue.originalTransaction);
                break;
        }

        this.productIdentifier = nativeValue.payment.productIdentifier;
        this.transactionIdentifier = nativeValue.transactionIdentifier;
        if (nativeValue.transactionDate) {
            this.transactionDate = nativeValue.transactionDate as any; // NSDate will automatically be bridged to date
        }    
        if (nativeValue.transactionReceipt) {
            this.transactionReceipt = nativeValue.transactionReceipt.base64EncodedStringWithOptions(NSDataBase64EncodingOptions.NSDataBase64Encoding64CharacterLineLength);
        }    
    }
} 