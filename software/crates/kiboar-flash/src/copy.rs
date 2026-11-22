use std::io::{self, Write};
use std::sync::atomic::{AtomicBool, Ordering};

use thiserror::Error;

/// Bytes written between progress callbacks and cancellation checks.
pub const CHUNK_SIZE: usize = 16 * 1024;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct Progress {
    pub bytes_written: u64,
    pub total_bytes: u64,
}

/// Copy the artefact to a writer, reporting progress and honouring cancellation.
///
/// The artefact is copied byte for byte: the RP2040 bootloader reads the UF2
/// file from the mounted volume and performs the flash itself. The caller owns
/// the destination file and must remove it when this returns
/// [`WriteError::Cancelled`] or [`WriteError::Io`]; the crate cannot know the
/// path.
pub fn write_artifact<W, F>(
    artifact: &[u8],
    writer: &mut W,
    mut on_progress: F,
    cancel: &AtomicBool,
) -> Result<u64, WriteError>
where
    W: Write,
    F: FnMut(Progress),
{
    let total = artifact.len() as u64;
    let mut written = 0u64;

    for chunk in artifact.chunks(CHUNK_SIZE) {
        if cancel.load(Ordering::Relaxed) {
            return Err(WriteError::Cancelled);
        }
        writer.write_all(chunk)?;
        written += chunk.len() as u64;
        on_progress(Progress {
            bytes_written: written,
            total_bytes: total,
        });
    }

    if cancel.load(Ordering::Relaxed) {
        return Err(WriteError::Cancelled);
    }
    writer.flush()?;
    Ok(written)
}

#[derive(Debug, Error)]
pub enum WriteError {
    #[error("the write was cancelled; the partial file must be removed")]
    Cancelled,
    #[error("the write failed: {0}")]
    Io(#[from] io::Error),
}

#[cfg(test)]
mod tests {
    use std::sync::Arc;

    use super::*;

    #[derive(Default)]
    struct MemoryWriter {
        bytes: Vec<u8>,
        flushed: bool,
    }

    impl Write for MemoryWriter {
        fn write(&mut self, buf: &[u8]) -> io::Result<usize> {
            self.bytes.extend_from_slice(buf);
            Ok(buf.len())
        }

        fn flush(&mut self) -> io::Result<()> {
            self.flushed = true;
            Ok(())
        }
    }

    struct FailingWriter;

    impl Write for FailingWriter {
        fn write(&mut self, _buf: &[u8]) -> io::Result<usize> {
            Err(io::Error::other("disk full"))
        }

        fn flush(&mut self) -> io::Result<()> {
            Ok(())
        }
    }

    struct CancellingWriter {
        cancel: Arc<AtomicBool>,
        written: usize,
    }

    impl Write for CancellingWriter {
        fn write(&mut self, buf: &[u8]) -> io::Result<usize> {
            self.written += buf.len();
            self.cancel.store(true, Ordering::Relaxed);
            Ok(buf.len())
        }

        fn flush(&mut self) -> io::Result<()> {
            Ok(())
        }
    }

    #[test]
    fn copies_every_byte_and_reports_progress() {
        let artifact = vec![7u8; CHUNK_SIZE * 2 + 10];
        let cancel = AtomicBool::new(false);
        let mut writer = MemoryWriter::default();
        let mut progress = Vec::new();

        let written = write_artifact(
            &artifact,
            &mut writer,
            |update| progress.push(update),
            &cancel,
        )
        .unwrap();

        assert_eq!(written, artifact.len() as u64);
        assert_eq!(writer.bytes, artifact);
        assert!(writer.flushed);
        assert_eq!(progress.len(), 3);
        assert_eq!(
            progress.last().unwrap().bytes_written,
            artifact.len() as u64
        );
        assert_eq!(progress.last().unwrap().total_bytes, artifact.len() as u64);
    }

    #[test]
    fn copies_an_empty_artefact() {
        let cancel = AtomicBool::new(false);
        let mut writer = MemoryWriter::default();

        let written = write_artifact(&[], &mut writer, |_| {}, &cancel).unwrap();

        assert_eq!(written, 0);
        assert!(writer.flushed);
    }

    #[test]
    fn stops_before_writing_when_already_cancelled() {
        let cancel = AtomicBool::new(true);
        let mut writer = MemoryWriter::default();

        let error = write_artifact(b"firmware", &mut writer, |_| {}, &cancel).unwrap_err();

        assert!(matches!(error, WriteError::Cancelled));
        assert!(writer.bytes.is_empty());
    }

    #[test]
    fn stops_between_chunks_when_cancelled() {
        let artifact = vec![7u8; CHUNK_SIZE * 3];
        let cancel = Arc::new(AtomicBool::new(false));
        let mut writer = CancellingWriter {
            cancel: Arc::clone(&cancel),
            written: 0,
        };

        let error = write_artifact(&artifact, &mut writer, |_| {}, &cancel).unwrap_err();

        assert!(matches!(error, WriteError::Cancelled));
        assert_eq!(writer.written, CHUNK_SIZE);
    }

    #[test]
    fn propagates_writer_errors() {
        let cancel = AtomicBool::new(false);
        let error = write_artifact(b"firmware", &mut FailingWriter, |_| {}, &cancel).unwrap_err();

        assert!(matches!(error, WriteError::Io(_)));
    }
}
