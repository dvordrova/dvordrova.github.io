const width = 280 + 420;
const height = 420;

const treeRadius = 20;

let svg = d3.select("#svg");

let heap = new FibonacciHeap();

let inputsData = {
  insertInput: "",
  changeInput: null,
  selectedNode: null,
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
    let min = heap.popMin();
    this._addLog(
      "blue",
      `popMin ${min}: #roots = ${heap.length}, #nodes = ${heap.n}, min = ${heap.min ? heap.min.value : null}`,
    );
  },
  decreaseKey() {
    try {
      console.log(this.selectedNode);
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
      // console.log(d);
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
console.log("min", heap.popMin());
heap.insert(20);
console.log(heap.debug());

let fibData = fibSquareData();
drawBackground(svg, fibData);
drawSpiral(svg, fibData);

// applyZoom(svg, data, 0, data.cumDelay * 2, 5);
// applyZoom(svg, data, data.cumDelay * 2, data.cumDelay, 1);

// var path = svg.append("svg:g").selectAll("path"),
//   circle = svg.append("svg:g").selectAll("g");

let { nodes, links } = heap.getData();
let simulation = null;

function enrichNode(node) {
  console.log(node);
  let { degree, depth, maxDepth } = node;
  // console.log({ node, degree, depth, maxDepth, fibData });
  let square = fibData[degree];
  node.x0 = square.xFinal + (1 / 6) * square.sizeFinal;
  node.x1 = square.xFinal + (5 / 6) * square.sizeFinal;
  // if (maxDepth == 1) {
  //   node.y0 = square.yFinal + square.sizeFinal / 2;
  //   node.y1 = square.yFinal + square.sizeFinal / 2;
  //   continue
  // }
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
  console.log(inputsData);
}

function simulate(svg, fibData) {
  console.log({ nodes, links });

  for (let node of nodes) {
    enrichNode(node);
  }
  simulation.nodes(nodes).force("link").links(links);
  svg.append("g").attr("class", "links");
  svg.append("g").attr("class", "nodes");
  // .force("center", d3.forceCenter(0, 0).strength(0.2));
  // const link = svg
  //   .append("g")
  //   .attr("class", "links")
  //   .selectAll("line")
  //   .data(links)
  //   .enter()
  //   .append("line")
  //   .attr("class", "link");
  // const node = svg
  //   .append("g")
  //   .attr("class", "nodes")
  //   .selectAll("g")
  //   .data(nodes, (d) => d.id)
  //   .enter()
  //   .append("g");

  // const circles = node
  //   .append("circle")
  //   .attr("class", "node")
  //   .attr("r", treeRadius)
  //   .attr("cx", (d) => d.x)
  //   .attr("cy", (d) => d.y);

  // circles.on("click", clickNode);

  // const texts = node
  //   .append("text")
  //   .text((d) => d.value)
  //   .attr("dx", getXByData)
  // .attr("dy", getYByData);

  // const labels = node
  //   .append("text")
  //   .text((d) => d.id)
  //   .attr("dx", -10)
  //   .attr("dy", 4);

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
      .classed("targeted", (d) => !d.source.mark);

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

    // svg
    //   .select("g.nodes")
    //   .selectAll("g text")
    //   .attr("dx", getXByData)
    //   .attr("dy", getYByData)
    //   .attr("font-weight", (d) => (d.isMin ? "bold" : "normal"));

    // console.log(d);
    // svg
    //   .select("g.links")
    //   .selectAll("line")
    //   .attr("x1", (d) => d.source.x)
    //   .attr("y1", (d) => d.source.y)
    //   .attr("x2", (d) => d.target.x)
    //   .attr("y2", (d) => d.target.y)
    //   .classed("targeted", (d) => !d.source.mark);
    // // .attr("stroke", d.source.targeted ? "red" : "black");
    // // circles
    // svg
    //   .select("g.nodes")
    //   .selectAll("g circle")
    //   .attr("cx", (d) => {
    //     if (d.id == 6) {
    //       console.log({ fig: "circle", d });
    //     }
    //     return d.x;
    //   })
    //   .attr("cy", (d) => d.y)
    //   .attr("fill", (d) =>
    //     d.depth == 1 ? (d.isMin ? "url(#stripes)" : "#ddac51") : "#dde6c7",
    //   );
    // svg
    //   .select("g.nodes")
    //   .selectAll("g text")
    //   .attr("dx", getXByData)
    //   .attr("dy", getYByData)
    //   .attr("font-weight", (d) => (d.isMin ? "bold" : "normal"));
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
      console.log({ node });
      ids[node.id].x = node.x;
      ids[node.id].y = node.y;
      // ids[node.id].vx = node.vx;
      // ids[node.id].vy = node.vy;
    }
  }
  nodes = newNodes;

  console.log({ nodes });
  links = newLinks;
  simulation.nodes(nodes).force("link").links(links);
  // simulation.force("link").initialize(links);
  // simulation.force("charge").initialize(nodes);
  // simulation.force("collide").initialize(nodes);
  // simulation.force("toSegment").initialize(nodes);
  // let gNodes = svg.selectAll("g.nodes").data(nodes, (d) => d.id);

  // gNodes.exit().remove();

  // let gN = gNodes.enter().append("g");
  // gN.append("circle")
  //   .attr("class", "node")
  //   .attr("cx", (d) => d.x)
  //   .attr("cy", (d) => d.y)
  //   .attr("r", treeRadius)
  //   .on("click", clickNode);
  // // gN.append("text")
  // //   .text((d) => d.value)
  // //   .attr("dx", getXByData)
  // //   .attr("dy", getYByData);

  // svg
  //   .select("g.links")
  //   .selectAll("line")
  //   .data(links)
  //   .enter()
  //   .append("line")
  //   .attr("class", "link")
  //   .attr("x1", (d) => d.source.x)
  //   .attr("y1", (d) => d.source.y)
  //   .attr("x2", (d) => d.target.x)
  //   .attr("y2", (d) => d.target.y);

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
