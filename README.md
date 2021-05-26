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

* Define unlimited lines with custom color and names:
![Example of some lines created in RDA](./img/lines.png)
* Intuitive line editor to define the stops and route of a line:
![Creating a line](./img/line-creation.gif)  
* Fine-tune lines by using way points (these are not counted as stops)  
![Use waypoints to define detailed routs](./img/waypoints.gif)  
* Parameterizable analysis
* Min, median, average, and maximal detour per line
![Parameters change the results of the analysis](./img/analysis.gif)  
* Automatic name generation for stops based on address data  
* Use different routing servers and tile layers
* Import and export

## Building the app

If you want to build the app yourself, you just need an Angular workbench set up and then
call `ng serve` for a local demo server or `ng build --configuration production` to build
a production environment.

## Usage

In order to use the app, a tile server URL is needed for displaying the map, and a OSRM server URL
is needed for the actual routing. Some public tile servers can be found at [the OSM wiki](https://wiki.openstreetmap.org/wiki/Tile_servers),
and the [OSRM Demo Server](https://github.com/Project-OSRM/osrm-backend/wiki/Demo-server) is available
for quick testing. Please be aware that there are usage policies restricting the offered demo services
of OSM and OSRM. For heavy usage of the app, I suggest self-hosting tile servers and OSRM servers.

If both URLS are at hand, paste them in the following link. Don't forget to bookmark the
link if you want to come back:
```https://127.0.0.1/?tiles=TILE_SERVER&osrm=OSRM_SERVER```

After the app is loaded, you can start to enter and edit lines. The detour analysis is only
available for the currently selected line. It works with a *Evaluation Range Cap*. This cap 
essentially limits the lengths of sub tours that are considered. A cap of 0 means that only
the complete tour is analyzed, i.e. the total length of the line is compared to the shortest path
between source and origin.

If the cap is 1, then all sub tours with at most one stop less than the whole line are considered. This makes
for two additional sub paths, making three in total. No matter how high the cap is, the minimal
sub tours that are considered consist of two stops.

## Sample File

The repository contains a [sample file](wuerzburg.json) containing all city lines of Wuerzburg City in spring 2021.
There are 21 distinct lines. Lines that have significantly different from-path compared to the to-path
are contained twice, which makes 37 sample lines in the file. For every line only the main path
is realized. Please do not use these lines for actual route planing as they might be imprecise and deprecated.
Use the official [public transportation site](https://vvm-info.de) for that.

Please be aware that the sample file only contains the location and names of the stops. The
routing between the stops is done by OSRM. Depending on your used OSRM profile your routes
can be different from mine. In my OSRM profile, I basically allowed all types of roads
to be used for routing. The profile file is currently in bad shape, unfortunately. I will clean
it up in the future.

## FAQ

***How can I enable service roads (often used by buses)?***

The routing depends on the OSRM configuration. The OSRM demo is optimized for car routing, which
avoids service roads. If you want other profiles (e.g to allow service roads), you either
have to self-host an OSRM server or pay for one.

***The RDA proposes crazy routes that are not suitable for buses. How to fix that?***

See last question. In some cases, using way points on a line can improve the overall route,
but I overall suggest self-hosting an OSRM server.

***Why does the analyzer sometimes give negative detours?***

RDA only analyzes the lengths of tours. The routing algorithms of OSRM however, often take additional
metrics into account, such es few traffic lights, few crossings and so on. Thus, it might happen
that a bus tour is actually shorter than the path suggested by OSRM. To avoid this, use customize
profiles for the OSRM (only applies to self-hosted OSRM).

## Answer to the initial question

First, I didn't really have time to evaluate the findings, maybe I'll present the actual data on
my sample set of Wuerzburg in the future. It isn't just done by looking at all lines and taking the
average or median of relative detours. The reason lies in the following three points:

**First,** there are some lines that are definitely not designed to be used from source to origin.
The most extreme example is line 13 in Wuerzburg. In practice, nobody enters at the source (left side)
and travels to the final destination (right side) because there is a much faster tram connection with
only a handful of intermediate stops. The line in fact serves to get people *out* of the city in
the first half of stops, and *into* the city in the second half of stops. Solving the problem
is easy if one has local knowledge of the situation. In this case the line can be either split
in two for the sake of analysis or ignored as outlier.

![The line 13 in Wuerzburg](./img/line13.png)

**Second,** the choice of which path to use is multi-dimensional. The bus route might be shorter because the bus is allowed
to go through pedestrian areas while the cars are routed around the old city district. Which one is
better? The first might be shorter but also slower than the latter. The OSRM can incorporate
such metrics in its shortest path, but it cannot easily solve the question which detour is
acceptable in public transport.

**Third,** sub tours of length 2 are trivial because even
in public transport they follow the same path as the OSRM would suggest for cars. On the other hand,
the complete tour is often vastly different from the "best" path between source and destination. Thus,
which sub tours do you consider for a holistic analysis?

I didn't yet have time and nerve to come to terms with these points. Thus, I leave them for discussion
as of now. Maybe I come back to them in the future.

##Shoutouts

Thanks to all the great open-source libraries and tools. I will not name all of them here
because I will forget someone :) .

##License

See [License File](LICENSE).


