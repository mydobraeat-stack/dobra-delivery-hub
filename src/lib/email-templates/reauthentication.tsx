import * as React from 'react'

import { Heading, Text } from '@react-email/components'

import { EmailLayout, codeBox, h1, small, text } from './brand'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <EmailLayout preview="Your Dobra verification code">
    <Heading style={h1}>Your verification code</Heading>
    <Text style={text}>Enter this code to confirm it&apos;s really you:</Text>
    <Text style={codeBox}>{token}</Text>
    <Text style={small}>
      The code expires shortly. If you didn&apos;t request it, you can ignore this
      email.
    </Text>
  </EmailLayout>
)

export default ReauthenticationEmail
