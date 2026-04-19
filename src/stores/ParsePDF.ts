/**
 * 调用本地解析服务
 * @param file PDF 文件对象
 * @returns 返回解析后的 IOrder 对象（Partial）
 */
// src/utils/parsePdf.ts
import type { IOrder } from '@/types/Order'

export async function parsePdfService(file: File): Promise<Partial<IOrder>> {
  const formData = new FormData()
  formData.append('file', file)

  try {
    const response = await fetch('http://localhost:8000/api/order/parse-pdf', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`解析失败(${response.status}): ${errorText}`)
    }

    // 关键点：.json() 会自动把 \u5f53\u7eb8 变成 "当纳利"
    const result = await response.json()

    // 注意：根据你之前提供的后端代码，返回的可能是直接的对象，
    // 也可能是嵌套在 { data: {...} } 里的。
    // 如果 Python 返回的是 jsonify(order_data)，那么 result 就是数据本身。
    const data = result.data ? result.data : result

    console.log('--- 🛡️ Service 接收到已解码数据 ---', data)
    return data as Partial<IOrder>
  } catch (error) {
    console.error('PDF 解析服务内部出错:', error)
    throw error
  }
}
