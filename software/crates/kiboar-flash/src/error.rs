use thiserror::Error;

use crate::{DigestError, SignatureError, Uf2Error};

/// Everything that can go wrong while checking an artefact before a write.
#[derive(Debug, Error)]
pub enum ArtifactError {
    #[error(transparent)]
    Uf2(#[from] Uf2Error),
    #[error(transparent)]
    Digest(#[from] DigestError),
    #[error(transparent)]
    Signature(#[from] SignatureError),
}
