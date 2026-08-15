import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { AlertTriangle, ArrowLeft, Loader2, Lock, Mail } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { isSupabaseConfigured } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input, Label } from '@/components/ui/field'
import logo from '@/assets/logo-embarque-nos-leiloes.jpg'

export default function Landing() {
  const session = useAuthStore((s) => s.session)
  const loading = useAuthStore((s) => s.loading)
  const signIn = useAuthStore((s) => s.signIn)
  const requestPasswordReset = useAuthStore((s) => s.requestPasswordReset)

  const [mode, setMode] = useState<'login' | 'reset'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resetSent, setResetSent] = useState(false)

  if (!loading && session) return <Navigate to="/imoveis" replace />

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    if (mode === 'login') {
      const { error } = await signIn(email, password)
      if (error) setError(error)
    } else {
      const { error } = await requestPasswordReset(email)
      if (error) setError(error)
      else setResetSent(true)
    }
    setSubmitting(false)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-slate-50 px-4 py-12 dark:bg-slate-950">
      <div className="flex flex-col items-center gap-5 text-center">
        <img src={logo} alt="Embarque nos Leilões" className="h-32 w-32" />
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Arrematação</h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-600 dark:text-slate-400">
            Ferramenta para melhor controle e organização dos imóveis arrematados pelo grupo{' '}
            <strong className="font-semibold text-slate-800 dark:text-slate-200">Embarque nos Leilões</strong>, através da
            assessoria de <strong className="font-semibold text-slate-800 dark:text-slate-200">Paulo Barreto</strong>.
          </p>
        </div>
      </div>

      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {!isSupabaseConfigured && (
          <div className="mb-4 flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0 translate-y-0.5" />
            <p>O login ainda não foi configurado neste ambiente.</p>
          </div>
        )}

        {mode === 'reset' && resetSent ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Se houver uma conta com esse e-mail, enviamos um link para redefinir a senha.
            </p>
            <button
              type="button"
              onClick={() => {
                setMode('login')
                setResetSent(false)
              }}
              className="flex items-center gap-1 text-sm font-medium text-orange-600 hover:underline dark:text-orange-400"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Voltar ao login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {mode === 'login' ? 'Entrar' : 'Redefinir senha'}
            </h2>

            <div>
              <Label htmlFor="landing-email">E-mail</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="landing-email"
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                  placeholder="voce@exemplo.com"
                />
              </div>
            </div>

            {mode === 'login' && (
              <div>
                <Label htmlFor="landing-password">Senha</Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="landing-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            )}

            {error && <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>}

            <Button type="submit" disabled={submitting} className="mt-1">
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === 'login' ? 'Entrar' : 'Enviar link de redefinição'}
            </Button>

            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'reset' : 'login')
                setError(null)
              }}
              className="text-center text-xs font-medium text-slate-500 hover:text-orange-600 dark:text-slate-400 dark:hover:text-orange-400"
            >
              {mode === 'login' ? 'Esqueci minha senha' : 'Voltar ao login'}
            </button>
          </form>
        )}
      </div>

      <p className="max-w-sm text-center text-xs text-slate-400">
        O acesso é feito por convite. Se você faz parte do grupo e ainda não recebeu o seu, fale com Paulo Barreto.
      </p>
    </div>
  )
}
