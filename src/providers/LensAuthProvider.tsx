import React, {createContext, useCallback, useContext, useEffect, useState,} from 'react';
import {currentSession} from '@lens-protocol/client/actions';
import type {AuthenticatedSession, SessionClient} from '@lens-protocol/client';
import {signMessage} from '@wagmi/core';
import {APP_ADDRESS, lensPublicClient} from '../constants';
import {walletConfig} from './WalletProvider';
import {AccountType, LensAuthContextType} from "../types";
import {useAccount} from "wagmi";
import {getLastLoggedInAccount} from "../utils/lens.utils.ts";

const LensAuthContext = createContext<LensAuthContextType | undefined>(undefined);

export const LensAuthProvider = ({children}: { children: React.ReactNode }) => {
    const {
        address: walletAddress,
    } = useAccount()
    const [client, setClient] = useState<SessionClient | null>(null);
    const [activeSession, setActiveSession] = useState<AuthenticatedSession | null>(null);
    const [currentAccount, setCurrentAccount] = useState<AccountType | null>(null);
    const [isAuthenticating, setIsAuthenticating] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const restore = useCallback(async () => {
        try {
            const result = await lensPublicClient.resumeSession();
            if (result.isErr()) {
                setClient(null);
                setActiveSession(null);
                setIsAuthenticating(false);
                setCurrentAccount(null);
                return;
            }

            const resumedClient = result.value;
            setClient(resumedClient);

            const sessionData = await currentSession(resumedClient);
            if (sessionData.isOk()) {
                setActiveSession(sessionData.value);
            }

            if (walletAddress) {
                setCurrentAccount(await getLastLoggedInAccount(walletAddress))
            }
        } catch (err) {
            console.error('Restore failed:', err);
        } finally {
            setIsAuthenticating(false);
        }
    }, [walletAddress]);

    const authenticate = useCallback(
        async (
            lensAccountAddress: string,
            walletAddr: string
        ) => {
            try {
                setIsAuthenticating(true)
                const response = await lensPublicClient.login({
                    accountOwner: {
                        account: lensAccountAddress,
                        app: APP_ADDRESS,
                        owner: walletAddr,
                    },
                    signMessage: (message: string) => signMessage(walletConfig, {message}),
                });

                if (response.isErr()) {
                    console.warn('Authentication failed:', response.error);
                    setIsAuthenticating(false)
                    return;
                }

                await restore();
            } catch (err) {
                console.error('Unexpected login error:', err);
                setIsAuthenticating(false)
            }
        },
        [restore]
    );

    const disconnect = useCallback(async () => {
        try {
            if (client) {
                await client.logout();
            } else {
                const result = await lensPublicClient.resumeSession();
                if (result.isOk()) {
                    await result.value.logout();
                }
            }
        } catch (err) {
            console.error('Logout failed:', err);
        } finally {
            setClient(null);
            setActiveSession(null);
            setCurrentAccount(null)
        }
    }, [client]);

    const onboard = useCallback(
        async (walletAddr: string) => {
            try {
                const response = await lensPublicClient.login({
                    onboardingUser: {
                        app: APP_ADDRESS,
                        wallet: walletAddr,
                    },
                    signMessage: (message: string) => signMessage(walletConfig, {message}),
                });

                if (response.isErr()) {
                    console.warn('Onboarding login failed:', response.error);
                    return;
                }

                const newClient = response.value;
                setClient(newClient);

                const sessionData = await currentSession(newClient);
                if (sessionData.isOk()) {
                    setActiveSession(sessionData.value);
                }
            } catch (err) {
                console.error('Onboarding error:', err);
            }
        },
        []
    );

    useEffect(() => {
        restore();
    }, [restore]);

    useEffect(() => {
        setIsAuthenticated(!!activeSession);
    }, [activeSession])

    return (
        <LensAuthContext.Provider
            value={{
                isAuthenticated,
                activeSession,
                client,
                isAuthenticating,
                authenticate,
                disconnect,
                restore,
                onboard,
                currentAccount,
            }}
        >
            {children}
        </LensAuthContext.Provider>
    );
};

export const useLensAuth = (): LensAuthContextType => {
    const context = useContext(LensAuthContext);
    if (!context) {
        throw new Error('useLensAuth must be used within a LensAuthProvider');
    }
    return context;
};
