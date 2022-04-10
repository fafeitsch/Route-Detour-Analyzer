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

@Component({
  selector: 'timetable-editor',
  templateUrl: './timetable-editor.component.html',
  styleUrls: ['./timetable-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimetableEditorComponent implements OnDestroy, AfterViewInit {
  @ViewChild(CdkPortal) portal!: CdkPortal;
  private portalHost!: PortalOutlet;

  @Input() set sideNavOutlet(outlet: HTMLElement | undefined) {
    this._sideNavOutlet = outlet;
    this.ngAfterViewInit();
  }

  private _sideNavOutlet: HTMLElement | undefined;

  constructor(
    private readonly factoryResolver: ComponentFactoryResolver,
    private readonly injector: Injector,
    private readonly appRef: ApplicationRef
  ) {}

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
}
