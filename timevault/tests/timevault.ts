import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Timevault } from "../target/types/timevault";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { assert, expect } from "chai";

describe("timevault", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Timevault as Program<Timevault>;

  let capsulePda: PublicKey;
  let bump: number;
  const creator = provider.wallet.publicKey;

  const unlockInSeconds = 5;
  const now = Math.floor(Date.now() / 1000);
  const unlockTimestamp = now + unlockInSeconds;
  const title = "First title"

  it("Create a capsule", async () => {
    [capsulePda, bump] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("capsule"),
        creator.toBuffer(),
        new anchor.BN(unlockTimestamp).toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    );

    await program.methods
      .createCapsule(
        new anchor.BN(unlockTimestamp),
        title,
        "ipfs://dummyhash",
        "text"
      )
      .accounts({
        capsule: capsulePda,
        user: creator,
        systemProgram: SystemProgram.programId
      } as any)
      .rpc();

      const capsule = await program.account.timeCapsule.fetch(capsulePda);
      console.log(capsule);
      assert.equal(capsule.creator.toBase58(), creator.toBase58());
      assert.equal(capsule.isUnlocked, false);
  });

  it("Fails to unlock before unlockTimestamp", async() => {
    try {
      await program.methods
        .openCapsule()
        .accounts({
          capsule: capsulePda,
          creator,
          clock: anchor.web3.SYSVAR_CLOCK_PUBKEY
        } as any)
        .rpc();
        const capsule = await program.account.timeCapsule.fetch(capsulePda);
        console.log(capsule)
        assert.fail("Capsule unlocked too early!");
    } catch (err) {
      assert.ok(err.message.includes("UnlockTooEarly"));
    }
  });

  it("Unlocks capsule after unlockTimestamp", async() => {
    await new Promise((resolve) => setTimeout(resolve, unlockInSeconds * 1000 + 6000));

    await program.methods
      .openCapsule()
      .accounts({
        capsule: capsulePda,
        creator,
        clock: anchor.web3.SYSVAR_CLOCK_PUBKEY
      } as any)
      .rpc();

      const capsule = await program.account.timeCapsule.fetch(capsulePda);
      console.log(capsule)
      assert.equal(capsule.isUnlocked, true);
  })
});
