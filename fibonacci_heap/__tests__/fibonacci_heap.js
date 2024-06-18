const { FibonacciHeap } = require("../fibonacci_heap");

test("heap insert one element", () => {
  let heap = new FibonacciHeap();
  heap.insert(1);
  expect(heap.n).toBe(1);
});

test("heap insert two elements", () => {
  let heap = new FibonacciHeap();
  heap.insert(1);
  heap.insert(2);
  expect(heap.n).toBe(2);
});

test("heap popMin", () => {
  let heap = new FibonacciHeap();
  heap.insert(1);
  heap.insert(2);
  heap.insert(3);
  expect(heap.popMin()).toBe(1);
  expect(heap.min.value).toBe(2);
  expect(heap.min.parent).toBe(null);
  expect(heap.min.next.value).toBe(2);
  expect(heap.min.prev.value).toBe(2);
  expect(heap.min.children.value).toBe(3);
  expect(heap.min.children.next.value).toBe(3);
  expect(heap.min.children.prev.value).toBe(3);
  expect(heap.min.children.parent.value).toBe(2);
  expect(heap.min.children.children).toBe(null);

  expect(heap.popMin()).toBe(2);
  expect(heap.min.value).toBe(3);
  expect(heap.min.parent).toBe(null);
  expect(heap.min.next.value).toBe(3);
  expect(heap.min.prev.value).toBe(3);
  expect(heap.min.children).toBe(null);

  expect(heap.popMin()).toBe(3);
  expect(heap.min).toBe(null);

  expect(heap.popMin()).toBe(null);
});

test("heap remove", () => {
  let heap = new FibonacciHeap();
  heap.insert(1);
  heap.insert(2);
  heap.insert(3);
  heap.popMin();

  heap.remove(heap.min.children);

  expect(heap.min.value).toBe(2);
  expect(heap.min.children).toBe(null);
});

test("heap remove 2", () => {
  let heap = new FibonacciHeap();
  heap.insert(1);
  heap.insert(2);
  heap.insert(3);
  heap.popMin();

  heap.remove(heap.min);

  expect(heap.min.value).toBe(3);
  expect(heap.min.children).toBe(null);
});

test("heap remove 3", () => {
  let heap = new FibonacciHeap();
  heap.insert(1);
  heap.insert(2);
  heap.insert(3);
  heap.insert(4);
  heap.insert(5);

  heap.popMin();

  heap.decreaseKey(heap.min.children.next.children, 1);

  expect(heap.min.value).toBe(1);
  expect(heap.min.parent).toBe(null);
  expect(heap.min.children).toBe(null);
  expect(heap.min.next.next.value).toBe(1);
  expect(heap.min.next.next.parent).toBe(null);
  expect(heap.min.next.next.children).toBe(null);
  expect(heap.min.prev.prev.value).toBe(1);
  expect(heap.min.prev.prev.parent).toBe(null);
  expect(heap.min.prev.prev.children).toBe(null);

  expect(heap.min.next.value).toBe(2);
  expect(heap.min.next.children.value).toBe(3);
  expect(heap.min.next.children.next.value).toBe(4);
  expect(heap.min.next.children.next.marked).toBe(true);
  expect(heap.min.next.children.next.children).toBe(null);

  expect(heap.min.prev.value).toBe(2);
  expect(heap.min.prev.children.value).toBe(3);
  expect(heap.min.prev.children.prev.value).toBe(4);
  expect(heap.min.prev.children.prev.marked).toBe(true);
  expect(heap.min.prev.children.prev.children).toBe(null);
});

test("heap remove 4", () => {
  let heap = new FibonacciHeap();
  heap.insert(1);
  heap.insert(2);
  heap.insert(3);
  heap.insert(4);
  heap.insert(5);

  heap.popMin();

  heap.decreaseKey(heap.min.children.next, 1);

  for (let node of [
    heap.min,
    heap.min.next.next,
    heap.min.prev.prev,
    heap.min.next.prev,
    heap.min.prev.next,
  ]) {
    expect(node.value).toBe(1);
    expect(node.parent).toBe(null);
    expect(node.children.value).toBe(5);
  }

  // expect(heap.min.next.value).toBe(2);
  // expect(heap.min.next.children.value).toBe(3);
  // expect(heap.min.next.children.next.value).toBe(4);
  // expect(heap.min.next.children.next.marked).toBe(true);
  // expect(heap.min.next.children.next.children).toBe(null);

  // expect(heap.min.prev.value).toBe(2);
  // expect(heap.min.prev.children.value).toBe(3);
  // expect(heap.min.prev.children.prev.value).toBe(4);
  // expect(heap.min.prev.children.prev.marked).toBe(true);
  // expect(heap.min.prev.children.prev.children).toBe(null);
});
