use serde::Serialize;
use ts_rs::TS;

/// Vendor id allocated at pid.codes for open source hardware. The pid.codes
/// vendor id is shared with other projects, so the product string is part of
/// the discovery filter.
pub const KIBOAR_VID: u16 = 0x1209;
pub const KIBOAR_PRODUCT_PREFIX: &str = "Kiboar ";

pub fn is_kiboar_product(product: Option<&str>) -> bool {
    product.is_some_and(|value| value.starts_with(KIBOAR_PRODUCT_PREFIX))
}

/// The MCU family a bootloader belongs to. Flashing is only implemented for
/// RP2040 in M2; the other families are recognised so the application can say
/// what it found instead of treating them as unknown.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, TS)]
#[serde(rename_all = "snake_case")]
#[ts(export, export_to = "../../../app/src/lib/bindings/")]
pub enum McuFamily {
    Rp2040,
    Stm32,
    Esp32S3,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, TS)]
#[ts(export, export_to = "../../../app/src/lib/bindings/")]
pub struct MatrixSize {
    pub rows: u8,
    pub cols: u8,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, TS)]
#[ts(export, export_to = "../../../app/src/lib/bindings/")]
pub struct BoardInfo {
    pub board_id: String,
    pub hw_rev: u8,
    pub fw_version: String,
    pub protocol_version: u8,
    pub serial: u32,
    pub matrix: MatrixSize,
    pub layers: u8,
    pub split: bool,
}

/// One device the application can see. The tag is the state the UI shows:
/// a bootloader to flash, a Kiboar board to configure, or something it cannot
/// identify.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, TS)]
#[serde(tag = "kind", rename_all = "snake_case")]
#[ts(export, export_to = "../../../app/src/lib/bindings/")]
pub enum Device {
    Bootloader {
        id: String,
        family: McuFamily,
        vid: u16,
        pid: u16,
        product: Option<String>,
    },
    Kiboar {
        id: String,
        vid: u16,
        pid: u16,
        product: Option<String>,
        info: BoardInfo,
    },
    Unknown {
        id: String,
        vid: u16,
        pid: u16,
        product: Option<String>,
        reason: Option<String>,
    },
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn accepts_a_kiboar_product_string() {
        assert!(is_kiboar_product(Some("Kiboar kb60-hhkb")));
    }

    #[test]
    fn rejects_another_product_under_the_shared_vendor_id() {
        assert!(!is_kiboar_product(Some("Some other pid.codes project")));
        assert!(!is_kiboar_product(Some("kiboar lowercase")));
        assert!(!is_kiboar_product(None));
    }
}
