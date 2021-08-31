require("dotenv").config();
const opensea = require("opensea-js");
const OpenSeaPort = opensea.OpenSeaPort;
const Network = opensea.Network;
const MnemonicWalletSubprovider =
  require("@0x/subproviders").MnemonicWalletSubprovider;
const RPCSubprovider = require("web3-provider-engine/subproviders/rpc");
const Web3ProviderEngine = require("web3-provider-engine");

const MNEMONIC = process.env.MNEMONIC;
const NODE_API_KEY = process.env.INFURA_KEY || process.env.ALCHEMY_KEY;
const isInfura = !!process.env.INFURA_KEY;
const FACTORY_CONTRACT_ADDRESS = process.env.FACTORY_CONTRACT_ADDRESS;
const NFT_CONTRACT_ADDRESS = process.env.NFT_CONTRACT_ADDRESS;
const OWNER_ADDRESS = process.env.OWNER_ADDRESS;
const NETWORK = process.env.NETWORK;
const API_KEY = process.env.API_KEY || ""; // API key is optional but useful if you're doing a high volume of requests.

if (!MNEMONIC || !NODE_API_KEY || !NETWORK || !OWNER_ADDRESS) {
  console.error(
    "Please set a mnemonic, Alchemy/Infura key, owner, network, API key, nft contract, and factory contract address."
  );
  return;
}

if (!FACTORY_CONTRACT_ADDRESS && !NFT_CONTRACT_ADDRESS) {
  console.error("Please either set a factory or NFT contract address.");
  return;
}

const BASE_DERIVATION_PATH = `44'/60'/0'/0`;

const mnemonicWalletSubprovider = new MnemonicWalletSubprovider({
  mnemonic: MNEMONIC,
  baseDerivationPath: BASE_DERIVATION_PATH,
});
const network =
  NETWORK === "mainnet" || NETWORK === "live" ? "mainnet" : "rinkeby";
const infuraRpcSubprovider = new RPCSubprovider({
  rpcUrl: isInfura
    ? "https://" + network + ".infura.io/v3/" + NODE_API_KEY
    : "https://eth-" + network + ".alchemyapi.io/v2/" + NODE_API_KEY,
});

const providerEngine = new Web3ProviderEngine();
providerEngine.addProvider(mnemonicWalletSubprovider);
providerEngine.addProvider(infuraRpcSubprovider);
providerEngine.start();

const seaport = new OpenSeaPort(
  providerEngine,
  {
    networkName:
      NETWORK === "mainnet" || NETWORK === "live"
        ? Network.Main
        : Network.Rinkeby,
    apiKey: API_KEY,
  },
  (arg) => console.log(arg)
);

async function main() {

  let start = 0;
  let assets = [];
  for (let i = 30; i < 8000; i = i + 30) {
    console.log(i);
    const token_ids = [];
    for (let j = start; j < i; j++) {
      token_ids.push(j);
    }
    start = i;
    console.log(token_ids);
    const thirtyAssets = await seaport.api.getAssets({
      limit: 30,
      token_ids,
      asset_contract_address: NFT_CONTRACT_ADDRESS,
    });

    assets = assets.concat(thirtyAssets.assets);
  }

  console.log(assets.length);

  //   const offer = await seaport.createBuyOrder({
  //     asset: {
  //       tokenId,
  //       tokenAddress,
  //     },
  //     accountAddress: OWNER_ADDRESS,
  //     // Value of the offer, in units of the payment token (or wrapped ETH if none is specified):
  //     startAmount: 0.1,
  //   });

  //   const assets = YOUR_ASSETS;
    // const offer = await seaport.createBundleBuyOrder({
    //   assets,
    //   accountAddress: OWNER_ADDRESS,
    //   startAmount: 0.02,
    //   // Optional expiration time for the order, in Unix time (seconds):
    //   expirationTime: Math.round(Date.now() / 1000 + 60 * 60 * 12), // One day from now
    // });
}

main();
