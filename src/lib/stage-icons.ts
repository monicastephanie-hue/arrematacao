import {
  Banknote,
  ClipboardCheck,
  DoorOpen,
  FileSignature,
  Hammer,
  Handshake,
  MapPin,
  Percent,
  Receipt,
  Stamp,
  UserCheck,
  type LucideIcon,
} from 'lucide-react'

/** Associa palavras-chave do nome da etapa a um pictograma. A primeira que combinar vence. */
const STAGE_ICON_RULES: { match: RegExp; icon: LucideIcon }[] = [
  { match: /pagamento|arremat|lance|boleto/i, icon: Banknote },
  { match: /iptu|itbi/i, icon: Receipt },
  { match: /escritura|chb/i, icon: FileSignature },
  { match: /registro/i, icon: Stamp },
  { match: /desocupa/i, icon: DoorOpen },
  { match: /reforma|manuten/i, icon: Hammer },
  { match: /vistoria|inspe/i, icon: ClipboardCheck },
  { match: /comprador|aprovad/i, icon: UserCheck },
  { match: /venda|vendid/i, icon: Handshake },
  { match: /gcap|imposto|renda|ganho de capital/i, icon: Percent },
]

/** Pictograma representando a etapa pelo nome; cai para um pin genérico em etapas personalizadas. */
export function getStageIcon(name: string): LucideIcon {
  return STAGE_ICON_RULES.find((rule) => rule.match.test(name))?.icon ?? MapPin
}
