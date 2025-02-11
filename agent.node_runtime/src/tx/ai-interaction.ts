// scripts/ai-interaction.ts

import * as dotenv from "dotenv";
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import dotenv from 'dotenv';
import { getObj } from './tx';
dotenv.config();
export const PACKAGE_ID = '0x89343938f268409409fd77fdd2d98d183dc78add9e9945fe7d9aae2930784472';
export const info_ID = "0x0c237adf2568691ddfd5a19b6cfec1a07708ed0c1d7c6543e3da65d117b6f8fe"
export const manager_ID = "0x7ce382d2c69e329dbc165baf6f34c8f3d435d391df643b1850bd70987ee0bdc8"
const client = new SuiClient({ url: getFullnodeUrl('devnet') });
const phase = process.env.PHASE;
const keyPair = Ed25519Keypair.deriveKeypair(phase);

// NFT 的信息结构
interface NFT {
  title: string;
  content: string;
}

const RPC_URL = process.env.SEPOLIA_RPC_URL as string;
const AI_PRIVATE_KEY = process.env.AI_PRIVATE_KEY as string;
const TARVENCOIN_ADDRESS = process.env.TARVENCOIN_ADDRESS as string;
const TARVENNFT_ADDRESS = process.env.TARVENNFT_ADDRESS as string;

const tarvenCoinABI = [
  "function faucet(address recipient, uint256 amount) external"
];

const tarvenNFTABI = [
  "function mintNFT(address recipient, string memory tokenURI) external returns (uint256)"
];

// 初始化 provider、AI 钱包及合约实例
const provider = new ethers.JsonRpcProvider(RPC_URL);
const aiWallet = new ethers.Wallet(AI_PRIVATE_KEY, provider);

const tarvenCoin = new ethers.Contract(TARVENCOIN_ADDRESS, tarvenCoinABI, aiWallet);
const tarvenNFT = new ethers.Contract(TARVENNFT_ADDRESS, tarvenNFTABI, aiWallet);

/**
 * 调用 TarvenCoin 合约的 faucet 函数
 * @param recipient 接收代币的地址
 * @param amount 代币数量（number 类型，通过 ethers.parseUnits 得到 bigint）
 */
async function callFaucet(recipient: string, amount: number, objid: string, tokenData: {title: string, content: string}) {

  try {
    const tx = new Transaction();
    const obj = tx.object(objid);
    const manager = tx.object(manager_ID);
    const info = tx.object(info_ID);
    const svgImage = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400">
    <style>
      .pixel { font-family: 'Press Start 2P', cursive; }
    </style>
    <rect width="100%" height="100%" fill="white"/>
    <text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" fill="black" font-size="24" class="pixel">
      ${tokenData.title}
    </text>
    <text x="50%" y="90%" dominant-baseline="middle" text-anchor="middle" fill="black" font-size="12" class="pixel">
      BeforeLife
    </text>
    </svg>`;
    const base64Svg = Buffer.from(svgImage).toString("base64");
    const imageURI = `data:image/svg+xml;base64,${base64Svg}`;
    tx.moveCall({
      target: `${PACKAGE_ID}::agent::finish_chat`,
      arguments: [manager, obj, tx.pure.u64(amount*10**6), tx.pure.string(imageURI), info],
      typeArguments: [],
    })
    const txHash = await client.signAndExecuteTransaction({ signer: keyPair, transaction: tx });
  } catch (error) {
    console.error("Faucet call failed:", error);
    return {"status": "error", "txHash": ""};
  }
}


/**
 * 调用 TarvenNFT 合约的 mintNFT 函数
 * @param recipient 接收 NFT 的地址
 * @param tokenData NFT 信息（包含标题和内容）
 */
async function callMintNFT(recipient: string, tokenData: NFT): Promise<{
  status: "success" | "error",
  txHash: string
}> {
  // 生成 SVG 图片，该图片将作为 NFT 的图像显示
  const svgImage = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400">
  <style>
    .pixel { font-family: 'Press Start 2P', cursive; }
  </style>
  <rect width="100%" height="100%" fill="white"/>
  <text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" fill="black" font-size="24" class="pixel">
    ${tokenData.title}
  </text>
  <text x="50%" y="90%" dominant-baseline="middle" text-anchor="middle" fill="black" font-size="12" class="pixel">
    BeforeLife
  </text>
  </svg>`;

  const base64Svg = Buffer.from(svgImage).toString("base64");
  const imageURI = `data:image/svg+xml;base64,${base64Svg}`;

  // 构造 NFT 元数据 JSON 对象，加入 image 字段
  const tokenMetadata = JSON.stringify({
    name: tokenData.title,
    description: tokenData.content,
    image: imageURI,
  });

  let txMintNFT;

  try {
    console.log(`Calling mintNFT: mint NFT to ${recipient} with tokenURI metadata...`);
    txMintNFT = await tarvenNFT.mintNFT(recipient, tokenMetadata);
    console.log("Waiting for mintNFT tx to be mined...");
    const receipt = await txMintNFT.wait();
    console.log("mintNFT call successful, tx hash:", txMintNFT.hash);
  } catch (error) {
    console.error("mintNFT call failed:", error);
    return {"status": "error", "txHash": ""};
  }

  return {"status": "success", "txHash": txMintNFT.hash};
}

async function main() {
  console.log("AI Wallet address:", await aiWallet.getAddress());

  // recipient 地址
  const recipient = "0x3a181F605bB12B792a59a6ba132de5B1085B57c8";

  // 示例 1：调用 faucet，铸造 100 个代币（假设代币为 18 位小数）
  await callFaucet(recipient, 100);

  // 示例 2：调用 mintNFT，传入 NFT 信息（title 和 content）
  const nftContent: NFT = {
    title: "Test NFT",
    content: "这里是一段测试文本，作为 NFT 的内容。"
  };
  await callMintNFT(recipient, nftContent);
}

// main()
//   .then(() => process.exit(0))
//   .catch((error) => {
//     console.error("Error in execution:", error);
//     process.exit(1);
//   });

export {
  callFaucet,
  callMintNFT
}
