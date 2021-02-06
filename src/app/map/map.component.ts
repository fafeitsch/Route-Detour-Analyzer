/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT). Find the full license text in the LICENSE file of the project root.
 */
import {AfterViewInit, ChangeDetectionStrategy, Component} from '@angular/core';
import * as L from 'leaflet';
import {select, Store} from '@ngrx/store';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {Stop} from '../+reducers';
import {addUnamedStopToLine} from '../+actions/actions';
import {MapStore} from './map.store';
import {LatLng} from 'leaflet';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MapStore],
})
export class MapComponent implements AfterViewInit {

  private destroy$ = new Subject<boolean>();
  private map: any;
  private tileLayer: any;
  private pathLayer: any;

  constructor(private readonly globalStore: Store<{ tileServer: string, line: Stop[] }>,
              private readonly store: MapStore) {
  }

  ngAfterViewInit(): void {
    this.initMap();
    this.store.getCenter$.pipe(takeUntil(this.destroy$)).subscribe(c => this.map.setView(new LatLng(c.lat, c.lng), c.zoom))
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
    this.store.getOrignalPath$.pipe(takeUntil(this.destroy$)).subscribe(
      path => {
        if(this.pathLayer) {
          this.map.removeLayer(this.pathLayer);
        }
        this.pathLayer = L.polyline(path, {color: 'red'}).addTo(this.map);
      },err => console.log(err),
    )
  }

  private initMap(): void {
    this.map = L.map('map', {
      center: [39.8282, -98.5795],
      zoom: 3
    });
    const store = this.globalStore;
    this.map.on('click', function(e: any){
      const lat: number = Math.round(e.latlng.lat*100000)/100000;
      const lng: number = Math.round(e.latlng.lng*100000)/100000;
      const stop = {name: lat + ', ' + lng, lat, lng}

      store.dispatch(addUnamedStopToLine({stop}))
    })
  }
}
