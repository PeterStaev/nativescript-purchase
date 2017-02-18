import application = require("application");
import * as purchase from "nativescript-purchase";

application.mainModule = "main-page";

// Remove this in the AppBuilder templates
application.cssFile = "./app.css";

purchase.init([
    "com.tangrainc.purchasesample.Product1",
    "com.tangrainc.purchasesample.Product2"
]);

application.start();
