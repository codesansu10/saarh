'use client'

import { useState, type FormEvent } from 'react'
import { Mail, Send, CheckCircle2, Building2 } from 'lucide-react'

export function QuoteForm() {
  const [submitted, setSubmitted] = useState(false)
  const [company, setCompany] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <section className="mt-10 overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-card">
      <div className="grid gap-8 p-8 md:grid-cols-2 md:p-10">
        <div className="flex flex-col justify-center">
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
            <Mail className="size-4" aria-hidden="true" />
            Request Quote
          </div>
          <h2 className="font-space-grotesk text-2xl font-bold text-foreground text-balance">
            Secure Your Green Steel Allocation
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Lock in guaranteed Pure Steel+ capacity from the Power4Steel plant
            network. A technical sales engineer will arrange your S-PURE+ sample
            block delivery.
          </p>
        </div>

        <div>
          {submitted ? (
            <div
              className="flex h-full flex-col items-center justify-center gap-4 rounded-xl border border-primary/40 bg-primary/10 p-8 text-center"
              role="status"
            >
              <CheckCircle2 className="size-12 text-primary" aria-hidden="true" />
              <p className="text-sm leading-relaxed text-foreground">
                Quote request transmitted securely to Saarstahl Key Account
                Management. A technical sales engineer will contact you within 24
                hours to arrange your S-PURE+ sample block delivery.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false)
                  setCompany('')
                  setEmail('')
                  setMessage('')
                }}
                className="text-xs font-semibold text-primary underline-offset-4 hover:underline"
              >
                Submit another request
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label
                  htmlFor="company"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  Company Name
                </label>
                <div className="flex items-center gap-2 rounded-lg border border-border bg-input px-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30">
                  <Building2
                    className="size-4 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <input
                    id="company"
                    required
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full bg-transparent py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground/60"
                    placeholder="e.g. Nordwind Turbines GmbH"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  Work Email
                </label>
                <div className="flex items-center gap-2 rounded-lg border border-border bg-input px-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30">
                  <Mail
                    className="size-4 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground/60"
                    placeholder="procurement@company.com"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  Message &amp; Technical Specs
                </label>
                <textarea
                  id="message"
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full resize-none rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/30"
                  placeholder="Grades, tolerances, volumes, delivery windows…"
                />
              </div>

              <button
                type="submit"
                className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-space-grotesk text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-transform hover:-translate-y-0.5 hover:bg-primary/90"
              >
                <Send className="size-4" aria-hidden="true" />
                Submit Quote &amp; Request Sample Batch
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
