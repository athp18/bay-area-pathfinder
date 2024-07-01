export function dijkstra(graph, startNode) { //dijkstra's is the backbone here
    const distances = {};
    const visited = {};
    const previous = {};
    const nodes = new PriorityQueue();
  
    // Initialize distances and previous
    Object.keys(graph).forEach(node => {
      distances[node] = Infinity;
      previous[node] = null;
    });
    distances[startNode] = 0;
  
    nodes.enqueue(startNode, 0);
  
    while (!nodes.isEmpty()) {
      const { value: currentNode } = nodes.dequeue();
  
      if (!visited[currentNode]) {
        visited[currentNode] = true;
  
        graph[currentNode].forEach(neighbor => {
          const { node: neighborNode, weight } = neighbor;
          const newDist = distances[currentNode] + weight;
  
          if (newDist < distances[neighborNode]) {
            distances[neighborNode] = newDist;
            previous[neighborNode] = currentNode;
            nodes.enqueue(neighborNode, newDist);
          }
        });
      }
    }
  
    return { distances, previous };
  }
  
  class PriorityQueue {
    constructor() {
      this.queue = [];
    }
  
    enqueue(value, priority) {
      this.queue.push({ value, priority });
      this.sort();
    }
  
    dequeue() {
      return this.queue.shift();
    }
  
    isEmpty() {
      return this.queue.length === 0;
    }
  
    sort() {
      this.queue.sort((a, b) => a.priority - b.priority);
    }
  }  
