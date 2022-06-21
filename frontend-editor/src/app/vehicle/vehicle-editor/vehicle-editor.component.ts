/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  Inject,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { CdkPortal, DomPortalOutlet, PortalOutlet } from '@angular/cdk/portal';
import { DOCUMENT } from '@angular/common';
import { VehicleEditorStore } from './vehicle-editor.store';
import { LatLng, Task } from '../../shared';
import { map } from 'rxjs/operators';

@Component({
  selector: 'vehicle-editor',
  templateUrl: './vehicle-editor.component.html',
  styleUrls: ['./vehicle-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [VehicleEditorStore],
})
export class VehicleEditorComponent implements AfterViewInit, OnDestroy {
  vehicle$ = this.store.vehicle$;
  dirty$ = this.store.dirty$;
  lastPosition$ = this.store.lastPosition$;
  tasks$ = this.vehicle$.pipe(map((vehicle) => vehicle.tasks));

  @ViewChild(CdkPortal) portal!: CdkPortal;
  private portalHost!: PortalOutlet;

  constructor(
    @Inject(DOCUMENT) private readonly document: Document,
    private readonly store: VehicleEditorStore
  ) {}

  ngAfterViewInit(): void {
    if (this.document.querySelector('#vehicle-sidenav') === null) {
      return;
    }
    this.portalHost = new DomPortalOutlet(
      this.document.querySelector('#vehicle-sidenav')!
    );
    this.portalHost.attach(this.portal);
  }

  ngOnDestroy() {
    this.portalHost.detach();
  }

  changePosition(position: LatLng) {
    this.store.setVehiclePosition$(position);
  }

  addTask(task: Task) {
    this.store.addTask$(task);
  }

  deleteTask(index: number) {
    this.store.deleteTask$(index);
  }

  commit() {
    this.store.commit$();
  }
}
