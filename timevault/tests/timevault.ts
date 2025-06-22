import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { assert, expect } from "chai";
import { Timevault } from "../target/types/timevault";

describe("timevault", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Timevault as Program<Timevault>;
  const user = provider.wallet;

  const title = "My First Capsule";
  const contentType = "text/plain";
  const contentUri = "ipfs://fakehash123";

  let unlockTime: number;
  let capsulePda: anchor.web3.PublicKey;
  let bump: number;

  it("Creates a time capsule", async () => {
    // Set unlock time to 10 seconds in the future
    const now = Math.floor(Date.now() / 1000);
    unlockTime = now + 10;

    // Derive PDA
    [capsulePda, bump] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("capsule"),
        user.publicKey.toBuffer(),
        new anchor.BN(unlockTime).toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    );

    // Send transaction
    await program.methods
      .createCapsule(
        new anchor.BN(unlockTime),
        title,
        contentType,
        contentUri
      )
      .accounts({
        user: user.publicKey,
        capsule: capsulePda,
        systemProgram: anchor.web3.SystemProgram.programId,
      }as any)
      .rpc();

    const capsule = await program.account.timeCapsule.fetch(capsulePda);

    assert.equal(capsule.creator.toBase58(), user.publicKey.toBase58());
    assert.equal(capsule.title, title);
    assert.equal(capsule.contentType, contentType);
    assert.equal(capsule.contentUri, contentUri);
    assert.equal(capsule.isUnlocked, false);
  });

  it("Fails to open capsule before unlock time", async () => {
    try {
      await program.methods
        .openCapsule()
        .accounts({
          creator: user.publicKey,
          capsule: capsulePda,
          clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
        }as any)
        .rpc();

      assert.fail("Should have thrown UnlockTooEarly error");
    } catch (err) {
      const anchorErr = err as anchor.AnchorError;
      expect(anchorErr.error.errorCode.code).to.equal("UnlockTooEarly");
    }
  });

  it("Opens capsule after unlock time", async () => {
    // Wait for unlock time
    console.log("Waiting for capsule to unlock...");
    await new Promise((resolve) => setTimeout(resolve, 20_000));

    await program.methods
      .openCapsule()
      .accounts({
        creator: user.publicKey,
        capsule: capsulePda,
        clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
      }as any)
      .rpc();

    const capsule = await program.account.timeCapsule.fetch(capsulePda);
    assert.equal(capsule.isUnlocked, true);
  });
});
