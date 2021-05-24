#Route Detour Analyzer

Routes in public transportation often do not use shortest path between their origin
and their final destination. I wondered how much deviation from the shortest path
are the passengers willing to accept.

For example, in the image below, the detour of the bus line is 500 m (or 1.71 times)
longer than the shortest path between the leftmost and the rightmost station.

![Example of a detour on a public transportation line.](./img/detour.png)

I wondered: How much detour is acceptable on any bus line between the stations? In
order to evaluate this I wrote the Route Detour Analyzer. It allows defining lines
and compute the detours of sub paths withing that line.

## Features

* Define custom lines and experiment
* Fine-tune lines by using way points (these are not counted as stops)  
* Parameterizable analysis
* Min, median, average, and maximal detour per line   
* Automatic name generation for stops based on address data  
* Colorize lines
* Use different routing severs and tile layers
* Import and export of lines

## Usage

In order to use the app, a tile server URL is needed for displaying the map, and a OSRM server URL
is needed for the actual routing. For example, tile servers can be found at [the OSM wiki](https://wiki.openstreetmap.org/wiki/Tile_servers),
and the [OSRM Demo Server](https://github.com/Project-OSRM/osrm-backend/wiki/Demo-server) is available
for quick testing. Please be aware that there are usage policies restricting the offered demo services
of OSM and OSRM. For heavy usage of the app, I suggest self-hosting tile servers and OSRM servers.

If both URLS are at hand, paste them in the following link. Don't forget to bookmark the
link if you want to come back:
```https://127.0.0.1/?tiles=TILE_SERVER&osrm=OSRM_SERVER```

After the app is loaded, you can start to enter and edit lines. The detour analysis is only
available the currently selected line. It works with a *Evaluation Range Cap*. This cap 
essentially limits the lengths of sub tours that are considered. A cap of 0 means that only
the complete tour is analyzed, i.e. the total length of the line is compared to the shortest path
between source and origin.

If the cap is 1, then all sub tours with at most one stop less than the whole line are considered. This makes
for two additional sub paths, making three in total. No matter how high the cap is, the minimal
sub tours that are considered consist of two stops.

## FAQ

***How can I enable service roads (often used by buses)?***

The routing depends on the OSRM configuration. The OSRM demo is optimized for car routing, which
avoids service roads. If you want other profiles (e.g to allow service roads), you either
have to self-host an OSRM server or pay for one.

***The app proposes crazy routes that are not suitable for buses. How to fix that?***

See last question. In some cases, using way points on a line can improve the overall route,
but I overall suggest to self-host an OSRM server.

***Why does the analyzer sometimes give negative detours?***
