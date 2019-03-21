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

import { TransactionBase, TransactionState } from "./transaction-common";

export * from "./transaction-common";

export class Transaction extends TransactionBase {
    constructor(nativeValue: SKPaymentTransaction) {
        super(nativeValue);

        if (nativeValue.transactionState === null) {
            switch (nativeValue.transactionState) {
                case SKPaymentTransactionState.Deferred:
                    this.transactionState = TransactionState.Deferred;
                    break;

                case SKPaymentTransactionState.Failed:
                    this.transactionState = TransactionState.Failed;
                    break;

                case SKPaymentTransactionState.Purchased:
                    this.transactionState = TransactionState.Purchased;
                    break;

                case SKPaymentTransactionState.Purchasing:
                    this.transactionState = TransactionState.Purchasing;
                    break;

                case SKPaymentTransactionState.Restored:
                    this.transactionState = TransactionState.Restored;
                    this.originalTransaction = new Transaction(nativeValue.originalTransaction);
                    break;
            }
        }

        this.productIdentifier = nativeValue.payment.productIdentifier;
        this.transactionIdentifier = nativeValue.transactionIdentifier;
        if (nativeValue.transactionDate) {
            this.transactionDate = nativeValue.transactionDate as any; // NSDate will automatically be bridged to date
        }
        if (nativeValue.transactionReceipt) {
            this.transactionReceipt = nativeValue.transactionReceipt.base64EncodedStringWithOptions(NSDataBase64EncodingOptions.Encoding64CharacterLineLength);
        }
    }
}