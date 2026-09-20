import * as React from 'react'

import { Button, Heading, Link, Text } from '@react-email/components'

import { EmailLayout, button, h1, link, small, text } from './brand'

interface MagicLinkEmailProps {
  siteName: string
  confirmationUrl: string
}

export const MagicLinkEmail = ({ siteName, confirmationUrl }: MagicLinkEmailProps) => (
  <EmailLayout preview={`Your ${siteName} login link`} siteName={siteName}>
    <Heading style={h1}>Your login link</Heading>
    <Text style={text}>
      Welcome back! Tap the button below to sign in to <strong>{siteName}</strong> —
      no password needed.
    </Text>
    <Button style={button} href={confirmationUrl}>
      Log In
    </Button>
    <Text style={{ ...small, margin: '22px 0 0' }}>
      Button not working? Paste this link into your browser:
      <br />
      <Link href={confirmationUrl} style={link}>
        {confirmationUrl}
      </Link>
    </Text>
    <Text style={small}>
      This link only works once. If you didn&apos;t ask to sign in, you can ignore
      this email.
    </Text>
  </EmailLayout>
)

export default MagicLinkEmail
