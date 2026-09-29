var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { inject, Injectable, NgZone } from '@angular/core';
let AmpsService = class AmpsService {
    ngZone = inject(NgZone);
    /**
     * This method loads data from AMPS using a dedicated worker.
     *
     * @param [filter] Optional filter value.
     * @returns {Promise<AMPSMessage[]>}
     */
    getTableData(filter) {
        return new Promise((resolve, reject) => {
            // create a new Worker
            const worker = new Worker('app/amps.worker.js');
            // assigning an event listener to get results from worker
            worker.addEventListener('message', (e) => {
                this.ngZone.run(() => {
                    // worker has finished
                    if (e.data.success) {
                        resolve(e.data.data);
                    }
                    else {
                        reject(e.data.error);
                    }
                    // destroy the worker
                    worker.terminate();
                });
            });
            worker.addEventListener('error', (e) => {
                this.ngZone.run(() => reject(e.message));
                worker.terminate();
            });
            // start the worker
            worker.postMessage({ filter });
        });
    }
};
AmpsService = __decorate([
    Injectable()
], AmpsService);
export { AmpsService };
//# sourceMappingURL=app.amps.service.js.map