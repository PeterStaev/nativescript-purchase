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

import { ProductBase, ProductType} from "./product-common";

export * from "./product-common";

export class Product extends ProductBase {
    constructor(nativeValue: SKProduct, type: ProductType) {
        super(nativeValue, type);
        
        let formatter = NSNumberFormatter.alloc().init();
        formatter.numberStyle = NSNumberFormatterStyle.CurrencyStyle;
        formatter.locale = nativeValue.priceLocale;

        this.productIdentifier = nativeValue.productIdentifier;
        this.localizedDescription = nativeValue.localizedDescription;
        this.localizedTitle = nativeValue.localizedTitle;
        this.priceAmount = nativeValue.price.doubleValue;
        this.priceFormatted = formatter.stringFromNumber(nativeValue.price as any);
        this.priceCurrencyCode = nativeValue.priceLocale.objectForKey(NSLocaleCurrencyCode);
    }
}