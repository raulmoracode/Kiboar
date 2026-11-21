use hidapi::HidApi;
use kiboar_device::bootloader::classify;
use kiboar_device::device::BoardInfo;
use kiboar_device::protocol::{parse_board_info, INFO_VERSION, PAYLOAD_LEN, REPORT_ID};
use kiboar_device::{is_kiboar_product, Device, KIBOAR_VID};
use nusb::MaybeFuture;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum ScanError {
    #[error("USB enumeration failed: {0}")]
    Usb(#[from] nusb::Error),
    #[error("HID enumeration failed: {0}")]
    Hid(#[from] hidapi::HidError),
}

#[derive(Debug, Error)]
pub enum ProbeError {
    #[error(transparent)]
    Hid(#[from] hidapi::HidError),
    #[error("short board info report: {0} bytes")]
    ShortReport(usize),
    #[error("unexpected feature report id {0:#04x}")]
    WrongReportId(u8),
    #[error(transparent)]
    Protocol(#[from] kiboar_device::ProtocolError),
}

pub fn scan_devices() -> Result<Vec<Device>, ScanError> {
    let mut devices = Vec::new();
    scan_bootloaders(&mut devices)?;
    scan_kiboar(&mut devices)?;
    Ok(devices)
}

fn scan_bootloaders(devices: &mut Vec<Device>) -> Result<(), ScanError> {
    for info in nusb::list_devices().wait()? {
        let vid = info.vendor_id();
        let pid = info.product_id();
        if let Some(family) = classify(vid, pid) {
            devices.push(Device::Bootloader {
                id: format!("usb:{vid:04x}:{pid:04x}:{}", info.device_address()),
                family,
                vid,
                pid,
                product: info.product_string().map(str::to_owned),
            });
        }
    }
    Ok(())
}

fn scan_kiboar(devices: &mut Vec<Device>) -> Result<(), ScanError> {
    let api = HidApi::new()?;

    for info in api.device_list() {
        let vid = info.vendor_id();
        if vid != KIBOAR_VID {
            continue;
        }

        // The pid.codes vendor id is shared by many open source projects. The
        // product string is the cheap filter that keeps the probe away from
        // devices that are not Kiboar boards.
        let product = info.product_string().map(str::to_owned);
        if !is_kiboar_product(product.as_deref()) {
            continue;
        }

        let pid = info.product_id();
        let id = format!("hid:{vid:04x}:{pid:04x}:{:?}", info.path());

        match read_info(&api, info) {
            Ok(board) => devices.push(Device::Kiboar {
                id,
                vid,
                pid,
                product,
                info: board,
            }),
            Err(error) => devices.push(Device::Unknown {
                id,
                vid,
                pid,
                product,
                reason: Some(error.to_string()),
            }),
        }
    }
    Ok(())
}

fn read_info(api: &HidApi, info: &hidapi::DeviceInfo) -> Result<BoardInfo, ProbeError> {
    let device = api.open_path(info.path())?;

    let mut request = [0u8; 1 + PAYLOAD_LEN];
    request[0] = REPORT_ID;
    request[1] = INFO_VERSION;
    device.send_feature_report(&request)?;

    let mut response = [0u8; 1 + PAYLOAD_LEN];
    let length = device.get_feature_report(&mut response)?;
    if length < 1 + PAYLOAD_LEN {
        return Err(ProbeError::ShortReport(length));
    }
    if response[0] != REPORT_ID {
        return Err(ProbeError::WrongReportId(response[0]));
    }

    Ok(parse_board_info(&response[1..1 + PAYLOAD_LEN])?)
}
