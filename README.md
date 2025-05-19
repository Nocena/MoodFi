# 🌈 MoodFi – A NOCENA SocialFi App for the Lens Spring Hackathon

**MoodFi** is a lightweight SocialFi prototype built for the **Lens Spring Hackathon** by the NOCENA team. It allows users to upload mood-based images, receive AI-powered mood analysis, and **earn rewards in $NOCX**, the native token of the NOCENA ecosystem.

Users can vibe, post, and if their mood content reaches a specific **social score threshold (currently 1 like)**, they can **mint their mood as a Soulbound NFT** – creating a verifiable on-chain memory.

> _"Your mood deserves to be more than just a post – make it a moment on-chain."_ 💫

---

## 🎯 What is MoodFi?

MoodFi is a simplified SocialFi dApp where:

- Users upload **selfie or mood images**
- AI detects the **mood emotion** (e.g., Happy, Sad, Excited)
- Posts are shared on **Lens Protocol**
- If a post gets **1 like or more**, the user can **mint it as a Mood NFT**
- Minted NFTs can be **listed, repriced, and traded** in the built-in **NFT Marketplace**
- Users earn **$NOCX tokens** based on activity and engagement
- **Challenge-to-Earn** mode lets users match the **Daily Mood** to win extra rewards
- An **AI chatbot** interacts with users via **live mood streaming conversations**

This is a **proof-of-concept prototype** that showcases the potential of mood-based social engagement in Web3 using the Lens ecosystem.

---

## 🧩 Features

- 🖼️ **Image-Based Mood Posts** – Users post mood selfies or mood art (image-only for now).
- 🧠 **AI Mood Detection** – Each image is analyzed and tagged with a mood using emotion recognition models.
- 🔗 **Lens Protocol Integration** – Posts are shared directly on Lens and interact with the social graph.
- 🧡 **Mint When Liked** – If your mood post gets at least **1 like**, you can **mint it as a Soulbound Mood NFT**.
- 🎖️ **$NOCX Token Rewards** – Mood posts and mints are tied to the $NOCX token, the native currency of NOCENA.
- 🧬 **Soulbound NFTs** – Minted moods are non-transferable to preserve identity.
- 🛒 **NFT Marketplace** – Users can **list**, **change prices**, and **buy others’ NFTs** in a dedicated in-app marketplace.
- 🎯 **Challenge-to-Earn** – Match your mood with the **Daily Mood Challenge** to earn bonus $NOCX rewards.
- 💬 **AI Mood Stream Chatbot** – Real-time mood interactions via a conversational chatbot that reacts to your emotions.

---

## 💡 Why MoodFi?

This project explores how **emotions, social engagement, and NFTs** can merge into meaningful on-chain identity. It’s a small but powerful step towards **vibe-based economies**, where social validation and self-expression translate into Web3 ownership and rewards.

---

## 🛠️ Tech Stack

- **Frontend**: React, TailwindCSS
- **Blockchain**: Solidity, Lens (Testnet)
- **Lens Integration**: Lens SDK & APIs
- **AI**:
    - Emotion detection using open-source ML models
    - Real-time chat interaction with a mood-aware AI chatbot
- **Token**: `$NOCX` – ERC20 for rewards
- **NFTs**: ERC-721 Soulbound Token standard + Marketplace listing logic
- **Wallets**: MetaMask

---

## 🧪 Smart Contract Summary
🛠️ Smart contracts available on GitHub: [github.com/matijamicunovic629/nocena-contracts](https://github.com/matijamicunovic629/nocena-contracts)

- `NocenaToken.sol`: Main token for development [(View deployed contract on Lens Testnet)](https://explorer.testnet.lens.xyz/address/0xff37F413099547A2B237EE04a12cacec6583b4dB)
- `vesting.sol`: Manages token vesting schedules and distribution [(View deployed contract on Lens Testnet)](https://explorer.testnet.lens.xyz/address/0x63C95E6B23E20De964378bd2B41F96480758b338)
- `MoodNftMarketplace.sol`: Manages Mood Nft Marketplace [(View deployed contract on Lens Testnet)](https://explorer.testnet.lens.xyz/address/0x183731e6308794876086a2e7bd9F1C2DEfa204Dd)
> Contracts are deployed to Lens testnet and verified.

---

## 🛤️ Roadmap

This is a **hackathon prototype** with limited features.
Next steps could include:

- ✅ AI mood score integration
- ✅ Mint after social score threshold
- ✅ NFT Marketplace for buying/selling
- ✅ Challenge-to-Earn mode
- ✅ AI mood chatbot integration
- ⏳ Mood leaderboard & vibe analytics
- ⏳ DAO-based mood voting & quests
- ⏳ Mood Circles (mood-based social groups)
- ⏳ $NOCX staking for advanced features
- ⏳ Multi-language emotion detection

---

## 🙌 Credits

Built by the **NOCENA team** for the **Lens Spring Hackathon**.

- 🔗 [Lens Protocol](https://lens.xyz)
- 🧠 AI Emotion Detection via open-source models
- 🤖 AI Chatbot powered by emotion prompt engineering
- 💎 Powered by `$NOCX`, the NOCENA token

---

## 🙏 Special Thanks

Huge thanks to [bolt.new](https://bolt.new) for their incredible support during the hackathon. Their platform helped us build and deploy our idea easily, enabling us to focus more on innovation and user experience. MoodFi wouldn't be the same without it!


## ⭐️ Support the Vibe

If you like the idea, please **star** the repo and follow us on Lens to stay updated.

```bash
⭐️ github.com/Nocena/MoodFi
