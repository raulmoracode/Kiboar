# Symbol content report

State after the metadata pass for issue #8. Counts are read from `symbols/Kiboar.kicad_sym`; URLs were checked with `curl -L -A "Mozilla/5.0"` and a 15 s timeout on 2026-11-13.

## Summary

| Field | Before | After |
| --- | ---: | ---: |
| Symbols | 146 | 146 |
| Empty `Description` | 87 | **0** |
| Empty `Datasheet` | 87 | **85** |
| Datasheet URLs reachable (HTTP 200) | not measured | **35 of 61** |

## Descriptions

The 87 empty descriptions were filled from the symbol family and the part name, then 27 were refined by hand (bare microcontrollers vs boards, potentiometers vs encoders, slide switches). They are **derived**, not read from a datasheet: replace them with a sourced description when one is available.

## Datasheets added or corrected

| Symbol | URL | Evidence |
| --- | --- | --- |
| `Button_B3U-1000P` | <https://omronfs.omron.com/en_US/ecb/products/pdf/en-b3u.pdf> | Omron B3U series datasheet, HTTP 200 |
| `Ethernet_6339191-5` | <https://www.te.com/commerce/DocumentDelivery/DDEController?Action=srchrtrv&DocNm=6339191&DocType=Customer%20Drawing&DocLang=English&DocFormat=pdf&PartCntxt=6339191-5> | TE product page document list |
| `Button_SKTHBAE010` | <https://tech.alpsalpine.com/cms.media/product_spec_skthbae010_en_f1b9e32850.pdf> | Corrected: the field pointed at `SKTHAHE010.pdf`, a different MPN; Alps product page, HTTP 200 |

## Datasheet URLs that block automated checks (24)

These are mostly manufacturer CDNs and distributor pages that answer 403 or time out. The URL may still open in a browser; it was not rewritten because there is no verified better source.

| Symbol | Status | URL |
| --- | ---: | --- |
| `Button_EVP-AEDB2A` | 000 | https://www.arrow.com/en/products/evp-aedb2a/panasonic |
| `Button_PTS647SM38SMTR2LFS` | 403 | https://www.ckswitches.com/media/2567/pts647.pdf |
| `CBK_2301843-2` | 403 | http://www.te.com/commerce/DocumentDelivery/DDEController?Action=showdoc&DocId=Customer+Drawing%7F2301843%7FH%7Fpdf%7FEnglish%7FENG_CD_2301843_H.pdf%7F2301843-2 |
| `CBK_2311765-1` | 403 | https://www.te.com/commerce/DocumentDelivery/DDEController?Action=showdoc&DocId=Customer+Drawing%7F2311765%7FD%7Fpdf%7FEnglish%7FENG_CD_2311765_D.pdf%7F2311765-1 |
| `CBK_5212044-1` | 403 | https://www.te.com/commerce/DocumentDelivery/DDEController?Action=showdoc&DocId=Customer+Drawing%7F5212044%7FP%7Fpdf%7FEnglish%7FENG_CD_5212044_P.pdf%7F5212044-1 |
| `CBK_5749181-1` | 403 | http://www.te.com/commerce/DocumentDelivery/DDEController?Action=showdoc&DocId=Customer+Drawing%7F5749181%7FP%7Fpdf%7FEnglish%7FENG_CD_5749181_P.pdf%7F5749181-1 |
| `CBK_90130-3308` | 000 | https://www.molex.com/pdm_docs/sd/901303308_sd.pdf |
| `CBK_90130-3310` | 000 | https://www.molex.com/pdm_docs/sd/901303310_sd.pdf |
| `CBK_90130-3312` | 000 | https://www.molex.com/content/dam/molex/molex-dot-com/products/automated/en-us/salesdrawingpdf/901/90130/901303312_sd.pdf?inline |
| `CBK_90130-3314` | 000 | https://www.molex.com/pdm_docs/sd/901303314_sd.pdf |
| `CBK_90136-2104` | 000 | https://www.molex.com/webdocs/datasheets/pdf/en-us/0901362104_PCB_HEADERS.pdf |
| `CBK_L77HDE15SD1CH4F` | 403 | https://cdn.amphenol-cs.com/media/wysiwyg/files/drawing/l77hdxxxsd1ch4f.pdf |
| `Dip_418121270804` | 403 | https://www.we-online.com/catalog/datasheet/418121270804.pdf |
| `Dip_418127270904` | 000 | https://katalog.we-online.de/em/datasheet/4181272709xx.pdf |
| `Ethernet_1-1734795-1` | 403 | https://www.te.com/commerce/DocumentDelivery/DDEController?Action=srchrtrv&DocNm=1734795&DocType=Customer+Drawing&DocLang=English |
| `Ethernet_1734795-1` | 000 | https://www.arrow.com/en/products/1734795-1/te-connectivity |
| `Ethernet_2041411-1` | 403 | https://www.te.com/commerce/DocumentDelivery/DDEController?Action=srchrtrv&DocNm=2041411&DocType=Customer+Drawing&DocLang=English&PartCntxt=2041411-1&DocFormat=pdf |
| `Ethernet_6339160-1` | 403 | https://www.te.com/commerce/DocumentDelivery/DDEController?Action=showdoc&DocId=Customer+Drawing%7F6339160%7FE%7Fpdf%7FEnglish%7FENG_CD_6339160_E_6339160-c_drw.pdf%7F6339160-1 |
| `Ethernet_6339191-5` | 403 | https://www.te.com/commerce/DocumentDelivery/DDEController?Action=srchrtrv&DocNm=6339191&DocType=Customer%20Drawing&DocLang=English&DocFormat=pdf&PartCntxt=6339191-5 |
| `Ethernet_85502-5005` | 000 | http://www.molex.com/webdocs/datasheets/pdf/en-us//0855025005_MODULAR_JACKS_PLUG.pdf |
| `Ethernet_95501-2441` | 000 | http://www.molex.com/webdocs/datasheets/pdf/en-us/0955012441_MODULAR_JACKS_PLUG.pdf |
| `PinHeader_610110249121` | 403 | https://www.we-online.com/catalog/datasheet/610110249121.pdf |
| `USB-C_216990-0001` | 000 | https://www.molex.com/pdm_docs/sd/2169900001_sd.pdf |
| `USB-C_216990-0002` | 000 | https://www.molex.com/pdm_docs/sd/2169900002_sd.pdf |

## Datasheet URLs that are dead (2)

| Symbol | Status | URL |
| --- | ---: | --- |
| `JOYSTICK_COM-10063` | 404 | https://www.sparkfun.com/datasheets/Components/Buttons/SF303GJ26-3.pdf |
| `TRRS_PJ-320A` | 404 | http://www.helloxkb.com/public/images/pdf/PJ-320A-.pdf |

## Symbols with no datasheet (85)

Grouped by family. The search performed was: LCSC/jlcsearch by MPN (no hits for these parts), manufacturer product pages through r.jina.ai (Alps and TE readable; Mouser, Würth, Molex and SnapEDA blocked), and DuckDuckGo HTML (rate-limited). No URL was written without a verified source.

| Family | Symbols |
| --- | ---: |
| `BatteryJack` | 3 |
| `Button` | 10 |
| `CBK` | 1 |
| `Display` | 3 |
| `Encoder` | 4 |
| `JOYSTICK` | 6 |
| `LED` | 6 |
| `MCU` | 26 |
| `OtherConnector` | 1 |
| `PIM452` | 1 |
| `PIMORONI` | 1 |
| `PinHeader` | 6 |
| `Placeholder` | 9 |
| `SWITCH` | 6 |
| `USB-C` | 1 |
| `USBC` | 1 |

<details><summary>Full list</summary>

- `BatteryJack_JST_S2B-PH-K-S_(LF)(SN)`
- `BatteryJack_JST_S2B-PH-SM4-TB(LF)(SN)`
- `BatteryJack_Pins`
- `Button_434123025816`
- `Button_EVP-AKE31A`
- `Button_EVPBB2A9B000`
- `Button_EVQ-9P701P`
- `Button_PTS820J25KSMTRLFS`
- `Button_SKHLAAA010`
- `Button_SKQGAFE010`
- `Button_SKRPADE010`
- `Button_TL3315NF160QG`
- `Button_TL3336AF160Q`
- `CBK_L717HDE15PD1CH4F`
- `Display_OLED_128x32`
- `Display_OLED_128x64`
- `Display_nice!view`
- `Encoder_EVQWGD001`
- `Encoder_RK09K113004U`
- `Encoder_RK10J11E0034`
- `Encoder_SLLB510100`
- `JOYSTICK_2765_adafruit`
- `JOYSTICK_COM-09032`
- `JOYSTICK_FJ08K-S`
- `JOYSTICK_MU-AS90R`
- `JOYSTICK_SKHCBEA010`
- `JOYSTICK_SKHHCWA010`
- `LED_OF-SMD3528WC`
- `LED_SK6812MINI-E`
- `LED_SK6812MINI-EA`
- `LED_SK6812SMINI`
- `LED_THT_LED`
- `LED_WS2812B-MINI`
- `MCU_ATMEGA328P-PU`
- `MCU_ATMEGA32A-AU`
- `MCU_ATMEGA32A-PU`
- `MCU_ATMega32U4-AU`
- `MCU_Adafruit_KB2040`
- `MCU_Arduino_Pro_Micro`
- `MCU_ESP32-C3-Zero`
- `MCU_ESP32-S2_MINI-V1.0.0_V2`
- `MCU_Elite-C`
- `MCU_Esp32-C3-Super-Mini-Pins`
- `MCU_Nice_Nano_V2`
- `MCU_PGA2040_PTH_PIMORONI`
- `MCU_RP2040-LCD-0.96_Waveshare`
- `MCU_RP2040-PLUS-WAVESHARE`
- `MCU_RP2040-TINY_WITH_3D_MODEL_WAVESHARE`
- `MCU_RP2040-ZERO_WAVESHARE`
- `MCU_RP2040_Pro_Micro`
- `MCU_RP2040_Stamp`
- `MCU_RP2040_Zero`
- `MCU_Raspberry_Pi_Pico`
- `MCU_STM32F072CBT6`
- `MCU_STM32F411CEU6_BLACK_PILL_V3.0`
- `MCU_Seeed_XIAO_RP2040`
- `MCU_Waveshare_ESP32-S3-Nano`
- `MCU_WeAct-STM32F4G431CBU6`
- `MCU_WeAct_CH552T`
- `OtherConnector_PRT-14417`
- `PIM452`
- `PIMORONI_447`
- `PinHeader_61000621121`
- `PinHeader_61001021121`
- `PinHeader_61300621021`
- `PinHeader_61300621121`
- `PinHeader_61301021021`
- `PinHeader_61301021121`
- `Placeholder_Crystal`
- `Placeholder_Diode`
- `Placeholder_Fuse`
- `Placeholder_Keyswitch`
- `Placeholder_LED`
- `Placeholder_Mounting_Hole`
- `Placeholder_Polyfuse`
- `Placeholder_Resistor`
- `Placeholder_Switch`
- `SWITCH_EG1215AA`
- `SWITCH_JS102011SAQN`
- `SWITCH_MSK12C02`
- `SWITCH_SSAL220100`
- `SWITCH_SSSS213100`
- `SWITCH_SSSS811101`
- `USB-C_217179-0001`
- `USBC_HRO_TYPE-C-31-M-14`

</details>

## What would close the remaining gap

- A Mouser or DigiKey API key: 45 symbols already carry a Mouser part number, and both APIs return the datasheet URL for an MPN.

- Manual review for the 13 generic symbols (`Placeholder_*`, `LED_THT_LED`, `BatteryJack_Pins`, `PIM452`, `PIMORONI_447`), which have no single part behind them.

