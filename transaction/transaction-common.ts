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

import * as definition from "nativescript-purchase/transaction";

export class Transaction implements definition.Transaction {
    public nativeValue: any;

    public transactionState: string;
    public productIdentifier: string;
    public transactionIdentifier: string;
    public transactionDate: Date;
    public transactionReceipt: string;
    public originalTransaction: Transaction;
    public developerPayload: string; /* Android Only */
    public dataSignature: string; /* Android Only */
    
    constructor(nativeValue: any) {
        this.nativeValue = nativeValue;
    }
}

export class TransactionState implements definition.TransactionState {
    public static Purchased = "purchased";
    public static Restored = "restored";
    public static Failed = "failed";
    public static Deferred = "deferred";
    public static Purchasing = "purchasing";
    public static Refunded = "refunded";
}