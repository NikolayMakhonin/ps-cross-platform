import type {SendHandle, Serializable} from 'child_process'
import type {Readable} from 'stream'

export interface TProcessLike {
  stdout: Readable | null;
  stderr: Readable | null;
  on(event: 'close', listener: (code: number | null, signal: NodeJS.Signals | null) => void): this;
  on(event: 'disconnect', listener: () => void): this;
  on(event: 'error', listener: (err: Error) => void): this;
  on(event: 'exit', listener: (code: number | null, signal: NodeJS.Signals | null) => void): this;
  on(event: 'message', listener: (message: Serializable, sendHandle: SendHandle) => void): this;
  on(event: 'spawn', listener: () => void): this;
}

export function waitProcess({
  proc,
}: {
  proc: TProcessLike,
}): Promise<{
  code: number | null
  signal: NodeJS.Signals | null
}> {
  return new Promise((resolve) => {
    proc
      .on('close', (code, signal) => {
        resolve({code, signal})
      })
  })
}

export function processSubscribe({
  proc,
  onMessage,
  onStdout,
  onStderr,
}: {
  proc: TProcessLike,
  onMessage?: (message: Serializable, sendHandle: SendHandle) => void,
  onStdout?: (chunk: Buffer) => void,
  onStderr?: (chunk: Buffer) => void,
}) {
  const unsubscribers = []

  if (onMessage) {
    unsubscribers.push(proc.on('message', onMessage))
  }

  if (onStdout && proc.stdout) {
    unsubscribers.push(proc.stdout.on('data', onStdout))
  }

  if (onStderr && proc.stderr) {
    unsubscribers.push(proc.stderr.on('data', onStderr))
  }

  return () => {
    unsubscribers.forEach(unsubscribe => unsubscribe())
    unsubscribers.length = 0
  }
}

export async function waitProcessData({
  proc,
}: {
  proc: TProcessLike,
}): Promise<{
  out: string,
  err: string,
  both: string,
  code?: number,
  signal?: NodeJS.Signals,
}> {
  let out = ''
  let err = ''
  let both = ''

  processSubscribe({
    proc,
    onStdout(chunk) {
      const str = chunk.toString()
      out += str
      both += str
    },
    onStderr(chunk) {
      const str = chunk.toString()
      err += str
      both += str
    },
  })

  const {code, signal} = await waitProcess({proc})

  return {
    out,
    err,
    both,
    code,
    signal,
  }
}
