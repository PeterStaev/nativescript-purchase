# NativeScript In-App Purchases plugin
[![Build Status](https://travis-ci.org/PeterStaev/nativescript-purchase.svg?branch=master)](https://travis-ci.org/PeterStaev/nativescript-purchase)
[![npm downloads](https://img.shields.io/npm/dm/nativescript-purchase.svg)](https://www.npmjs.com/package/nativescript-purchase)
[![npm downloads](https://img.shields.io/npm/dt/nativescript-purchase.svg)](https://www.npmjs.com/package/nativescript-purchase)
[![npm](https://img.shields.io/npm/v/nativescript-purchase.svg)](https://www.npmjs.com/package/nativescript-purchase)

A NativeScript plugin for making in-app purchases.

## Installation
Run the following command from the root of your project:

`tns plugin add nativescript-purchase`

This command automatically installs the necessary files, as well as stores nativescript-purchase as a dependency in your project's package.json file.

In order to get intellisense and make TypeScript compile without problems, add the following to your `references.d.ts`:
```typescript
/// <reference path="./node_modules/nativescript-purchase/nativescript-purchase.d.ts" />
```

## Usage

First we need to initialize the plugin with a list for product identifier that will be available for purchase. This is best to be done before application start. 
```typescript
import *  as purchase from "nativescript-purchase";
purchase.init(["com.sample.purchase.coolproduct1", "com.sample.purchase.coolproduct2"], false);
```
The last boolean parameter is used to distinguish the product type between subscriptions (true) or simple products (false).
To get the actual products with details (like title, price, currency, etc.) you should use:

```typescript
import { Product } from "nativescript-purchase/product";

purchase.getProducts().then((products: Array<Product>) => {
    products.forEach((product: Product) => {
        console.log(product.productIdentifier);
        console.log(product.localizedTitle);
        console.log(product.priceFormatted);
    });
});
```

Before proceeding with buying items you should hook up to the `transactionUpdated` event first. This way you will receive information about the transaction state while it is executing and take necessary action when the transaction completes:
```typescript
import { Transaction, TransactionState } from "nativescript-purchase/transaction";
import * as applicationSettings from "application-settings";

purchase.on(purchase.transactionUpdatedEvent, (transaction: Transaction) => {
    if (transaction.transactionState === TransactionState.Purchased) {
        alert(`Congratulations you just bought ${transaction.productIdentifier}!`);
        console.log(transaction.transactionDate);
        console.log(transaction.transactionIdentifier);
        applicationSettings.setBoolean(transaction.productIdentifier, true);
    }
    else if (transaction.transactionState === TransactionState.Restored) {
        console.log(`Purchase of ${transaction.productIdentifier} restored.`);
        console.log(transaction.transactionDate);
        console.log(transaction.transactionIdentifier);
        console.log(transaction.originalTransaction.transactionDate);
        applicationSettings.setBoolean(transaction.productIdentifier, true);
    }
    else if (transaction.transactionState === TransactionState.Failed) {
        alert(`Purchase of ${transaction.productIdentifier} failed!`);
    }    
});
```

Now lets buy a product!
```typescript
if (purchase.canMakePayments()) {
    // NOTE: 'product' must be the same instance as the one returned from getProducts()
    purchase.buyProduct(product);
}
else {
    alert("Sorry, your account is not eligible to make payments!");
}
```

NOTE: Because of the difference between iOS and Android in terms of consuming purchases - for iOS this is defined
in the product you add in iTunes Connect and it is consumed automatically, where for Android it has to be done manually - 
if you will be supporting Android you will have to manually consume the purchase by calling the `consumePurchase` method. 
The methods takes a single parameter that is the receipt from the transaction:
```typescript
purchase.on(purchase.transactionUpdatedEvent, (transaction: Transaction) => {
    if (transaction.transactionState === TransactionState.Purchased && transaction.productIdentifier.indexOf(".consume") >= 0) {
        purchase.consumePurchase(transaction.transactionReceipt)
            .then((responseCode) => console.log(responseCode)) // If responseCode === 0 the purchase has been successfully consumed
            .catch((e) => console.log(e));
    }    
});
``` 

And to restore previous purchases to the user's device:
```typescript
purchase.restorePurchases();
```

## In-depth Tutorial
1. [Adding the plugin to your application and creating a purchase workflow](https://www.tangrainc.com/blog/2017/02/implementing-app-purchases-nativescript-application-part-1/)
2. [Configuring iTunes Connect and making purchases on iOS](https://www.tangrainc.com/blog/2017/03/implementing-app-purchases-nativescript-application-part-2/)
3. Configuring Google Play Store and making purchases on Android *(COMING SOON!)*
