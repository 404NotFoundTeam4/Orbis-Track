/**
 * Description: จัดการ snapshot ของ cart item ids ที่ผู้ใช้ "เปิดดูแล้ว" ล่าสุด (ต่อ user)
 * Input : userId (number)
 * Output : getSeenCartItemIds(): number[], setSeenCartItemIds(): void
 * Author : Nontapat Sinthum (Guitar) 66160104
 **/
const key = (userId: number) => `orbis_cart_seen_ids_v1_${userId}`;

/**
 * Description: อ่าน snapshot ids ที่ผู้ใช้เคยเปิดดูล่าสุด
 * Input : userId (number)
 * Output : number[]
 * Author : Nontapat Sinthum (Guitar) 66160104
 **/
export function getSeenCartItemIds(userId: number): number[] {
  try {
    const raw = localStorage.getItem(key(userId));
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? parsed.filter((id) => Number.isFinite(Number(id))).map(Number) : [];
  } catch {
    return [];
  }
}

/**
 * Description: บันทึก snapshot ids ตอนผู้ใช้ "เปิดหน้า cart" (ถือว่าเห็นแล้ว)
 * Input : userId (number), ids (number[])
 * Output : void
 * Author : Nontapat Sinthum (Guitar) 66160104
 **/
export function setSeenCartItemIds(userId: number, ids: number[]): void {
  try {
    localStorage.setItem(key(userId), JSON.stringify(ids));
  } catch {
    // ignore
  }
}
