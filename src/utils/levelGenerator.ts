import { LevelData } from '../types/game';

// Deterministic Pseudo-Random Number Generator (PRNG)
function createPrng(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const CHAPTER_INFO = [
  { chapter: 1, title: 'Apprentice: The Spark', minLevel: 1, maxLevel: 20, size: 3, maxVal: 5, parTime: 40 },
  { chapter: 2, title: 'Strategist: Cross Matrix', minLevel: 21, maxLevel: 40, size: 4, maxVal: 7, parTime: 65 },
  { chapter: 3, title: 'Architect: Numeric Flow', minLevel: 41, maxLevel: 60, size: 4, maxVal: 9, parTime: 90 },
  { chapter: 4, title: 'Enigma: The Nexus', minLevel: 61, maxLevel: 80, size: 5, maxVal: 9, parTime: 120 },
  { chapter: 5, title: 'Grandmaster: Crown of Logic', minLevel: 81, maxLevel: 100, size: 6, maxVal: 12, parTime: 160 },
];

const LEVEL_DESCRIPTORS = [
  'First Steps', 'Dual Spark', 'Cross Addition', 'Echo Valley', 'Binary Rhythm',
  'Mirror Sum', 'Triple Crown', 'Balanced Scales', 'Amber Path', 'Diagonal Quest',
  'Silver Lining', 'Harmonic Wave', 'Cross Roads', 'Emerald Core', 'Prism Matrix',
  'Orbit Path', 'Lattice Shift', 'Golden Ratio', 'Quantum Leap', 'Master Trial',
  'Gateway Nova', 'Cipher Lock', 'Even Horizon', 'Oddity Link', 'Vertex Prime',
  'Solar Flare', 'Parallel Rays', 'Tectonic Shift', 'Vortex Node', 'Chronos Axis',
  'Starlight Grid', 'Opal Nexus', 'Equinox Bridge', 'Polaris Sum', 'Constellation',
  'Vector Bloom', 'Zenith Peak', 'Hyperion Gate', 'Solstice Arc', 'Master Trial II',
  'Genesis Spark', 'Abyssal Depth', 'Cosmic Thread', 'Magnetic Line', 'Helix Core',
  'Titan Forge', 'Aether Stream', 'Spectral Ring', 'Omega Pulse', 'Eclipse Path',
  'Fractal Weave', 'Obsidian Edge', 'Labyrinth Walk', 'Radiant Core', 'Sovereign Ray',
  'Crested Summit', 'Valkyrie Echo', 'Astral Plane', 'Celestial Spire', 'Master Trial III',
  'Chronicle I', 'Chronicle II', 'Monolith Base', 'Singularity', 'Supernova',
  'Event Horizon', 'Dark Matter', 'Graviton Web', 'Pulsar Wave', 'Nebula Drift',
  'Quasar Spark', 'Antimatter Flow', 'Hypercube', 'Infinity Loop', 'Apex Cipher',
  'Elysium Path', 'Arcane Matrix', 'Valhalla Gate', 'Pantheon Stone', 'Master Trial IV',
  'Absolute Zero', 'Tesseract', 'Cosmic Weaver', 'God Particle', 'Chrono Paradox',
  'Multiverse Key', 'Quantum Horizon', 'Void Walker', 'Prismatic Core', 'Aeon Pulse',
  'Entropy Bound', 'Nova Collapse', 'Astral Architect', 'Crown Matrix', 'Omnipresence',
  'Zenith Crown', 'Grand Enigma', 'Ultimate Accord', 'Ascendant Trial', 'Puzzle Grandmaster'
];

export function generateLevel(levelId: number): LevelData {
  const chapterConfig = CHAPTER_INFO.find(c => levelId >= c.minLevel && levelId <= c.maxLevel) || CHAPTER_INFO[0];
  const size = chapterConfig.size;
  const rng = createPrng(levelId * 7919 + 1337);

  // Generate grid values
  const grid: number[][] = [];
  for (let r = 0; r < size; r++) {
    const row: number[] = [];
    for (let c = 0; c < size; c++) {
      // Small variation in min/max based on chapter
      const minVal = 1;
      const maxVal = chapterConfig.maxVal;
      const val = Math.floor(rng() * (maxVal - minVal + 1)) + minVal;
      row.push(val);
    }
    grid.push(row);
  }

  // Generate secret solution ensuring a balanced challenge
  // Each row and column must have at least 1 true, and not all true
  let solution: boolean[][] = [];
  let validSolution = false;
  let attempts = 0;

  while (!validSolution && attempts < 50) {
    attempts++;
    solution = [];
    for (let r = 0; r < size; r++) {
      const solRow: boolean[] = [];
      for (let c = 0; c < size; c++) {
        // Between 40% and 60% probability of being included
        solRow.push(rng() > 0.45);
      }
      solution.push(solRow);
    }

    // Ensure at least 1 cell selected per row
    for (let r = 0; r < size; r++) {
      if (!solution[r].some(v => v)) {
        const c = Math.floor(rng() * size);
        solution[r][c] = true;
      }
      // Ensure not all cells selected per row to keep it interesting
      if (solution[r].every(v => v)) {
        const c = Math.floor(rng() * size);
        solution[r][c] = false;
      }
    }

    // Ensure at least 1 cell selected per col
    for (let c = 0; c < size; c++) {
      let colHasTrue = false;
      for (let r = 0; r < size; r++) {
        if (solution[r][c]) {
          colHasTrue = true;
          break;
        }
      }
      if (!colHasTrue) {
        const r = Math.floor(rng() * size);
        solution[r][c] = true;
      }
    }

    validSolution = true;
  }

  // Calculate target row and column sums from guaranteed solution
  const rowTargets: number[] = [];
  for (let r = 0; r < size; r++) {
    let sum = 0;
    for (let c = 0; c < size; c++) {
      if (solution[r][c]) {
        sum += grid[r][c];
      }
    }
    rowTargets.push(sum);
  }

  const colTargets: number[] = [];
  for (let c = 0; c < size; c++) {
    let sum = 0;
    for (let r = 0; r < size; r++) {
      if (solution[r][c]) {
        sum += grid[r][c];
      }
    }
    colTargets.push(sum);
  }

  const name = LEVEL_DESCRIPTORS[levelId - 1] || `Level ${levelId}`;

  return {
    id: levelId,
    chapter: chapterConfig.chapter,
    chapterTitle: chapterConfig.title,
    name: `Level ${levelId}: ${name}`,
    size,
    grid,
    solution,
    rowTargets,
    colTargets,
    parTime: chapterConfig.parTime + Math.floor((levelId % 20) * 1.5),
  };
}

// Generate unique daily challenge seeded by date string 'YYYY-MM-DD'
export function generateDailyLevel(dateStr: string): LevelData {
  // Convert date string into numeric hash
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash << 5) - hash + dateStr.charCodeAt(i);
    hash |= 0;
  }
  const rng = createPrng(Math.abs(hash) + 99999);
  
  // Daily challenge is a 4x4 or 5x5 board
  const size = 5;
  const maxVal = 9;

  const grid: number[][] = [];
  for (let r = 0; r < size; r++) {
    const row: number[] = [];
    for (let c = 0; c < size; c++) {
      row.push(Math.floor(rng() * maxVal) + 1);
    }
    grid.push(row);
  }

  const solution: boolean[][] = [];
  for (let r = 0; r < size; r++) {
    const solRow: boolean[] = [];
    for (let c = 0; c < size; c++) {
      solRow.push(rng() > 0.5);
    }
    solution.push(solRow);
  }

  // Ensure balance
  for (let r = 0; r < size; r++) {
    if (!solution[r].some(v => v)) {
      solution[r][Math.floor(rng() * size)] = true;
    }
    if (solution[r].every(v => v)) {
      solution[r][Math.floor(rng() * size)] = false;
    }
  }

  const rowTargets: number[] = [];
  for (let r = 0; r < size; r++) {
    let sum = 0;
    for (let c = 0; c < size; c++) {
      if (solution[r][c]) sum += grid[r][c];
    }
    rowTargets.push(sum);
  }

  const colTargets: number[] = [];
  for (let c = 0; c < size; c++) {
    let sum = 0;
    for (let r = 0; r < size; r++) {
      if (solution[r][c]) sum += grid[r][c];
    }
    colTargets.push(sum);
  }

  return {
    id: -1, // -1 signals Daily Challenge
    chapter: 0,
    chapterTitle: 'Daily Master Challenge',
    name: `Daily Challenge (${dateStr})`,
    size,
    grid,
    solution,
    rowTargets,
    colTargets,
    parTime: 90,
  };
}

// Pre-cached array of 100 levels metadata for fast level select list
export const ALL_LEVELS_METADATA = Array.from({ length: 100 }, (_, i) => {
  const id = i + 1;
  const chapterConfig = CHAPTER_INFO.find(c => id >= c.minLevel && id <= c.maxLevel) || CHAPTER_INFO[0];
  return {
    id,
    chapter: chapterConfig.chapter,
    chapterTitle: chapterConfig.title,
    name: `Level ${id}: ${LEVEL_DESCRIPTORS[i] || `Stage ${id}`}`,
    size: chapterConfig.size,
  };
});
