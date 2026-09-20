import * as React from 'react'

import { Button, Heading, Link, Text } from '@react-email/components'

import { EmailLayout, button, h1, link, small, text } from './brand'

interface InviteEmailProps {
  siteName: string
  siteUrl: string
  confirmationUrl: string
}

export const InviteEmail = ({ siteName, siteUrl, confirmationUrl }: InviteEmailProps) => (
  <EmailLayout
    preview={`You've been invited to ${siteName}`}
    siteName={siteName}
    siteUrl={siteUrl}
  >
    <Heading style={h1}>You&apos;re invited</Heading>
    <Text style={text}>
      You&apos;ve been invited to join <strong>{siteName}</strong>. Accept your
      invitation to set up your account and get started.
    </Text>
    <Button style={button} href={confirmationUrl}>
      Accept Invitation
    </Button>
    <Text style={{ ...small, margin: '22px 0 0' }}>
      Button not working? Paste this link into your browser:
      <br />
      <Link href={confirmationUrl} style={link}>
        {confirmationUrl}
      </Link>
    </Text>
    <Text style={small}>
      If this invitation wasn&apos;t meant for you, simply ignore this email.
    </Text>
  </EmailLayout>
)

export default InviteEmail
