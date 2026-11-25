use crate::{verify_minisign_signature, verify_sha256, ArtifactError, Uf2};

/// Everything the application knows about an official artefact before writing.
#[derive(Debug, Clone, Copy)]
pub struct VerificationPolicy<'a> {
    pub expected_sha256: &'a str,
    /// Contents of the `.minisig` file.
    pub signature: &'a str,
    /// Base64 public key or the contents of a `.pub` file.
    pub public_key: &'a str,
    /// MCU family detected over USB, for example [`crate::RP2040_FAMILY_ID`].
    pub family_id: u32,
}

/// Parse, verify and validate an artefact in the order that fails fastest.
///
/// The structural check runs first, then the digest, then the signature, and
/// only then the family check. No bytes are written here.
pub fn verify_artifact(
    bytes: &[u8],
    policy: &VerificationPolicy<'_>,
) -> Result<Uf2, ArtifactError> {
    let uf2 = Uf2::parse(bytes)?;
    verify_sha256(bytes, policy.expected_sha256)?;
    verify_minisign_signature(bytes, policy.signature, policy.public_key)?;
    uf2.validate_for_family(policy.family_id)?;
    Ok(uf2)
}

#[cfg(test)]
mod tests {
    use std::io::Cursor;

    use minisign::{sign, KeyPair};

    use crate::{
        sha256_hex, Uf2Error, BLOCK_SIZE, DATA_SIZE, FLAG_FAMILY_ID_PRESENT, MAGIC_END,
        MAGIC_START0, MAGIC_START1, RP2040_FAMILY_ID, RP2040_FLASH_START,
    };

    use super::*;

    fn artefact() -> Vec<u8> {
        let mut raw = [0u8; BLOCK_SIZE];
        raw[0..4].copy_from_slice(&MAGIC_START0.to_le_bytes());
        raw[4..8].copy_from_slice(&MAGIC_START1.to_le_bytes());
        raw[8..12].copy_from_slice(&FLAG_FAMILY_ID_PRESENT.to_le_bytes());
        raw[12..16].copy_from_slice(&RP2040_FLASH_START.to_le_bytes());
        raw[16..20].copy_from_slice(&(DATA_SIZE as u32).to_le_bytes());
        raw[24..28].copy_from_slice(&1u32.to_le_bytes());
        raw[28..32].copy_from_slice(&RP2040_FAMILY_ID.to_le_bytes());
        raw[BLOCK_SIZE - 4..].copy_from_slice(&MAGIC_END.to_le_bytes());
        raw.to_vec()
    }

    fn signed() -> (Vec<u8>, String, String, String) {
        let bytes = artefact();
        let digest = sha256_hex(&bytes);
        let KeyPair { pk, sk } = KeyPair::generate_unencrypted_keypair().unwrap();
        let public_key = pk.to_box().unwrap().to_string();
        let signature = sign(None, &sk, Cursor::new(&bytes), Some("test"), None)
            .unwrap()
            .to_string();
        (bytes, digest, signature, public_key)
    }

    #[test]
    fn accepts_a_signed_artefact_for_the_detected_family() {
        let (bytes, digest, signature, public_key) = signed();
        let policy = VerificationPolicy {
            expected_sha256: &digest,
            signature: &signature,
            public_key: &public_key,
            family_id: RP2040_FAMILY_ID,
        };

        let uf2 = verify_artifact(&bytes, &policy).unwrap();
        assert_eq!(uf2.block_count(), 1);
    }

    #[test]
    fn rejects_a_wrong_digest_before_checking_the_signature() {
        let (bytes, _digest, signature, public_key) = signed();
        let zeros = "0".repeat(64);
        let policy = VerificationPolicy {
            expected_sha256: &zeros,
            signature: &signature,
            public_key: &public_key,
            family_id: RP2040_FAMILY_ID,
        };

        assert!(matches!(
            verify_artifact(&bytes, &policy),
            Err(ArtifactError::Digest(_))
        ));
    }

    #[test]
    fn rejects_a_tampered_artefact() {
        let (mut bytes, digest, signature, public_key) = signed();
        let policy = VerificationPolicy {
            expected_sha256: &digest,
            signature: &signature,
            public_key: &public_key,
            family_id: RP2040_FAMILY_ID,
        };
        bytes[32] ^= 0xFF;

        assert!(matches!(
            verify_artifact(&bytes, &policy),
            Err(ArtifactError::Digest(_))
        ));
    }

    #[test]
    fn rejects_a_valid_artefact_for_another_family() {
        let (bytes, digest, signature, public_key) = signed();
        let policy = VerificationPolicy {
            expected_sha256: &digest,
            signature: &signature,
            public_key: &public_key,
            family_id: 0x1234_5678,
        };

        assert!(matches!(
            verify_artifact(&bytes, &policy),
            Err(ArtifactError::Uf2(Uf2Error::FamilyMismatch { .. }))
        ));
    }
}
