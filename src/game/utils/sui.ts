import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
 
// use getFullnodeUrl to define Devnet RPC location
const rpcUrl = getFullnodeUrl('testnet');
const suiClient = new SuiClient({ url: rpcUrl });

export const getSuiBalance = async (address: string) => {
  const balance = await suiClient.call("suix_getBalance", [address]);
  return (balance as any).totalBalance/10**9;
};

