// Per-stream display metadata for the bold "digitalised" path tiles: a distinct neon accent
// color per skill track, 3-4 real skill tags derived from that path's actual module titles
// (content/*.json — not invented), and a difficulty level derived from the highest module
// tier reached in that stream (per the modules.tier column).

export type Difficulty = "beginner" | "intermediate" | "advanced";

export type PathMeta = {
  accent: string;
  skills: string[];
  difficulty: Difficulty;
};

export const pathMeta: Record<string, PathMeta> = {
  "common-core": {
    accent: "#baff2e",
    skills: ["Problem Solving", "Git & GitHub", "Python Basics", "Career Prep"],
    difficulty: "beginner",
  },
  "cloud-devops": {
    accent: "#00e5ff",
    skills: ["Linux", "Docker", "SQL", "Cloud Deploy"],
    difficulty: "intermediate",
  },
  aiml: {
    accent: "#b967ff",
    skills: ["Python", "scikit-learn", "PyTorch", "LLMs & GenAI"],
    difficulty: "advanced",
  },
  "software-engineer": {
    accent: "#ffcc00",
    skills: ["Big-O & DSA", "Data Structures", "System Design"],
    difficulty: "intermediate",
  },
  fullstack: {
    accent: "#ff3d81",
    skills: ["JavaScript", "React", "Node & Express"],
    difficulty: "intermediate",
  },
  data: {
    accent: "#00ffb3",
    skills: ["Statistics", "SQL & Pandas", "ML for Analysts"],
    difficulty: "advanced",
  },
  cybersecurity: {
    accent: "#ff5b3d",
    skills: ["Networking", "Web Security", "SOC & Response"],
    difficulty: "advanced",
  },
};

export const difficultyLabel: Record<Difficulty, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export const difficultyLevel: Record<Difficulty, number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
};
