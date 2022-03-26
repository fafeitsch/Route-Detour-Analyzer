package main

import (
	"backend/rpc"
	"backend/scenario"
	"encoding/json"
	"fmt"
	"github.com/urfave/cli/v2"
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
var scenarioFileFlag = &cli.StringFlag{
	Name:     "scenario",
	Usage:    "Path where the scenario file lives",
	Required: true,
}

var manager *scenario.Manager
var osrmUrl = osrmServerFlag.Value

func main() {
	app := cli.App{
		Flags: []cli.Flag{portFlag, osrmServerFlag, scenarioFileFlag},
		Action: func(ctx *cli.Context) error {
			var err error
			manager, err = scenario.New(ctx.String(scenarioFileFlag.Name))
			if err != nil {
				return fmt.Errorf("could not read scenario file: %v", err)
			}
			osrmUrl = ctx.String(osrmServerFlag.Name)
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
		}
		http.NotFound(resp, req)
	}
}
