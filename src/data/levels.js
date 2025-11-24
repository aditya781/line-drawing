const LEVELS = [
  {
    difficulty: "Easy",
    name: "The Beginning",
    nodes: [{id:0,x:0.2,y:0.8},{id:1,x:0.5,y:0.2},{id:2,x:0.8,y:0.8}],
    edges: [{from:0,to:1},{from:1,to:2},{from:2,to:0}] // Circuit (0 Odds)
  },
  {
    difficulty: "Easy",
    name: "The Bow",
    nodes: [{id:0,x:0.2,y:0.2},{id:1,x:0.8,y:0.2},{id:2,x:0.5,y:0.8}],
    edges: [{from:0,to:1,curve:{x:0.5,y:0.4}},{from:1,to:2},{from:2,to:0}] // Circuit (0 Odds)
  },
  {
    difficulty: "Easy",
    name: "Hourglass",
    nodes: [{id:0,x:0.3,y:0.2},{id:1,x:0.7,y:0.2},{id:2,x:0.5,y:0.5},{id:3,x:0.3,y:0.8},{id:4,x:0.7,y:0.8}],
    edges: [{from:0,to:1},{from:1,to:2},{from:2,to:0},{from:2,to:3},{from:3,to:4},{from:4,to:2}] // Circuit (0 Odds)
  },
  {
    difficulty: "Easy",
    name: "Kite",
    nodes: [{id:0,x:0.5,y:0.1},{id:1,x:0.2,y:0.4},{id:2,x:0.8,y:0.4},{id:3,x:0.5,y:0.9}],
    edges: [{from:0,to:1},{from:1,to:3},{from:3,to:2},{from:2,to:0},{from:1,to:2}] // Path (Odds: 1,2)
  },
  {
    difficulty: "Easy",
    name: "Bowtie",
    nodes: [{id:0,x:0.2,y:0.3},{id:1,x:0.2,y:0.7},{id:2,x:0.5,y:0.5},{id:3,x:0.8,y:0.3},{id:4,x:0.8,y:0.7}],
    edges: [{from:0,to:1},{from:1,to:2},{from:2,to:0},{from:2,to:3},{from:3,to:4},{from:4,to:2}] // Circuit (0 Odds)
  },
  {
    difficulty: "Easy",
    name: "Envelope",
    nodes: [{id:0,x:0.2,y:0.4},{id:1,x:0.8,y:0.4},{id:2,x:0.8,y:0.8},{id:3,x:0.2,y:0.8},{id:4,x:0.5,y:0.2}],
    edges: [{from:0,to:1},{from:1,to:2},{from:2,to:3},{from:3,to:0},{from:0,to:4},{from:4,to:1}] // Path (Odds: 0,1)
  },
  {
    difficulty: "Easy",
    name: "House",
    nodes: [{id:0,x:0.2,y:0.8},{id:1,x:0.8,y:0.8},{id:2,x:0.8,y:0.4},{id:3,x:0.2,y:0.4},{id:4,x:0.5,y:0.1}],
    edges: [{from:0,to:1},{from:1,to:2},{from:2,to:4},{from:4,to:3},{from:3,to:0},{from:3,to:2},{from:3,to:1}] // Path (Odds: 1,2)
  },
  {
    difficulty: "Easy",
    name: "Star",
    nodes: [{id:0,x:0.5,y:0.1},{id:1,x:0.65,y:0.4},{id:2,x:0.9,y:0.4},{id:3,x:0.7,y:0.6},{id:4,x:0.8,y:0.9},{id:5,x:0.5,y:0.75},{id:6,x:0.2,y:0.9},{id:7,x:0.3,y:0.6},{id:8,x:0.1,y:0.4},{id:9,x:0.35,y:0.4}],
    edges: [{from:0,to:1},{from:1,to:2},{from:2,to:3},{from:3,to:4},{from:4,to:5},{from:5,to:6},{from:6,to:7},{from:7,to:8},{from:8,to:9},{from:9,to:0}] // Circuit
  },
  {
    difficulty: "Easy",
    name: "Dumbbell",
    nodes: [{id:0,x:0.2,y:0.5},{id:1,x:0.4,y:0.3},{id:2,x:0.4,y:0.7},{id:3,x:0.6,y:0.3},{id:4,x:0.6,y:0.7},{id:5,x:0.8,y:0.5}],
    edges: [
      {from:0,to:1},{from:1,to:2},{from:2,to:0}, // Left Tri
      {from:1,to:3},{from:3,to:5},{from:5,to:4},{from:4,to:3},{from:4,to:2}, // Right Tri + Bridge
      {from:1,to:4} // **FIX**: Diagonal brace to make graph solvable
    ]
  },
  {
    difficulty: "Easy",
    name: "Vase",
    nodes: [{id:0,x:0.4,y:0.2},{id:1,x:0.6,y:0.2},{id:2,x:0.7,y:0.4},{id:3,x:0.6,y:0.8},{id:4,x:0.4,y:0.8},{id:5,x:0.3,y:0.4}],
    edges: [{from:0,to:1},{from:1,to:2},{from:2,to:3},{from:3,to:4},{from:4,to:5},{from:5,to:0},{from:2,to:5}] // Path (Odds: 2,5)
  },
  {
    difficulty: "Medium",
    name: "Butterfly",
    nodes: [{id:0,x:0.5,y:0.5},{id:1,x:0.2,y:0.2},{id:2,x:0.2,y:0.5},{id:3,x:0.5,y:0.2},{id:4,x:0.8,y:0.2},{id:5,x:0.8,y:0.5}],
    edges: [
      {from:0,to:1},{from:1,to:2},{from:2,to:0}, 
      {from:0,to:3},{from:3,to:4},{from:4,to:5},{from:5,to:0} 
    ] // 0 is deg 4. Others deg 2. Solvable.
  },
  {
    difficulty: "Medium",
    name: "Ice Cream",
    nodes: [{id:0,x:0.3,y:0.4},{id:1,x:0.7,y:0.4},{id:2,x:0.5,y:0.9},{id:3,x:0.3,y:0.2},{id:4,x:0.5,y:0.1},{id:5,x:0.7,y:0.2}],
    edges: [
      {from:0,to:1},{from:1,to:2},{from:2,to:0}, 
      {from:0,to:3,curve:{x:0.2,y:0.3}},{from:3,to:4,curve:{x:0.4,y:0.1}},{from:4,to:5,curve:{x:0.6,y:0.1}},{from:5,to:1,curve:{x:0.8,y:0.3}} 
    ] // Solvable Path (0,1 are odd)
  },
  {
    difficulty: "Medium",
    name: "Cat Head",
    nodes: [{id:0,x:0.3,y:0.4},{id:1,x:0.2,y:0.2},{id:2,x:0.4,y:0.3},{id:3,x:0.6,y:0.3},{id:4,x:0.8,y:0.2},{id:5,x:0.7,y:0.4},{id:6,x:0.5,y:0.7}],
    edges: [
      {from:0,to:1},{from:1,to:2},{from:2,to:0}, 
      {from:3,to:4},{from:4,to:5},{from:5,to:3}, 
      {from:2,to:3}, 
      {from:0,to:6},{from:6,to:5}, 
      {from:0,to:5} 
    ] // Odds: 2,3. Solvable.
  },
  {
    difficulty: "Medium",
    name: "Boat",
    nodes: [{id:0,x:0.2,y:0.6},{id:1,x:0.8,y:0.6},{id:2,x:0.6,y:0.8},{id:3,x:0.4,y:0.8},{id:4,x:0.5,y:0.2}],
    edges: [
      {from:0,to:1},{from:1,to:2},{from:2,to:3},{from:3,to:0}, 
      {from:0,to:4},{from:4,to:1} 
    ] // Odds: 0,1. Solvable.
  },
  {
    difficulty: "Medium",
    name: "Crown",
    nodes: [{id:0,x:0.2,y:0.6},{id:1,x:0.2,y:0.3},{id:2,x:0.35,y:0.5},{id:3,x:0.5,y:0.2},{id:4,x:0.65,y:0.5},{id:5,x:0.8,y:0.3},{id:6,x:0.8,y:0.6}],
    edges: [{from:0,to:1},{from:1,to:2},{from:2,to:3},{from:3,to:4},{from:4,to:5},{from:5,to:6},{from:6,to:0}] // Circuit
  },
  {
    difficulty: "Medium",
    name: "Glasses",
    nodes: [{id:0,x:0.1,y:0.4},{id:1,x:0.4,y:0.4},{id:2,x:0.6,y:0.4},{id:3,x:0.9,y:0.4},{id:4,x:0.25,y:0.6},{id:5,x:0.75,y:0.6}],
    edges: [{from:0,to:1},{from:1,to:4},{from:4,to:0},{from:1,to:2,curve:{x:0.5,y:0.3}},{from:2,to:3},{from:3,to:5},{from:5,to:2}] // Odds: 1,2. Solvable.
  },
  {
    difficulty: "Medium",
    name: "Mug",
    nodes: [{id:0,x:0.3,y:0.3},{id:1,x:0.6,y:0.3},{id:2,x:0.6,y:0.7},{id:3,x:0.3,y:0.7},{id:4,x:0.8,y:0.4},{id:5,x:0.8,y:0.6}],
    edges: [{from:0,to:1,curve:{x:0.45,y:0.25}},{from:1,to:2},{from:2,to:3,curve:{x:0.45,y:0.75}},{from:3,to:0},{from:1,to:4,curve:{x:0.7,y:0.35}},{from:4,to:5,curve:{x:0.9,y:0.5}},{from:5,to:2,curve:{x:0.7,y:0.65}}] // Circuit
  },
  {
    difficulty: "Medium",
    name: "Umbrella",
    nodes: [{id:0,x:0.2,y:0.5},{id:1,x:0.5,y:0.2},{id:2,x:0.8,y:0.5},{id:3,x:0.5,y:0.5},{id:4,x:0.5,y:0.8},{id:5,x:0.4,y:0.9}],
    edges: [{from:0,to:1,curve:{x:0.3,y:0.3}},{from:1,to:2,curve:{x:0.7,y:0.3}},{from:2,to:3},{from:3,to:0},{from:3,to:4},{from:4,to:5,curve:{x:0.4,y:0.8}},{from:1,to:3}] // Odds: 1,5. Solvable.
  },
  {
    difficulty: "Medium",
    name: "Infinity",
    nodes: [{id:0,x:0.5,y:0.5},{id:1,x:0.2,y:0.3},{id:2,x:0.2,y:0.7},{id:3,x:0.8,y:0.3},{id:4,x:0.8,y:0.7}],
    edges: [{from:0,to:1,curve:{x:0.35,y:0.4}},{from:1,to:2,curve:{x:0.1,y:0.5}},{from:2,to:0,curve:{x:0.35,y:0.6}},{from:0,to:3,curve:{x:0.65,y:0.4}},{from:3,to:4,curve:{x:0.9,y:0.5}},{from:4,to:0,curve:{x:0.65,y:0.6}}] // Circuit
  },
  {
    difficulty: "Medium",
    name: "Heart Weave",
    nodes: [{id:0,x:0.5,y:0.3},{id:1,x:0.2,y:0.2},{id:2,x:0.1,y:0.5},{id:3,x:0.5,y:0.9},{id:4,x:0.9,y:0.5},{id:5,x:0.8,y:0.2}],
    edges: [{from:0,to:1,curve:{x:0.35,y:0.15}},{from:1,to:2,curve:{x:0.1,y:0.3}},{from:2,to:3,curve:{x:0.2,y:0.8}},{from:3,to:4,curve:{x:0.8,y:0.8}},{from:4,to:5,curve:{x:0.9,y:0.3}},{from:5,to:0,curve:{x:0.65,y:0.15}},{from:0,to:3}] // Path (Odds: 0,3)
  },
  {
    difficulty: "Medium",
    name: "Arrow Block",
    nodes: [{id:0,x:0.5,y:0.1},{id:1,x:0.2,y:0.4},{id:2,x:0.4,y:0.4},{id:3,x:0.4,y:0.9},{id:4,x:0.6,y:0.9},{id:5,x:0.6,y:0.4},{id:6,x:0.8,y:0.4}],
    edges: [{from:0,to:1},{from:1,to:2},{from:2,to:3},{from:3,to:4},{from:4,to:5},{from:5,to:6},{from:6,to:0},{from:2,to:5}] // Circuit
  },
  {
    difficulty: "Medium",
    name: "Double Square",
    nodes: [{id:0,x:0.2,y:0.2},{id:1,x:0.5,y:0.2},{id:2,x:0.5,y:0.5},{id:3,x:0.2,y:0.5},{id:4,x:0.8,y:0.5},{id:5,x:0.8,y:0.8},{id:6,x:0.5,y:0.8}],
    edges: [{from:0,to:1},{from:1,to:2},{from:2,to:3},{from:3,to:0},{from:2,to:4},{from:4,to:5},{from:5,to:6},{from:6,to:2}] // Circuit
  },

  {
    difficulty: "Medium",
    name: "Window Solvable",
    nodes: [{id:0,x:0.2,y:0.2},{id:1,x:0.8,y:0.2},{id:2,x:0.8,y:0.8},{id:3,x:0.2,y:0.8},{id:4,x:0.5,y:0.2},{id:5,x:0.5,y:0.8},{id:6,x:0.2,y:0.5},{id:7,x:0.8,y:0.5},{id:8,x:0.5,y:0.5}],
    edges: [
      {from:0,to:4},{from:4,to:1},{from:1,to:7},{from:7,to:2},{from:2,to:5},{from:5,to:3},{from:3,to:6},{from:6,to:0},
      {from:4,to:8},{from:8,to:5},{from:6,to:8},{from:8,to:7},
      {from:4,to:6}, // Fix 1
      {from:5,to:7}  // Fix 2
    ] // Circuit (All Even)
  },
  {
    difficulty: "Hard",
    name: "The Prism",
    nodes: [{id:0,x:0.4,y:0.3},{id:1,x:0.6,y:0.3},{id:2,x:0.7,y:0.5},{id:3,x:0.6,y:0.7},{id:4,x:0.4,y:0.7},{id:5,x:0.3,y:0.5}],
    edges: [
        {from:0,to:1},{from:1,to:2},{from:2,to:3},{from:3,to:4},{from:4,to:5},{from:5,to:0}, // Hexagon
        {from:0,to:2},{from:2,to:4},{from:4,to:0}, // Triangle 1
        {from:1,to:3},{from:3,to:5},{from:5,to:1}  // Triangle 2
    ] // Circuit (All deg 4)
  },
  {
    difficulty: "Hard",
    name: "Lantern",
    nodes: [{id:0,x:0.3,y:0.2},{id:1,x:0.7,y:0.2},{id:2,x:0.8,y:0.5},{id:3,x:0.7,y:0.8},{id:4,x:0.3,y:0.8},{id:5,x:0.2,y:0.5},{id:6,x:0.5,y:0.1},{id:7,x:0.5,y:0.9}],
    edges: [
        {from:0,to:1},{from:1,to:2},{from:2,to:3},{from:3,to:4},{from:4,to:5},{from:5,to:0},
        {from:0,to:6},{from:6,to:1},
        {from:4,to:7},{from:7,to:3},
        {from:0,to:4},{from:1,to:3} 
    ] // Circuit
  },
];

export default LEVELS;
//7,9, 13