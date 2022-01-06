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
  Inject,
  Injector,
  OnDestroy,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { CdkPortal, DomPortalOutlet, PortalOutlet } from '@angular/cdk/portal';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'toolbar',
  template: `
    <ng-template cdkPortal>
      <ng-content></ng-content>
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class ToolbarComponent implements AfterViewInit, OnDestroy {
  @ViewChild(CdkPortal) portal!: CdkPortal;

  private portalHost!: PortalOutlet;

  constructor(
    private readonly factoryResolver: ComponentFactoryResolver,
    private readonly injector: Injector,
    private readonly appRef: ApplicationRef,
    @Inject(DOCUMENT) private readonly document: Document
  ) {}

  ngAfterViewInit() {
    if (this.document.querySelector('#application-toolbar') === null) {
      return;
    }
    this.portalHost = new DomPortalOutlet(
      this.document.querySelector('#application-toolbar')!,
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
