import "./bundle-config";

import application = require("application");
import * as purchase from "nativescript-purchase";

purchase.init([
    "com.tangrainc.purchasesample.Product1",
    "com.tangrainc.purchasesample.Product2"
]);

application.start({ moduleName: "main-page" });
