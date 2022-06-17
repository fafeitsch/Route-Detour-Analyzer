/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { Injectable } from '@angular/core';
import { RpcClientService } from './rpc-client.service';
import { Vehicle } from './types';

@Injectable({
  providedIn: 'root',
})
export class VehicleService {
  constructor(private rpc: RpcClientService) {}

  getVehicles() {
    return this.rpc.request<Vehicle[]>('vehicles', 'getVehicles');
  }

  getVehicle(key: string) {
    return this.rpc.request<Vehicle>('vehicles', 'getVehicle', { key });
  }

  saveVehicleMetadata(vehicle: Partial<Vehicle>) {
    return this.rpc.request<Vehicle>(
      'vehicles',
      'saveVehicleMetadata',
      vehicle
    );
  }

  saveVehicle(vehicle: Partial<Vehicle>) {
    return this.rpc.request<Vehicle>('vehicles', 'saveVehicle', vehicle);
  }

  deleteVehicle(key: string) {
    return this.rpc.request<void>('vehicles', 'deleteVehicle', { key });
  }
}
