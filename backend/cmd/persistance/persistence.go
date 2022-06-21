package main

import (
	"backend/rpc"
	"backend/scenario"
	"encoding/json"
	"fmt"
	"github.com/urfave/cli/v2"
	"io"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
)

var portFlag = &cli.IntFlag{
	Name:    "port",
	Aliases: []string{"p"},
	Usage:   "Port to use for the backend",
	Value:   45734,
}
var osrmServerFlag = &cli.StringFlag{
	Name:  "osrm",
	Usage: "Base endpoint for the OSRM server",
	Value: "http://localhost:5000",
}

var tileServerFlag = &cli.StringFlag{
	Name:  "tiles",
	Usage: "Tile server URL",
	Value: "http://127.0.0.1:8080/tile",
}
var scenarioFileFlag = &cli.StringFlag{
	Name:     "scenario",
	Usage:    "Path where the scenario file lives",
	Required: true,
}

var manager *scenario.Manager
var osrmUrl = osrmServerFlag.Value
var tileServer = tileServerFlag.Value

func main() {
	app := cli.App{
		Flags: []cli.Flag{portFlag, osrmServerFlag, scenarioFileFlag, tileServerFlag},
		Action: func(ctx *cli.Context) error {
			var err error
			manager, err = scenario.LoadFile(ctx.String(scenarioFileFlag.Name))
			if err != nil {
				return fmt.Errorf("could not read scenario file: %v", err)
			}
			osrmUrl = ctx.String(osrmServerFlag.Name)
			tileServer = ctx.String(tileServerFlag.Name)
			return http.ListenAndServe("127.0.0.1:"+strconv.Itoa(portFlag.Value), globalHandler())
		},
	}
	err := app.Run(os.Args)
	if err != nil {
		log.Fatalf("could not initialize app: %v", err)
	}
}

func globalHandler() http.HandlerFunc {
	return func(resp http.ResponseWriter, req *http.Request) {
		if strings.HasPrefix(req.URL.RequestURI(), "/rpc") {
			rpc.HandleFunc(manager, osrmUrl).ServeHTTP(resp, req)
			return
		} else if strings.HasPrefix(req.URL.RequestURI(), "/export") {
			resp.Header().Set("Content-Type", "text/json")
			resp.Header().Set("Content-Disposition", "attachment; filename=\"scenario.json\"")
			_ = json.NewEncoder(resp).Encode(manager.Export())
			return
		} else if strings.HasPrefix(req.URL.RequestURI(), "/tile") {
			tileId := req.URL.RequestURI()[strings.LastIndex(req.URL.String(), "tile")+4:]
			client := http.Client{Timeout: 0}
			response, err := client.Get(tileServer + tileId)
			if err != nil {
				fmt.Printf("%v", err)
				http.Error(resp, "could not get tiles from tile server", http.StatusInternalServerError)
				return
			}
			resp.Header().Set("Content-Type", response.Header.Get("Content-Type"))
			resp.Header().Set("Content-Length", response.Header.Get("Content-Length"))
			_, _ = io.Copy(resp, response.Body)
			_ = response.Body.Close()
			return
		}
		http.NotFound(resp, req)
	}
}
