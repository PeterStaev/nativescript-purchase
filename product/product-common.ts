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

import * as definition from "nativescript-purchase/product";

export { ProductType } from "nativescript-purchase/product";

export class ProductBase implements definition.Product {
    public nativeValue: any;

    public productIdentifier: string;
    public localizedTitle: string;
    public localizedDescription: string;
    public priceAmount: number;
    public priceFormatted: string;
    public priceCurrencyCode: string;
    public productType: definition.ProductType;
    public subscriptionPeriod?: string;
    
    constructor(nativeValue: any, type: definition.ProductType) {
        this.nativeValue = nativeValue;
        this.productType = type;
    }
}