import * as settings from './constants.js';
import { Message } from 'amps';


export interface QueryOptions {
    topic: string;
    messageType: string;
    filter?: string;
    topN?: string;
    orderBy?: string;
}


/**
 * This class encapsulates the AMPS JavaScript API
 */
export class AMPSQuery {
    private worker: Worker = null;

    /**
     * This method loads data from AMPS using a dedicated worker.
     *
     * @param [filter] Optional filter value.
     * @returns {Promise<AMPSMessage[]>} 
     */
    getData(
        params: QueryOptions,
        onSow: (message: Message[]) => void,
        onNew: (message: Message) => void,
        onUpdate: (message: Message) => void,
        onDelete: (message: Message) => void,
        onError: (err: Error) => void
    ): void {
        if (this.worker !== null) {
            // destroy previous worker
            this.worker.terminate();
            this.worker = null;
        }
        
        // create a new Worker
        this.worker = new Worker('js/query_worker.js');

        // assigning an event listener to get results from worker
        this.worker.addEventListener('message', (e: MessageEvent) => {
            if (e.data.error) {
                onError(e.data.error);
            }
            else if (e.data.sow) {
                onSow(e.data.sow);
            }
            else if (e.data.p) {
                onNew(e.data.p);
            }
            else if (e.data.u) {
                onUpdate(e.data.u);
            }
            else if (e.data.oof) {
                onDelete(e.data.oof);
            }
        });

        // start the worker
        this.worker.postMessage(params);
    }

    stop(): void {
        if (this.worker !== null) {
            // destroy previous worker
            this.worker.terminate();
            this.worker = null;
        }
    }
}

