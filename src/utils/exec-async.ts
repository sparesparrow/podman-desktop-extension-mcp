import { exec, ExecOptions } from 'child_process';
import { promisify } from 'util';

export const execAsync = promisify(exec);

export interface ExecResult {
  stdout: string;
  stderr: string;
}

export async function execWithOptions(
  command: string,
  options: ExecOptions = {}
): Promise<ExecResult> {
  try {
    const { stdout, stderr } = await execAsync(command, options);
    return { stdout, stderr };
  } catch (error) {
    throw new Error(`Command execution failed: ${error}`);
  }
} 