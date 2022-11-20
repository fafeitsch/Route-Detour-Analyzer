package main

import (
	"backend/mqtt"
	vehicle2 "backend/vehicle"
	"encoding/json"
	"fmt"
	paho "github.com/eclipse/paho.mqtt.golang"
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
	Usage: "Number of milliseconds between two simulation events",
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
			mqttOptions := paho.NewClientOptions()
			mqttOptions.AddBroker("ws://localhost:9001")
			mqttOptions.SetClientID("anyid")
			client := paho.NewClient(mqttOptions)
			token := client.Connect()
			if token.Wait() && token.Error() != nil {
				return fmt.Errorf("could not connect to MQTT broker: %v", token.Error())
			}
			sender := func(message mqtt.Message) {
				topic := fmt.Sprintf("vehicles/%s/%s", vehicle.Key, message.Topic)
				payload, _ := json.Marshal(message.Payload)
				token := client.Publish(topic, 0, message.Retain, string(payload))
				token.Wait()
			}
			if err != nil {
				return fmt.Errorf("could not create vehicle: %v", err)
			}
			vehicle.Simulate(vehicle2.SimulationOptions{
				Sender:         sender,
				Speed:          8,
				TimeResolution: 1,
				StartTime:      "8:00",
			})
			return nil
		},
	}
	err := app.Run(os.Args)
	if err != nil {
		log.Fatalf("could not initialize app: %v", err)
	}
}
