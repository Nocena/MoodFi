import {mainnet, PublicClient, testnet} from "@lens-protocol/client";
import {createPublicClient} from "viem";
import {lensTestnet} from "wagmi/chains";
import {http} from "wagmi";

const storage = typeof window !== 'undefined' ? window.localStorage : undefined;
export const viemLensPublicClient = createPublicClient({
    chain: lensTestnet,
    transport: http(lensTestnet.rpcUrls.default.http[0]),
})

export const lensPublicClient = PublicClient.create({
    environment: testnet,
    storage: storage,
});

export const lensPublicMainnetClient = PublicClient.create({
    environment: mainnet,
    storage: storage,
});

export const APP_ADDRESS = import.meta.env.VITE_APP_ADDRESS || '0xc901aD3b1c331d9D5ab9C685D4D34C448dd4F03A'
export const GRAPH_ADDRESS = import.meta.env.VITE_GRAPH_ADDRESS || '0x26a33b3feA154692b33a3024982F4b5E5F1Fe176'
export const FEED_ADDRESS = import.meta.env.VITE_FEED_ADDRESS || '0xD82fAf1259c852CBa6A128DAF2ec5f758F3415Fa'
export const WALLETCONNECT_PROJECT_ID = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || ''

export const NOCX_ADDRESS = '0xff37F413099547A2B237EE04a12cacec6583b4dB'
export const MARKETPLACE_ADDRESS = '0x183731e6308794876086a2e7bd9F1C2DEfa204Dd'