# Connecting mydobra.pl for Dobra emails

The five branded emails (confirm signup, password reset, magic link, email change, invite) are already built: Dobra logo, yellow header, red action buttons, friendly copy, branded subject lines, no platform names. Nothing further is needed on the design side.

The only remaining blocker is DNS. A fresh check of your registrar's own servers shows neither required record exists yet, so this is not a propagation delay.

## What you need to add at Network Solutions

Your domain's DNS is hosted at Network Solutions (nameservers ns15/ns16.worldnic.com). Sign in there and open the DNS settings for mydobra.pl.

### Record 1 — verification (TXT)

Section: "Advanced DNS Records" -> "TXT (Text) Records" -> Edit -> Add

- Host / Name: `_lovable-email`
- Value / Text: `lovable_email_verify=8867e749f83eb56cf7641617b70327dfb1f99507c12c915e0973a2e2763fee03`
- TTL: leave the default

### Records 2 and 3 — mail delegation (NS)

Section: "Advanced DNS Records" -> "Host Aliases / Name Server records for subdomains" (Network Solutions sometimes labels this "Delegate subdomain to other name servers")

- Host / Subdomain: `notify`
- Name server 1: `ns3.lovable.cloud`
- Name server 2: `ns4.lovable.cloud`

Both nameservers are required; one alone will not verify.

## Points that commonly go wrong

- Enter hosts exactly as `_lovable-email` and `notify`. If the panel shows `.mydobra.pl` after the field, do not type the domain again.
- The NS entries cannot be added as A or CNAME rows in the ordinary record table; they must go in the subdomain-delegation section.
- Network Solutions does not apply changes until you click Continue and then Save on the final confirmation screen.
- Your existing website records and your current mailboxes are untouched by all three records.

## After you save

Tell me and I will query public DNS and your registrar's servers directly, confirm the records are live, and report whether verification has completed. Verification usually finishes within an hour of the records appearing; once it does, Dobra emails send from your own domain automatically with no further changes.

If Network Solutions' panel does not offer subdomain nameserver delegation at all, the alternative is moving DNS hosting for mydobra.pl to a provider that supports NS records (the domain stays registered where it is). Say the word and I will plan that route instead.
