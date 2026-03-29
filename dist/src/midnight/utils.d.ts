import 'dotenv/config';
import * as ledger from '@midnight-ntwrk/ledger-v8';
export declare const CONFIG: {
    indexer: string;
    indexerWS: string;
    node: string;
    proofServer: string;
};
export declare function deriveKeys(seed: string): any;
export declare function createWallet(seed: string): Promise<{
    wallet: any;
    shieldedSecretKeys: any;
    dustSecretKey: any;
    unshieldedKeystore: any;
}>;
export declare function signTransactionIntents(tx: {
    intents?: Map<number, any>;
}, signFn: (payload: Uint8Array) => ledger.Signature, proofMarker: 'proof' | 'pre-proof'): void;
export declare function createProviders(walletCtx: Awaited<ReturnType<typeof createWallet>>): Promise<{
    privateStateProvider: any;
    publicDataProvider: any;
    zkConfigProvider: any;
    proofProvider: any;
    walletProvider: {
        getCoinPublicKey: () => any;
        getEncryptionPublicKey: () => any;
        balanceTx(tx: any, ttl?: Date): Promise<any>;
        submitTx: (tx: any) => any;
    };
    midnightProvider: {
        getCoinPublicKey: () => any;
        getEncryptionPublicKey: () => any;
        balanceTx(tx: any, ttl?: Date): Promise<any>;
        submitTx: (tx: any) => any;
    };
}>;
//# sourceMappingURL=utils.d.ts.map