import fs from 'fs/promises';
import path from 'path';

export async function fetchDishesServer() {
  const filePath = path.join(process.cwd(), 'public', 'menu-data.json');
  const fileContents = await fs.readFile(filePath, 'utf8');
  return JSON.parse(fileContents);
}
