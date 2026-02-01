import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const libPath = path.join(process.cwd(), 'lib');

// Load a single game from its directory
function loadGame(gamePath: string, fallbackName: string) {
  const dataJsonPath = path.join(gamePath, 'data.json');
  if (!fs.existsSync(dataJsonPath)) return null;
  
  const dataJson = JSON.parse(fs.readFileSync(dataJsonPath, 'utf-8'));
  
  const gameStepsCodes = fs.readdirSync(gamePath)
    .filter(f => /^code_step\d+\.py$/.test(f))
    .sort((a, b) => parseInt(a.match(/\d+/)?.[0] || '0') - parseInt(b.match(/\d+/)?.[0] || '0'))
    .map(file => fs.readFileSync(path.join(gamePath, file), 'utf-8'));
  
  return {
    gameName: dataJson.gameTitle || fallbackName,
    baseExplanations: dataJson.baseExplanations || [],
    gameDoc: dataJson.CurrentGame || {},
    gameStepsCodes,
  };
}

export async function GET(request: Request) {
  try {
    const gameName = new URL(request.url).searchParams.get('game');
    
    // Load specific game
    if (gameName) {
      const game = loadGame(path.join(libPath, gameName), gameName);
      if (!game) {
        return NextResponse.json({ error: `Game ${gameName} not found`, data: [] }, { status: 404 });
      }
      return NextResponse.json({ data: [game] });
    }
    
    // Load all games
    const games = fs.readdirSync(libPath, { withFileTypes: true })
      .filter(entry => entry.isDirectory())
      .map(entry => {
        try {
          return loadGame(path.join(libPath, entry.name), entry.name);
        } catch (e) {
          console.error(`Error loading game ${entry.name}:`, e);
          return null;
        }
      })
      .filter(Boolean);
    
    return NextResponse.json({ data: games });
  } catch (error) {
    console.error('Error loading local games:', error);
    return NextResponse.json({ error: String(error), data: [] }, { status: 500 });
  }
}
