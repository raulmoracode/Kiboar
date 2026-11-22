//! Verification and transfer of a Kiboar firmware artefact.
//!
//! The crate is deliberately free of Tauri, USB and filesystem specifics so it
//! can be tested without a device. The application layer detects the bootloader
//! volume, calls [`verify_artifact`] and then [`write_artifact`].

mod artifact;
mod copy;
mod digest;
mod error;
mod signature;
mod uf2;

pub use artifact::{verify_artifact, VerificationPolicy};
pub use copy::{write_artifact, Progress, WriteError, CHUNK_SIZE};
pub use digest::{sha256_hex, verify_sha256, DigestError};
pub use error::ArtifactError;
pub use signature::{verify_minisign_signature, SignatureError};
pub use uf2::{
    Uf2, Uf2Block, Uf2Error, BLOCK_SIZE, DATA_SIZE, FLAG_FAMILY_ID_PRESENT, FLAG_FILE_CONTAINER,
    FLAG_NOT_MAIN_FLASH, MAGIC_END, MAGIC_START0, MAGIC_START1, RP2040_FAMILY_ID,
};
