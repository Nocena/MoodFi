import {mainnet, PublicClient, testnet} from "@lens-protocol/client";
import {createThirdwebClient, defineChain} from "thirdweb";

const storage = typeof window !== 'undefined' ? window.localStorage : undefined;
export const thirdwebLensTestnet = defineChain({
    id: 37111,
    rpc: "https://rpc.testnet.lens.dev",
});

export const lensPublicClient = PublicClient.create({
    environment: testnet,
    storage: storage,
});

export const lensPublicMainnetClient = PublicClient.create({
    environment: mainnet,
    storage: storage,
});

export const WALLETCONNECT_PROJECT_ID = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || ''
export const THIRDWEB_CLIENT_ID = import.meta.env.VITE_THIRDWEB_CLIENT_ID || ''
export const THIRDWEB_SECRET_KEY = import.meta.env.VITE_THIRDWEB_SECRET_KEY || ''

export const thirdwebClient = createThirdwebClient({
    clientId: THIRDWEB_CLIENT_ID,
});

export const thirdwebClientServer = createThirdwebClient({
    secretKey: THIRDWEB_SECRET_KEY,
    clientId: THIRDWEB_CLIENT_ID,
});
