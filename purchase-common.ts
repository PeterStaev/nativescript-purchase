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

let observers: { [eventName: string]: Array<(data: any) => void> } = {};

export const transactionUpdatedEvent = "transactionUpdated";

export function _notify(eventName: string, data: any) {
    if (!observers[eventName]) {
        return;
    }

    observers[eventName].forEach((callback) => { callback(data); });
}

export function on(eventName: string, handler: (data: any) => void) {
    if (!observers[eventName]) {
        observers[eventName] = [];
    }

    observers[eventName].push(handler);
}

export function off(eventName: string, handler?: (data: any) => void) {
    if (!observers[eventName]) {
        return;
    }

    if (!handler) {
        observers[eventName].splice(0);
        return;
    }

    let index = observers[eventName].indexOf(handler);
    if (index !== -1) {
        observers[eventName].splice(index, 1);
    }
}

export function getStoreReceipt(): string {
    return undefined;
}

export function finishTransaction(): Promise<void> {
    return Promise.resolve();
}
