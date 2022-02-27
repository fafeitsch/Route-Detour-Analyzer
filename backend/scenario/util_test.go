package scenario

import (
	"github.com/stretchr/testify/assert"
	"sort"
	"testing"
)

func TestSortLines(t *testing.T) {
	lines := []Line{
		{Name: "Sonderwagen U"},
		{Name: "Linie 10: Hubland"},
		{Name: "Linie 7: Sanderring", Key: "b"},
		{Name: "Linie 7: Sanderring", Key: "a"},
	}
	sort.Slice(lines, sortLines(lines))
	assert.Equal(t, "Linie 7: Sanderring", lines[0].Name)
	assert.Equal(t, "a", lines[0].Key)
	assert.Equal(t, "Linie 7: Sanderring", lines[1].Name)
	assert.Equal(t, "b", lines[1].Key)
	assert.Equal(t, "Linie 10: Hubland", lines[2].Name)
	assert.Equal(t, "Sonderwagen U", lines[3].Name)
}
