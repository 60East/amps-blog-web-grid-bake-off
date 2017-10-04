import { Injectable } from '@angular/core';
import { Message } from 'amps';
import * as workerPath from 'file-loader?name=[name].js!./amps.worker';


@Injectable()
export class AmpsService {
    private worker: Worker = null;

    /**
     * This method loads data from AMPS using a dedicated worker.
     *
     * @param [filter] Optional filter value.
     * @returns {Promise<AMPSMessage[]>} 
     */
    getData(
        params: {topic: string, messageType: string, filter?: string, bookmark?: string, orderBy?: string},
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
        this.worker = new Worker(workerPath);

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
}
