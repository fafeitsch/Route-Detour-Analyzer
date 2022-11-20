package mqtt

type Message struct {
	Topic   string
	Payload any
	Retain  bool
}

type Sender func(message Message)
