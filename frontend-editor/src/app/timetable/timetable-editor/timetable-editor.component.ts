/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import {
  AfterViewInit,
  ApplicationRef,
  ChangeDetectionStrategy,
  Component,
  ComponentFactoryResolver,
  Injector,
  Input,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { CdkPortal, DomPortalOutlet, PortalOutlet } from '@angular/cdk/portal';
import { TimetableEditorStore, TourScaffold } from './timetable-editor.store';
import { ArrivalDeparture, Tour } from '../../shared';
import { TimetableStore } from '../timetable.store';

@Component({
  selector: 'timetable-editor',
  templateUrl: './timetable-editor.component.html',
  styleUrls: ['./timetable-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TimetableEditorStore],
})
export class TimetableEditorComponent implements OnDestroy, AfterViewInit {
  @ViewChild(CdkPortal) portal!: CdkPortal;
  private portalHost!: PortalOutlet;

  stations$ = this.store.stations$;
  tours$ = this.store.tours$;
  line$ = this.store.line$;
  selectedTourIndex: number | undefined = undefined;
  selectedTour: Tour | undefined = undefined;
  clean$ = this.store.clean$;

  @Input() set sideNavOutlet(outlet: HTMLElement | undefined) {
    this._sideNavOutlet = outlet;
    this.ngAfterViewInit();
  }

  private _sideNavOutlet: HTMLElement | undefined;

  constructor(
    private readonly factoryResolver: ComponentFactoryResolver,
    private readonly injector: Injector,
    private readonly appRef: ApplicationRef,
    private readonly store: TimetableEditorStore,
    private readonly routeStore: TimetableStore
  ) {
    this.store.setLine$(routeStore.line$);
  }

  ngAfterViewInit(): void {
    if (!this._sideNavOutlet || !this.portal) {
      return;
    }
    this.portalHost = new DomPortalOutlet(
      this._sideNavOutlet,
      this.factoryResolver,
      this.appRef,
      this.injector
    );
    this.portalHost.attach(this.portal);
  }

  ngOnDestroy() {
    this.portalHost.detach();
  }

  trackByUuid(index: number, tour: Tour & { uuid: string }) {
    return tour.uuid;
  }

  selectTour(tour: Tour, index: number) {
    this.selectedTourIndex =
      this.selectedTourIndex === index ? undefined : index;
    this.selectedTour = this.selectedTourIndex === undefined ? undefined : tour;
  }

  commit() {
    this.store.commit$();
  }

  deleteTour() {
    if (this.selectedTourIndex === undefined) {
      return;
    }
    this.store.deleteTour$(this.selectedTourIndex);
    this.selectedTourIndex = undefined;
    this.selectedTour = undefined;
  }

  editTour(tour: TourScaffold) {
    if (!this.selectedTour) {
      this.store.addTour$(tour);
    } else if (this.selectedTourIndex !== undefined) {
      this.store.modifyTour$({ scaffold: tour, index: this.selectedTourIndex });
      this.selectedTourIndex = undefined;
      this.selectedTour = undefined;
    }
  }

  modifyTime(
    index: number,
    eventIndex: number,
    changedEvent: ArrivalDeparture
  ) {
    this.store.modifyTime$({ index, eventIndex, changedEvent });
  }
}
