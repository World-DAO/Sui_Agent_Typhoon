import express, { Request, Response } from "express";

import * as agent from './experimental'
import * as tx from './tx/ai-interaction'
// import { testStoreData } from './nillion_vault'
process.stdin.destroy();

// Create a new express application instance
const app = express();
app.use(express.json());

// Set the network port
const port = 8090;

// Define the root path with a greeting message
app.get("/api/ping", (req: Request, res: Response) => {
    res.json({ message: "hello world!" });
});

app.post("/api/tx/faucet", async (req: Request, res: Response) => { // ✅ 加上 `async`
    try {
        let wallet = req.body.wallet;
        let amount = req.body.amount;
        let objid = req.body.objid;
        let tokenData = req.body.tokenData;

        const ret = await tx.callFaucet(wallet, amount, objid, tokenData);  // ✅ 这里就可以用 `await` 了
        if (ret.status === "success" ) {
            res.json({ message: "success", txHash: ret.txHash});
        } else {
            res.status(500).json({ error: "Internal Server Error" });
        }
    } catch (error) {
        console.error("Faucet transaction failed:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Start the Express server
app.listen(port, () => {
    console.log(`The server is running at http://0.0.0.0:${port}`);
});