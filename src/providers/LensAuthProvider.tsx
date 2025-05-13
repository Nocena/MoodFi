import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
} from 'react';
import { currentSession } from '@lens-protocol/client/actions';
import type { SessionClient, AuthenticatedSession } from '@lens-protocol/client';
import { signMessage } from '@wagmi/core';
import { lensPublicClient } from '../constants';
import { walletConfig } from './WalletProvider';
import {LensAuthContextType} from "../types";

const LensAuthContext = createContext<LensAuthContextType | undefined>(undefined);

export const LensAuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [client, setClient] = useState<SessionClient | null>(null);
    const [activeSession, setActiveSession] = useState<AuthenticatedSession | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    const restore = useCallback(async () => {
        try {
            const result = await lensPublicClient.resumeSession();
            if (result.isErr()) {
                setClient(null);
                setActiveSession(null);
                setIsLoading(false);
                return;
            }

            const resumedClient = result.value;
            setClient(resumedClient);

            const sessionData = await currentSession(resumedClient);
            if (sessionData.isOk()) {
                setActiveSession(sessionData.value);
            }
        } catch (err) {
            console.error('Restore failed:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const authenticate = useCallback(
        async (
            config: any,
            lensAccount: any,
            appId: string,
            walletAddr: string
        ) => {
            try {
                const response = await lensPublicClient.login({
                    accountOwner: {
                        account: lensAccount.address,
                        app: appId,
                        owner: walletAddr,
                    },
                    signMessage: (message: string) => signMessage(config, { message }),
                });

                if (response.isErr()) {
                    console.warn('Authentication failed:', response.error);
                    return;
                }

                await restore();
            } catch (err) {
                console.error('Unexpected login error:', err);
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
        }
    }, [client]);

    const onboard = useCallback(
        async ({ appId, walletAddr }: { appId: string; walletAddr: string }) => {
            try {
                const response = await lensPublicClient.login({
                    onboardingUser: {
                        app: appId,
                        wallet: walletAddr,
                    },
                    signMessage: (message: string) => signMessage(walletConfig, { message }),
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
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <LensAuthContext.Provider
            value={{
                activeSession,
                client,
                isLoading,
                authenticate,
                disconnect,
                restore,
                onboard,
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
