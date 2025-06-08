
export interface CustomerData {
  id: string;
  ลำดับ: number;
  หน่วยให้บริการ: string;
  เขต: string;
  ภาค: string;
  วันที่: string;
  เวลา: string;
  ประเภท1: number;
  ประเภท2: number;
  ประเภท3: number;
  ประเภท4: number;
  อื่นๆ: string;
  ข้อ1: number;
  ข้อ2: number;
  ข้อ3: number;
  ข้อ4: number;
  ข้อ5: number;
  ข้อ6: number;
  ข้อ7: number;
  สรุป: string;
  หมายเหตุ: string;
  ลูกค้าต้องการให้ติดต่อกลับ: string;
  sentiment: 'Positive' | 'Negative' | 'Neutral';
  บริการช้า: number;
  ระบบช้า: number;
  'service mind พนักงาน': number;
  แซงคิว: number;
  ปรับปรุงสถานที่: number;
  ไม่สามารถจัดหมวดหมู่ได้: number;
}

export interface ColumnMapping {
  excelColumn: string;
  systemColumn: keyof CustomerData;
  type: 'number' | 'text' | 'date';
  isValid: boolean;
}

export const COLUMN_DEFINITIONS = {
  ลำดับ: { type: 'number', description: 'ลำดับ' },
  หน่วยให้บริการ: { type: 'text', description: 'หน่วยให้บริการ' },
  เขต: { type: 'text', description: 'เขต' },
  ภาค: { type: 'text', description: 'ภาค' },
  วันที่: { type: 'date', description: 'วันที่' },
  เวลา: { type: 'text', description: 'เวลา' },
  ประเภท1: { type: 'number', description: 'ประเภท1 (ฝากถอนเงินฝาก/สลากออมสิน)' },
  ประเภท2: { type: 'number', description: 'ประเภท2 (ชำระสินเชื่อ/ชำระค่าสินค้าและบริการ)' },
  ประเภท3: { type: 'number', description: 'ประเภท3 (สมัครใช้บริการ เงินฝาก/สินเชื่อ/MyMo/บัตร/อื่น ๆ)' },
  ประเภท4: { type: 'number', description: 'ประเภท4 (สอบถาม/ขอคำปรึกษา)' },
  อื่นๆ: { type: 'text', description: 'อื่นๆ' },
  ข้อ1: { type: 'number', description: 'ข้อ1 (ความพึงพอใจต่อการดูแล เอาใจใส่ ความสบายใจเมื่อมาใช้บริการ)' },
  ข้อ2: { type: 'number', description: 'ข้อ2 (ความพึงพอใจต่อการตอบคำถาม ให้คำแนะนำ ความน่าเชื่อถือ ความเป็นมืออาชีพ)' },
  ข้อ3: { type: 'number', description: 'ข้อ3 (ความพึงพอใจต่อความรวดเร็วในการให้บริการ หลังเรียกคิว)' },
  ข้อ4: { type: 'number', description: 'ข้อ4 (ความพึงพอใจต่อการตอบคำถาม ให้คำแนะนำ ความน่าเชื่อถือ ความเป็นมืออาชีพ)' },
  ข้อ5: { type: 'number', description: 'ข้อ5 (ความพึงพอใจต่อความพร้อมของเครื่องมือ เช่น ATM, ADM, Passbook)' },
  ข้อ6: { type: 'number', description: 'ข้อ6 (ความพึงพอใจต่อความประทับใจในการเข้าใช้บริการที่ธนาคารออมสินสาขา)' },
  ข้อ7: { type: 'number', description: 'ข้อ7 (ความพึงพอใจต่อความประทับใจในการเข้าใช้บริการที่ธนาคารออมสินสาขา)' },
  สรุป: { type: 'text', description: 'สรุป' },
  หมายเหตุ: { type: 'text', description: 'หมายเหตุ (คอมเม้นลูกค้า)' },
  ลูกค้าต้องการให้ติดต่อกลับ: { type: 'text', description: 'ลูกค้าต้องการให้ติดต่อกลับ' },
  sentiment: { type: 'text', description: 'ความรู้สึก (Positive/Negative/Neutral)' },
  บริการช้า: { type: 'number', description: 'บริการช้า (0=ไม่มี, 1=มี)' },
  ระบบช้า: { type: 'number', description: 'ระบบช้า (0=ไม่มี, 1=มี)' },
  'service mind พนักงาน': { type: 'number', description: 'service mind พนักงาน (0=ไม่มี, 1=มี)' },
  แซงคิว: { type: 'number', description: 'แซงคิว (0=ไม่มี, 1=มี)' },
  ปรับปรุงสถานที่: { type: 'number', description: 'ปรับปรุงสถานที่ (0=ไม่มี, 1=มี)' },
  ไม่สามารถจัดหมวดหมู่ได้: { type: 'number', description: 'ไม่สามารถจัดหมวดหมู่ได้ (0=ไม่มี, 1=มี)' }
} as const;
