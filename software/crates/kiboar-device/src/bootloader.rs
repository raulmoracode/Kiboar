use crate::device::McuFamily;

/// USB identities exposed by the ROM bootloader of each supported family.
/// These are chip identities, not board identities: they tell the application
/// which MCU family it is talking to, never which keyboard.
pub const RP2040_BOOTSEL: (u16, u16) = (0x2E8A, 0x0003);
pub const STM32_DFU: (u16, u16) = (0x0483, 0xDF11);
pub const ESP32_S3_ROM: (u16, u16) = (0x303A, 0x1001);

pub fn classify(vid: u16, pid: u16) -> Option<McuFamily> {
    match (vid, pid) {
        RP2040_BOOTSEL => Some(McuFamily::Rp2040),
        STM32_DFU => Some(McuFamily::Stm32),
        ESP32_S3_ROM => Some(McuFamily::Esp32S3),
        _ => None,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn classifies_the_supported_bootloaders() {
        assert_eq!(classify(0x2E8A, 0x0003), Some(McuFamily::Rp2040));
        assert_eq!(classify(0x0483, 0xDF11), Some(McuFamily::Stm32));
        assert_eq!(classify(0x303A, 0x1001), Some(McuFamily::Esp32S3));
    }

    #[test]
    fn ignores_a_device_that_is_not_a_bootloader() {
        assert_eq!(classify(0x2E8A, 0x0005), None);
        assert_eq!(classify(0x1209, 0x0001), None);
    }
}
