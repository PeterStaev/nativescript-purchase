/*! *****************************************************************************
Copyright (c) 2019 Tangra Inc.

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

declare module "nativescript-purchase" {
    import { Product } from "nativescript-purchase/product";
    import { Transaction } from "nativescript-purchase/transaction";

    export const transactionUpdatedEvent: string;

    export function init(productIdentifiers: Array<string>): Promise<any>;
    export function getProducts(): Promise<Array<Product>>;
    export function buyProduct(product: Product, developerPayload?: string);
    export function consumePurchase(token: string): Promise<number>;
    export function restorePurchases(): Promise<void>;
    export function canMakePayments(): boolean;
    export function getStoreReceipt(): string;
    export function refreshStoreReceipt(): Promise<void>;

    export function on(eventName: string, handler: (data: any) => void);
    export function on(eventName: "transactionUpdated", handler: (data: Transaction) => void);

    export function off(eventName: string, handler?: (data: any) => void);
    export function off(eventName: "transactionUpdated", handler?: (data: Transaction) => void);
}
