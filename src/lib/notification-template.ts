export const DEFAULT_NOTIFICATION_TEMPLATE = `NOTIFICAÇÃO EXTRAJUDICIAL

NOTIFICANTE: {{notificante}}

NOTIFICADO(A): {{notificado}}
{{notificado_qualificacao}}

ASSUNTO: Notificação para desocupação voluntária de imóvel adquirido em leilão

Pelo presente instrumento, o(a) Notificante, na qualidade de arrematante e legítimo(a) proprietário(a) do imóvel situado em {{imovel_endereco}}, adquirido através de leilão {{leiloeiro_info}}, vem respeitosamente NOTIFICAR o(a) Notificado(a) acima qualificado(a) para que, no prazo de {{prazo_dias}} dias contados do recebimento desta notificação, promova a desocupação voluntária e a entrega das chaves do referido imóvel, livre de pessoas e bens.

Decorrido o prazo acima sem o atendimento voluntário, o(a) Notificante se reserva o direito de adotar as medidas judiciais cabíveis para a reintegração/imissão na posse do imóvel, incluindo a cobrança de eventuais perdas e danos, aluguéis pelo período de ocupação indevida e demais custos decorrentes, sem prejuízo de outras medidas legais aplicáveis.

{{motivo}}

{{cidade}}, {{data_extenso}}.


_______________________________________
{{notificante}}
Notificante`

export interface NotificationVars {
  notificante: string
  notificado: string
  notificado_qualificacao: string
  imovel_endereco: string
  leiloeiro_info: string
  prazo_dias: string
  cidade: string
  data_extenso: string
  motivo: string
}

/** Substitui as tags {{chave}} do modelo pelos valores informados. Tags sem valor viram string vazia. */
export function mergeTemplate(template: string, vars: NotificationVars): string {
  return template.replace(/\{\{\s*([a-z_]+)\s*\}\}/gi, (match, key: string) => {
    const value = vars[key as keyof NotificationVars]
    return value !== undefined ? value : match
  })
}
