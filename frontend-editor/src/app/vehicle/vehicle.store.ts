/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { NotificationService, Vehicle } from '../shared';
import { Injectable } from '@angular/core';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { VehicleService } from '../shared/vehicle.service';
import { Observable } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { PropertiesService } from '../shared/properties.service';

interface State {
  vehicles: Vehicle[];
}

@Injectable()
export class VehicleStore extends ComponentStore<State> {
  readonly vehicles$ = super.select((state) => state.vehicles);

  readonly loadVehicles$ = super.effect(() =>
    this.service.getVehicles().pipe(
      tapResponse(
        (vehicles) => this.patchState({ vehicles }),
        () =>
          this.notificationService.raiseNotification(
            'Could not load vehicles.',
            'error'
          )
      )
    )
  );

  readonly saveVehicle$ = super.effect((vehicle$: Observable<Vehicle>) =>
    vehicle$.pipe(
      switchMap((vehicle) =>
        this.service.saveVehicleMetadata(vehicle).pipe(
          tapResponse(
            (got) => {
              this.notificationService.raiseNotification(
                'Vehicle updated successfully.',
                'success'
              );
              super.patchState((state) => ({
                vehicles: state.vehicles.map((v) =>
                  v.key === got.key ? got : v
                ),
              }));
            },
            () =>
              this.notificationService.raiseNotification(
                'Could not save vehicle.',
                'error'
              )
          )
        )
      )
    )
  );

  readonly createVehicle$ = super.effect((trigger$: Observable<void>) =>
    trigger$.pipe(
      switchMap(() => this.propertiesService.getCenter().pipe(take(1))),
      switchMap((position) =>
        this.service.saveVehicle({ position }).pipe(
          tapResponse(
            (vehicle) => {
              this.notificationService.raiseNotification(
                'Vehicle created.',
                'success'
              );
              super.patchState((state) => ({
                vehicles: [...state.vehicles, vehicle],
              }));
            },
            () =>
              this.notificationService.raiseNotification(
                'Vehicle could not be created.',
                'error'
              )
          )
        )
      )
    )
  );

  readonly deleteVehicle$ = super.effect((key$: Observable<string>) =>
    key$.pipe(
      switchMap((key) =>
        this.service.deleteVehicle(key).pipe(
          tapResponse(
            () => {
              this.notificationService.raiseNotification(
                'Vehicle deleted',
                'success'
              );
              super.patchState((state) => ({
                vehicles: state.vehicles.filter((v) => v.key !== key),
              }));
            },
            () =>
              this.notificationService.raiseNotification(
                'Vehicle could not be deleted.',
                'error'
              )
          )
        )
      )
    )
  );

  constructor(
    private readonly service: VehicleService,
    private readonly notificationService: NotificationService,
    private readonly propertiesService: PropertiesService
  ) {
    super({ vehicles: [] });
  }
}
