import "server-only";
import { mkdir, unlink } from "node:fs/promises";
import { join, resolve } from "node:path";

export function portfolioStorageDir(): string {
  return resolve(process.env.PORTFOLIO_STORAGE_DIR || join(process.cwd(), "var", "portfolio"));
}

export async function ensurePortfolioStorage(): Promise<string> {
  const directory = portfolioStorageDir();
  await mkdir(directory, { recursive: true, mode: 0o750 });
  return directory;
}

export async function deletePortfolioImage(imageUrl: string | null): Promise<void> {
  const match = imageUrl?.match(/^\/api\/media\/([0-9a-f-]{36}\.(?:jpg|png|webp))$/i);
  if (!match) return;
  try {
    await unlink(join(portfolioStorageDir(), match[1]));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
}
