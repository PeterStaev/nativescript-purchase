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

declare module "nativescript-purchase/product" {
    export type ProductType = "inapp" | "subs";

    export class Product {
        public nativeValue: any;

        public productIdentifier: string;
        public localizedTitle: string;
        public localizedDescription: string;
        public priceAmount: number;
        public priceFormatted: string;
        public priceCurrencyCode: string;
        public productType: ProductType;
        public subscriptionPeriod?: string;
        
        constructor(nativeValue: any, type?: ProductType);
    }    
}