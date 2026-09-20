import * as React from 'react'

import { Button, Heading, Link, Text } from '@react-email/components'

import { EmailLayout, button, h1, link, small, text } from './brand'

interface EmailChangeEmailProps {
  siteName: string
  oldEmail: string
  email: string
  newEmail: string
  confirmationUrl: string
}

export const EmailChangeEmail = ({
  siteName,
  oldEmail,
  email,
  newEmail,
  confirmationUrl,
}: EmailChangeEmailProps) => (
  <EmailLayout
    preview={`Confirm your new ${siteName} email`}
    siteName={siteName}
    disclaimer="If you didn't request this change, you can safely ignore this email — your email address stays the same."
  >
    <Heading style={h1}>Confirm your new email</Heading>
    <Text style={text}>
      You asked to change the email on your <strong>{siteName}</strong> account from{' '}
      <strong>{oldEmail || email}</strong> to <strong>{newEmail}</strong>.
    </Text>
    <Button style={button} href={confirmationUrl}>
      Confirm New Email
    </Button>
    <Text style={{ ...small, margin: '22px 0 0' }}>
      Button not working? Paste this link into your browser:
      <br />
      <Link href={confirmationUrl} style={link}>
        {confirmationUrl}
      </Link>
    </Text>
  </EmailLayout>
)

export default EmailChangeEmail
