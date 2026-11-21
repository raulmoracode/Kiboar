pub mod bootloader;
pub mod device;
pub mod protocol;

pub use bootloader::classify;
pub use device::{
    is_kiboar_product, BoardInfo, Device, MatrixSize, McuFamily, KIBOAR_PRODUCT_PREFIX, KIBOAR_VID,
};
pub use protocol::{parse_board_info, ProtocolError, INFO_VERSION, PAYLOAD_LEN, REPORT_ID};
