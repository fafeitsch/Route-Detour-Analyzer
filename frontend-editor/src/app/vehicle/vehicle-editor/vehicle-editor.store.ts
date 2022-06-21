/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { LatLng, NotificationService, Task, Vehicle } from '../../shared';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { ActivatedRoute } from '@angular/router';
import { map, switchMap, take, tap } from 'rxjs/operators';
import { VehicleService } from '../../shared/vehicle.service';
import { isDefined } from '../../shared/utils';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

interface State {
  vehicle: Vehicle;
  dirty: boolean;
  lastPosition: LatLng | undefined;
}

@Injectable()
export class VehicleEditorStore extends ComponentStore<State> {
  readonly vehicle$ = super.select((state) => state.vehicle);
  readonly dirty$ = super.select((state) => state.dirty);
  readonly lastPosition$ = super.select((state) => state.lastPosition);

  readonly setVehiclePosition$ = super.updater((state, position: LatLng) => ({
    ...state,
    vehicle: { ...state.vehicle, position },
    dirty: true,
  }));

  readonly addTask$ = super.updater((state, task: Task) => ({
    ...state,
    dirty: true,
    vehicle: { ...state.vehicle, tasks: [...state.vehicle.tasks, task] },
  }));

  readonly deleteTask$ = super.updater((state, index: number) => ({
    ...state,
    dirty: true,
    vehicle: {
      ...state.vehicle,
      tasks: state.vehicle.tasks.filter((_, i) => i !== index),
    },
  }));

  private readonly loadVehicle$ = super.effect(() =>
    this.route.paramMap.pipe(
      map((params) => params.get('vehicle')),
      isDefined(),
      switchMap((key) =>
        this.vehicleService.getVehicle(key).pipe(
          tapResponse(
            (vehicle) => super.patchState({ vehicle }),
            () =>
              this.notificationService.raiseNotification(
                'Could not load vehicle'
              )
          )
        )
      )
    )
  );

  private readonly loadLastPosition = super.effect(() =>
    this.vehicle$.pipe(
      switchMap((vehicle) => {
        if (!vehicle.tasks.length) {
          return of(vehicle.position);
        }
        const lastTask = vehicle.tasks[vehicle.tasks.length - 1];
        if (lastTask.type === 'roaming') {
          return of(lastTask.path![lastTask.path!.length - 1]);
        }
        return of(undefined);
      }),
      tap((lastPosition) => super.patchState({ lastPosition }))
    )
  );

  readonly commit$ = super.effect((trigger$: Observable<void>) =>
    trigger$.pipe(
      switchMap(() => this.vehicle$.pipe(take(1))),
      switchMap((vehicle) =>
        this.vehicleService.saveVehicle(vehicle).pipe(
          tapResponse(
            () => {
              this.notificationService.raiseNotification(
                'Vehicle saved successfully',
                'success'
              );
              super.patchState({ dirty: false });
            },
            () =>
              this.notificationService.raiseNotification(
                'Could not save vehicle.'
              )
          )
        )
      )
    )
  );

  constructor(
    private readonly route: ActivatedRoute,
    private readonly vehicleService: VehicleService,
    private readonly notificationService: NotificationService
  ) {
    super({
      vehicle: { key: '', position: { lng: 0, lat: 0 }, name: '', tasks: [] },
      dirty: false,
      lastPosition: undefined,
    });
  }
}
