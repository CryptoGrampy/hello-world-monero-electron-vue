const monerojs = require("monero-javascript")
import { BehaviorSubject, Observable, Subject } from 'rxjs'

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



export class Monerod {
    daemon: any

    private readonly stateSubject: Subject<MoneroDaemonState> = new Subject();

    public get state$ (): Observable<MoneroDaemonState> {
        return this.stateSubject.asObservable()
    }
    
    constructor() {}

    async initDaemon() {
        // TODO: Be able to update rpc connection value/update it in reactive way
        this.daemon = await monerojs.connectToDaemonRpc('http://192.168.1.75:18089')

        this.setState()
    }

    setState() {
        setInterval(async () => {
            try {
                const res = await this.daemon.getInfo()

                this.stateSubject.next(res.state)
            } catch (error) {
                console.log('hey', error)
            }
        }, 5000)
    }

    async stopNode() {

    }

    async startNode() {

    }
}