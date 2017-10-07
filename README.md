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

## Configuration
In order your in-app purchases to be recognized by the plugin you must configure those on the Google/iTunes side. You can check the [in-depth tutorials](#in-depth-tutorial) at the bottom of the page to see how to do it step-by-step. 

## API

### Static Properties
* **transactionUpdatedEvent** - *String*  
String value used when hooking to `transactionUpdated` event.

### Static methods
* **init(string[]): void**  
Initializes the plugin for work with the specified in-app purchase identifiers. 

* **getProducts(): Promise<Product[]>**  
Returns the product details *(see below)* for the in-app purchase identifiers that were used in init. 

* **canMakePayments(): boolean**  
Checks whether the current user is allowed to make in-app purchases. 

* **buyProduct(Product, string?): void**  
Buys the given product. On Android you can send custom string data that will be present in the `Transaction`.

* **consumePurchase(string): Promise<number>**  
Consumes the purchases represented by the given transaction token. If the promise returns `0` the consume was successful. Note that this is needed only for Android. For iOS each purchase is automatically consumed when it is set up as a consumabel product in iTunes. 

* **restorePurchases(): void**  
Restores previous purchased items for the current user. 

### Events
* **transactionUpdated**  
Triggered a buy/restore transaction changes its state. You receive a `Transaction` object where you can check the status and other properties  *(see below)* of the transaction. 

### `Product` properties
* **nativeValue**  
The native object representing the product. On iOS this will be an instance of `SKProduct` and on Android this will be a `org.json.JSONObject`

* **productIdentifier** - *string*  
The in-app product identifier as setup on iTunes Connect or Google Store.

* **localizedTitle** - *string*  
The title of the product based on the user's phone localization. 

* **localizedDescription** - *string*  
The description of the product based on the user's phone localization. 

* **priceAmount** - *number*  
The numerical value of the price for this in-app product based on the currency user's app store. 

* **priceFormatted** - *string*  
The formatted `priceAmount` with the corresponding currency symbol of the user's app store. 

* **priceCurrencyCode** - *string*  
The ISO4217 currency code of the price (for example BGN, EUR, USD, etc.)


### `Transaction` properties
* **nativeValue**  
The native value representing the transaction. On iOS this will be an instance of `SKPaymentTransactio` and on Android this will be a `org.json.JSONObject`.

* **transactionState** - *string*  
The state of the transaction. Can be one of the following:
    * Purchased
    * Restored
    * Failed
    * Deferred *(iOS only)*
    * Purchasing *(iOS only)*
    * Refunded *(Android only)*

* **productIdentifier** - *string*  
The in-app product identifier that triggerred this transaction. 

* **transactionIdentifier** - *string*  
The unique identifier of the transaction.

* **transactionDate** - *Date*  
The date of the transaction.

* **transactionReceipt** - *string*  
The Base64 encoded transaction receipt. You can use this to do additional verification on your backend. 

* **originalTransaction** - *Transaction*  
This will be present only when restoring purchases and will contain the original transaction that purchased a given product. 

* **developerPayload** - *string (Android only)*  
Custom data sent with `buyProduct`. 

* **dataSignature** - *string (Android only)*  
The signature for the transaction.

## Usage

First we need to initialize the plugin with a list for product identifier that will be availabel for purchase. This is best to be done before application start. 
```typescript
import *  as purchase from "nativescript-purchase";
purchase.init(["com.sample.purchase.coolproduct1", "com.sample.purchase.coolproduct2"]);
```

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

## Demo
This repository includes a plain NativeScript demo. In order to set it up run the following in your shell:
```shell
$ git clone https://github.com/peterstaev/nativescript-purchase
$ cd nativescript-purchase
$ npm install
$ grunt compile
$ cd demo
```
You will not be able to directly run the demo, becuase you need to add your purchases to the stores. Also since I already registered the application id you will have to change that in the `package.json` file located in the `demo` folder. So make sure you read and follow the [in-depth tutorials](#in-depth-tutorial) below in order to get started with the demo. 

## In-depth Tutorial
1. [Adding the plugin to your application and creating a purchase workflow](https://www.tangrainc.com/blog/2017/02/implementing-app-purchases-nativescript-application-part-1/)
2. [Configuring iTunes Connect and making purchases on iOS](https://www.tangrainc.com/blog/2017/03/implementing-app-purchases-nativescript-application-part-2/)
3. [Configuring Google Play Store and making purchases on Android](https://www.tangrainc.com/blog/2017/06/implementing-app-purchases-nativescript-application-part-3/)

## Donate
`bitcoin:14fjysmpwLvSsAskvLASw6ek5XfhTzskHC`

![Donate](https://www.tangrainc.com/qr.png)
