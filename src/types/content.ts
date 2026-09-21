export interface LearningActivity {
  id: string;
  emoji: string;
  category: string;
  title: string;
  description: string;
  age: string;
  duration: string;
  skills: string[];
  materials: string[];
  steps: string[];
}

export interface TeachingMedia {
  id: string;
  emoji: string;
  title: string;
  kind: string;        // เช่น บัตรภาพ / เพลง / นิทาน / ของเล่น
  description: string;
  usage: string[];
}

export interface Worksheet {
  id: string;
  emoji: string;
  title: string;
  unit: string;
  skill: string;
  description: string;
  instructions: string[];
}

export interface TeacherNote {
  id: string;
  emoji: string;
  title: string;
  summary: string;
  points: string[];
}
