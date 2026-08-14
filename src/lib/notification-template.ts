export const DEFAULT_NOTIFICATION_TEMPLATE = `NOTIFICAÇÃO EXTRAJUDICIAL

PRIMEIRA NOTIFICAÇÃO EXTRAJUDICIAL


Ilmo(a). Sr(a).

{{notificado}}                                                    {{cidade}}, {{data_extenso}}.
CPF nº {{notificado_cpf}}
{{notificado_qualificacao}}


Conforme se comprova pelo Registro de Imóveis da Comarca de {{comarca}}, {{imovel_matricula}}, referente ao imóvel situado em {{imovel_endereco}}, adquirido em leilão {{leiloeiro_info}}, nos termos do respectivo edital, e considerando o interesse do(a) Notificante em usufruir do bem de maneira irrestrita, procede-se à presente NOTIFICAÇÃO EXTRAJUDICIAL.

Assim, solicita-se a V.Sa. a DESOCUPAÇÃO VOLUNTÁRIA do referido imóvel, no prazo IMPRORROGÁVEL de {{prazo_dias}} dias, a contar da data de recebimento desta comunicação, devolvendo-o livre de pessoas e coisas, com seus acessórios e instalações em perfeito estado de conservação, sob pena de esbulho possessório.

Caso V.Sa. não desocupe voluntariamente o imóvel no prazo estipulado, ou aja de qualquer modo a impedir a irrestrita fruição do bem por parte do(a) legítimo(a) proprietário(a), ora Notificante, poderá ser constrangido(a) JUDICIALMENTE, além de ser compelido(a) ao cumprimento dos demais encargos decorrentes, a exemplo de custas processuais e honorários advocatícios{{honorarios_clausula}}, sob pena, ainda, de cumprimento de mandado de imissão na posse, com auxílio do Estado, inclusive com a utilização coercitiva de força policial em caso de resistência.

Conforme disposição do art. 37-A da Lei nº 9.514/97, os ocupantes de imóvel adquirido por alienação fiduciária estão sujeitos ao pagamento de taxa de ocupação, por mês ou fração, correspondente a 1% (um por cento) do valor do imóvel{{taxa_ocupacao_clausula}}, computada desde a data da consolidação da propriedade em favor do credor fiduciário/sucessor.

"Art. 37-A da Lei 9.514/97. O devedor fiduciante pagará ao credor fiduciário, ou a quem vier a sucedê-lo, a título de taxa de ocupação do imóvel, por mês ou fração, valor correspondente a 1% (um por cento) do valor a que se refere o inciso VI ou o parágrafo único do art. 24 desta Lei, computado e exigível desde a data da consolidação da propriedade fiduciária ao patrimônio do credor fiduciante, até a data em que este, ou seus sucessores, vier a ser imitido na posse do imóvel. (Redação dada pela Lei nº 13.465, de 2017)."

[Observação: a cláusula acima só se aplica a imóveis adquiridos por alienação fiduciária (ex.: financiados via Caixa). Remova este parágrafo e o anterior caso não se aplique ao seu caso.]

Por mera liberalidade, deixa-se de aplicar a referida taxa caso V.Sa. desocupe o imóvel em até {{prazo_dias}} dias do recebimento desta notificação.

{{motivo}}

Coloca-se à disposição para eventuais dúvidas através do telefone {{telefone}}{{email_clausula}}.

Diante do exposto, elege-se o foro de {{foro}} como competente para o processamento desta notificação e de eventual ação judicial dela decorrente.

{{cidade}}, {{data_extenso}}.


_______________________________________
{{notificante}}
Notificante`

export interface NotificationVars {
  notificante: string
  notificado: string
  notificado_cpf: string
  notificado_qualificacao: string
  imovel_endereco: string
  imovel_matricula: string
  comarca: string
  leiloeiro_info: string
  prazo_dias: string
  cidade: string
  foro: string
  data_extenso: string
  telefone: string
  email_clausula: string
  honorarios_clausula: string
  taxa_ocupacao_clausula: string
  motivo: string
}

/** Substitui as tags {{chave}} do modelo pelos valores informados. Tags sem valor viram string vazia. */
export function mergeTemplate(template: string, vars: NotificationVars): string {
  return template.replace(/\{\{\s*([a-z_]+)\s*\}\}/gi, (match, key: string) => {
    const value = vars[key as keyof NotificationVars]
    return value !== undefined ? value : match
  })
}
