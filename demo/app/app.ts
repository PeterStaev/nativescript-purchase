import "./bundle-config";

import application = require("application");
import * as purchase from "nativescript-purchase";

purchase.init([
    "com.tangrainc.purchasesample.Product1",
    "com.tangrainc.purchasesample.Product2",
    "com.tangrainc.purchasesample.Sub1",
    "com.tangrainc.purchasesample.Sub2",
    "com.tangrainc.purcahsesample.Seasonal",
]);

application.start({ moduleName: "main-page" });
