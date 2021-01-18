/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT). Find the full license text in the LICENSE file of the project root.
 */
import {AfterViewInit, ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import * as L from 'leaflet';
import {select, Store} from '@ngrx/store';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapComponent implements AfterViewInit {

  private destroy$ = new Subject<boolean>();
  private map: any;
  private tileLayer: any;

  constructor(private readonly globalStore: Store<{ tileServer: string }>) {
  }

  ngAfterViewInit(): void {
    this.initMap();
    this.globalStore.pipe(select('tileServer'), takeUntil(this.destroy$)).subscribe(
      url => {
        if (this.tileLayer) {
          this.map.removeLayer(this.tileLayer);
        }
        this.tileLayer = L.tileLayer(url, {
          maxZoom: 19,
          attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        });
        this.tileLayer.addTo(this.map);
      }
    );
  }

  private initMap(): void {
    this.map = L.map('map', {
      center: [39.8282, -98.5795],
      zoom: 3
    });

  }
}
