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

import * as common from "./product-common";

export class Product extends common.Product {
    constructor(nativeValue: org.json.JSONObject) {
        super(nativeValue);
        
        this.productIdentifier = nativeValue.getString("productId");
        this.localizedDescription = nativeValue.getString("description");
        this.localizedTitle = nativeValue.getString("title");
        this.priceAmount = nativeValue.getInt("price_amount_micros") / 1000000;
        this.priceFormatted = nativeValue.getString("price");
        this.priceCurrencyCode = nativeValue.getString("price_currency_code");
    }
}