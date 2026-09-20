import * as React from 'react'

import { Button, Heading, Link, Text } from '@react-email/components'

import { EmailLayout, button, h1, link, small, text } from './brand'

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

export const SignupEmail = ({
  siteName,
  siteUrl,
  recipient,
  confirmationUrl,
}: SignupEmailProps) => (
  <EmailLayout
    preview={`Confirm your ${siteName} account`}
    siteName={siteName}
    siteUrl={siteUrl}
    disclaimer="If you didn't create a Dobra account, you can safely ignore this email — no account will be activated."
  >
    <Heading style={h1}>Confirm your email</Heading>
    <Text style={text}>
      Thanks for signing up for <strong>{siteName}</strong>! Confirm your email to
      start ordering.
    </Text>
    <Text style={text}>
      We just need to check that <strong>{recipient}</strong> is really you.
    </Text>
    <Button style={button} href={confirmationUrl}>
      Verify Email
    </Button>
    <Text style={{ ...small, margin: '22px 0 0' }}>
      Button not working? Paste this link into your browser:
      <br />
      <Link href={confirmationUrl} style={link}>
        {confirmationUrl}
      </Link>
    </Text>
    <Text style={small}>
      If you didn&apos;t create an account, you can safely ignore this email.
    </Text>
  </EmailLayout>
)

export default SignupEmail
