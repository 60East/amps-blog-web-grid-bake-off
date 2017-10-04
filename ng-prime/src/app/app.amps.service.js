"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var core_1 = require("@angular/core");
var AmpsService = (function () {
    function AmpsService() {
    }
    /**
     * This method loads data from AMPS using a dedicated worker.
     *
     * @param [filter] Optional filter value.
     * @returns {Promise<AMPSMessage[]>}
     */
    AmpsService.prototype.getTableData = function (filter) {
        return new Promise(function (resolve, reject) {
            // create a new Worker
            var worker = new Worker('app/amps.worker.js');
            // assigning an event listener to get results from worker
            worker.addEventListener('message', function (e) {
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
            // start the worker
            worker.postMessage(filter);
        });
    };
    return AmpsService;
}());
AmpsService = __decorate([
    core_1.Injectable()
], AmpsService);
exports.AmpsService = AmpsService;
//# sourceMappingURL=app.amps.service.js.map