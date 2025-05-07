// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { Cluster, PublicKey } from '@solana/web3.js'
import TimevaultIDL from '../target/idl/timevault.json'
import type { Timevault } from '../target/types/timevault'

// Re-export the generated IDL and type
export { Timevault, TimevaultIDL }

// The programId is imported from the program IDL.
export const TIMEVAULT_PROGRAM_ID = new PublicKey(TimevaultIDL.address)

// This is a helper function to get the Tokenvesting Anchor program.
export function getTimevaultProgram(provider: AnchorProvider, address?: PublicKey): Program<Timevault> {
  return new Program({ ...TimevaultIDL, address: address ? address.toBase58() : TimevaultIDL.address } as Timevault, provider)
}

// This is a helper function to get the program ID for the Tokenvesting program depending on the cluster.
export function getTimevaultProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      // This is the program ID for the Tokenvesting program on devnet and testnet.
      return new PublicKey('5RQg8HaGADZUWhqB6UAKf98XnnSkdCJeqByaFG4ES5Rb')
    case 'mainnet-beta':
    default:
      return TIMEVAULT_PROGRAM_ID
  }
}