import * as React from 'react'

import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'

export const BRAND = {
  yellow: '#FFCE0A',
  red: '#DC3A2A',
  ink: '#2B2723',
  cream: '#FFFDF6',
  muted: '#6B655E',
}

export const LOGO_URL =
  'https://mydobra.pl/__l5e/assets-v1/625edaa8-cc2b-4380-89f6-418cca1d8553/dobra-logo.png'
export const SUPPORT_EMAIL = 'support@mydobra.pl'

const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
  margin: '0',
  padding: '0',
}

const outer = { padding: '24px 12px', maxWidth: '560px' }

const card = {
  backgroundColor: BRAND.cream,
  border: `1px solid ${BRAND.yellow}`,
  borderRadius: '18px',
  overflow: 'hidden' as const,
}

const header = {
  backgroundColor: BRAND.yellow,
  padding: '24px 28px 20px',
  textAlign: 'center' as const,
}


const inner = { padding: '28px' }

export const h1 = {
  fontSize: '22px',
  fontWeight: 'bold' as const,
  color: BRAND.ink,
  margin: '0 0 16px',
}

export const text = {
  fontSize: '15px',
  color: BRAND.ink,
  lineHeight: '1.6',
  margin: '0 0 18px',
}

export const small = {
  fontSize: '13px',
  color: BRAND.muted,
  lineHeight: '1.6',
  margin: '0 0 8px',
}

export const link = { color: BRAND.red, textDecoration: 'underline' }

export const button = {
  backgroundColor: BRAND.red,
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: 'bold' as const,
  borderRadius: '999px',
  padding: '14px 28px',
  textDecoration: 'none',
  display: 'inline-block',
}

export const codeBox = {
  backgroundColor: '#ffffff',
  border: `2px dashed ${BRAND.yellow}`,
  borderRadius: '12px',
  padding: '18px',
  textAlign: 'center' as const,
  fontSize: '30px',
  fontWeight: 'bold' as const,
  letterSpacing: '8px',
  color: BRAND.ink,
  margin: '0 0 20px',
}

const hr = { borderColor: '#EDE7DA', margin: '24px 0 16px' }

const footerText = {
  fontSize: '12px',
  color: BRAND.muted,
  lineHeight: '1.6',
  margin: '0 0 4px',
  textAlign: 'center' as const,
}

export const EmailLayout = ({
  preview,
  siteName = 'Dobra',
  siteUrl = 'https://mydobra.pl',
  disclaimer = "If you didn't request this email, you can safely ignore it — no changes have been made to your account.",
  children,
}: {
  preview: string
  siteName?: string
  siteUrl?: string
  disclaimer?: string
  children: React.ReactNode
}) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{preview}</Preview>
    <Body style={main}>
      <Container style={outer}>
        <Section style={card}>
          <Section style={header}>
            <Img
              src={LOGO_URL}
              width="150"
              height="66"
              alt={siteName}
              style={{ margin: '0 auto', display: 'block' }}
            />
          </Section>
          <Section style={inner}>{children}</Section>
        </Section>
        <Hr style={hr} />
        <Text style={footerText}>{disclaimer}</Text>
        <Text style={footerText}>
          We take your privacy seriously. Read our{' '}
          <Link href={`${siteUrl}/privacy`} style={link}>
            Privacy Policy
          </Link>
          .
        </Text>
        <Text style={footerText}>
          Need help? Email{' '}
          <Link href={`mailto:${SUPPORT_EMAIL}`} style={link}>
            {SUPPORT_EMAIL}
          </Link>{' '}
          or visit our{' '}
          <Link href={`${siteUrl}/help`} style={link}>
            Help Centre
          </Link>
          .
        </Text>
        <Text style={footerText}>
          <Link href={siteUrl} style={{ ...link, textDecoration: 'none' }}>
            mydobra.pl
          </Link>
          {' · '}
          Food delivery, done well.
        </Text>
        <Text style={footerText}>
          © {new Date().getFullYear()} {siteName}. All rights reserved.
        </Text>
      </Container>
    </Body>
  </Html>
)

export { Heading, Text, Link }
