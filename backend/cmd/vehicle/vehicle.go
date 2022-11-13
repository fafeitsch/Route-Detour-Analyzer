package main

import (
	vehicle2 "backend/vehicle"
	"fmt"
	"github.com/urfave/cli/v2"
	"log"
	"os"
	"path/filepath"
)

var scenarioFileFlag = &cli.StringFlag{
	Name:     "scenario",
	Usage:    "Path where the scenario files live. Must be relative.",
	Required: true,
}

var vehicleKeyFlag = &cli.StringFlag{
	Name:     "key",
	Usage:    "Key of the vehicle to simulate",
	Required: true,
}

var startTimeFlag = &cli.StringFlag{
	Name:  "start",
	Usage: "Time at the simulation start",
}

var timeResolutionFlag = &cli.IntFlag{
	Name:  "resolution",
	Usage: "Number of milliseconds between to simulation events",
	Value: 1000,
}

func main() {
	app := cli.App{
		Flags: []cli.Flag{
			vehicleKeyFlag,
			scenarioFileFlag,
			startTimeFlag,
			timeResolutionFlag,
		},
		Action: func(ctx *cli.Context) error {
			var err error
			directory := ctx.String(scenarioFileFlag.Name)
			if filepath.IsAbs(directory) {
				return fmt.Errorf("the file path \"%s\" is not relative", directory)
			}
			vehicle, err := vehicle2.NewVehicle(directory, ctx.String(vehicleKeyFlag.Name))
			if err != nil {
				return fmt.Errorf("could not create vehicle: %v", err)
			}
			_ = vehicle
			return nil
		},
	}
	err := app.Run(os.Args)
	if err != nil {
		log.Fatalf("could not initialize app: %v", err)
	}
}
