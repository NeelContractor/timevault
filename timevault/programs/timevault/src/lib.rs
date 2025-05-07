#![allow(clippy::result_large_err)]
#![allow(unexpected_cfgs)]

use anchor_lang::prelude::*;

declare_id!("5RQg8HaGADZUWhqB6UAKf98XnnSkdCJeqByaFG4ES5Rb");

#[program]
pub mod timevault {
    use super::*;

    pub fn create_capsule(ctx: Context<CreateCapsule>, unlock_time: i64, title: String, content_type: String, content_uri: String) -> Result<()> {
        let capsule = &mut ctx.accounts.capsule;
        let clock = Clock::get()?;

        capsule.creator = *ctx.accounts.user.key;
        capsule.unlock_time = unlock_time;
        capsule.created_at = clock.unix_timestamp;
        capsule.title = title;
        capsule.content_type = content_type;
        capsule.content_uri = content_uri;
        capsule.is_unlocked = false;

        Ok(())
    }

    pub fn open_capsule(ctx: Context<OpenCapsule>) -> Result<()> {
        let capsule = &mut ctx.accounts.capsule;
        let now = Clock::get()?.unix_timestamp;

        require!(now > capsule.unlock_time, CapsuleError::UnlockTooEarly);
        capsule.is_unlocked = true;

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(unlock_time: i64)]
pub struct CreateCapsule<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        init,
        payer = user,
        space = 8 + TimeCapsule::INIT_SPACE,
        seeds = [b"capsule", user.key().as_ref(), unlock_time.to_le_bytes().as_ref()],
        bump
    )]
    pub capsule: Account<'info, TimeCapsule>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct OpenCapsule<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,
    #[account(
        mut,
        has_one = creator
    )]
    pub capsule: Account<'info, TimeCapsule>,
    pub clock: Sysvar<'info, Clock>,
}

#[account]
#[derive(InitSpace)]
pub struct TimeCapsule {
    pub creator: Pubkey,
    #[max_len(50)]
    pub title: String,
    pub created_at: i64,
    pub unlock_time: i64,
    #[max_len(50)]
    pub content_type: String,
    #[max_len(50)]
    pub content_uri: String,
    pub is_unlocked: bool
}

#[error_code]
pub enum CapsuleError {
    #[msg("Capsule not Open yet.")]
    UnlockTooEarly,
}