import type { ValueType } from '@/types'

export interface ParsedExpense {
  /** id local, só para a lista de revisão na tela — não é o id salvo no store. */
  id: string
  date: string | null
  amount: number
  description: string
  type: ValueType
  /** Trecho original de onde este lançamento foi extraído, para conferência. */
  raw: string
  /** true quando um trecho idêntico apareceu mais de uma vez no texto colado
   *  (comum quando a mesma mensagem é encaminhada/copiada duas vezes). */
  duplicate: boolean
}

function makeLocalId(): string {
  return `p${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
}

const SEPARATOR_LINE = /^["“”'`\-_=]{3,}$/

/** Linhas que fazem parte do "ruído" do formato de aviso (pix, valor por pessoa, quem já
 *  pagou etc.) e nunca devem virar descrição de um lançamento. */
const NOISE_LINE = /🔑|pix\s*(para|:)|📊|ficou\s+r\$|^✅|nota\s+paga/i

function normalizeLine(line: string): string {
  return line.replace(/\r/g, '').replace(/^\*+/, '').trim()
}

/** "18.08.26", "18/08/2026", "18-08-26" → "2026-08-18". Também aceita datas sem ano
 *  ("10/08"), assumindo o ano corrente — comum em mensagens de WhatsApp do dia a dia. */
function parseDateToken(token: string): string | null {
  const full = token.match(/(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})/)
  const partial = full ? null : token.match(/^(\d{1,2})[./-](\d{1,2})$/)
  const m = full ?? partial
  if (!m) return null
  const day = Number(m[1])
  const month = Number(m[2])
  const year = full ? (m[3].length === 2 ? Number(m[3]) + 2000 : Number(m[3])) : new Date().getFullYear()
  if (month < 1 || month > 12 || day < 1 || day > 31) return null
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

/** "1.610,25" ou "340" ou "340,00" (formato brasileiro) → 1610.25 / 340 / 340. */
function parseAmountBR(raw: string): number | null {
  let s = raw.trim().replace(/[^\d.,]/g, '')
  if (!s) return null
  const hasComma = s.includes(',')
  const hasDot = s.includes('.')
  if (hasComma && hasDot) {
    s = s.replace(/\./g, '').replace(',', '.')
  } else if (hasComma) {
    s = s.replace(',', '.')
  } else if (hasDot) {
    const parts = s.split('.')
    if (parts.length === 2 && parts[1].length === 3) s = parts.join('') // separador de milhar, sem centavos
  }
  const n = parseFloat(s)
  return Number.isFinite(n) ? n : null
}

const TYPE_KEYWORDS: { match: RegExp; type: ValueType }[] = [
  { match: /itbi/i, type: 'itbi' },
  { match: /condom[ií]nio|iptu/i, type: 'condominio_iptu' },
  { match: /reforma|obra|material|pedreiro|pintura|m[aã]o[- ]de[- ]obra/i, type: 'reforma' },
  { match: /advogad|honor[aá]rio/i, type: 'advogado' },
  { match: /cart[oó]rio|registro|escritura|\bchb\b/i, type: 'custas_cartorio' },
  { match: /comiss[aã]o|leiloeiro/i, type: 'comissao_leiloeiro' },
  { match: /sinal|entrada/i, type: 'sinal' },
  { match: /gcap|ganho de capital|imposto de renda/i, type: 'gcap' },
  { match: /venda/i, type: 'venda' },
  { match: /lance|arremate|boleto/i, type: 'lance' },
]

function guessType(description: string): ValueType {
  return TYPE_KEYWORDS.find((rule) => rule.match.test(description))?.type ?? 'outro'
}

/** Extrai possíveis lançamentos de despesa de um texto colado (mensagens de WhatsApp, por
 *  exemplo). Reconhece o formato "📅 Em .../ 💰 Valor Total: R$ ..." usado pela assessoria,
 *  e como alternativa linhas soltas do tipo "Descrição - R$ 123,45 - 10/08". O resultado é
 *  sempre uma sugestão para revisão humana antes de salvar. */
export function parsePastedExpenses(rawText: string): ParsedExpense[] {
  const lines = rawText.split('\n').map(normalizeLine)
  const consumed = new Set<number>()
  const results: ParsedExpense[] = []

  // 1) Blocos estruturados: "📅 Em <data>" ... "💰 Valor Total: R$ <valor>"
  for (let i = 0; i < lines.length; i++) {
    const dateMatch = lines[i].match(/📅.*?em\s*([\d./-]+)/i)
    if (!dateMatch) continue

    const date = parseDateToken(dateMatch[1])
    const descLines: string[] = []
    let amount: number | null = null
    let j = i + 1
    const limit = Math.min(lines.length, i + 15)
    while (j < limit) {
      const l = lines[j]
      const amountMatch = l.match(/💰.*?r\$\s*([\d.,]+)/i)
      if (amountMatch) {
        amount = parseAmountBR(amountMatch[1])
        consumed.add(j)
        break
      }
      if (l && !SEPARATOR_LINE.test(l) && !NOISE_LINE.test(l)) descLines.push(l)
      consumed.add(j)
      j++
    }
    consumed.add(i)
    if (amount !== null) {
      const description = descLines.join(' ').trim() || 'Despesa'
      results.push({
        id: makeLocalId(),
        date,
        amount,
        description,
        type: guessType(description),
        raw: lines.slice(i, j + 1).join('\n'),
        duplicate: false,
      })
    }
    i = j
  }

  // 2) Linhas soltas fora dos blocos acima: "Descrição - R$ 123,45 - 10/08" (ou sem data).
  const looseLine = /^(.*?)(?:[-–—:]|$)\s*r\$\s*([\d.,]+)(?:.*?(\d{1,2}[./-]\d{1,2}(?:[./-]\d{2,4})?))?\s*$/i
  for (let i = 0; i < lines.length; i++) {
    if (consumed.has(i)) continue
    const line = lines[i]
    if (!line || SEPARATOR_LINE.test(line) || NOISE_LINE.test(line)) continue
    const m = line.match(looseLine)
    if (!m) continue
    const amount = parseAmountBR(m[2])
    if (amount === null) continue
    const description = m[1].trim() || 'Despesa'
    const date = m[3] ? parseDateToken(m[3]) : null
    results.push({
      id: makeLocalId(),
      date,
      amount,
      description,
      type: guessType(description),
      raw: line,
      duplicate: false,
    })
  }

  // Marca (mas não remove) duplicatas exatas — comum quando a mesma mensagem é colada
  // duas vezes. A pessoa decide na revisão se mantém ou descarta.
  const seen = new Map<string, number>()
  for (const r of results) {
    const key = `${r.date ?? ''}|${r.amount}|${r.description.toLowerCase()}`
    const count = seen.get(key) ?? 0
    if (count > 0) r.duplicate = true
    seen.set(key, count + 1)
  }

  return results
}
