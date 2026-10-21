export function normalizeSkills(skills: string[]): string[] {
  const aliases: Record<string, string> = {
    'reactjs': 'React',
    'react.js': 'React',
    'react js': 'React',
    'postgres': 'PostgreSQL',
    'postgres db': 'PostgreSQL',
    'vuejs': 'Vue.js',
    'vue': 'Vue.js',
    'node': 'Node.js',
    'nodejs': 'Node.js',
    'node.js': 'Node.js',
  };

  const normalized = skills.map(s => {
    const lower = s.toLowerCase().trim();
    return aliases[lower] || s.trim();
  });

  return Array.from(new Set(normalized));
}
