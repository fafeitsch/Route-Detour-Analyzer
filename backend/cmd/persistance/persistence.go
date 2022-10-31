package main

import (
	"archive/zip"
	"backend/rpc"
	"backend/scenario"
	"fmt"
	"github.com/urfave/cli/v2"
	"io"
	"io/fs"
	"log"
	"net/http"
	"os"
	"path/filepath"
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
	Usage:    "Path where the scenario files live. Must be relative.",
	Required: true,
}

var manager *scenario.Manager
var directory string
var osrmUrl = osrmServerFlag.Value
var tileServer = tileServerFlag.Value

func main() {
	app := cli.App{
		Flags: []cli.Flag{
			portFlag,
			osrmServerFlag,
			scenarioFileFlag,
			tileServerFlag,
		},
		Action: func(ctx *cli.Context) error {
			var err error
			directory = ctx.String(scenarioFileFlag.Name)
			if filepath.IsAbs(directory) {
				return fmt.Errorf("the file path \"%s\" is not relative", directory)
			}
			manager, err = scenario.LoadScenario(ctx.String(scenarioFileFlag.Name))
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
			resp.Header().Set("Content-Type", "application/zip")
			resp.Header().Set("Content-Disposition", "attachment; filename=\"scenario.zip\"")
			w := zip.NewWriter(resp)
			err := filepath.WalkDir(directory, func(path string, d fs.DirEntry, err error) error {
				if err != nil {
					return err
				}
				if d.IsDir() {
					return nil
				}
				file, err := os.Open(path)
				if err != nil {
					return err
				}
				defer func() {
					_ = file.Close()
				}()
				f, err := w.Create(path)
				if err != nil {
					return err
				}
				_, err = io.Copy(f, file)
				if err != nil {
					return err
				}
				return nil
			})
			if err != nil {
				resp.WriteHeader(500)
			}
			_ = w.Close()
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
