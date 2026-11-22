use sha2::{Digest, Sha256};
use thiserror::Error;

/// Lowercase hexadecimal SHA-256 of `bytes`.
pub fn sha256_hex(bytes: &[u8]) -> String {
    let digest = Sha256::digest(bytes);
    let mut hex = String::with_capacity(digest.len() * 2);
    for byte in digest {
        use std::fmt::Write as _;
        let _ = write!(hex, "{byte:02x}");
    }
    hex
}

/// Compare an artefact with the digest declared by the registry.
///
/// The expected value is normalised to lowercase so a digest copied from a
/// different tool still matches.
pub fn verify_sha256(bytes: &[u8], expected_hex: &str) -> Result<(), DigestError> {
    let expected = expected_hex.trim().to_ascii_lowercase();
    if expected.len() != 64 {
        return Err(DigestError::InvalidLength {
            length: expected.len(),
        });
    }
    if !expected.bytes().all(|byte| byte.is_ascii_hexdigit()) {
        return Err(DigestError::NotHexadecimal);
    }

    let actual = sha256_hex(bytes);
    if actual == expected {
        Ok(())
    } else {
        Err(DigestError::Mismatch { expected, actual })
    }
}

#[derive(Debug, Error, PartialEq, Eq)]
pub enum DigestError {
    #[error("the expected SHA-256 has {length} characters, not 64")]
    InvalidLength { length: usize },
    #[error("the expected SHA-256 is not hexadecimal")]
    NotHexadecimal,
    #[error("SHA-256 mismatch: expected {expected}, got {actual}")]
    Mismatch { expected: String, actual: String },
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn hashes_the_standard_vectors() {
        assert_eq!(
            sha256_hex(b""),
            "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
        );
        assert_eq!(
            sha256_hex(b"abc"),
            "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"
        );
    }

    #[test]
    fn accepts_the_declared_digest_in_any_case() {
        let digest = sha256_hex(b"firmware");
        assert!(verify_sha256(b"firmware", &digest.to_uppercase()).is_ok());
    }

    #[test]
    fn rejects_a_different_artefact() {
        let digest = sha256_hex(b"firmware");
        assert!(matches!(
            verify_sha256(b"other", &digest),
            Err(DigestError::Mismatch { .. })
        ));
    }

    #[test]
    fn rejects_a_malformed_digest() {
        assert_eq!(
            verify_sha256(b"firmware", "abc"),
            Err(DigestError::InvalidLength { length: 3 })
        );
        let wrong = "z".repeat(64);
        assert_eq!(
            verify_sha256(b"firmware", &wrong),
            Err(DigestError::NotHexadecimal)
        );
    }
}
