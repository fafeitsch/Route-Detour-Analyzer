/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { VehicleStore } from './vehicle.store';
import { Vehicle } from '../shared';

@Component({
  selector: 'vehicle',
  templateUrl: './vehicle.component.html',
  styleUrls: ['./vehicle.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'd-flex h-100 overflow-auto' },
  providers: [VehicleStore],
})
export class VehicleComponent {
  vehicles$ = this.store.vehicles$;

  constructor(readonly store: VehicleStore) {}

  createVehicle() {
    this.store.createVehicle$();
  }

  deleteVehicle(key: string) {
    this.store.deleteVehicle$(key);
  }

  changeVehicleName(vehicle: Vehicle) {
    this.store.saveVehicle$(vehicle);
  }
}
