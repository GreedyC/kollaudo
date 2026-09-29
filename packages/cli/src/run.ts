import { parseArgs } from "node:util";

export const VERSION = "0.0.0";

export const HELP = `Usage: kollaudo <command> [options]

Send test results to Kollaudo from any CI or script.

Commands:
  push <report>   Send a CTRF test report (coming in v0.1)

Options:
  -h, --help      Show this help
  -v, --version   Show the CLI version

Environment:
  KOLLAUDO_URL    URL of your Kollaudo server
  KOLLAUDO_TOKEN  API token of your project
`;

export interface Io {
  out: (text: string) => void;
  err: (text: string) => void;
}

/** Runs the CLI with the given arguments and returns the exit code. */
export function run(args: string[], io: Io): number {
  let parsed: ReturnType<typeof parse>;
  try {
    parsed = parse(args);
  } catch (error) {
    io.err(`${(error as Error).message}\n\n${HELP}`);
    return 1;
  }

  const { values, positionals } = parsed;

  if (values.version) {
    io.out(`${VERSION}\n`);
    return 0;
  }

  if (values.help || positionals.length === 0) {
    io.out(HELP);
    return 0;
  }

  io.err(`Unknown command: ${positionals[0]}\n\n${HELP}`);
  return 1;
}

function parse(args: string[]) {
  return parseArgs({
    args,
    allowPositionals: true,
    options: {
      help: { type: "boolean", short: "h" },
      version: { type: "boolean", short: "v" },
    },
  });
}
