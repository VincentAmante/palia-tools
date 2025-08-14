import { describe, it, expect } from 'vitest'
import { convertV_0_1_to_V_0_2, convertV_0_2Codesto_V_0_3, convertV_0_3Codesto_V_0_4, convertV_0_3SettingsToV_0_4Settings, parseSave } from './save-handler'

describe('Save Handler', () => {
  // sample 1 : 0.1 v0.1_DIM-111-111-111_CROPS-NaNaToNaToCoToCoCo-NaNaNaToNaToCoToCo-ToNaNaCoToNaCoCoTo-ToBlBlToBlBlNaToCo-ApApApApApApApApAp-BlBlToBlBlToCoToNa-NaNaToWhNaNaRiWhNa-CoCoCoToCoToNaToNa-ToNaNaNaNaPoNaPoOn
  // sample 2 : v0.3_D-111-111-111_CR-BbBbBbBbBbBbBbBbBb-BbNBbBbNBbBbBbBb-BbBbBbBbBbBbBbBbN-BbBbBbBbBbBbBbBbBb-BbBbBbBbBbBbBbBbBb-BbBbNBbBbNBbBbN-NNNNNNNNN-NNNNNNNNN-NNNNNNNNN_D30NrNssL50Cr0.Bb.S7-BbS6

  describe('Full save code conversion', () => {
    it('should fully convert a 0.3 save to 0.4 save in the expected format (Test 1 - Batterfly Beans is converted)', () => {
      const v0_3Save = 'v0.3_D-111-111-111_CR-BbBbBbBbBbBbBbBbBb-BbNBbBbNBbBbBbBb-BbBbBbBbBbBbBbBbN-BbBbBbBbBbBbBbBbBb-BbBbBbBbBbBbBbBbBb-BbBbNBbBbNBbBbN-NNNNNNNNN-NNNNNNNNN-NNNNNNNNN_D30NrNssL50Cr0.Bb.S7-BbS6'
      const expectedDimensionInfo = 'D-111-111-111'
      const expectedCropsInfo = 'CR-BtBtBtBtBtBtBtBtBt-BtNBtBtNBtBtBtBt-BtBtBtBtBtBtBtBtN-BtBtBtBtBtBtBtBtBt-BtBtBtBtBtBtBtBtBt-BtBtNBtBtNBtBtN-NNNNNNNNN-NNNNNNNNN-NNNNNNNNN'
      const expectedSettingsInfo = 'D30NrNssL50Cr0.Bt.S7-BtS6'

      const { dimensionInfo, version, cropInfo, settingsInfo } = parseSave(v0_3Save)

      expect(version).toBe('0.4')
      expect(dimensionInfo).toBe(expectedDimensionInfo)
      expect(cropInfo).toBe(expectedCropsInfo)
      expect(settingsInfo).toBe(expectedSettingsInfo)
    })

    it('should fully convert a 0.3 save to 0.4 save in the expected format (Test 2 - No changes except for version expected)', () => {
      const v0_3Save = 'v0.3_D-111-111-111_CR-Cb.HP.HO.HBk.HSSO.HSS-BkCbPAAAAAA-OBkCb.HBBPBBO-PCbBkCrWOBkCbP-AAACrCb.YBkAAA-PCbBkOWCrBkCbP-OBBPBBCb.HBkO-AAAAAAPCbBk-SSO.HSSBk.HO.HP.HCb.H_D30L25Cr0.BkS-OP-WS-PS-CrP-CbP-SP-BP-AP'
      const expectedDimensionInfo = 'D-111-111-111'
      const expectedCropsInfo = 'CR-Cb.HP.HO.HBk.HSSO.HSS-BkCbPAAAAAA-OBkCb.HBBPBBO-PCbBkCrWOBkCbP-AAACrCb.YBkAAA-PCbBkOWCrBkCbP-OBBPBBCb.HBkO-AAAAAAPCbBk-SSO.HSSBk.HO.HP.HCb.H'
      const expectedSettingsInfo = 'D30L25Cr0.BkS-OP-WS-PS-CrP-CbP-SP-BP-AP'

      const { dimensionInfo, version, cropInfo, settingsInfo } = parseSave(v0_3Save)

      expect(version).toBe('0.4')
      expect(dimensionInfo).toBe(expectedDimensionInfo)
      expect(cropInfo).toBe(expectedCropsInfo)
      expect(settingsInfo).toBe(expectedSettingsInfo)
    })

    it('should fully convert a 0.3 save to 0.4 save in the expected format (Test 3 - Batterfly and Blueberries Mixed)', () => {
      const v0_3Save = 'v0.3_D-111-111-111_CR-BbBbBBbBbBBBB-BBbBbBBbBbBBB-BbBbNBbBbNBbBbN-BBBBBBBBB-BBBBBbBbBBbBb-BbBbNNNNNNN-BbBbBbBbBbBbNNN-BbBBBbBBNNN-NNNNNNNNN_Cr0.Bb.S3-BbS5-B.S4-BS7'
      const expectedDimensionInfo = 'D-111-111-111'
      const expectedCropsInfo = 'CR-BtBtBBtBtBBBB-BBtBtBBtBtBBB-BtBtNBtBtNBtBtN-BBBBBBBBB-BBBBBtBtBBtBt-BtBtNNNNNNN-BtBtBtBtBtBtNNN-BtBBBtBBNNN-NNNNNNNNN'
      const expectedSettingsInfo = 'Cr0.Bt.S3-BtS5-B.S4-BS7'

      const { dimensionInfo, version, cropInfo, settingsInfo } = parseSave(v0_3Save)

      expect(version).toBe('0.4')
      expect(dimensionInfo).toBe(expectedDimensionInfo)
      expect(cropInfo).toBe(expectedCropsInfo)
      expect(settingsInfo).toBe(expectedSettingsInfo)
    })
  })

  describe('Crop Setting Conversion Functions', () => {
    it('should convert v0.3 settings to v0.4 settings (no harvest settings)', () => {
      const v0_3Settings = 'Cr0.Bb.S7-BbS6'
      const expectedV0_4Settings = 'Cr0.Bt.S7-BtS6'
      expect(convertV_0_3SettingsToV_0_4Settings(v0_3Settings)).toBe(expectedV0_4Settings)
    })

    it('should convert v0.3 settings to v0.4 settings (no processor settings)', () => {
      const v0_3Settings = 'D30NrNssL50'
      const expectedV0_4Settings = 'D30NrNssL50'
      expect(convertV_0_3SettingsToV_0_4Settings(v0_3Settings)).toBe(expectedV0_4Settings)
    })

    it('should convert v0.3 settings to v0.4 settings', () => {
      const v0_3Settings = 'D30NrNssL50Cr0.Bb.S7-BbS6'
      const expectedV0_4Settings = 'D30NrNssL50Cr0.Bt.S7-BtS6'
      expect(convertV_0_3SettingsToV_0_4Settings(v0_3Settings)).toBe(expectedV0_4Settings)
    })
  })

  describe('Crop Codes Conversion', () => {
    it('should convert v0.1 crop codes to v0.2', () => {
      const v0_1Save = 'CROPS-NaNaToNaToCoToCoCo-NaNaNaToNaToCoToCo-ToNaNaCoToNaCoCoTo-ToBlBlToBlBlNaToCo-ApApApApApApApApAp-BlBlToBlBlToCoToNa-NaNaToWhNaNaRiWhNa-CoCoCoToCoToNaToNa-ToNaNaNaNaPoNaPoOn'
      const expectedV0_2Save = 'CROPS-NNTNTCrTCrCr-NNNTNTCrTCr-TNNCrTNCrCrT-TBBTBBNTCr-AAAAAAAAA-BBTBBTCrTN-NNTWNNRWN-CrCrCrTCrTNTN-TNNNNPNPO'
      expect(convertV_0_1_to_V_0_2(v0_1Save)).toBe(expectedV0_2Save)
    })

    it('should convert v0.2 codes to v0.3', () => {
      const v0_2Save = 'CROPS-NNTNTCrTCrCr-NNNTNTCTCr-TNNCrTNCrCrT-TBBTBBNTCr-AAAAAAAAA-BBTBBTCTN-NNTWNNRWN-CrCrCrTCrTNTN-TNNNNPNPO'
      const expectedV0_3Save = 'CR-NNTNTCrTCrCr-NNNTNTCTCr-TNNCrTNCrCrT-TBBTBBNTCr-AAAAAAAAA-BBTBBTCTN-NNTWNNRWN-CrCrCrTCrTNTN-TNNNNPNPO'
      expect(convertV_0_2Codesto_V_0_3(v0_2Save)).toBe(expectedV0_3Save)
    })

    it('should convert v0.2 codes to v0.3 (with Fert)', () => {
      const v0_2Save = 'CROPS-NN.HpTNTCrTCrCr-NNNTNTCTCr.Hp-TNN.HpCrTNCrCrT.Hp-TBBTBBNTCr-AAAAAAAAA-BBTBBTCTN-NNTWNNRWN-CrCrCrTCrTNTN-TNNNNPNPO'
      const expectedV0_3Save = 'CR-NN.YTNTCrTCrCr-NNNTNTCTCr.Y-TNN.YCrTNCrCrT.Y-TBBTBBNTCr-AAAAAAAAA-BBTBBTCTN-NNTWNNRWN-CrCrCrTCrTNTN-TNNNNPNPO'
      expect(convertV_0_2Codesto_V_0_3(v0_2Save)).toBe(expectedV0_3Save)
    })

    it('should convert v0.3 codes to v0.4', () => {
      const v0_3Save = 'CR-NN.YTNTCrTCrCr-NNNTNTCTCr.Y-TNNCrTNCrCrT.Y-TBBTBBNTCr-AAAAAAAAA-BBTBBTCTN-NNTWNNRWN-CrCrCrTCrTNTN-TNNNNPNPO'
      const expectedV0_4Save = 'CR-NN.YTNTCrTCrCr-NNNTNTCTCr.Y-TNNCrTNCrCrT.Y-TBBTBBNTCr-AAAAAAAAA-BBTBBTCTN-NNTWNNRWN-CrCrCrTCrTNTN-TNNNNPNPO'
      expect(convertV_0_3Codesto_V_0_4(v0_3Save)).toBe(expectedV0_4Save)
    })


    it('should convert v0.3 codes to v0.4 (Batterfly Beans Focus)', () => {
      const v0_3Save = 'CR-BbBbBbBbBbBbBbBbBb-BbNBbBbNBbBbBbBb-BbBbBbBbBbBbBbBbN-BbBbBbBbBbBbBbBbBb-BbBbBbBbBbBbBbBbBb-BbBbNBbBbNBbBbN-NNNNNNNNN-NNNNNNNNN-NNNNNNNNN'
      const expectedV0_4Save = 'CR-BtBtBtBtBtBtBtBtBt-BtNBtBtNBtBtBtBt-BtBtBtBtBtBtBtBtN-BtBtBtBtBtBtBtBtBt-BtBtBtBtBtBtBtBtBt-BtBtNBtBtNBtBtN-NNNNNNNNN-NNNNNNNNN-NNNNNNNNN'
      expect(convertV_0_3Codesto_V_0_4(v0_3Save)).toBe(expectedV0_4Save)
    })
  })
})
