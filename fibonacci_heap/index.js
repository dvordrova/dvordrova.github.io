const width = 280 + 420;
const height = 420;

const treeRadius = 20;

let svg = d3.select("#svg");

let heap = new FibonacciHeap();

let inputsData = {
  insertInput: "",
  changeInput: null,
  selectedNode: null,
  simulationStarted: false,
  setInsertInput(value) {
    this.insertInput = value;
  },
  setChangeInput(value) {
    this.changeInput = value;
  },
  setSelectedNode(node) {
    this.selectedNode = node;
  },
  focusNext(refName) {
    this.$nextTick(() => this.$refs[refName].focus());
  },
  _addLog(color, text) {
    const logContainer = document.getElementById("history-log");
    const logEntry = document.createElement("div");
    logEntry.classList.add(
      "p-1",
      `bg-${color}-100`,
      "border-l-4",
      `border-${color}-500`,
      `text-${color}-700`,
    );
    logEntry.textContent = text;
    logContainer.insertBefore(logEntry, logContainer.firstChild);
  },
  insert() {
    heap.insert(parseInt(this.insertInput));
    this._addLog(
      "green",
      `Insert ${this.insertInput}: #roots = ${heap.length}, #nodes = ${heap.n}, min = ${heap.min.value}`,
    );

    Alpine.store("inputsData").$nextTick(() => {
      document.querySelector('[x-ref="insertInputField"]').focus();
    });
  },
  popMin() {
    if (
      inputsData.selectedNode &&
      heap.min == inputsData.selectedNode.__data__.link
    ) {
      Alpine.store("inputsData").selectedNode = null;
      Alpine.store("inputsData").changeInput = "";
      Alpine.store("inputsData").$nextTick(() => {
        document.querySelector('[x-ref="insertInputField"]').focus();
      });
    }
    let min = heap.popMin();
    this._addLog(
      "blue",
      `popMin ${min}: #roots = ${heap.length}, #nodes = ${heap.n}, min = ${heap.min ? heap.min.value : null}`,
    );
  },
  decreaseKey() {
    try {
      let prevValue = this.selectedNode.__data__.link.value;
      heap.decreaseKey(
        this.selectedNode.__data__.link,
        parseInt(this.changeInput),
      );
      this._addLog(
        "orange",
        `Decrease key ${prevValue} -> ${this.changeInput}: #roots = ${heap.length}, #nodes = ${heap.n}, min = ${heap.min.value}`,
      );
    } catch (e) {
      this._addLog("red", e.message);
    }
  },
  deleteNode() {
    let prevValue = this.selectedNode.__data__.link.value;
    heap.remove(this.selectedNode.__data__.link);
    this._addLog(
      "red",
      `remove ${prevValue}: #roots = ${heap.length}, #nodes = ${heap.n}, min = ${heap.min ? heap.min.value : null}`,
    );
    Alpine.store("inputsData").selectedNode = null;
    Alpine.store("inputsData").changeInput = "";
    Alpine.store("inputsData").$nextTick(() => {
      document.querySelector('[x-ref="insertInputField"]').focus();
    });
  },
};

document.addEventListener("alpine:init", () => {
  Alpine.store("inputsData", inputsData);
});

const color = d3
  .scaleLinear()
  .domain([0, 5])
  .range(["hsl(152,80%,80%)", "hsl(228,30%,40%)"])
  .interpolate(d3.interpolateHcl);

function seededRandom(seed) {
  var x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

// Function to generate a nice color with fixed seed and index for different colors
function getColor(seed, index) {
  const t = seededRandom(seed + index);
  const color = d3.interpolateRainbow(t);
  // Convert the interpolated color to rgba with transparency
  const rgb = d3.color(color).rgb();
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5)`;
}

function drawBackground(svg, data) {
  svg
    .selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", (d) => {
      return d.x;
    })
    .attr("y", (d) => {
      return d.y;
    })
    .attr("width", (d) => {
      return d.size;
    })
    .attr("height", (d) => {
      return d.size;
    })
    .attr("fill", "rgba(0, 0, 0, 0.0)")
    .attr("stroke", "rgba(0, 0, 0, 0.0)")
    .attr("stroke-linecap", "round")
    .transition()
    .ease(d3.easeQuadOut)
    .delay((d) => {
      return d.delayRect;
    })
    .duration((d) => {
      return d.durationRect;
    })
    .attr("fill", (d) => {
      return d.color;
    })
    .attr("stroke", "rgba(0, 0, 0, 0.5)")
    .on("end", function (d, i) {
      // efade out and delet them after
      if (i > 3) {
        d3.select(this)
          .transition()
          .duration(300)
          .attr("fill", "rgba(0, 0, 0, 0.0)")
          .on("end", function () {
            d3.select(this).remove();
          });
      }
    });
}

function drawSpiral(svg, data) {
  svg
    .selectAll("path")
    .data(data)
    .enter()
    .append("path")
    .attr("transform", (d) => {
      return `translate(${d.ax}, ${d.ay})`;
    })
    .attr("fill", "rgba(0, 0, 0, 0.1)")
    .attr("stroke", "none")
    .attr("d", (d, i) => {
      return d3.arc()({
        innerRadius: d.size - 2,
        outerRadius: d.size,
        startAngle: d.startAngle,
        endAngle: d.startAngle,
      });
    })
    .transition()
    .ease(d3.easeQuad)
    .delay((d) => {
      return d.delayArc;
    })
    .duration((d) => {
      return d.durationArc;
    })
    .attrTween("d", function (d) {
      const interpolate = d3.interpolate(d.startAngle, d.endAngle);
      return function (t) {
        const arc = d3
          .arc()
          .innerRadius(d.size - 2)
          .outerRadius(d.size)
          .startAngle(d.startAngle)
          .endAngle(interpolate(t));
        return arc();
      };
    })
    .on("end", function (d, i) {
      if (i > 3) {
        d3.select(this)
          .transition()
          .delay(d.cumDelay - d.durationArc - d.delayArc)
          .duration(300)
          .attr("fill", "rgba(0, 0, 0, 0.0)")
          .on("end", function () {
            d3.select(this).remove();
            d3.selectAll("rect")
              .transition()
              .duration(5000)
              .attr("x", (d) => {
                return d.xFinal;
              })
              .attr("y", (d) => {
                return d.yFinal;
              })
              .attr("width", (d) => {
                return d.sizeFinal;
              })
              .attr("height", (d) => {
                return d.sizeFinal;
              });
          });
      } else {
        d3.select(this)
          .transition()
          .delay(d.cumDelay - d.durationArc - d.delayArc + 300)
          .duration(300)
          .attr("fill", "rgba(0, 0, 0, 0.0)")
          .on("end", function () {
            d3.select(this).remove();
          });
      }
    });
}

function getXByData(d) {
  return d.x - this.getComputedTextLength() / 2;
}

function getYByData(d) {
  return d.y + 4;
}

for (let i = 1; i < 9; ++i) {
  heap.insert(i);
}
heap.popMin();
heap.insert(20);

let fibData = fibSquareData();
drawBackground(svg, fibData);
drawSpiral(svg, fibData);

let { nodes, links } = heap.getData();
let simulation = null;

function enrichNode(node) {
  let { degree, depth, maxDepth } = node;
  let square = fibData[degree];
  node.x0 = square.xFinal + (1 / 6) * square.sizeFinal;
  node.x1 = square.xFinal + (5 / 6) * square.sizeFinal;
  node.y0 = node.y1 =
    square.yFinal + (square.sizeFinal * (depth - 0.5)) / (maxDepth + 1);
}

function clickNode(e, d) {
  if (inputsData.selectedNode !== null) {
    d3.select(inputsData.selectedNode).attr("stroke-width", "1");
  }
  if (inputsData.selectedNode == this) {
    Alpine.store("inputsData").changeInput = "";
    Alpine.store("inputsData").selectedNode = null;
    Alpine.store("inputsData").$nextTick(() => {
      document.querySelector('[x-ref="insertInputField"]').focus();
    });
  } else {
    d3.select(this).attr("stroke-width", "3");
    Alpine.store("inputsData").changeInput = d.value;
    Alpine.store("inputsData").selectedNode = this;
    Alpine.store("inputsData").$nextTick(() => {
      document.querySelector('[x-ref="changeInputField"]').focus();
    });
  }
}

function simulate(svg, fibData) {
  for (let node of nodes) {
    enrichNode(node);
  }
  simulation.nodes(nodes).force("link").links(links);
  svg.append("g").attr("class", "links");
  svg.append("g").attr("class", "nodes");

  simulation.on("tick", () => {
    // Update links
    svg
      .select("g.links")
      .selectAll("line")
      .data(links)
      .join(
        (enter) => {
          return enter.append("line").attr("class", "link");
        },
        (update) => update,
        (exit) => exit.remove(),
      )
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y)
      .attr("stroke-dasharray", (d) => {
        return d.target.marked ? "5,5" : "0";
      });

    // TODO: remove data from tick
    // Update nodes
    let group = svg
      .select("g.nodes")
      .selectAll("g")
      .data(nodes, (d) => d.id)
      .join(
        (enter) => {
          let g = enter.append("g");
          g.append("circle")
            .attr("class", "node")
            .attr("r", treeRadius)
            .on("click", clickNode);
          g.append("text")
            .text((d) => (d.value == Number.MIN_SAFE_INTEGER ? "-∞" : d.value))
            .attr("dx", getXByData)
            .attr("dy", getYByData);
          return g;
        },
        (update) => update,
        (exit) => exit.remove(),
      );
    group
      .select("text")
      .attr("dx", getXByData)
      .attr("dy", getYByData)
      .text((d) => (d.value == Number.MIN_SAFE_INTEGER ? "-∞" : d.value));
    group
      .select("circle")
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y)
      .attr("fill", (d) =>
        d.depth == 1 ? (d.isMin ? "url(#stripes)" : "#ddac51") : "#dde6c7",
      );
  });
}

function forceToSegment() {
  for (let i = 0; i < nodes.length; ++i) {
    const d = nodes[i];
    const closest = closestPointOnSegment(d.x0, d.y0, d.x1, d.y1, d.x, d.y);
    d.vx += (closest.x - d.x) * 0.1; // Adjust the strength as needed
    d.vy += (closest.y - d.y) * 0.1; // Adjust the strength as needed
  }
}

setTimeout(() => {
  simulation = d3
    .forceSimulation()
    .force("toSegment", forceToSegment)
    .force(
      "link",
      d3
        .forceLink()
        .id((d) => d.id)
        .distance(treeRadius * 3),
    )
    .force("charge", d3.forceManyBody().strength(-200))
    .force("collide", d3.forceCollide(20));
  simulate(svg, fibData);
  inputsData._addLog(
    "green",
    `Created: #roots = ${heap.length}, #nodes = ${heap.n}, min = ${heap.min.value}`,
  );
  Alpine.store("inputsData").simulationStarted = true;
  inputsData.focusNext("insertInputField");
}, fibData[0].cumDelay + 3333);

function processEvent(event) {
  // change:
  // - value
  // - depth
  // - isMin
  // - maxDepth
  // - degree
  // - link to parent

  // insert:
  // - new node
  // - new links

  let { nodes: newNodes, links: newLinks } = event;

  let ids = {};
  for (let node of newNodes) {
    enrichNode(node);
    // node.
    ids[node.id] = node;
  }
  for (let node of nodes) {
    if (ids[node.id] !== undefined) {
      ids[node.id].x = node.x;
      ids[node.id].y = node.y;
    }
  }
  nodes = newNodes;

  links = newLinks;
  simulation.nodes(nodes).force("link").links(links);

  simulation.alpha(1).restart();
}

let eventIndex = heap.history.length;
function repeatedlyProcessEvents() {
  let event = heap.getHistory(eventIndex);
  if (event !== null) {
    processEvent(event);
    eventIndex++;
    setTimeout(repeatedlyProcessEvents, 1000);
  } else {
    setTimeout(repeatedlyProcessEvents, 200);
  }
}
setTimeout(repeatedlyProcessEvents, fibData[0].cumDelay + 5555);
