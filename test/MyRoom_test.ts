import assert from "assert";
import { ColyseusTestServer, boot } from "@colyseus/testing";

// import your "app.config.ts" file here.
import appConfig from "../src/app.config";
import { TavernState } from "../src/rooms/TavernRoom";
import { resolve } from "path";
import { expect } from 'chai';
import { Client } from 'colyseus.js';
import { ethers } from "ethers";
import { Reply } from "../src/database/storyDB";

describe("testing your Colyseus app", () => {
  let colyseus: ColyseusTestServer;

  before(async () => colyseus = await boot(appConfig));
  after(async () => colyseus.shutdown());

  beforeEach(async () => await colyseus.cleanup());

});
