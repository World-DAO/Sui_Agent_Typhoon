/**
 * IMPORTANT:
 * ---------
 * Do not manually edit this file if you'd like to host your server on Colyseus Cloud
 *
 * If you're self-hosting (without Colyseus Cloud), you can manually
 * instantiate a Colyseus Server as documented here:
 *
 * See: https://docs.colyseus.io/server/api/#constructor-options
 */
import { listen } from "@colyseus/tools";

// Import Colyseus config
import app from "./app.config";

import express from "express";
import routes from "./routes/routes";
import cors from "cors";

const app_ = express();
app_.use(express.json());
app_.use(cors());

// ✅ 挂载 API 路由
app_.use("/api", routes);

// ✅ 监听 3000 端口
const PORT = process.env.PORT || 3000;
app_.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});

// Create and listen on 2567 (or PORT environment variable.)
listen(app);