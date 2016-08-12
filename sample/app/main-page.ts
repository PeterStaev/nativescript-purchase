import * as observable from "data/observable";
import * as observableArray from "data/observable-array";
import * as pages from "ui/page";
import * as purchase from "nativescript-purchase";
import { Transaction } from "nativescript-purchase/transaction";
import { Product } from "nativescript-purchase/product";
import * as applicationSettings from "application-settings";
import { ItemEventData } from "ui/list-view";

var viewModel: observable.Observable;

export function pageLoaded(args: observable.EventData) {
    var page = <pages.Page>args.object;
    var items = new observableArray.ObservableArray();

    viewModel = new observable.Observable();

    purchase.on(purchase.transactionUpdatedEvent, (transaction: Transaction) => {
        console.dump(transaction);
        applicationSettings.setBoolean()
    });

    purchase.getProducts()
        .then((res) => viewModel.set("items", res))
        .catch((e) => alert(e));
    
    page.bindingContext = viewModel;
}

export function onProductTap(data: ItemEventData) {
    let product = viewModel.get("items")[data.index] as Product;

    purchase.buyProduct(product);
}

export function onRestoreTap() {
    purchase.restorePurchases();
}