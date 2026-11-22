use minisign_verify::{PublicKey, Signature};
use thiserror::Error;

/// Verify a minisign signature over the exact artefact bytes.
///
/// `public_key` accepts either a base64 key or the contents of a `.pub` file;
/// `signature` is the contents of the `.minisig` file.
pub fn verify_minisign_signature(
    data: &[u8],
    signature: &str,
    public_key: &str,
) -> Result<(), SignatureError> {
    let key = if public_key.contains('\n') {
        PublicKey::decode(public_key)
    } else {
        PublicKey::from_base64(public_key.trim())
    }
    .map_err(|error| SignatureError::MalformedPublicKey(error.to_string()))?;

    let signature = Signature::decode(signature)
        .map_err(|error| SignatureError::MalformedSignature(error.to_string()))?;

    key.verify(data, &signature, false)
        .map_err(|_| SignatureError::Rejected)
}

#[derive(Debug, Error, PartialEq, Eq)]
pub enum SignatureError {
    #[error("the public key is malformed: {0}")]
    MalformedPublicKey(String),
    #[error("the signature is malformed: {0}")]
    MalformedSignature(String),
    #[error("the signature does not match the artefact or the public key")]
    Rejected,
}

#[cfg(test)]
mod tests {
    use std::io::Cursor;

    use minisign::{sign, KeyPair};

    use super::*;

    fn signed(data: &[u8]) -> (String, String) {
        let KeyPair { pk, sk } = KeyPair::generate_unencrypted_keypair().unwrap();
        let public_key = pk.to_box().unwrap().to_string();
        let signature = sign(None, &sk, Cursor::new(data), Some("test"), None)
            .unwrap()
            .to_string();
        (public_key, signature)
    }

    #[test]
    fn accepts_a_valid_signature() {
        let data = b"kiboar firmware";
        let (public_key, signature) = signed(data);
        assert!(verify_minisign_signature(data, &signature, &public_key).is_ok());
    }

    #[test]
    fn rejects_tampered_data() {
        let (public_key, signature) = signed(b"kiboar firmware");
        assert_eq!(
            verify_minisign_signature(b"kiboar firmware!", &signature, &public_key),
            Err(SignatureError::Rejected)
        );
    }

    #[test]
    fn rejects_a_different_key() {
        let data = b"kiboar firmware";
        let (_, signature) = signed(data);
        let (other_key, _) = signed(b"other");
        assert_eq!(
            verify_minisign_signature(data, &signature, &other_key),
            Err(SignatureError::Rejected)
        );
    }

    #[test]
    fn rejects_a_malformed_public_key() {
        let (_, signature) = signed(b"data");
        assert!(matches!(
            verify_minisign_signature(b"data", &signature, "not a key"),
            Err(SignatureError::MalformedPublicKey(_))
        ));
    }

    #[test]
    fn rejects_a_malformed_signature() {
        let (public_key, _) = signed(b"data");
        assert!(matches!(
            verify_minisign_signature(b"data", "not a signature", &public_key),
            Err(SignatureError::MalformedSignature(_))
        ));
    }
}
