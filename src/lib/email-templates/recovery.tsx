import * as React from 'react'

import { Button, Heading, Link, Text } from '@react-email/components'

import { EmailLayout, button, h1, link, small, text } from './brand'

interface RecoveryEmailProps {
  siteName: string
  confirmationUrl: string
}

export const RecoveryEmail = ({ siteName, confirmationUrl }: RecoveryEmailProps) => (
  <EmailLayout preview={`Reset your ${siteName} password`} siteName={siteName}>
    <Heading style={h1}>Reset your password</Heading>
    <Text style={text}>
      We got a request to reset the password for your <strong>{siteName}</strong>{' '}
      account. Tap the button below to choose a new one.
    </Text>
    <Button style={button} href={confirmationUrl}>
      Reset Password
    </Button>
    <Text style={{ ...small, margin: '22px 0 0' }}>
      Button not working? Paste this link into your browser:
      <br />
      <Link href={confirmationUrl} style={link}>
        {confirmationUrl}
      </Link>
    </Text>
    <Text style={small}>
      Didn&apos;t ask for this? You can ignore this email — your password stays the
      same.
    </Text>
  </EmailLayout>
)

export default RecoveryEmail
