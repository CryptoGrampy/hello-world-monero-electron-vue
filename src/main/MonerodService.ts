const monerojs = require("monero-javascript")
import { dialog } from 'electron'
import { from, Observable, of, map, pipe, Subject, timer, concatMapTo, interval, Subscription } from 'rxjs'
import ElectronStore from "electron-store";


// Return object from monero-javascript getInfo().state
export interface MoneroDaemonState {
    adjustedTimestamp: number,
    numAltBlocks: number,
    blockSizeLimit: number,
    blockSizeMedian: number,
    blockWeightLimit: number,
    blockWeightMedian: number,
    isBusySyncing: boolean,
    databaseSize: number,
    freeSpace: any,
    numOfflinePeers: number,
    height: number,
    heightWithoutBootstrap: number,
    numIncomingConnections: number,
    networkType: number,
    isOffline: boolean,
    numOutgoingConnections: number,
    numRpcConnections: number,
    startTimestamp: number,
    isSynchronized: boolean,
    target: number,
    targetHeight: number,
    topBlockHash: string,
    numTxs: number,
    numTxsPool: number,
    updateAvailable: boolean,
    version: string,
    wasBootstrapEverUsed: boolean,
    numOnlinePeers: number,
    cumulativeDifficulty: any,
    difficulty: any
}

// Store user's Monerod settings via electron-store
interface MonerodStore {
    monerodStore: {
        filepath?: string
        monerodFilepath?: boolean
        monerodConfig?: string[]
    }
}

// TODO: Add linter/organize/review public private methods in class
export class MonerodService {
    private readonly store = new ElectronStore<MonerodStore>()
    private readonly monerodLatestDataSubject: Subject<MoneroDaemonState> = new Subject();
    public daemon: any
    private getDaemonInfoRequest$?: Subscription
    private getInfoInterval?: NodeJS.Timer

    // TODO Monerod startup stuff - config should be user editable and get saved to store
    private readonly config = [
        this.getMonerodFilepath(),
        "--no-igd",
        "--rpc-bind-port", "18089",
        "--rpc-bind-ip", "0.0.0.0",
        "--confirm-external-bind",
        "--prune-blockchain"
    ];

    public get monerodLatestData$(): Observable<MoneroDaemonState> {
        return this.monerodLatestDataSubject.asObservable()
    }

    public async startDaemon() {
        /**
         * TODO: Make this work if no connex available
         * TODO: Restart daemon when config changes (subscribe to config changes with rxjs) 
         * 
         * Running Daemon locally with monero-javascript- this was recently added
         * https://github.com/monero-ecosystem/monero-javascript/blob/fcc00324538975817d4524b9a337e95a9b68f441/src/test/TestMoneroDaemonRpc.js#L58
         */
        // 

        try {
            console.log('Starting Daemon')
            this.daemon = await monerojs.connectToDaemonRpc(this.config);

            console.log('Daemon connected', await this.daemon.isConnected())

            if (await this.daemon.isConnected()) {
                // Start polling monerod for data
                this.getDaemonInfo()
            }

        } catch (err) {
            console.log('start daemon error', err)
        }
    }

    private async getDaemonInfo() {
        // Using rxjs here to allow for unsubscribing / canceling outstanding requests before stopping Daemon
        // TODO: replace TS any type
        // TODO: FIXME
        // this.getDaemonInfoRequest$ = timer(0, 10000).pipe(concatMapTo(from(this.daemon.getInfo()))).subscribe((data: any) => {
        //     console.log(data.state.numTxsPool)
        //     this.monerodLatestDataSubject.next(data.state as MoneroDaemonState)
        // })

        this.getInfoInterval = setInterval(async () => {
            const data = await this.daemon.getInfo()
            this.monerodLatestDataSubject.next(data.state as MoneroDaemonState)
        }, 10000)
    }

    public async stopDaemon() {
        // TODO: Move stop tasks to a cleanup method?
        // this.getDaemonInfoRequest$?.unsubscribe()

        if (this.getInfoInterval) {
            clearInterval(this.getInfoInterval)
        }

        try {
            console.log('stopping daemon')
            await this.daemon.stopProcess()
        } catch (err) {
            console.log('stop daemon error', err)
        }
    }

    public async restartDaemon() {
        // TODO: Add Restart
    }

    public async update(path?: string) {
        // TODO: Does this actually work?
        await this.daemon.downloadUpdate(path)
    }

    // Generates ElectronJS prompt to ask user to specify monerod file location
    public async askMonerodFilePath() {
        const filePath = await dialog.showOpenDialog({ properties: ['openFile'], message: 'Please find and select your Monerod file', title: 'Please find and select your Monerod file' })

        if (!filePath.canceled) {
            this.store.set('monerodStore.monerodFilepath', String(filePath.filePaths[0]))
        }
    }

    // Retrieves filepath from electron-store
    public getMonerodFilepath(): string {
        return this.store.get('monerodStore.monerodFilepath')
    }

    // Util method
    public calcSyncPercentage(height: number, targetHeight: number): number {
        if (targetHeight > height) {
            return Number(((height / targetHeight) * 100).toFixed(1))
        }
        return 100;
    }
}

