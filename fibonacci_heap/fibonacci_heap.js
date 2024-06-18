class FibonacciNode {
  static newId = 1;
  constructor(value) {
    this.id = FibonacciNode.newId++;
    this.value = value;
    this.next = this;
    this.prev = this;
    this.parent = null;
    this.children = null;
    this.children_count = 0;
    this.marked = false;
    this.degree = 0;
    this.depth = 1;
    this.maxDepth = 1;
  }
}

/** Concatenates two nodes
 * @param {FibonacciNode} a - first node
 * @param {FibonacciNode} b - second node
 *               deleted                deleted
 *                 link                  link
 * (ap) -> ( a ) ------> (an)     (bp) ------> ( b ) -> (bn)
 *  ^     |     ^ deleted |           ^ deleted |   ^     |
 *  |     |     |  link   |           |  link   |   |     |
 *  |_____|     |_________|           |_________|   |_____|
 * @returns {FibonacciNode} node with minimal value
 *             new                          new
 *             link                         link
 * (ap)->( a )  ->  ( b ) -> (bn)      (bp) -> (an)
 *  ^     | ^ new  |    ^     |           ^ new  |
 *  |     | | link |    |     |           | link |
 *  |_____| |______|    |_____|           |______|
 */
function ConcatNodes(a, b) {
  if (a === null) {
    return b;
  }
  if (b === null) {
    return a;
  }
  let bp = b.prev;
  let an = a.next;
  a.next = b;
  b.prev = a;
  an.prev = bp;
  bp.next = an;
  if (a.value <= b.value) {
    return a;
  }
  return b;
}

class FibonacciHeap {
  constructor() {
    this.min = null;
    this.n = 0;
    this.length = 0;
    this.history = [];
  }

  getHistory(i) {
    if (i < this.history.length) {
      return this.history[i];
    }
    return null;
  }

  /** @param {FibonacciHeap} otherHeap **/
  join(otherHeap) {
    this.n += otherHeap.n;
    this.length += otherHeap.length;
    this.min = ConcatNodes(this.min, otherHeap.min);
  }

  /** @param {number} value **/
  insert(value) {
    const node = new FibonacciNode(value);
    this.min = ConcatNodes(this.min, node);
    this.length++;
    this.n++;
    this.history.push(this.getData());
  }

  insertNode(node) {
    node.parent = null;
    node.marked = false;
    node.next = node;
    node.prev = node;
    this.min = ConcatNodes(this.min, node);
    this.length++;
  }

  /** @param {FibonacciNode} node
   * @param {FibonacciNode} newParent
   */
  insertNodeIn(node, newParent) {
    node.prev.next = node.next;
    node.next.prev = node.prev;

    node.next = node;
    node.prev = node;
    node.marked = false;
    node.parent = newParent;

    newParent.children = ConcatNodes(newParent.children, node);
    newParent.children_count++;

    this.min = newParent;
  }

  remove(node) {
    this.decreaseKey(node, Number.MIN_SAFE_INTEGER);
    this.popMin();
  }

  popMin() {
    if (this.min === null) {
      this.history.push(this.getData());
      return null;
    }
    const value = this.min.value;
    if (this.min.children_count !== 0) {
      let child = this.min.children;
      do {
        child.parent = null;
      } while (child !== this.min.children);
      this.min = ConcatNodes(this.min, this.min.children);
    }
    if (this.min != this.min.next) {
      this.min.next.prev = this.min.prev;
      this.min.prev.next = this.min.next;
      this.min = this.min.next;
      this.history.push(this.getData());
      this._consolidate();
    } else {
      this.length = 0;
      this.min = null;
    }
    this.n--;
    this.history.push(this.getData());
    return value;
  }

  _consolidate() {
    const A = new Array(Math.floor(Math.log2(this.n + 1)) + 1);
    for (let i = 0; i < A.length; i++) {
      A[i] = null;
    }
    let roots = [];
    let cur_root = this.min;
    do {
      roots.push(cur_root);
      cur_root = cur_root.next;
    } while (cur_root !== this.min);
    for (let w of roots) {
      console.log(w);
      let j = 0;
      // console.log({ A: structuredClone(A) });
      let next_w = w.next;
      let d = w.children_count;
      while (A[d] && j < 10) {
        j++;
        // console.log({ d });
        let y = A[d];
        // console.log({ w, y });
        if (w.value > y.value) {
          [w, y] = [y, w];
        }
        this.insertNodeIn(y, w);
        this.history.push(this.getData());
        A[d] = null;
        d++;
      }
      // console.log(`push ${d}`);
      A[d] = w;
      w = next_w;
    }
    this.min = null;
    this.length = 0;
    console.log(A);
    for (let i = 0; i < A.length; i++) {
      if (A[i] === null) {
        continue;
      }
      this.length++;
      A[i].prev = A[i];
      A[i].next = A[i];
      this.min = ConcatNodes(this.min, A[i]);
    }
  }

  _cut(node, parent) {
    parent.children_count--;
    if (node.next === node) {
      parent.children = null;
    } else {
      node.next.prev = node.prev;
      node.prev.next = node.next;
      parent.children = node.next;
    }
    this.insertNode(node);
    this.history.push(this.getData());
  }

  _cutRecursive(node) {
    if (node.parent === null) {
      return;
    }
    if (node.marked) {
      let parent = node.parent;
      this._cut(node, parent);
      this._cutRecursive(parent);
    } else {
      node.marked = true;
      this.history.push(this.getData());
    }
  }

  decreaseKey(node, newValue) {
    if (newValue > node.value) {
      throw new Error(
        `new value ${newValue} is greater than current value ${node.value}`,
      );
    }
    node.value = newValue;
    if (node.parent && node.parent.value > newValue) {
      let parent = node.parent;
      this._cut(node, parent);
      this._cutRecursive(parent);
    } else {
      this.history.push(this.getData());
    }

    if (node.value < this.min.value) {
      this.min = node;
      this.history.push(this.getData());
    }
  }

  clear() {
    this.min = null;
    this.n = 0;
  }

  childrenToData(node) {
    if (node.children === null) {
      return { name: node.value, value: node.value };
    }

    let children = [];
    let child = node.children;
    do {
      children.push(this.childrenToData(child));
      child = child.next;
    } while (child !== node.children);
    return { name: node.value, value: node.value, children };
  }

  toData() {
    let data = { name: "tree" };
    if (this.min === null) {
      return data;
    }
    let roots = [];
    let root = this.min;
    do {
      roots.push(this.childrenToData(root));
      root = root.next;
    } while (root !== this.min);
    return { ...data, children: roots };
  }

  debugNode(node, indent) {
    if (indent === undefined) {
      indent = "";
    }
    let res = `${indent}${node.value}`;
    let child = node.children;
    if (child === null) {
      return res;
    }
    do {
      res += "\n" + this.debugNode(child, indent + "  ");
      child = child.next;
    } while (child !== node.children);
    return res;
  }

  debug() {
    if (this.min === null) {
      return "empty";
    }
    let res = "";
    let root = this.min;
    do {
      res += this.debugNode(root) + "\n";
      root = root.next;
    } while (root !== this.min);
    return res;
  }

  getData() {
    let nodes = [];
    let links = [];
    if (this.min == null) {
      return { nodes, links };
    }
    let addNode = (node, parent_node_id, depth, degree) => {
      let res = depth;
      nodes.push({
        id: node.id,
        value: node.value,
        depth,
        degree,
        link: node,
        marked: node.marked,
      });
      if (parent_node_id !== null) {
        links.push({ source: parent_node_id, target: node.id });
      }
      let child = node.children;
      if (child === null) {
        return res;
      }
      do {
        res = Math.max(res, addNode(child, node.id, depth + 1, degree));
        child = child.next;
      } while (child !== node.children);
      return res;
    };
    let root = this.min;
    do {
      let maxDepth = addNode(root, null, 1, root.children_count);
      for (let node of nodes) {
        if (node.maxDepth === undefined) {
          node.maxDepth = maxDepth;
        }
      }
      root = root.next;
    } while (root !== this.min);
    nodes[0].isMin = true;
    return { nodes, links };
  }
}

module.exports = { FibonacciHeap };
