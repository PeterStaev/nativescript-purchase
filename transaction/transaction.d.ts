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

declare module "nativescript-purchase/transaction" {
    export class Transaction {
        public nativeValue: any;

        public transactionState: string;
        public productIdentifier: string;
        public transactionIdentifier: string;
        public transactionDate: Date;
        public transactionReceipt: string;
        public originalTransaction: Transaction;
        public developerPayload: string;
        public dataSignature: string; /* Android Only */

        constructor(nativeValue: any);
    }

    export class TransactionState {
        public static Purchased: string;
        public static Restored: string;
        public static Failed: string;
        public static Deferred: string;
        public static Purchasing: string;
        public static Refunded: string;
    }
}