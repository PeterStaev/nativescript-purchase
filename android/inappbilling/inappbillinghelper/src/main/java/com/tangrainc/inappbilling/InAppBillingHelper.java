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

package com.tangrainc.inappbilling;

import android.app.Activity;
import android.app.PendingIntent;
import android.os.IBinder;
import android.os.Bundle;

import android.content.ComponentName;
import android.content.ServiceConnection;
import android.content.Intent;
import android.content.Context;
import android.os.RemoteException;
import android.util.Log;

import com.android.vending.billing.IInAppBillingService;
import com.google.common.util.concurrent.*;

import org.json.*;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.concurrent.Callable;
import java.util.concurrent.Executors;

public class InAppBillingHelper {

    private static final String TAG = "InAppBillingHelper";
    public static final int BUY_INTENT_REQUEST_CODE = 4590;

    private IInAppBillingService _service;
    private ListeningExecutorService _executor;
    private String[] _productIdentifiers;
    private Context _context;
    private String productType;

    public InAppBillingHelper(Context context, String[] productIdentifiers, boolean subs) {
        _executor = MoreExecutors.listeningDecorator(Executors.newSingleThreadExecutor());
        _productIdentifiers = productIdentifiers;
        _context = context;
        productType = subs ? "subs" : "inapp";
        ServiceConnection _serviceConn = new ServiceConnection() {
            @Override
            public void onServiceDisconnected(ComponentName name) {
                Log.d(TAG, "Billing Service disconnected.");
                _service = null;
            }

            @Override
            public void onServiceConnected(ComponentName name, IBinder service) {
                Log.d(TAG, "Billing Service connected.");
                _service = IInAppBillingService.Stub.asInterface(service);
            }
        };

        Intent serviceIntent = new Intent("com.android.vending.billing.InAppBillingService.BIND");
        serviceIntent.setPackage("com.android.vending");
        _context.bindService(serviceIntent, _serviceConn, Context.BIND_AUTO_CREATE);
    }

    public ListenableFuture<JSONObject[]> getProducts() {
        return _executor.submit(new Callable<JSONObject[]>() {
            @Override
            public JSONObject[] call() throws Exception {
                // Wait for the service to be initialized (if call too soon after constructor)
                int loop = 0;
                while (_service == null || loop < 20) {
                    Thread.sleep(500);
                    loop++;
                }
                if (_service == null) {
                    throw new Exception("Billing service could not be connected for 10 secs! May be running on an emulator w/o Google Service?");
                }
                Bundle queryProducts = new Bundle();
                queryProducts.putStringArrayList("ITEM_ID_LIST", new ArrayList< >(Arrays.asList(_productIdentifiers)));

                Bundle productDetails = _service.getSkuDetails(3, _context.getPackageName(), productType, queryProducts);
                ArrayList<JSONObject> result = new ArrayList< >();

                int response = productDetails.getInt("RESPONSE_CODE");
                if (response == 0) {
                    ArrayList<String> responseList = productDetails.getStringArrayList("DETAILS_LIST");

                    for (String thisResponse : responseList) {
                        result.add(new JSONObject(thisResponse));
                    }

                    return result.toArray(new JSONObject[0]);
                }
                else {
                    throw new Exception("Response from service: " + response);
                }
            }
        });
    }

    public void startBuyIntent(Activity foregroundActivity, String productIdentifier, String payload) throws Exception {
        Bundle buyIntentBundle = _service.getBuyIntent(3, _context.getPackageName(), productIdentifier, productType, payload);
        PendingIntent pendingIntent = buyIntentBundle.getParcelable("BUY_INTENT");

        if (pendingIntent == null) {
            throw new Exception("Product already purchased!");
        }

        foregroundActivity.startIntentSenderForResult(pendingIntent.getIntentSender(), BUY_INTENT_REQUEST_CODE, new Intent(), 0, 0, 0);
    }

    public ListenableFuture<Integer> consumePurchase(final String token) {
        return _executor.submit(new Callable<Integer>() {
            @Override
            public Integer call() throws Exception {
                // Wait for the service to be initialized (if call too soon after constructor)
                int loop = 0;
                while (_service == null || loop < 20) {
                    Thread.sleep(500);
                    loop++;
                }
                if (_service == null) {
                    throw new Exception("Billing service could not be connected for 10 secs! May be running on an emulator w/o Google Service?");
                }

                return _service.consumePurchase(3, _context.getPackageName(), token);
            }
        });
    }

    public ListenableFuture<JSONObject[]> getPurchases() {
        return this.getPurchases(null);
    }

    public ListenableFuture<JSONObject[]> getPurchases(final String continuationToken) {
        return _executor.submit(new Callable<JSONObject[]>() {
            @Override
            public JSONObject[] call() throws Exception {
                Log.d(TAG, "Getting Purchases...");

                ArrayList<JSONObject> result = new ArrayList< >();
                Bundle ownedItems = _service.getPurchases(3, _context.getPackageName(), productType, continuationToken);
                int response = ownedItems.getInt("RESPONSE_CODE");

                if (response == 0) {
                    ArrayList<String> purchaseDataList = ownedItems.getStringArrayList("INAPP_PURCHASE_DATA_LIST");
                    ArrayList<String> signatureList = ownedItems.getStringArrayList("INAPP_DATA_SIGNATURE_LIST");
                    String newContinuationToken = ownedItems.getString("INAPP_CONTINUATION_TOKEN");

                    for (int i = 0; i < purchaseDataList.size(); i++) {
                        String purchaseData = purchaseDataList.get(i);
                        String signature = signatureList.get(i);
                        JSONObject resultItem = new JSONObject(purchaseData);

                        resultItem.put("signature", signature);
                        result.add(resultItem);
                    }

                    if (newContinuationToken != null) {
                        result.addAll(Arrays.asList(getPurchases(newContinuationToken).get()));
                    }
                }
                else {
                    throw new Exception("Response from service: " + response);
                }

                return result.toArray(new JSONObject[0]);
            }
        });
    }
}