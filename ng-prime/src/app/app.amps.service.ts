import { inject, Injectable, NgZone } from '@angular/core';
import { AMPSMessage } from './amps-message';


@Injectable()
export class AmpsService {
    private readonly ngZone = inject(NgZone);

    /**
     * This method loads data from AMPS using a dedicated worker.
     *
     * @param [filter] Optional filter value.
     * @returns {Promise<AMPSMessage[]>} 
     */
    getTableData(filter?: string): Promise<AMPSMessage[]> {
        return new Promise((resolve, reject) => {
            // create a new Worker
            const worker = new Worker('app/amps.worker.js');

            // assigning an event listener to get results from worker
            worker.addEventListener('message', (e: MessageEvent) => {
                this.ngZone.run(() => {
                    // worker has finished
                    if (e.data.success) {
                        resolve(e.data.data);
                    } else {
                        reject(e.data.error);
                    }

                    // destroy the worker
                    worker.terminate();
                });
            });

            worker.addEventListener('error', (e: ErrorEvent) => {
                this.ngZone.run(() => reject(e.message));
                worker.terminate();
            });

            // start the worker
            worker.postMessage({filter});
        });
    }
}
